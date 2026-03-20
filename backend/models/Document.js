const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    // required: true, // Made optional for general documents
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  fileName: String,
  fileUrl: {
    type: String,
    required: true,
  },
  fileType: String,
  fileSize: Number,
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  adminFeedback: String,
  reviewedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  reviewedAt: Date,
  isLocked: {
    type: Boolean,
    default: true,
  },
  unlockedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Document', documentSchema);
