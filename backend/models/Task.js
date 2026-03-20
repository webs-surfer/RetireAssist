const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  helperId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  serviceType: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    trim: true,
  },
  price: {
    type: Number,
    default: 0,
  },
  proposedPrice: Number,
  status: {
    type: String,
    enum: ['pending', 'negotiation', 'accepted', 'in-progress', 'documents-submitted', 'admin-review', 'completed', 'rejected', 'cancelled'],
    default: 'pending',
  },
  stage: {
    type: Number,
    default: 1,
    min: 1,
    max: 5,
  },
  stageLabel: {
    type: String,
    default: 'Task Started',
  },
  instructions: String,
  location: {
    address: String,
    city: String,
    coordinates: [Number],
  },
  startTime: Date,
  endTime: Date,
  isPaid: {
    type: Boolean,
    default: false,
  },
  paymentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Payment',
  },
  documentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Document',
  },
  userRating: {
    rating: Number,
    feedback: String,
    ratedAt: Date,
  },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
