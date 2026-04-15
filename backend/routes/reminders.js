const express = require('express');
const Reminder = require('../models/Reminder');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// GET /api/reminders
router.get('/', authMiddleware, async (req, res) => {
    try {
        const reminders = await Reminder.find({ userId: req.user.id }).sort({ dueDate: 1 });
        res.json(reminders);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching reminders', error: error.message });
    }
});

// POST /api/reminders
router.post('/', authMiddleware, async (req, res) => {
    try {
        const { title, description, dueDate, type, priority } = req.body;
        const reminder = new Reminder({
            userId: req.user.id,
            title,
            description,
            dueDate,
            type: type || 'custom',
            priority: priority || 'medium'
        });
        await reminder.save();
        res.status(201).json({ message: 'Reminder created', reminder });
    } catch (error) {
        res.status(500).json({ message: 'Error creating reminder', error: error.message });
    }
});

// PUT /api/reminders/:id
router.put('/:id', authMiddleware, async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndUpdate(
            { _id: req.params.id, userId: req.user.id },
            req.body,
            { new: true }
        );
        if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
        res.json({ message: 'Reminder updated', reminder });
    } catch (error) {
        res.status(500).json({ message: 'Error updating reminder', error: error.message });
    }
});

// DELETE /api/reminders/:id
router.delete('/:id', authMiddleware, async (req, res) => {
    try {
        const reminder = await Reminder.findOneAndDelete({ _id: req.params.id, userId: req.user.id });
        if (!reminder) return res.status(404).json({ message: 'Reminder not found' });
        res.json({ message: 'Reminder deleted' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting reminder', error: error.message });
    }
});

module.exports = router;
