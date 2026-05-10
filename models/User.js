const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, 'Please add a full name'],
    },
    email: {
      type: String,
      required: [true, 'Please add a verified email'],
      unique: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Please add a valid email',
      ],
    },
    phoneNumber: {
      type: String,
      // Optional validation can be added here
    },
    role: {
      type: String,
      enum: ['Client', 'Professional'],
      required: [true, 'Please specify a role (Client or Professional)'],
    },
    profilePicture: {
      type: String, // URL to the profile picture
      default: 'default-profile-pic-url',
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    verificationStatus: {
      type: String,
      enum: ['Unverified', 'Pending', 'Verified'],
      default: 'Unverified',
    },
    identityProof: {
      type: String, // path to the uploaded file
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('User', userSchema);
