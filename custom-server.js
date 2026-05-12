const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { Server } = require('socket.io');
const express = require('express');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');
const axios = require('axios');
require('dotenv').config();

const warehousesConfig = require('./src/config/warehouses');

// Build database paths and initial stats dynamically from config
const childDatabases = {};
const warehouseStats = {};

Object.entries(warehousesConfig).forEach(([id, config]) => {
    childDatabases[id] = config.dbPath;
    warehouseStats[id] = {
        name: config.name,
        status: 'offline',
        stats: null,
        url: config.url,
        occupancy: '0%',
        capacity: '0',
        actual: '0',
        lifetime: { loading: 0, unloading: 0 }
    };
});

const googleSheets = require('./src/services/googleSheets');
const adminRoutes = require('./src/routes/admin');
const db = require('./src/services/database');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 23670;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const TZ_OFFSET = parseInt(process.env.TIMEZONE_OFFSET || '7');

let unregisteredWarehouses = {};

// Helper to refresh stats for a warehouse from its database
const refreshWarehouseAnalytics = (id) => {
    if (!warehouseStats[id]) return;
    
    // 1. Get Ratings & Active Reports from Master DB
    const ratingData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE warehouse_id = ?').get(id);
    warehouseStats[id].avg_rating = ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(1)) : 0;
    warehouseStats[id].total_reviews = ratingData.total_reviews || 0;
    
    const activeReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE warehouse_id = ? AND status IN ('pending', 'received')").get(id);
    warehouseStats[id].active_reports = activeReports.count || 0;

    // 2. Get Performance Averages from Child DB
    if (childDatabases[id]) {
        try {
            const childDb = new Database(childDatabases[id], { readonly: true });
            const today = new Date(Date.now() + TZ_OFFSET * 3600000).toISOString().split('T')[0];
            
            const data = childDb.prepare(`
                SELECT 
                    SUM(CASE WHEN type='M' AND status='waiting' THEN 1 ELSE 0 END) as muat_waiting,
                    SUM(CASE WHEN type='M' AND status='processing' THEN 1 ELSE 0 END) as muat_processing,
                    SUM(CASE WHEN type='B' AND status='waiting' THEN 1 ELSE 0 END) as bongkar_waiting,
                    SUM(CASE WHEN type='B' AND status='processing' THEN 1 ELSE 0 END) as bongkar_processing,
                    SUM(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as muat_today,
                    SUM(CASE WHEN type='B' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as bongkar_today,
                    SUM(CASE WHEN type='M' AND status='finished' THEN 1 ELSE 0 END) as muat_lifetime,
                    SUM(CASE WHEN type='B' AND status='finished' THEN 1 ELSE 0 END) as bongkar_lifetime,
                    AVG(CASE WHEN status='finished' AND created_at LIKE ? THEN (strftime('%s', COALESCE(called_at, processing_at)) - strftime('%s', created_at))/60.0 END) as avg_w_today,
                    AVG(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at, created_at)))/60.0 END) as avg_l_today,
                    AVG(CASE WHEN type='B' AND status='finished' AND created_at LIKE ? THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at, created_at)))/60.0 END) as avg_u_today,
                    AVG(CASE WHEN status='finished' AND created_at >= date('now', '-30 days') THEN (strftime('%s', COALESCE(called_at, processing_at)) - strftime('%s', created_at))/60.0 END) as avg_w_30d,
                    AVG(CASE WHEN type='M' AND status='finished' AND created_at >= date('now', '-30 days') THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at, created_at)))/60.0 END) as avg_l_30d,
                    AVG(CASE WHEN type='B' AND status='finished' AND created_at >= date('now', '-30 days') THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at, created_at)))/60.0 END) as avg_u_30d
                FROM queues
            `).get(`${today}%`, `${today}%`, `${today}%`, `${today}%`, `${today}%`);

            if (!warehouseStats[id].stats) warehouseStats[id].stats = {};
            
            // Live Queues & Processing
            warehouseStats[id].stats.muat_waiting = data.muat_waiting || 0;
            warehouseStats[id].stats.muat_processing = data.muat_processing || 0;
            warehouseStats[id].stats.bongkar_waiting = data.bongkar_waiting || 0;
            warehouseStats[id].stats.bongkar_processing = data.bongkar_processing || 0;
            warehouseStats[id].stats.finished_muat_today = data.muat_today || 0;
            warehouseStats[id].stats.finished_bongkar_today = data.bongkar_today || 0;
            
            // Analytics
            warehouseStats[id].stats.avg_waiting_today = data.avg_w_today || 0;
            warehouseStats[id].stats.avg_loading_today = data.avg_l_today || 0;
            warehouseStats[id].stats.avg_unloading_today = data.avg_u_today || 0;
            warehouseStats[id].stats.avg_waiting_30d = data.avg_w_30d || 0;
            warehouseStats[id].stats.avg_loading_30d = data.avg_l_30d || 0;
            warehouseStats[id].stats.avg_unloading_30d = data.avg_u_30d || 0;

            // Legacy fallbacks
            warehouseStats[id].stats.avg_waiting = data.avg_w_today || data.avg_w_30d || 0;
            warehouseStats[id].stats.avg_loading = data.avg_l_today || data.avg_l_30d || 0;
            warehouseStats[id].stats.avg_unloading = data.avg_u_today || data.avg_u_30d || 0;

            warehouseStats[id].lifetime = {
                loading: data.muat_lifetime || 0,
                unloading: data.bongkar_lifetime || 0
            };
            childDb.close();
        } catch (e) {
            console.error(`Analytics refresh error for ${id}:`, e.message);
        }
    }
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
    server.use('/uploads', express.static(path.join(__dirname, 'public/uploads')));
    
    // Attach io to req
    server.use((req, res, next) => {
        req.io = io;
        next();
    });

    server.use('/api/admin', adminRoutes);
    server.get('/api/stats', (req, res) => {
        try {
            Object.keys(warehouseStats).forEach(id => refreshWarehouseAnalytics(id));
            res.json({ registered: warehouseStats, unregistered: unregisteredWarehouses });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    server.post('/api/reports', (req, res) => {
        try {
            const { warehouse_id, reporter_name, reporter_phone, category, description, photo } = req.body;
            if (!warehouse_id || !category || !description) {
                return res.status(400).json({ error: 'Missing required fields' });
            }
            const stmt = db.prepare('INSERT INTO reports (warehouse_id, reporter_name, reporter_phone, category, description, photo) VALUES (?, ?, ?, ?, ?, ?)');
            const info = stmt.run(warehouse_id, reporter_name || 'Anonymous', reporter_phone || '', category, description, photo || null);
            
            // Real-time notification with refreshed count
            refreshWarehouseAnalytics(warehouse_id);
            io.emit('stats_updated', { id: warehouse_id, ...warehouseStats[warehouse_id] });

            res.json({ success: true, id: info.lastInsertRowid });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    server.get('/api/historical-stats', async (req, res) => {
        const { date } = req.query; 
        if (!date) return res.status(400).json({ error: 'Date is required' });
        console.log(`[API] Fetching historical stats for: ${date}`);
        try {
            const occupancyData = await googleSheets.getOccupancyData(date);
            const results = {}; // Temporary results for historical date
            
            for (const id of Object.keys(warehouseStats)) {
                results[id] = JSON.parse(JSON.stringify(warehouseStats[id]));
                const w = results[id];
                
                const activeReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE warehouse_id = ? AND status IN ('pending', 'received') AND created_at <= ?").get(id, `${date} 23:59:59`);
                w.active_reports = activeReports.count || 0;

                const matchKey = Object.keys(occupancyData).find(key => 
                    key.toLowerCase().trim() === w.name.toLowerCase().trim()
                );
                if (matchKey) {
                    const data = occupancyData[matchKey];
                    w.name = matchKey;
                    w.occupancy = data.occupancy;
                    w.capacity = data.capacity;
                    w.actual = data.actual;
                } else {
                    w.occupancy = '0%'; w.capacity = '0'; w.actual = '0';
                }
                w.status = 'historical';
                
                if (childDatabases[id]) {
                    try {
                        const childDb = new Database(childDatabases[id], { readonly: true });
                        const dailyStats = childDb.prepare(`
                            SELECT 
                                SUM(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as muat_today,
                                SUM(CASE WHEN type='B' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as bongkar_today,
                                AVG(CASE WHEN status='finished' AND created_at LIKE ? THEN (strftime('%s', COALESCE(called_at, processing_at)) - strftime('%s', created_at))/60.0 END) as avg_w_today,
                                AVG(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at, created_at)))/60.0 END) as avg_l_today,
                                AVG(CASE WHEN type='B' AND status='finished' AND created_at LIKE ? THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at, created_at)))/60.0 END) as avg_u_today,
                                SUM(CASE WHEN type='M' AND status='finished' AND created_at <= ? THEN 1 ELSE 0 END) as muat_lifetime,
                                SUM(CASE WHEN type='B' AND status='finished' AND created_at <= ? THEN 1 ELSE 0 END) as bongkar_lifetime
                            FROM queues
                        `).get(`${date}%`, `${date}%`, `${date}%`, `${date}%`, `${date}%`, `${date} 23:59:59`, `${date} 23:59:59`);
                        
                        w.stats = {
                            finished_muat_today: dailyStats.muat_today || 0,
                            finished_bongkar_today: dailyStats.bongkar_today || 0,
                            avg_waiting_today: dailyStats.avg_w_today || 0,
                            avg_loading_today: dailyStats.avg_l_today || 0,
                            avg_unloading_today: dailyStats.avg_u_today || 0,
                            avg_waiting: dailyStats.avg_w_today || 0,
                            avg_loading: dailyStats.avg_l_today || 0,
                            avg_unloading: dailyStats.avg_u_today || 0,
                        };
                        w.lifetime = { loading: dailyStats.muat_lifetime || 0, unloading: dailyStats.bongkar_lifetime || 0 };
                        childDb.close();
                    } catch (e) { console.error(e); }
                }
            }
            
            const unregistered = {};
            Object.keys(occupancyData).forEach(name => {
                const isRegistered = Object.values(results).some(w => w.name.toLowerCase().trim() === name.toLowerCase().trim());
                if (!isRegistered && name.toLowerCase().trim() !== 'rm pabrik') {
                    unregistered[name] = { name, ...occupancyData[name], status: 'historical', isUnregistered: true };
                }
            });
            res.json({ registered: results, unregistered });
        } catch (err) {
            console.error('Historical stats error:', err);
            res.status(500).json({ error: 'Failed to fetch historical stats' });
        }
    });

    server.get('/api/reviews/:warehouse_id', (req, res) => {
        try {
            const reviews = db.prepare('SELECT * FROM reviews WHERE warehouse_id = ? ORDER BY created_at DESC').all(req.params.warehouse_id);
            res.json(reviews);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

    server.post('/api/reviews', (req, res) => {
        const { warehouse_id, rating, comment, reviewer_name } = req.body;
        if (!warehouse_id || !rating) return res.status(400).json({ error: 'Warehouse ID and Rating are required' });
        try {
            const stmt = db.prepare('INSERT INTO reviews (warehouse_id, rating, comment, reviewer_name) VALUES (?, ?, ?, ?)');
            const info = stmt.run(warehouse_id, rating, comment || '', reviewer_name || 'Anonymous');
            refreshWarehouseAnalytics(warehouse_id);
            io.emit('stats_updated', { id: warehouse_id, ...warehouseStats[warehouse_id] });
            res.json({ success: true, id: info.lastInsertRowid });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });

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
                    warehouseStats[id].name = matchKey;
                    warehouseStats[id].occupancy = data.occupancy;
                    warehouseStats[id].capacity = data.capacity;
                    warehouseStats[id].actual = data.actual;
                }
                refreshWarehouseAnalytics(id);
            });
            unregisteredWarehouses = {};
            Object.keys(occupancyData).forEach(name => {
                const isRegistered = Object.values(warehouseStats).some(w => w.name.toLowerCase().trim() === name.toLowerCase().trim());
                if (!isRegistered) {
                    unregisteredWarehouses[name] = { name, ...occupancyData[name], status: 'offline', isUnregistered: true };
                }
            });
            io.emit('occupancy_updated', { registered: warehouseStats, unregistered: unregisteredWarehouses });
        } catch (err) {
            console.error('[SYNC ERROR]', err);
        }
    };
    syncOccupancy();
    setInterval(syncOccupancy, 60 * 1000);

    io.on('connection', (socket) => {
        socket.on('register_warehouse', (data) => {
            const { id, token } = data;
            if (token !== AUTH_TOKEN) return socket.disconnect();
            if (warehouseStats[id]) {
                socket.join('warehouses');
                socket.warehouseId = id;
                warehouseStats[id].status = 'online';
                refreshWarehouseAnalytics(id);
                io.emit('warehouse_status_changed', { id, ...warehouseStats[id] });
                console.log(`Warehouse Registered: ${id}`);
            }
        });
        socket.on('update_stats', (stats) => {
            if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
                // Merge real-time stats with DB analytics
                warehouseStats[socket.warehouseId].stats = { ...warehouseStats[socket.warehouseId].stats, ...stats };
                refreshWarehouseAnalytics(socket.warehouseId);
                warehouseStats[socket.warehouseId].last_update = new Date();
                io.emit('stats_updated', { id: socket.warehouseId, ...warehouseStats[socket.warehouseId] });
            }
        });
        socket.on('disconnect', () => {
            if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
                warehouseStats[socket.warehouseId].status = 'offline';
                io.emit('warehouse_status_changed', { id: socket.warehouseId, ...warehouseStats[socket.warehouseId] });
            }
        });
    });
    server.use((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });
    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
