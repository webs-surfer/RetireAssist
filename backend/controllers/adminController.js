const User = require('../models/User');
const HelperProfile = require('../models/HelperProfile');
const Document = require('../models/Document');
const Task = require('../models/Task');
const Payment = require('../models/Payment');
const { sendSuccess, sendError } = require('../utils/sendResponse');
const { createNotification } = require('./notificationController');

// @desc    Get platform stats
// @route   GET /api/admin/stats
// @access  Private (admin)
const getStats = async (req, res) => {
  try {
    const [totalUsers, totalHelpers, totalTasks, pendingKyc, pendingDocs, completedTasks, totalPayments] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'helper' }),
      Task.countDocuments(),
      HelperProfile.countDocuments({ kycStatus: 'pending' }),
      Document.countDocuments({ status: 'pending' }),
      Task.countDocuments({ status: 'completed' }),
      Payment.countDocuments({ status: 'completed' }),
    ]);

    return sendSuccess(res, 200, 'Stats fetched', {
      stats: { totalUsers, totalHelpers, totalTasks, pendingKyc, pendingDocs, completedTasks, totalPayments },
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).select('-password').sort({ createdAt: -1 });
    return sendSuccess(res, 200, `${users.length} users found`, { users });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get all helpers with KYC status
// @route   GET /api/admin/helpers?status=pending|approved|rejected|all
// @access  Private (admin)
const getPendingHelpers = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const query = status !== 'all' ? { kycStatus: status } : {};
    const profiles = await HelperProfile.find(query)
      .populate('userId', 'name email phone age gender location createdAt')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Helpers fetched', { helpers: profiles });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Verify or reject helper KYC
// @route   PUT /api/admin/verify-helper/:profileId
// @access  Private (admin)
const verifyHelper = async (req, res) => {
  try {
    const { action, feedback } = req.body;

    const profile = await HelperProfile.findById(req.params.profileId);
    if (!profile) return sendError(res, 404, 'Helper profile not found');

    profile.kycStatus = action === 'approve' ? 'approved' : 'rejected';
    profile.verifiedAt = new Date();
    profile.verifiedBy = req.user._id;
    profile.adminFeedback = feedback || '';
    if (action === 'approve') profile.isAvailable = true;

    await profile.save();

    const io = req.app.get('io');
    io.to(`user_${profile.userId}`).emit('kyc_update', { status: profile.kycStatus, feedback });

    // Create notification for helper
    await createNotification(io, profile.userId, {
      type: 'kyc',
      title: action === 'approve' ? 'KYC Approved ✅' : 'KYC Rejected ❌',
      message: action === 'approve'
        ? 'Your KYC has been verified! You can now receive service requests.'
        : `KYC rejected: ${feedback || 'Please resubmit your documents.'}`,
      icon: action === 'approve' ? '✅' : '❌',
      relatedId: profile._id,
      relatedModel: 'HelperProfile',
    });

    return sendSuccess(res, 200, `Helper ${profile.kycStatus}`, { profile });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get all documents
// @route   GET /api/admin/documents?status=pending|approved|rejected|all
// @access  Private (admin)
const getPendingDocuments = async (req, res) => {
  try {
    const { status = 'all' } = req.query;
    const query = status !== 'all' ? { status } : {};
    const docs = await Document.find(query)
      .populate('taskId', 'serviceType userId helperId')
      .populate('uploadedBy', 'name email')
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, 'Documents fetched', { documents: docs });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Verify or reject document
// @route   PUT /api/admin/verify-document/:docId
// @access  Private (admin)
const verifyDocument = async (req, res) => {
  try {
    const { action, feedback } = req.body;

    const doc = await Document.findById(req.params.docId);
    if (!doc) return sendError(res, 404, 'Document not found');

    doc.status = action === 'approve' ? 'approved' : 'rejected';
    doc.adminFeedback = feedback || '';
    doc.reviewedBy = req.user._id;
    doc.reviewedAt = new Date();

    await doc.save();

    // Update task stage
    if (action === 'approve') {
      await Task.findByIdAndUpdate(doc.taskId, { stage: 4, stageLabel: 'Admin Approved', status: 'approved' });
    }

    const task = await Task.findById(doc.taskId);
    const io = req.app.get('io');
    if (task) {
      io.to(`task_${doc.taskId}`).emit('document_reviewed', { status: doc.status, feedback });

      // Notify user
      await createNotification(io, task.userId, {
        type: 'document',
        title: action === 'approve' ? 'Document Approved ✅' : 'Document Rejected ❌',
        message: action === 'approve'
          ? `Your document for ${task.serviceType} has been approved. Please complete payment.`
          : `Document rejected: ${feedback || 'Please resubmit.'}`,
        icon: action === 'approve' ? '📄' : '❌',
        relatedId: task._id,
        relatedModel: 'Task',
      });
    }

    return sendSuccess(res, 200, `Document ${doc.status}`, { document: doc });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Deactivate/activate user
// @route   PUT /api/admin/user/:userId/toggle
// @access  Private (admin)
const toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) return sendError(res, 404, 'User not found');

    user.isActive = !user.isActive;
    await user.save();

    return sendSuccess(res, 200, `User ${user.isActive ? 'activated' : 'deactivated'}`, { user });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

module.exports = { getStats, getAllUsers, getPendingHelpers, verifyHelper, getPendingDocuments, verifyDocument, toggleUserStatus };
