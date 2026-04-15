const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
    name: { type: String, required: true },
    category: {
        type: String,
        enum: ['pension', 'insurance', 'tax', 'government', 'banking', 'legal', 'healthcare', 'other'],
        required: true
    },
    description: { type: String, required: true },
    icon: { type: String, default: '📄' },
    estimatedDays: { type: Number, default: 7 },
    basePrice: { type: Number, default: 500 },
    requiredDocuments: [{ type: String }],
    steps: [{ type: String }],
    isActive: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model('Service', serviceSchema);
