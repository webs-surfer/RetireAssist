const express = require('express');
const User = require('../models/User');
const Request = require('../models/Request');
const Payment = require('../models/Payment');
const Notification = require('../models/Notification');
const { authMiddleware, adminMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/admin/stats
router.get('/stats', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const [totalUsers, totalHelpers, pendingHelpers, totalRequests, completedRequests, totalRevenue] = await Promise.all([
            User.countDocuments({ role: 'user' }),
            User.countDocuments({ role: 'helper' }),
            User.countDocuments({ role: 'helper', onboardingStatus: 'pending' }),
            Request.countDocuments(),
            Request.countDocuments({ status: 'completed' }),
            Payment.aggregate([{ $match: { status: 'completed' } }, { $group: { _id: null, total: { $sum: '$platformFee' } } }])
        ]);
        res.json({ totalUsers, totalHelpers, pendingHelpers, totalRequests, completedRequests, totalRevenue: totalRevenue[0]?.total || 0 });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching stats', error: error.message });
    }
});

// GET /api/admin/users — with search + pagination
router.get('/users', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { search, role, page = 1, limit = 10 } = req.query;
        const filter = {};
        if (role) filter.role = role;
        if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const [users, total] = await Promise.all([
            User.find(filter)
                .select('-password -aadhaarEncrypted -aadhaarIv -panEncrypted -panIv -pensionIdEncrypted -pensionIdIv -monthlyPensionEncrypted -monthlyPensionIv')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit)),
            User.countDocuments(filter)
        ]);
        res.json({ users, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching users', error: error.message });
    }
});

// GET /api/admin/helpers
router.get('/helpers', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = { role: 'helper' };
        if (status) filter.onboardingStatus = status;
        const helpers = await User.find(filter)
            .select('-password -aadhaarEncrypted -panEncrypted')
            .sort({ createdAt: -1 });
        res.json(helpers);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching helpers', error: error.message });
    }
});

// PUT /api/admin/helpers/:id/verify — approve or reject with reason
router.put('/helpers/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { action, decision, reason, rejectionReason } = req.body;
        const resolvedDecision = decision || action; // accept either key
        const isApproved = resolvedDecision === 'approve' || resolvedDecision === 'approved';
        const rejectReason = rejectionReason || reason || 'Documents were not clear';

        const helper = await User.findByIdAndUpdate(req.params.id, {
            onboardingStatus: isApproved ? 'approved' : 'rejected',
            isVerified: isApproved,
            ...(isApproved ? {} : { rejectionReason: rejectReason })
        }, { new: true }).select('-password');

        if (!helper) return res.status(404).json({ message: 'Helper not found' });

        await Notification.create({
            user: helper._id,
            type: 'kyc',
            title: isApproved ? '🎉 KYC Approved!' : '❌ KYC Rejected',
            message: isApproved
                ? 'Your identity has been verified. You can now accept service requests!'
                : `KYC rejected. Reason: ${rejectReason}. Please re-upload.`,
            link: isApproved ? '/helper/dashboard' : '/helper/profile'
        });

        const socketId = global.onlineUsers?.get(helper._id.toString());
        if (socketId) global.io?.to(socketId).emit('notification', { type: 'kyc', approved: isApproved });

        res.json({ message: `Helper ${isApproved ? 'approved' : 'rejected'} successfully`, helper });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying helper', error: error.message });
    }
});

// GET /api/admin/tasks — all requests, filterable by status
router.get('/tasks', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const requests = await Request.find(filter)
            .populate('user', 'name email')
            .populate('helper', 'name email')
            .populate('service', 'name category')
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching tasks', error: error.message });
    }
});

// GET /api/admin/payments
router.get('/payments', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const payments = await Payment.find()
            .populate('payer', 'name email')
            .populate('payee', 'name email')
            .populate('request', 'serviceName')
            .sort({ createdAt: -1 });
        res.json(payments);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching payments', error: error.message });
    }
});

// GET /api/admin/requests (alias for tasks)
router.get('/requests', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { status } = req.query;
        const filter = {};
        if (status) filter.status = status;
        const requests = await Request.find(filter)
            .populate('user', 'name email')
            .populate('helper', 'name email')
            .populate('service', 'name category')
            .sort({ createdAt: -1 })
            .limit(200);
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// PUT /api/admin/users/:id/role
router.put('/users/:id/role', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        const { role } = req.body;
        const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
        if (!user) return res.status(404).json({ message: 'User not found' });
        res.json({ message: 'Role updated', user });
    } catch (error) {
        res.status(500).json({ message: 'Error updating role', error: error.message });
    }
});

// DELETE /api/admin/users/:id
router.delete('/users/:id', authMiddleware, adminMiddleware, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user', error: error.message });
    }
});

module.exports = router;
