const admin = require('../config/firebase');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let idToken;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      idToken = req.headers.authorization.split(' ')[1];

      // Verify Firebase ID Token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // We extract the user email or UID. Firebase usually gives us email and uid.
      // Let's find the user in our DB based on the email from Firebase token
      req.user = await User.findOne({ email: decodedToken.email });

      if (!req.user) {
        return res.status(401).json({ message: 'User not found in database' });
      }

      next();
    } catch (error) {
      console.error(error);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!idToken) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};

// Middleware to check roles
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};

// Middleware to ensure user is verified before accepting jobs
const requireVerification = (req, res, next) => {
  if (req.user.verificationStatus !== 'Verified' || !req.user.isVerified) {
    return res.status(403).json({
      message: 'Your profile is not verified. You cannot perform this action.',
    });
  }
  next();
};

module.exports = { protect, authorize, requireVerification };
