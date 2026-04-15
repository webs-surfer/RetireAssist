const mongoose = require('mongoose');

const requestSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
    serviceName: { type: String, required: true },
    description: { type: String, default: '' },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'documents_submitted', 'completed', 'cancelled', 'rejected'],
        default: 'pending'
    },
    agreedPrice: { type: Number, default: 0 },
    proposedPrice: { type: Number, default: 0 },
    priority: { type: String, enum: ['low', 'normal', 'urgent'], default: 'normal' },
    location: { type: String, default: '' },
    documents: [{ name: String, url: String, uploadedAt: Date }],
    timeline: [{
        status: String,
        message: String,
        timestamp: { type: Date, default: Date.now }
    }],
    chatId: { type: mongoose.Schema.Types.ObjectId, ref: 'Chat', default: null },
    rating: { type: Number, default: 0 },
    feedback: { type: String, default: '' },
    paymentStatus: { type: String, enum: ['unpaid', 'paid', 'refunded'], default: 'unpaid' },
    paymentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment', default: null },
    completedAt: { type: Date, default: null }
}, { timestamps: true });

module.exports = mongoose.model('Request', requestSchema);
