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
const childDatabases = {
    'newgudang': '/root/newgudang/database/waru.db',
    'gudangkletek': '/root/gudangkletek/database/kletek.db',
    'gudangrm1': '/root/gudangrm1/database/gudangrawmaterialabba.db',
    'gudangrm2': '/root/gudangrm2/database/gudangrawmaterialcassaland.db',
    'gudangrm3': '/root/gudangrm3/database/gudangrawmaterialsumberasia.db',
    'gudangrm4': '/root/gudangrm4/database/gudangrawmaterialkemasan.db'
};
const googleSheets = require('./src/services/googleSheets');
const adminRoutes = require('./src/routes/admin');
const db = require('./src/services/database');
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();
const PORT = process.env.PORT || 23670;
const AUTH_TOKEN = process.env.AUTH_TOKEN;
const warehouseStats = {
    'newgudang': { name: 'Gudang Waru', status: 'offline', stats: null, url: 'https://gudangwaru.my.id', occupancy: '0%', capacity: '0', actual: '0', lifetime: { loading: 0, unloading: 0 } },
    'gudangkletek': { name: 'Gudang Kletek', status: 'offline', stats: null, url: 'https://gudangkletek.my.id', occupancy: '0%', capacity: '0', actual: '0', lifetime: { loading: 0, unloading: 0 } },
    'gudangrm1': { name: 'RM Abba', status: 'offline', stats: null, url: 'https://gudangrmabba.my.id', occupancy: '0%', capacity: '0', actual: '0', lifetime: { loading: 0, unloading: 0 } },
    'gudangrm2': { name: 'RM Cassaland', status: 'offline', stats: null, url: 'https://gudangcassaland.my.id', occupancy: '0%', capacity: '0', actual: '0', lifetime: { loading: 0, unloading: 0 } },
    'gudangrm3': { name: 'RM Sumber Asia', status: 'offline', stats: null, url: 'https://gudangsumberasia.my.id', occupancy: '0%', capacity: '0', actual: '0', lifetime: { loading: 0, unloading: 0 } },
    'gudangrm4': { name: 'RM Kemasan', status: 'offline', stats: null, url: 'https://gudangkemasan.my.id', occupancy: '0%', capacity: '0', actual: '0', lifetime: { loading: 0, unloading: 0 } },
    'gudangpabrik': { name: 'RM Pabrik', status: 'offline', stats: null, url: '#', occupancy: '0%', capacity: '0', actual: '0', lifetime: { loading: 0, unloading: 0 } },
};
let unregisteredWarehouses = {};
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
    server.use('/api/admin', adminRoutes);
    server.get('/api/stats', (req, res) => {
        try {
            const results = JSON.parse(JSON.stringify(warehouseStats));
            const today = new Date(Date.now() + 7 * 3600000).toISOString().split('T')[0];
            Object.keys(results).forEach(id => {
                const ratingData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE warehouse_id = ?').get(id);
                results[id].avg_rating = ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(1)) : 0;
                results[id].total_reviews = ratingData.total_reviews || 0;
                if (childDatabases[id]) {
                    try {
                        const childDb = new Database(childDatabases[id], { readonly: true });
                        const data = childDb.prepare(`
                            SELECT 
                                SUM(CASE WHEN type='M' AND status NOT IN ('finished', 'cancelled') THEN 1 ELSE 0 END) as muat_q,
                                SUM(CASE WHEN type='B' AND status NOT IN ('finished', 'cancelled') THEN 1 ELSE 0 END) as bongkar_q,
                                SUM(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as muat_today,
                                SUM(CASE WHEN type='B' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as bongkar_today,
                                SUM(CASE WHEN type='M' AND status='finished' THEN 1 ELSE 0 END) as muat_lifetime,
                                SUM(CASE WHEN type='B' AND status='finished' THEN 1 ELSE 0 END) as bongkar_lifetime,
                                AVG(CASE WHEN created_at >= date('now', '-30 days') THEN (strftime('%s', called_at) - strftime('%s', created_at))/60.0 END) as avg_w
                            FROM queues
                        `).get(`${today}%`, `${today}%`);
                        if (!results[id].stats) results[id].stats = {};
                        results[id].stats.muat_waiting = data.muat_q || 0;
                        results[id].stats.bongkar_waiting = data.bongkar_q || 0;
                        results[id].stats.finished_muat_today = data.muat_today || 0;
                        results[id].stats.finished_bongkar_today = data.bongkar_today || 0;
                        results[id].stats.avg_waiting = data.avg_w || 0;
                        results[id].lifetime = {
                            loading: data.muat_lifetime || 0,
                            unloading: data.bongkar_lifetime || 0
                        };
                        childDb.close();
                    } catch (e) {
                        console.error(`Initial fetch error for ${id}:`, e.message);
                    }
                }
            });
            res.json({ registered: results, unregistered: unregisteredWarehouses });
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
            const results = JSON.parse(JSON.stringify(warehouseStats)); 
            const unregistered = {};
            const fetchPromises = Object.keys(results).map(async (id) => {
                const w = results[id];
                const ratingData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE warehouse_id = ?').get(id);
                w.avg_rating = ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(1)) : 0;
                w.total_reviews = ratingData.total_reviews || 0;
                const nameInStats = w.name;
                const matchKey = Object.keys(occupancyData).find(key => 
                    key.toLowerCase().trim() === nameInStats.toLowerCase().trim()
                );
                if (matchKey) {
                    const data = occupancyData[matchKey];
                    w.occupancy = data.occupancy;
                    w.capacity = data.capacity;
                    w.actual = data.actual;
                } else {
                    w.occupancy = '0%';
                    w.capacity = '0';
                    w.actual = '0';
                }
                w.status = 'historical';
                if (childDatabases[id]) {
                    try {
                        const childDb = new Database(childDatabases[id], { readonly: true });
                        const dailyStats = childDb.prepare(`
                            SELECT 
                                SUM(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as muat_today,
                                SUM(CASE WHEN type='B' AND status='finished' AND created_at LIKE ? THEN 1 ELSE 0 END) as bongkar_today,
                                AVG(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN (strftime('%s', COALESCE(called_at, processing_at, finished_at)) - strftime('%s', created_at))/60.0 END) as avg_w,
                                AVG(CASE WHEN type='M' AND status='finished' AND created_at LIKE ? THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at)))/60.0 END) as avg_l,
                                AVG(CASE WHEN type='B' AND status='finished' AND created_at LIKE ? THEN (strftime('%s', finished_at) - strftime('%s', COALESCE(processing_at, called_at)))/60.0 END) as avg_u
                            FROM queues
                        `).get(`${date}%`, `${date}%`, `${date}%`, `${date}%`, `${date}%`);
                        const lifetimeStats = childDb.prepare(`
                            SELECT 
                                SUM(CASE WHEN type='M' AND status='finished' AND created_at <= ? THEN 1 ELSE 0 END) as muat_lifetime,
                                SUM(CASE WHEN type='B' AND status='finished' AND created_at <= ? THEN 1 ELSE 0 END) as bongkar_lifetime
                            FROM queues
                        `).get(`${date} 23:59:59`, `${date} 23:59:59`);
                        w.stats = {
                            finished_muat_today: dailyStats.muat_today || 0,
                            finished_bongkar_today: dailyStats.bongkar_today || 0,
                            muat_waiting: 0,
                            bongkar_waiting: 0,
                            avg_waiting: dailyStats.avg_w || 0,
                            avg_loading: dailyStats.avg_l || 0,
                            avg_unloading: dailyStats.avg_u || 0,
                        };
                        w.lifetime = {
                            loading: lifetimeStats.muat_lifetime || 0,
                            unloading: lifetimeStats.bongkar_lifetime || 0
                        };
                        childDb.close();
                        console.log(`[API] DB stats fetched for ${id}`);
                    } catch (err) {
                        console.error(`Error querying child DB for ${id}:`, err.message);
                    }
                } else if (w.url && w.url !== '#') {
                    try {
                        const apiUrl = `${w.url.replace(/\/$/, '')}/api/history-data?date=${date}`;
                        console.log(`[API] Fetching child stats via fallback API: ${apiUrl}`);
                        const response = await axios.get(apiUrl, { timeout: 8000 });
                        const { summary } = response.data;
                        if (summary) {
                            w.stats = {
                                finished_muat_today: summary.do_count || 0,
                                finished_bongkar_today: summary.po_count || 0,
                                muat_waiting: 0,
                                bongkar_waiting: 0,
                                avg_waiting: 0,
                            };
                        }
                    } catch (err) {
                        console.error(`Error fetching historical stats via fallback for ${id}:`, err.message);
                    }
                }
            });
            Object.keys(occupancyData).forEach(name => {
                const isRegistered = Object.values(warehouseStats).some(w => w.name.toLowerCase().trim() === name.toLowerCase().trim());
                if (!isRegistered && name.toLowerCase().trim() !== 'rm pabrik') {
                    unregistered[name] = {
                        name: name,
                        ...occupancyData[name],
                        status: 'historical',
                        isUnregistered: true
                    };
                }
            });
            await Promise.all(fetchPromises);
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
            if (warehouseStats[warehouse_id]) {
                const ratingData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE warehouse_id = ?').get(warehouse_id);
                warehouseStats[warehouse_id].avg_rating = ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(1)) : 0;
                warehouseStats[warehouse_id].total_reviews = ratingData.total_reviews || 0;
                io.emit('stats_updated', { 
                    id: warehouse_id, 
                    ...warehouseStats[warehouse_id]
                });
            }
            res.json({ success: true, id: info.lastInsertRowid });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    });
    const syncOccupancy = async () => {
        console.log('[SYNC] Fetching occupancy from Google Sheets...');
        try {
            const occupancyData = await googleSheets.getOccupancyData();
            const unregistered = {};
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
                    console.log(`[SYNC] ${id} (${nameInStats}): Occ=${data.occupancy}, Act=${data.actual}, Cap=${data.capacity}`);
                } else {
                    console.log(`[SYNC] No match for ${id} (${nameInStats}) in sheets`);
                }
                const ratingData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE warehouse_id = ?').get(id);
                warehouseStats[id].avg_rating = ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(1)) : 0;
                warehouseStats[id].total_reviews = ratingData.total_reviews || 0;
            });
            unregisteredWarehouses = {};
            Object.keys(occupancyData).forEach(name => {
                const isRegistered = Object.values(warehouseStats).some(w => w.name.toLowerCase().trim() === name.toLowerCase().trim());
                if (!isRegistered) {
                    unregisteredWarehouses[name] = {
                        name: name,
                        ...occupancyData[name],
                        status: 'offline',
                        isUnregistered: true
                    };
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
                const ratingData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE warehouse_id = ?').get(id);
                warehouseStats[id].avg_rating = ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(1)) : 0;
                warehouseStats[id].total_reviews = ratingData.total_reviews || 0;
                io.emit('warehouse_status_changed', { id, ...warehouseStats[id] });
                console.log(`Warehouse Registered: ${id}`);
            }
        });
        socket.on('update_stats', (stats) => {
            if (socket.warehouseId && warehouseStats[socket.warehouseId]) {
                warehouseStats[socket.warehouseId].lifetime = {
                    loading: stats.finished_muat_lifetime || 0,
                    unloading: stats.finished_bongkar_lifetime || 0
                };
                warehouseStats[socket.warehouseId].stats = stats;
                warehouseStats[socket.warehouseId].last_update = new Date();
                const ratingData = db.prepare('SELECT AVG(rating) as avg_rating, COUNT(*) as total_reviews FROM reviews WHERE warehouse_id = ?').get(socket.warehouseId);
                warehouseStats[socket.warehouseId].avg_rating = ratingData.avg_rating ? parseFloat(ratingData.avg_rating.toFixed(1)) : 0;
                warehouseStats[socket.warehouseId].total_reviews = ratingData.total_reviews || 0;
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
    server.use((req, res) => {
        const parsedUrl = parse(req.url, true);
        handle(req, res, parsedUrl);
    });
    httpServer.listen(PORT, (err) => {
        if (err) throw err;
        console.log(`> Ready on http://localhost:${PORT}`);
    });
});
