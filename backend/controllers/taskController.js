const Task = require('../models/Task');
const Chat = require('../models/Chat');
const HelperProfile = require('../models/HelperProfile');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const { createNotification } = require('./notificationController');

const STAGES = ['Task Started', 'In Progress', 'Documents Submitted', 'Admin Review', 'Completed'];

// @desc    Create task (user sends request to helper)
// @route   POST /api/task/create
// @access  Private (user)
const createTask = async (req, res) => {
  try {
    const { helperId, serviceType, description, proposedPrice, instructions } = req.body;

    if (!helperId || !serviceType) {
      return sendError(res, 400, 'helperId and serviceType are required');
    }

    console.log('[Task Create] User:', req.user._id, 'Helper:', helperId, 'Service:', serviceType, 'Price:', proposedPrice);

    const task = await Task.create({
      userId: req.user._id,
      helperId,
      serviceType,
      description: description || `Need help with ${serviceType}`,
      proposedPrice: proposedPrice || 0,
      price: proposedPrice || 0,
      instructions: instructions || '',
      status: 'pending',
      stage: 1,
      stageLabel: STAGES[0],
    });

    console.log('[Task Create] Created:', task._id);

    // Create chat room for this task
    try {
      await Chat.create({
        taskId: task._id,
        participants: [req.user._id, helperId],
      });
    } catch (chatErr) {
      console.warn('[Task Create] Chat room creation failed:', chatErr.message);
    }

    // Emit to helper via socket
    const io = req.app.get('io');
    io.to(`user_${helperId}`).emit('new_request', { task });

    // Create notification for helper
    if (helperId) {
      try {
        await createNotification(io, helperId, {
          type: 'task',
          title: 'New Task Request',
          message: `You have a new ${serviceType} request.`,
          icon: '📋',
          relatedId: task._id,
          relatedModel: 'Task',
        });
      } catch (notifErr) {
        console.warn('[Task Create] Notification failed:', notifErr.message);
      }
    }

    return sendSuccess(res, 201, 'Task request sent successfully', { task });
  } catch (error) {
    console.error('[Task Create Error]:', error);
    return sendError(res, 500, error.message);
  }
};

// @desc    Get tasks for user
// @route   GET /api/task/user
// @access  Private (user)
const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ userId: req.user._id })
      .populate('helperId', 'name phone')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks fetched', { tasks });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get tasks for helper
// @route   GET /api/task/helper
// @access  Private (helper)
const getHelperTasks = async (req, res) => {
  try {
    const tasks = await Task.find({ helperId: req.user._id })
      .populate('userId', 'name phone age location')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Tasks fetched', { tasks });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Accept task
// @route   PUT /api/task/accept/:taskId
// @access  Private (helper)
const acceptTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return sendError(res, 404, 'Task not found');
    if (task.helperId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized');
    }

    task.status = 'accepted';
    task.startTime = new Date();
    await task.save();

    const io = req.app.get('io');
    io.to(`task_${task._id}`).emit('task_accepted', { taskId: task._id, status: task.status });
    io.to(`user_${task.userId}`).emit('task_update', { task });

    return sendSuccess(res, 200, 'Task accepted', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Reject task
// @route   PUT /api/task/reject/:taskId
// @access  Private (helper)
const rejectTask = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return sendError(res, 404, 'Task not found');

    task.status = 'rejected';
    await task.save();

    const io = req.app.get('io');
    io.to(`user_${task.userId}`).emit('task_rejected', { taskId: task._id });

    return sendSuccess(res, 200, 'Task rejected', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Update task stage/status
// @route   PUT /api/task/update-status/:taskId
// @access  Private (helper)
const updateTaskStatus = async (req, res) => {
  try {
    const { status, stage } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return sendError(res, 404, 'Task not found');

    task.status = status || task.status;
    if (stage && stage >= 1 && stage <= 5) {
      task.stage = stage;
      task.stageLabel = STAGES[stage - 1];
    }
    if (status === 'completed') task.endTime = new Date();

    await task.save();

    const io = req.app.get('io');
    io.to(`task_${task._id}`).emit('task_status_update', { task });
    io.to(`user_${task.userId}`).emit('task_update', { task });

    return sendSuccess(res, 200, 'Task updated', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Rate task/helper
// @route   PUT /api/task/rate/:taskId
// @access  Private (user)
const rateTask = async (req, res) => {
  try {
    const { rating, feedback } = req.body;
    const task = await Task.findById(req.params.taskId);
    if (!task) return sendError(res, 404, 'Task not found');
    if (task.userId.toString() !== req.user._id.toString()) {
      return sendError(res, 403, 'Not authorized');
    }

    task.userRating = { rating, feedback, ratedAt: new Date() };
    await task.save();

    // Update helper rating
    const helperProfile = await HelperProfile.findOne({ userId: task.helperId });
    if (helperProfile) {
      const totalRatings = helperProfile.totalRatings + 1;
      const newRating = ((helperProfile.rating * helperProfile.totalRatings) + rating) / totalRatings;
      helperProfile.rating = Math.round(newRating * 10) / 10;
      helperProfile.totalRatings = totalRatings;
      await helperProfile.save();
    }

    return sendSuccess(res, 200, 'Rating submitted', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get single task
// @route   GET /api/task/:taskId
// @access  Private
const getTaskById = async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId)
      .populate('userId', 'name phone')
      .populate('helperId', 'name phone')
      .populate('documentId')
      .populate('paymentId');

    if (!task) return sendError(res, 404, 'Task not found');
    return sendSuccess(res, 200, 'Task fetched', { task });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { createTask, getUserTasks, getHelperTasks, acceptTask, rejectTask, updateTaskStatus, rateTask, getTaskById };
