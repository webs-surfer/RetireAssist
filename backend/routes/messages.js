const express = require('express');
const Message = require('../models/Message');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/messages/:room – get messages for a room (requestId)
router.get('/:room', authMiddleware, async (req, res) => {
    try {
        const messages = await Message.find({ room: req.params.room })
            .sort({ createdAt: 1 })
            .limit(100);
        res.json(messages);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching messages', error: error.message });
    }
});

// POST /api/messages/:room – persist a message
router.post('/:room', authMiddleware, async (req, res) => {
    try {
        const { content, type, fileUrl } = req.body;
        const msg = await Message.create({
            room: req.params.room,
            sender: req.user.id,
            senderName: req.user.name,
            senderRole: req.user.role,
            content,
            type: type || 'text',
            fileUrl: fileUrl || ''
        });
        res.status(201).json(msg);
    } catch (error) {
        res.status(500).json({ message: 'Error saving message', error: error.message });
    }
});

// PUT /api/messages/:room/read – mark all messages in room as read
router.put('/:room/read', authMiddleware, async (req, res) => {
    try {
        await Message.updateMany(
            { room: req.params.room, sender: { $ne: req.user.id }, isRead: false },
            { $set: { isRead: true }, $addToSet: { readBy: req.user.id } }
        );
        res.json({ message: 'Messages marked as read' });
    } catch (error) {
        res.status(500).json({ message: 'Error marking messages read', error: error.message });
    }
});

module.exports = router;
