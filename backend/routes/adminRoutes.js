const express = require('express');
const router = express.Router();
const { getStats, getAllUsers, getPendingHelpers, verifyHelper, getPendingDocuments, verifyDocument, toggleUserStatus } = require('../controllers/adminController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// All admin routes require admin role
router.use(protect, authorize('admin'));

router.get('/stats', getStats);
router.get('/users', getAllUsers);
router.put('/user/:userId/toggle', toggleUserStatus);
router.get('/helpers', getPendingHelpers);
router.put('/verify-helper/:profileId', verifyHelper);
router.get('/documents', getPendingDocuments);
router.put('/verify-document/:docId', verifyDocument);

module.exports = router;
