const express = require('express');
const router = express.Router();
const { uploadDocument, getDocument, getMyDocuments } = require('../controllers/documentController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

// Any authenticated user can upload documents (not just helpers)
router.post('/upload', protect, upload.single('document'), uploadDocument);
router.get('/my-documents', protect, getMyDocuments);
router.get('/:taskId', protect, getDocument);

module.exports = router;
