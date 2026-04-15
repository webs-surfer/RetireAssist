const express = require('express');
const Request = require('../models/Request');
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

// POST /api/requests – user creates a new request
router.post('/', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'user') return res.status(403).json({ message: 'Only users can create requests' });
        const { serviceId, serviceName, description, helperId, proposedPrice, priority, location } = req.body;

        const request = new Request({
            user: req.user.id,
            service: serviceId,
            serviceName,
            description,
            helper: helperId || null,
            proposedPrice: proposedPrice || 0,
            priority: priority || 'normal',
            location,
            timeline: [{ status: 'pending', message: 'Request created and awaiting helper acceptance' }]
        });

        await request.save();
        await request.populate('user', 'name email phone');

        // Notify helper if one was selected
        if (helperId) {
            notify(helperId, {
                type: 'request',
                title: 'New Service Request',
                message: `${req.user.name} has requested your help with "${serviceName}"`,
                link: `/helper/requests`
            });
        }

        res.status(201).json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error creating request', error: error.message });
    }
});

// GET /api/requests/mine – current user/helper's own requests
router.get('/mine', authMiddleware, async (req, res) => {
    try {
        const filter = req.user.role === 'user' ? { user: req.user.id } : { helper: req.user.id };
        const requests = await Request.find(filter)
            .populate('user', 'name email phone age')
            .populate('helper', 'name email phone rating isVerified')
            .populate('service', 'name category icon')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// GET /api/requests/available – helpers browse open requests
router.get('/available', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'helper') return res.status(403).json({ message: 'Helper only' });
        const requests = await Request.find({ status: 'pending', helper: null })
            .populate('user', 'name age location')
            .populate('service', 'name category icon')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching requests', error: error.message });
    }
});

// GET /api/requests/:id
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('user', 'name email phone age')
            .populate('helper', 'name email phone rating isVerified faceImage')
            .populate('service');
        if (!request) return res.status(404).json({ message: 'Request not found' });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching request', error: error.message });
    }
});

// PUT /api/requests/:id/accept – helper accepts a request
router.put('/:id/accept', authMiddleware, async (req, res) => {
    try {
        if (req.user.role !== 'helper') return res.status(403).json({ message: 'Helper only' });
        const { agreedPrice } = req.body;
        const request = await Request.findById(req.params.id);
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.status !== 'pending') return res.status(400).json({ message: 'Request already accepted' });

        request.helper = req.user.id;
        request.status = 'accepted';
        request.agreedPrice = agreedPrice || request.proposedPrice;
        request.timeline.push({ status: 'accepted', message: `Request accepted by ${req.user.name}` });
        await request.save();
        await request.populate(['user', 'helper', 'service']);

        notify(request.user._id?.toString(), {
            type: 'request',
            title: 'Request Accepted!',
            message: `${req.user.name} has accepted your request for "${request.serviceName}"`,
            link: `/user/track/${request._id}`
        });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error accepting request', error: error.message });
    }
});

// PUT /api/requests/:id/status – update request status
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status, message } = req.body;
        const request = await Request.findById(req.params.id).populate('user').populate('helper');
        if (!request) return res.status(404).json({ message: 'Request not found' });

        const isOwner = request.user._id.toString() === req.user.id || request.helper?._id?.toString() === req.user.id;
        if (!isOwner && req.user.role !== 'admin') return res.status(403).json({ message: 'Not authorized' });

        request.status = status;
        request.timeline.push({ status, message: message || `Status updated to ${status}` });
        if (status === 'completed') request.completedAt = new Date();
        await request.save();

        const notifyUserId = request.user._id?.toString();
        const notifyHelperId = request.helper?._id?.toString();
        const msg = `Your request "${request.serviceName}" status: ${status}`;
        if (notifyUserId) notify(notifyUserId, { type: 'task', title: 'Task Update', message: msg, link: `/user/track/${request._id}` });
        if (notifyHelperId) notify(notifyHelperId, { type: 'task', title: 'Task Update', message: msg, link: `/helper/tasks/${request._id}` });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error updating status', error: error.message });
    }
});

// PUT /api/requests/:id/rate – user rates helper
router.put('/:id/rate', authMiddleware, async (req, res) => {
    try {
        const { rating, feedback } = req.body;
        const request = await Request.findById(req.params.id).populate('helper');
        if (!request) return res.status(404).json({ message: 'Request not found' });
        if (request.user.toString() !== req.user.id) return res.status(403).json({ message: 'Only the user can rate' });
        if (request.status !== 'completed') return res.status(400).json({ message: 'Can only rate completed tasks' });

        request.rating = rating;
        request.feedback = feedback;
        await request.save();

        // Update helper's overall rating
        if (request.helper) {
            const User = require('../models/User');
            const helper = await User.findById(request.helper._id);
            const newTotal = helper.totalReviews + 1;
            const newRating = ((helper.rating * helper.totalReviews) + rating) / newTotal;
            await User.findByIdAndUpdate(helper._id, { rating: Math.round(newRating * 10) / 10, totalReviews: newTotal });
        }

        res.json({ message: 'Rating submitted' });
    } catch (error) {
        res.status(500).json({ message: 'Error rating helper', error: error.message });
    }
});

module.exports = router;
