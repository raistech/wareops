require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const cors = require('cors');

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
// Key: warehouse_id (e.g., 'newgudang', 'gudangkletek')
const warehouseStats = {
    'newgudang': { name: 'Gudang Waru', status: 'offline', stats: null, url: 'https://gudangwaru.my.id' },
    'gudangkletek': { name: 'Gudang Kletek', status: 'offline', stats: null, url: 'https://gudangkletek.my.id' },
    'gudangrm1': { name: 'RM Abba', status: 'offline', stats: null, url: 'https://gudangrmabba.my.id' },
    'gudangrm2': { name: 'RM Cassaland', status: 'offline', stats: null, url: 'https://gudangcassaland.my.id' },
    'gudangrm3': { name: 'RM Sumber Asia', status: 'offline', stats: null, url: 'https://gudangsumberasia.my.id' },
    'gudangrm4': { name: 'RM Kemasan', status: 'offline', stats: null, url: 'https://gudangkemasan.my.id' },
};

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Basic API to get current stats
app.get('/api/stats', (req, res) => {
    res.json(warehouseStats);
});

// Socket.io logic
io.on('connection', (socket) => {
    console.log('New connection:', socket.id);

    // Authentication and Registration for Warehouse Clients
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
            
            // Broadcast update to public clients with URL
            io.emit('warehouse_status_changed', { id, status: 'online', url: warehouseStats[id].url });
        }
    });

    // Handle incoming stats update from warehouse
    socket.on('update_stats', (stats) => {
        if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
            console.log(`Stats update from ${socket.warehouseId}`);
            warehouseStats[socket.warehouseId].stats = stats;
            warehouseStats[socket.warehouseId].last_update = new Date();
            
            // Broadcast to all public clients with URL included just in case
            io.emit('stats_updated', { id: socket.warehouseId, stats, url: warehouseStats[socket.warehouseId].url });
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
    console.log(`Monitoring Hub running on port ${PORT}`);
});
