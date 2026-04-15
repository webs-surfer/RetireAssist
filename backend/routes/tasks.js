const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Request = require('../models/Request');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Multer for final document upload
const docStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = path.join(__dirname, '../uploads/task-docs');
        fs.mkdirSync(dir, { recursive: true });
        cb(null, dir);
    },
    filename: (req, file, cb) => cb(null, `${req.params.id}_${Date.now()}_${file.originalname}`)
});
const uploadDoc = multer({ storage: docStorage, limits: { fileSize: 20 * 1024 * 1024 } });

function notify(userId, data) {
    try {
        Notification.create({ user: userId, ...data }).catch(() => {});
        const socketId = global.onlineUsers?.get(userId?.toString());
        if (socketId) global.io?.to(socketId).emit('notification', data);
    } catch (e) {}
}

// GET /api/tasks/:id — task details with timeline (uses Request model)
router.get('/:id', authMiddleware, async (req, res) => {
    try {
        const request = await Request.findById(req.params.id)
            .populate('user', 'name email phone')
            .populate('helper', 'name email phone rating isVerified faceImage publicKey')
            .populate('service', 'name category icon');
        if (!request) return res.status(404).json({ message: 'Task not found' });
        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching task', error: error.message });
    }
});

// PUT /api/tasks/:id/status — update status + add timeline note
router.put('/:id/status', authMiddleware, async (req, res) => {
    try {
        const { status, note } = req.body;
        const request = await Request.findById(req.params.id).populate('user').populate('helper');
        if (!request) return res.status(404).json({ message: 'Task not found' });

        const isHelper = request.helper?._id?.toString() === req.user.id;
        const isUser = request.user?._id?.toString() === req.user.id;
        if (!isHelper && !isUser && req.user.role !== 'admin') {
            return res.status(403).json({ message: 'Not authorized' });
        }

        request.status = status;
        request.timeline.push({ status, message: note || `Status updated to ${status}` });
        if (status === 'completed') request.completedAt = new Date();
        await request.save();

        const notifyUserId = request.user?._id?.toString();
        const msg = `Your task "${request.serviceName}" status changed to: ${status.replace('_', ' ')}`;
        if (notifyUserId) notify(notifyUserId, { type: 'task', title: 'Task Update', message: msg, link: `/user/track/${request._id}` });

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: 'Error updating task status', error: error.message });
    }
});

// POST /api/tasks/:id/document — helper uploads final document
router.post('/:id/document', authMiddleware, uploadDoc.single('finalDocument'), async (req, res) => {
    try {
        if (req.user.role !== 'helper') return res.status(403).json({ message: 'Helper only' });
        if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

        const request = await Request.findById(req.params.id).populate('user');
        if (!request) return res.status(404).json({ message: 'Task not found' });
        if (request.helper?.toString() !== req.user.id) return res.status(403).json({ message: 'Not your task' });

        const fileUrl = `/uploads/task-docs/${req.file.filename}`;
        request.timeline.push({ status: request.status, message: `Final document uploaded: ${req.file.originalname}` });
        // Store in documents array
        request.documents = request.documents || [];
        request.documents.push({ name: req.file.originalname, url: fileUrl, uploadedAt: new Date() });
        await request.save();

        notify(request.user?._id?.toString(), {
            type: 'document', title: 'Document Ready', message: `Your helper uploaded the final document for "${request.serviceName}"`, link: `/user/track/${request._id}`
        });

        res.json({ message: 'Document uploaded successfully', fileUrl, request });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
});

// POST /api/tasks/:id/rate — user rates helper after completion
router.post('/:id/rate', authMiddleware, async (req, res) => {
    try {
        const { rating, comment } = req.body;
        if (!rating || rating < 1 || rating > 5) return res.status(400).json({ message: 'Rating must be 1-5' });

        const request = await Request.findById(req.params.id).populate('helper');
        if (!request) return res.status(404).json({ message: 'Task not found' });
        if (request.user.toString() !== req.user.id) return res.status(403).json({ message: 'Only the user can rate' });
        if (request.status !== 'completed') return res.status(400).json({ message: 'Can only rate completed tasks' });
        if (request.rating) return res.status(400).json({ message: 'Already rated' });

        request.rating = rating;
        request.feedback = comment || '';
        await request.save();

        // Weighted rating update
        if (request.helper) {
            const helper = await User.findById(request.helper._id);
            const newTotal = helper.totalReviews + 1;
            const newRating = ((helper.rating * helper.totalReviews) + rating) / newTotal;
            await User.findByIdAndUpdate(helper._id, {
                rating: Math.round(newRating * 10) / 10,
                totalReviews: newTotal
            });
            notify(helper._id.toString(), {
                type: 'rating', title: 'New Rating!', message: `You received a ${rating}⭐ rating for "${request.serviceName}"`, link: '/helper/earnings'
            });
        }

        res.json({ message: 'Rating submitted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error submitting rating', error: error.message });
    }
});

module.exports = router;
