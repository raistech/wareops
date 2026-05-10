const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Services & Routes
const googleSheets = require('./src/services/googleSheets');
const adminRoutes = require('./src/routes/admin');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 23670;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

// Store latest stats for each warehouse
const warehouseStats = {
    'newgudang': { name: 'Gudang Waru', status: 'offline', stats: null, url: '#', occupancy: '0%', capacity: '0', actual: '0' },
    'gudangkletek': { name: 'Gudang Kletek', status: 'offline', stats: null, url: 'https://gudangkletek.my.id', occupancy: '0%', capacity: '0', actual: '0' },
    'gudangrm1': { name: 'RM Abba', status: 'offline', stats: null, url: 'https://gudangrmabba.my.id', occupancy: '0%', capacity: '0', actual: '0' },
    'gudangrm2': { name: 'RM Cassaland', status: 'offline', stats: null, url: 'https://gudangcassaland.my.id', occupancy: '0%', capacity: '0', actual: '0' },
    'gudangrm3': { name: 'RM Sumber Asia', status: 'offline', stats: null, url: 'https://gudangsumberasia.my.id', occupancy: '0%', capacity: '0', actual: '0' },
    'gudangrm4': { name: 'RM Kemasan', status: 'offline', stats: null, url: 'https://gudangkemasan.my.id', occupancy: '0%', capacity: '0', actual: '0' },
    'gudangpabrik': { name: 'RM Pabrik', status: 'offline', stats: null, url: '#', occupancy: '0%', capacity: '0', actual: '0' },
};

app.prepare().then(() => {
    const server = express();
    const httpServer = createServer(server);
    const io = new Server(httpServer, {
        cors: {
            origin: "*",
            methods: ["GET", "POST"]
        }
    });

    server.use(cors());
    server.use(express.json());
    
    // Serve static uploads
    server.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));

    // API Routes (Legacy/Admin)
    server.use('/api/admin', adminRoutes);
    
    server.get('/api/stats', (req, res) => {
        res.json(warehouseStats);
    });

    // Sync occupancy from Google Sheets
    const syncOccupancy = async () => {
        console.log('[SYNC] Fetching occupancy from Google Sheets...');
        try {
            const occupancyData = await googleSheets.getOccupancyData();
            
            Object.keys(warehouseStats).forEach(id => {
                const nameInStats = warehouseStats[id].name;
                const matchKey = Object.keys(occupancyData).find(key => 
                    key.toLowerCase().trim() === nameInStats.toLowerCase().trim()
                );

                if (matchKey) {
                    const data = occupancyData[matchKey];
                    warehouseStats[id].occupancy = data.occupancy;
                    warehouseStats[id].capacity = data.capacity;
                    warehouseStats[id].actual = data.actual;
                    console.log(`[SYNC] Match found for ${id} (${nameInStats}): ${data.occupancy}`);
                } else {
                    console.log(`[SYNC] No match for ${id} (${nameInStats}) in sheets`);
                }
            });

            io.emit('occupancy_updated', warehouseStats);
        } catch (err) {
            console.error('[SYNC ERROR]', err);
        }
    };

    // Initial sync and interval (1 minute)
    syncOccupancy();
    setInterval(syncOccupancy, 60 * 1000);

    // Socket.io logic
    io.on('connection', (socket) => {
        socket.on('register_warehouse', (data) => {
            const { id, token } = data;
            if (token !== AUTH_TOKEN) return socket.disconnect();

            if (warehouseStats[id]) {
                socket.join('warehouses');
                socket.warehouseId = id;
                warehouseStats[id].status = 'online';
                io.emit('warehouse_status_changed', { id, ...warehouseStats[id] });
                console.log(`Warehouse Registered: ${id}`);
            }
        });

        socket.on('update_stats', (stats) => {
            if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
                warehouseStats[socket.warehouseId].stats = stats;
                warehouseStats[socket.warehouseId].last_update = new Date();
                io.emit('stats_updated', { 
                    id: socket.warehouseId, 
                    ...warehouseStats[socket.warehouseId]
                });
            }
        });

        socket.on('disconnect', () => {
            if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
                warehouseStats[socket.warehouseId].status = 'offline';
                io.emit('warehouse_status_changed', { id: socket.warehouseId, ...warehouseStats[socket.warehouseId] });
            }
        });
    });

    // Next.js handler
    server.use((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });

    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
