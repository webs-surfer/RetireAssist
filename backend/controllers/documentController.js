const Document = require('../models/Document');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Upload document for a task
// @route   POST /api/document/upload
// @access  Private
const uploadDocument = async (req, res) => {
  try {
    const { taskId, title, type } = req.body;
    if (!req.file) return sendError(res, 400, 'No file uploaded');

    console.log('[Document Upload] File:', req.file.originalname, 'Size:', req.file.size, 'User:', req.user._id);

    const docData = {
      uploadedBy: req.user._id,
      fileName: title || req.file.originalname,
      fileUrl: `/uploads/${req.file.filename}`,
      fileType: type || req.file.mimetype,
      fileSize: req.file.size,
      status: 'pending',
      isLocked: !!taskId,
    };

    if (taskId) docData.taskId = taskId;

    const doc = await Document.create(docData);
    console.log('[Document Upload] Saved:', doc._id, doc.fileName);

    if (taskId) {
      await Task.findByIdAndUpdate(taskId, {
        status: 'admin-review',
        stage: 3,
        stageLabel: 'Documents Submitted',
        documentId: doc._id,
      });

      const io = req.app.get('io');
      const task = await Task.findById(taskId);
      if (task) {
        io.to(`task_${taskId}`).emit('document_uploaded', { document: doc });
        io.to(`user_${task.userId}`).emit('task_update', { task });
      }
    }

    return sendSuccess(res, 201, taskId ? 'Document uploaded and pending admin review' : 'Document uploaded safely', { document: doc });
  } catch (error) {
    console.error('[Document Upload Error]:', error);
    return sendError(res, 500, error.message);
  }
};

// @desc    Get document for a task
// @route   GET /api/document/:taskId
// @access  Private
const getDocument = async (req, res) => {
  try {
    const doc = await Document.findOne({ taskId: req.params.taskId });
    if (!doc) return sendError(res, 404, 'Document not found');

    if (doc.isLocked && req.user.role === 'user') {
      return sendSuccess(res, 200, 'Document is locked. Complete payment to access.', {
        document: { _id: doc._id, status: doc.status, isLocked: true },
      });
    }

    return sendSuccess(res, 200, 'Document fetched', { document: doc });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

// @desc    Get all documents for current user
// @route   GET /api/document/my-documents
// @access  Private
const getMyDocuments = async (req, res) => {
  try {
    // Find docs uploaded by this user OR docs from their tasks
    const tasks = await Task.find({ userId: req.user._id }).select('_id');
    const taskIds = tasks.map(t => t._id);

    const docs = await Document.find({
      $or: [
        { uploadedBy: req.user._id },
        { taskId: { $in: taskIds } },
      ]
    }).sort({ createdAt: -1 });

    const formatted = docs.map(d => ({
      _id: d._id,
      title: d.fileName || 'Untitled Document',
      type: d.fileType || 'document',
      status: d.status || 'pending',
      fileUrl: d.fileUrl,
      taskId: d.taskId,
      createdAt: d.createdAt,
      fileName: d.fileName,
    }));

    console.log(`[Documents] Found ${formatted.length} documents for user ${req.user._id}`);

    return sendSuccess(res, 200, `${formatted.length} documents found`, { documents: formatted });
  } catch (error) {
    console.error('[Documents Error]:', error);
    return sendError(res, 500, error.message);
  }
};

module.exports = { uploadDocument, getDocument, getMyDocuments };
