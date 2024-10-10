const jwt = require('jsonwebtoken');
const User = require('../model/user.model');

// Middleware to protect routes and ensure user is authenticated
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1]; // Get the token from the headers
            const decoded = jwt.verify(token, process.env.JWT_SECRET); // Verify the token
            req.user = await User.findById(decoded.id).select('-password'); // Get user from token
            next();
        } catch (err) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    }

    if (!token) {
        return res.status(401).json({ message: 'Not authorized, no token' });
    }
};

// Role-based access control (only allows specific roles to access routes)
const authorizeRoles = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ message: 'Access denied' });
        }
        next();
    };
};

module.exports = { protect, authorizeRoles };
