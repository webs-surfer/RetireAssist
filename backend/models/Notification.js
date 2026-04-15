const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['request', 'task', 'payment', 'chat', 'system', 'kyc'], default: 'system' },
    title: { type: String, required: true },
    message: { type: String, required: true },
    link: { type: String, default: '' },
    isRead: { type: Boolean, default: false },
    data: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);
