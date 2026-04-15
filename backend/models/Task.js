const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    helper: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
        type: String,
        enum: ['pending', 'accepted', 'in_progress', 'documents_submitted', 'completed', 'cancelled'],
        default: 'accepted'
    },
    documents: [{
        name: String,
        url: String,
        uploadedAt: { type: Date, default: Date.now }
    }],
    timeline: [{
        status: String,
        note: String,
        timestamp: { type: Date, default: Date.now }
    }],
    finalDocument: { type: String, default: '' },
    isDocumentApproved: { type: Boolean, default: false },
    isPaymentDone: { type: Boolean, default: false },
    rating: { type: Number, default: 0 },
    ratingComment: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
