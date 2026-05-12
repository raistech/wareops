/**
 * Simple Authentication Middleware
 * Checks for a specific auth token in the headers
 */
const authMiddleware = (req, res, next) => {
    // Skip auth for login route and all GET requests (public data)
    if (req.path === '/login' || req.method === 'GET') {
        return next();
    }

    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Expecting "Bearer <token>"

    // Current hardcoded token used in the app
    const VALID_TOKEN = 'skye-admin-auth-token';

    if (!token) {
        return res.status(401).json({ error: 'Access denied. No token provided.' });
    }

    if (token !== VALID_TOKEN) {
        return res.status(403).json({ error: 'Invalid or expired token.' });
    }

    next();
};

module.exports = authMiddleware;
