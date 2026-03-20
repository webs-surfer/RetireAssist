const Task = require('../models/Task');
const Payment = require('../models/Payment');
const Document = require('../models/Document');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const { createNotification } = require('./notificationController');

// @desc    Create payment (demo mode — no Razorpay)
// @route   POST /api/payment/create
// @access  Private
const createPayment = async (req, res) => {
  try {
    const { taskId, amount, helperId } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return sendError(res, 404, 'Task not found');

    const payment = await Payment.create({
      taskId,
      userId: req.user._id,
      helperId,
      amount: amount || task.price || 0,
      status: 'pending',
      transactionId: `demo_txn_${Date.now()}`,
    });

    return sendSuccess(res, 201, 'Payment initiated (Demo Mode)', {
      payment,
      demoMode: true,
      message: 'Razorpay integration available when RAZORPAY_KEY_ID is configured.',
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Verify/complete payment (demo mode)
// @route   POST /api/payment/verify
// @access  Private
const verifyPayment = async (req, res) => {
  try {
    const { taskId } = req.body;

    // Update payment
    const payment = await Payment.findOneAndUpdate(
      { taskId },
      { status: 'completed', transactionId: `demo_paid_${Date.now()}` },
      { new: true }
    );

    // Unlock documents
    await Document.updateMany({ taskId }, { isLocked: false });

    // Complete task
    await Task.findByIdAndUpdate(taskId, {
      paymentStatus: 'paid',
      stage: 5,
      status: 'completed',
      stageLabel: 'Completed',
    });

    // Notify helper
    const io = req.app.get('io');
    const task = await Task.findById(taskId);
    if (task?.helperId) {
      await createNotification(io, task.helperId, {
        type: 'payment',
        title: 'Payment Received',
        message: `Payment of ₹${payment?.amount || 0} received for ${task.serviceType}`,
        icon: '💰',
        relatedId: task._id,
        relatedModel: 'Task',
      });
    }

    return sendSuccess(res, 200, 'Payment verified successfully (Demo)', { payment });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get payment history
// @route   GET /api/payment/history
// @access  Private
const getPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find({ userId: req.user._id })
      .populate('taskId', 'serviceType')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, `${payments.length} payments found`, { payments });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Demo complete payment in one shot (no gateway needed)
// @route   POST /api/payment/demo-complete
// @access  Private
const demoCompletePayment = async (req, res) => {
  try {
    const { taskId, amount, method, demoReference } = req.body;

    const task = await Task.findById(taskId);
    if (!task) return sendError(res, 404, 'Task not found');
    if (task.isPaid) return sendSuccess(res, 200, 'Already paid', {});

    // Create and immediately complete payment record
    const payment = await Payment.create({
      taskId,
      userId: req.user._id,
      helperId: task.helperId,
      amount: amount || task.price || task.proposedPrice || 0,
      status: 'completed',
      transactionId: demoReference || `demo_${Date.now()}`,
      method: method || 'demo',
    });

    // Unlock documents
    await Document.updateMany({ taskId }, { isLocked: false, unlockedAt: new Date() });

    // Update task: mark paid, stage 5
    await Task.findByIdAndUpdate(taskId, {
      isPaid: true,
      paymentId: payment._id,
      stage: 5,
      status: 'completed',
      stageLabel: 'Completed',
      endTime: new Date(),
    });

    // Notify helper
    const io = req.app.get('io');
    if (task.helperId) {
      await createNotification(io, task.helperId, {
        type: 'payment',
        title: 'Payment Received! 💰',
        message: `₹${payment.amount} received for ${task.serviceType} service.`,
        icon: '💰',
        relatedId: task._id,
        relatedModel: 'Task',
      });
      io.to(`user_${task.helperId}`).emit('payment_received', { payment, taskId });
    }

    return sendSuccess(res, 200, 'Payment completed successfully', { payment });
  } catch (error) {
    console.error('demoCompletePayment error:', error);
    return sendError(res, 500, error.message);
  }
};

module.exports = { createPayment, verifyPayment, getPaymentHistory, demoCompletePayment };

