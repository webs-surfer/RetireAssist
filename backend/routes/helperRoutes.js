const express = require('express');
const router = express.Router();
const { submitKYC, getNearbyHelpers, getHelperRequests, updateAvailability, getHelperProfile } = require('../controllers/helperController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const upload = require('../middleware/uploadMiddleware');

router.get('/nearby', protect, getNearbyHelpers);
router.get('/profile', protect, authorize('helper'), getHelperProfile);
router.get('/requests', protect, authorize('helper'), getHelperRequests);
router.post('/kyc', protect, authorize('helper'), upload.fields([{ name: 'aadhaar', maxCount: 1 }, { name: 'face', maxCount: 1 }]), submitKYC);
router.put('/update-availability', protect, authorize('helper'), updateAvailability);

module.exports = router;
