const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
    request: { type: mongoose.Schema.Types.ObjectId, ref: 'Request', required: true },
    payer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    payee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    amount: { type: Number, required: true },
    platformFee: { type: Number, default: 0 }, // 10% commission
    helperPayout: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    status: { type: String, enum: ['created', 'pending', 'completed', 'failed', 'refunded'], default: 'created' },
    razorpayOrderId: { type: String, default: '' },
    razorpayPaymentId: { type: String, default: '' },
    razorpaySignature: { type: String, default: '' },
    method: { type: String, default: 'razorpay' },
    payoutStatus: { type: String, enum: ['pending', 'processing', 'paid', 'failed'], default: 'pending' },
    payoutDate: { type: Date, default: null },
    notes: { type: String, default: '' }
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
