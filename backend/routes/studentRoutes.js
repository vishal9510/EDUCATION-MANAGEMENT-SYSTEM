const express = require('express');
const { protect, authorizeRoles } = require('../middleware/authMiddleware');
const router = express.Router();

// Student-only route (e.g., viewing progress)
router.get('/student-dashboard', protect, authorizeRoles('student'), (req, res) => {
    res.json({ message: 'Welcome to the student dashboard' });
});

module.exports = router;
