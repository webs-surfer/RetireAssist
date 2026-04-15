const express = require('express');
const crypto = require('crypto');
const Payment = require('../models/Payment');
const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

function notify(userId, data) {
    try {
        Notification.create({ user: userId, ...data }).catch(() => {});
        const socketId = global.onlineUsers?.get(userId?.toString());
        if (socketId) global.io?.to(socketId).emit('notification', data);
    } catch (e) {}
}

// POST /api/payments/order
router.post('/order', authMiddleware, async (req, res) => {
    try {
        const { requestId } = req.body;
        const serviceRequest = await Request.findById(requestId).populate('user').populate('helper');
        if (!serviceRequest) return res.status(404).json({ message: 'Request not found' });
        if (serviceRequest.user._id.toString() !== req.user.id) return res.status(403).json({ message: 'Not your request' });

        const amount = serviceRequest.agreedPrice || 0;
        const platformFee = Math.round(amount * 0.10);
        const helperPayout = amount - platformFee;

        if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
            const Razorpay = require('razorpay');
            const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });
            const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: requestId });
            const payment = await Payment.create({ request: requestId, payer: req.user.id, payee: serviceRequest.helper?._id, amount, platformFee, helperPayout, razorpayOrderId: order.id });
            return res.json({ order, payment, keyId: process.env.RAZORPAY_KEY_ID });
        }

        // Mock order for demo
        const mockOrderId = `mock_order_${Date.now()}`;
        const payment = await Payment.create({ request: requestId, payer: req.user.id, payee: serviceRequest.helper?._id || serviceRequest.user._id, amount, platformFee, helperPayout, razorpayOrderId: mockOrderId });
        res.json({ order: { id: mockOrderId, amount: amount * 100, currency: 'INR' }, payment, keyId: 'demo_mode' });
    } catch (error) {
        res.status(500).json({ message: 'Error creating payment', error: error.message });
    }
});

// POST /api/payments/verify — HMAC-SHA256 verification
router.post('/verify', authMiddleware, async (req, res) => {
    try {
        const { paymentId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

        // Verify signature if real Razorpay keys present
        if (razorpaySignature && process.env.RAZORPAY_KEY_SECRET) {
            const expectedSig = crypto
                .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
                .update(`${razorpayOrderId}|${razorpayPaymentId}`)
                .digest('hex');
            if (expectedSig !== razorpaySignature) {
                return res.status(400).json({ message: 'Payment signature verification failed' });
            }
        }

        const payment = await Payment.findById(paymentId).populate('request');
        if (!payment) return res.status(404).json({ message: 'Payment not found' });

        payment.status = 'completed';
        payment.razorpayPaymentId = razorpayPaymentId || `mock_pay_${Date.now()}`;
        payment.razorpaySignature = razorpaySignature || 'mock_sig';
        await payment.save();

        // Update request: mark as paid
        await Request.findByIdAndUpdate(payment.request._id, { paymentStatus: 'paid', paymentId: payment._id });

        // Update helper earnings
        await User.findByIdAndUpdate(payment.payee, { $inc: { earnings: payment.helperPayout, completedTasks: 1 } });

        // Notify both parties
        const helperId = payment.payee?.toString();
        const userId = payment.payer?.toString();
        if (helperId) notify(helperId, { type: 'payment', title: '💰 Payment Received!', message: `You received ₹${payment.helperPayout} for your service.`, link: '/helper/earnings' });
        if (userId) notify(userId, { type: 'payment', title: '✅ Payment Successful!', message: `Your payment of ₹${payment.amount} was processed. Documents are now unlocked.`, link: `/user/track/${payment.request._id}` });

        res.json({ message: 'Payment successful', payment });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying payment', error: error.message });
    }
});

// GET /api/payments/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const filter = req.user.role === 'helper' ? { payee: req.user.id } : { payer: req.user.id };
        const payments = await Payment.find(filter).populate('request', 'serviceName').sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
});

// GET /api/payments/all — admin
router.get('/all', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' });
        const payments = await Payment.find().populate('payer', 'name email').populate('payee', 'name email').populate('request', 'serviceName').sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
});

module.exports = router;
