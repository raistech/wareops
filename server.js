require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

// Services & Routes
const googleSheets = require('./src/services/googleSheets');
const adminRoutes = require('./src/routes/admin');
const db = require('./src/services/database');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

const PORT = process.env.PORT || 23670;
const AUTH_TOKEN = process.env.AUTH_TOKEN;

// Store latest stats for each warehouse
const warehouseStats = {
    'newgudang': { name: 'Gudang Waru', status: 'offline', stats: null, url: '#', occupancy: '0%' },
    'gudangkletek': { name: 'Gudang Kletek', status: 'offline', stats: null, url: 'https://gudangkletek.my.id', occupancy: '0%' },
    'gudangrm1': { name: 'RM Abba', status: 'offline', stats: null, url: 'https://gudangrmabba.my.id', occupancy: '0%' },
    'gudangrm2': { name: 'RM Cassaland', status: 'offline', stats: null, url: 'https://gudangcassaland.my.id', occupancy: '0%' },
    'gudangrm3': { name: 'RM Sumber Asia', status: 'offline', stats: null, url: 'https://gudangsumberasia.my.id', occupancy: '0%' },
    'gudangrm4': { name: 'RM Kemasan', status: 'offline', stats: null, url: 'https://gudangkemasan.my.id', occupancy: '0%' },
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// API Routes
app.use('/api/admin', adminRoutes);

app.get('/api/stats', (req, res) => {
    res.json(warehouseStats);
});

// Sync occupancy from Google Sheets
const syncOccupancy = async () => {
    console.log('[SYNC] Fetching occupancy from Google Sheets...');
    const occupancyData = await googleSheets.getOccupancyData();
    
    // Map sheet names to our IDs
    // We match by the 'name' property in warehouseStats
    Object.keys(warehouseStats).forEach(id => {
        const nameInStats = warehouseStats[id].name;
        // Try to find matching name in occupancyData (case insensitive)
        const match = Object.keys(occupancyData).find(key => 
            key.toLowerCase().trim() === nameInStats.toLowerCase().trim()
        );

        if (match) {
            warehouseStats[id].occupancy = occupancyData[match];
            console.log(`[SYNC] Updated ${id} occupancy: ${occupancyData[match]}`);
        }
    });

    // Broadcast update to all clients
    io.emit('occupancy_updated', warehouseStats);
};

// Initial sync and set interval
syncOccupancy();
setInterval(syncOccupancy, 15 * 60 * 1000); // Every 15 minutes

// Socket.io logic
io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    socket.on('register_warehouse', (data) => {
        const { id, token } = data;
        
        if (token !== AUTH_TOKEN) {
            console.log(`Unauthorized attempt from: ${id}`);
            return socket.disconnect();
        }

        if (warehouseStats[id]) {
            socket.join('warehouses');
            socket.warehouseId = id;
            warehouseStats[id].status = 'online';
            console.log(`Warehouse Registered: ${id}`);
            io.emit('warehouse_status_changed', { id, status: 'online', url: warehouseStats[id].url, occupancy: warehouseStats[id].occupancy });
        }
    });

    socket.on('update_stats', (stats) => {
        if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
            warehouseStats[socket.warehouseId].stats = stats;
            warehouseStats[socket.warehouseId].last_update = new Date();
            io.emit('stats_updated', { 
                id: socket.warehouseId, 
                stats, 
                url: warehouseStats[socket.warehouseId].url,
                occupancy: warehouseStats[socket.warehouseId].occupancy 
            });
        }
    });

    socket.on('disconnect', () => {
        if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
            warehouseStats[socket.warehouseId].status = 'offline';
            io.emit('warehouse_status_changed', { id: socket.warehouseId, status: 'offline' });
            console.log(`Warehouse Disconnected: ${socket.warehouseId}`);
        }
    });
});

server.listen(PORT, () => {
    console.log(`Monitoring & CMS Hub running on port ${PORT}`);
});
