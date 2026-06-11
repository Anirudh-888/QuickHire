const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { protect } = require('../middleware/auth');
const admin = require('../config/firebase');

// Configure multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    // Create uploads directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// File filter for PDF and Images
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only images and PDF files are allowed!'), false);
  }
};

const upload = multer({ storage: storage, fileFilter: fileFilter });

// Placeholder OCR Service Function
const performOCRService = async (filePath) => {
  console.log(`[OCR SERVICE] Analyzing document at: ${filePath}`);
  return new Promise((resolve) => {
    setTimeout(() => {
      console.log(`[OCR SERVICE] Analysis complete. Document flagged for pending verification.`);
      resolve({ status: 'success', confidence: 0.85 });
    }, 2000); // Simulate 2-second processing time
  });
};

// Route: POST /api/verify/upload-id
// Desc: Upload ID for Professional Verification
// Access: Private
router.post('/upload-id', protect, upload.single('identityDocument'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'Please upload a file' });
    }

    const userId = req.user.id;
    const filePath = req.file.path;

    // Run the placeholder OCR service
    await performOCRService(filePath);

    // Update the user's verification status
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.update({
      identityProof: `/uploads/${req.file.filename}`,
      verificationStatus: 'Pending',
    });
    
    const docSnap = await userRef.get();
    const updatedUser = docSnap.data();

    res.status(200).json({
      message: 'Identity document uploaded successfully. Profile is pending verification.',
      verificationStatus: updatedUser.verificationStatus,
      identityProof: updatedUser.identityProof
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
