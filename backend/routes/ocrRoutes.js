const express = require('express');
const router = express.Router();
const { ocrAadhaar } = require('../controllers/ocrController');
const { protect } = require('../middleware/authMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.post('/aadhaar', protect, upload.single('aadhaarImage'), ocrAadhaar);

module.exports = router;
