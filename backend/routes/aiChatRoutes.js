const express = require('express');
const router = express.Router();
const { getHistory, addMessages, clearHistory } = require('../controllers/aiChatController');
const { protect } = require('../middleware/authMiddleware');

router.get('/', protect, getHistory);
router.post('/', protect, addMessages);
router.delete('/', protect, clearHistory);

module.exports = router;
