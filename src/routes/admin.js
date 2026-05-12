const express = require('express');
const router = express.Router();
const db = require('../services/database');
const multer = require('multer');
const path = require('path');
const authMiddleware = require('../middleware/auth');

// Storage config for uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Apply Auth Middleware to all routes below
router.use(authMiddleware);

// Simple Auth Route
router.post('/login', (req, res) => {
    const { password } = req.body;
    
    // Check database for custom password first, then fallback to .env
    const dbPass = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password');
    const actualPassword = dbPass ? dbPass.value : process.env.ADMIN_PASSWORD;

    if (password === actualPassword) {
        res.json({ success: true, token: process.env.NEXT_PUBLIC_ADMIN_TOKEN });
    } else {
        res.status(401).json({ error: 'Invalid password' });
    }
});

router.post('/change-password', (req, res) => {
    const { currentPassword, newPassword } = req.body;
    
    const dbPass = db.prepare('SELECT value FROM settings WHERE key = ?').get('admin_password');
    const actualPassword = dbPass ? dbPass.value : process.env.ADMIN_PASSWORD;

    if (currentPassword !== actualPassword) {
        return res.status(401).json({ error: 'Current password incorrect' });
    }

    db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('admin_password', newPassword);
    res.json({ success: true });
});

// Blog Routes
router.get('/blogs', (req, res) => {
    const blogs = db.prepare('SELECT * FROM blogs ORDER BY created_at DESC').all();
    res.json(blogs);
});

router.post('/blogs', upload.single('image'), (req, res) => {
    const { title, content } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    const stmt = db.prepare('INSERT INTO blogs (title, content, image_url) VALUES (?, ?, ?)');
    const info = stmt.run(title, content, imageUrl);
    res.json({ id: info.lastInsertRowid, title, imageUrl });
});

router.delete('/blogs/:id', (req, res) => {
    db.prepare('DELETE FROM blogs WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Banner Routes
router.get('/banners', (req, res) => {
    const banners = db.prepare('SELECT * FROM banners ORDER BY sort_order ASC').all();
    res.json(banners);
});

router.post('/banners', upload.single('image'), (req, res) => {
    const { title, link_url, is_active } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    if (!imageUrl) return res.status(400).json({ error: 'Image is required' });
    const stmt = db.prepare('INSERT INTO banners (title, image_url, link_url, is_active) VALUES (?, ?, ?, ?)');
    const info = stmt.run(title, imageUrl, link_url, is_active === 'true' ? 1 : 0);
    res.json({ id: info.lastInsertRowid, imageUrl });
});

router.delete('/banners/:id', (req, res) => {
    db.prepare('DELETE FROM banners WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Employee Routes
router.get('/employees', (req, res) => {
    const employees = db.prepare('SELECT * FROM employees ORDER BY warehouse_id, sort_order ASC').all();
    res.json(employees);
});

router.post('/employees', upload.single('image'), (req, res) => {
    const { name, position, warehouse_id, sort_order } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;
    
    const stmt = db.prepare('INSERT INTO employees (name, position, image_url, warehouse_id, sort_order) VALUES (?, ?, ?, ?, ?)');
    const info = stmt.run(name, position, imageUrl, warehouse_id, sort_order || 0);
    
    res.json({ id: info.lastInsertRowid, name, imageUrl });
});

router.delete('/employees/:id', (req, res) => {
    db.prepare('DELETE FROM employees WHERE id = ?').run(req.params.id);
    res.json({ success: true });
});

// Review Moderation Routes
router.get('/reviews', (req, res) => {
    try {
        const reviews = db.prepare('SELECT * FROM reviews ORDER BY created_at DESC').all();
        res.json(reviews);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/reviews/:id', (req, res) => {
    try {
        db.prepare('DELETE FROM reviews WHERE id = ?').run(req.params.id);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Report Management Routes
router.get('/reports', (req, res) => {
    try {
        const reports = db.prepare('SELECT * FROM reports ORDER BY created_at DESC').all();
        res.json(reports);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.put('/reports/:id/status', (req, res) => {
    try {
        const { status } = req.body;
        const report = db.prepare('SELECT warehouse_id FROM reports WHERE id = ?').get(req.params.id);
        
        if (report) {
            db.prepare('UPDATE reports SET status = ? WHERE id = ?').run(status, req.params.id);
            // Refresh stats to ensure client gets the final verified count
            if (req.io) {
                const activeReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE warehouse_id = ? AND status IN ('pending', 'received')").get(report.warehouse_id);
                req.io.emit('report_count_updated', { warehouse_id: report.warehouse_id, count: activeReports.count || 0 });
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.delete('/reports/:id', (req, res) => {
    try {
        const report = db.prepare('SELECT warehouse_id FROM reports WHERE id = ?').get(req.params.id);
        if (report) {
            db.prepare('DELETE FROM reports WHERE id = ?').run(req.params.id);
            if (req.io) {
                const activeReports = db.prepare("SELECT COUNT(*) as count FROM reports WHERE warehouse_id = ? AND status IN ('pending', 'received')").get(report.warehouse_id);
                req.io.emit('report_count_updated', { warehouse_id: report.warehouse_id, count: activeReports.count || 0 });
            }
        }
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Settings routes
router.get('/settings', (req, res) => {
    try {
        const rows = db.prepare('SELECT * FROM settings').all();
        const settings = {};
        rows.forEach(row => settings[row.key] = row.value);
        res.json(settings);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/settings', (req, res) => {
    try {
        const settings = req.body;
        const upsert = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
        const transaction = db.transaction((data) => {
            for (const [key, value] of Object.entries(data)) {
                upsert.run(key, value ? value.toString() : '');
            }
        });
        transaction(settings);
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

router.post('/settings/icon', upload.single('image'), (req, res) => {
    try {
        if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
        const imageUrl = `/uploads/${req.file.filename}`;
        db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)').run('site_icon', imageUrl);
        res.json({ success: true, imageUrl });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
