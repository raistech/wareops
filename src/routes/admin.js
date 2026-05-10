const express = require('express');
const router = express.Router();
const db = require('../services/database');
const multer = require('multer');
const path = require('path');

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

// Settings Routes
router.get('/settings', (req, res) => {
    const settings = db.prepare('SELECT * FROM settings').all();
    const settingsObj = {};
    settings.forEach(s => settingsObj[s.key] = s.value);
    res.json(settingsObj);
});

router.post('/settings', (req, res) => {
    const updates = req.body;
    const stmt = db.prepare('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)');
    
    const transaction = db.transaction((data) => {
        for (const [key, value] of Object.entries(data)) {
            stmt.run(key, value.toString());
        }
    });
    
    transaction(updates);
    res.json({ success: true });
});

// Simple Auth Route
router.post('/login', (req, res) => {
    const { password } = req.body;
    console.log('[AUTH] Login attempt with password:', password);
    console.log('[AUTH] Expected password from ENV:', process.env.ADMIN_PASSWORD);
    
    if (password === process.env.ADMIN_PASSWORD) {
        console.log('[AUTH] Login successful');
        res.json({ success: true, token: 'fake-jwt-token-for-now' });
    } else {
        console.log('[AUTH] Login failed: Invalid password');
        res.status(401).json({ error: 'Invalid password' });
    }
});

module.exports = router;
