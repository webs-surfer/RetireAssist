const express = require('express');
const router = express.Router();
const { getChatByTask, sendMessage, getMyChats } = require('../controllers/chatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/my-chats', protect, getMyChats);
router.get('/:taskId', protect, getChatByTask);
router.post('/send', protect, sendMessage);

module.exports = router;
