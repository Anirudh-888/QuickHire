const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');

// Example route: Get current user profile
// Protected by JWT
router.get('/me', protect, async (req, res) => {
  try {
    res.status(200).json(req.user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Example route: Client only route
router.get('/client-dashboard', protect, authorize('Client'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the Client Dashboard' });
});

// Example route: Professional only route
router.get('/professional-dashboard', protect, authorize('Professional'), (req, res) => {
  res.status(200).json({ message: 'Welcome to the Professional Dashboard' });
});

module.exports = router;
