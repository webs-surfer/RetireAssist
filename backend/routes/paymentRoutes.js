const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getPaymentHistory, demoCompletePayment } = require('../controllers/paymentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.post('/create', protect, authorize('user'), createPayment);
router.post('/verify', protect, authorize('user'), verifyPayment);
router.post('/demo-complete', protect, demoCompletePayment);
router.get('/history', protect, getPaymentHistory);

module.exports = router;

