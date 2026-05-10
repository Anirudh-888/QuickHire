const express = require('express');
const router = express.Router();
const { protect, authorize } = require('../middleware/auth');
const User = require('../models/User');

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

// Create/Register user (Simulated after Firebase signup)
router.post('/register', async (req, res) => {
  try {
    const { fullName, email, phoneNumber, role, profilePicture } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const user = await User.create({
      fullName,
      email,
      phoneNumber,
      role,
      profilePicture,
      isVerified: false // Admin or logic needed to verify
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
