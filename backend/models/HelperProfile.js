const mongoose = require('mongoose');

const helperProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  kycStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  aadhaarNumber: {
    type: String,
    trim: true,
  },
  aadhaarImage: String,
  faceImage: String,
  servicesOffered: {
    type: [String],
    enum: ['Pension', 'Aadhaar', 'PAN', 'Insurance', 'EPF', 'Government', 'Health', 'Financial', 'Banking'],
    default: [],
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
  },
  totalRatings: {
    type: Number,
    default: 0,
  },
  totalJobs: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point',
    },
    coordinates: {
      type: [Number],
      default: [0, 0],
    },
    address: String,
    city: String,
  },
  priceRange: {
    min: { type: Number, default: 200 },
    max: { type: Number, default: 500 },
  },
  experience: {
    type: Number,
    default: 0,
  },
  languages: {
    type: [String],
    default: ['Hindi'],
  },
  bio: { type: String, trim: true, default: '' },
  adminFeedback: String,
  verifiedAt: Date,
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
}, { timestamps: true });

helperProfileSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('HelperProfile', helperProfileSchema);
