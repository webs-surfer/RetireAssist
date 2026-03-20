const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  category: { type: String, required: true, enum: ['Pension', 'Insurance', 'Government', 'Financial', 'Health'] },
  description: { type: String, trim: true },
  icon: { type: String, default: '📋' },
  color: { type: String, default: '#EBF5FB' },
  difficulty: { type: String, enum: ['Easy', 'Medium', 'Hard'], default: 'Easy' },
  estimatedDays: { type: Number, default: 7 },
  minAge: { type: Number, default: 0 },
  maxAge: { type: Number, default: 120 },
  eligibility: [String],
  requiredDocuments: [String],
  benefits: [String],
  applicationSteps: [String],
  fees: { type: String, default: 'Free' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
