const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Admin-only route (e.g., managing users)
router.get('/admin-dashboard', protect, authorizeRoles('admin'), (req, res) => {
    res.json({ message: 'Welcome to the admin dashboard' });
});

module.exports = router;
