const admin = require('../config/firebase');

const protect = async (req, res, next) => {
  let idToken;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      // Get token from header
      idToken = req.headers.authorization.split(' ')[1];

      // Verify Firebase ID Token
      const decodedToken = await admin.auth().verifyIdToken(idToken);

      // Fetch the user from Firestore
      const userRef = admin.firestore().collection('users').doc(decodedToken.uid);
      const docSnap = await userRef.get();

      if (!docSnap.exists) {
        return res.status(401).json({ message: 'User not found in database' });
      }

      req.user = { id: docSnap.id, ...docSnap.data() };

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
