const express = require('express');
const router = express.Router();
const { createTask, getUserTasks, getHelperTasks, acceptTask, rejectTask, updateTaskStatus, rateTask, getTaskById } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');
const { validate, taskSchema, ratingSchema } = require('../utils/validators');

router.post('/create', protect, authorize('user', 'admin'), validate(taskSchema), createTask);
router.get('/user', protect, authorize('user', 'admin'), getUserTasks);
router.get('/helper', protect, authorize('helper', 'admin'), getHelperTasks);
router.get('/:taskId', protect, getTaskById);
router.put('/accept/:taskId', protect, authorize('helper'), acceptTask);
router.put('/reject/:taskId', protect, authorize('helper'), rejectTask);
router.put('/update-status/:taskId', protect, authorize('helper'), updateTaskStatus);
router.put('/rate/:taskId', protect, authorize('user', 'admin'), validate(ratingSchema), rateTask);

module.exports = router;
