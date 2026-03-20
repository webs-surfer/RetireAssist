const express = require('express');
const router = express.Router();
const { getServices, getServiceById, createService } = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', getServices);
router.get('/:id', getServiceById);
router.post('/', protect, authorize('admin'), createService);

module.exports = router;
