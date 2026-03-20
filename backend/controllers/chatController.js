const Chat = require('../models/Chat');
const Message = require('../models/Message');
const Task = require('../models/Task');
const { sendSuccess, sendError } = require('../utils/sendResponse');

// @desc    Get or create chat for a task
// @route   GET /api/chat/:taskId
// @access  Private
const getChatByTask = async (req, res) => {
  try {
    const { taskId } = req.params;

    let chat = await Chat.findOne({ taskId })
      .populate('participants', 'name phone');

    // Auto-create chat if task exists but chat doesn't
    if (!chat) {
      const task = await Task.findById(taskId);
      if (!task) return sendError(res, 404, 'Task not found');

      chat = await Chat.create({
        taskId,
        participants: [task.userId, task.helperId].filter(Boolean),
        isActive: true,
      });
      chat = await Chat.findById(chat._id).populate('participants', 'name phone');
    }

    const messages = await Message.find({ chatId: chat._id })
      .populate('senderId', 'name')
      .sort({ createdAt: 1 })
      .lean();

    return sendSuccess(res, 200, 'Chat fetched', { chat, messages });
  } catch (error) {
    console.error('getChatByTask error:', error);
    return sendError(res, 500, error.message);
  }
};

// @desc    Send a message
// @route   POST /api/chat/send
// @access  Private
const sendMessage = async (req, res) => {
  try {
    const { chatId, text } = req.body;

    if (!chatId || !text?.trim()) {
      return sendError(res, 400, 'chatId and text are required');
    }

    const chat = await Chat.findById(chatId);
    if (!chat) return sendError(res, 404, 'Chat not found');

    const message = await Message.create({
      chatId,
      senderId: req.user._id,
      text: text.trim(),
      messageType: 'text',
    });

    // Update last message in chat
    await Chat.findByIdAndUpdate(chatId, {
      lastMessage: {
        text: text.trim(),
        senderId: req.user._id,
        timestamp: new Date(),
      },
    });

    const populated = await Message.findById(message._id).populate('senderId', 'name');

    // Emit via socket
    const io = req.app.get('io');
    if (io) {
      io.to(`chat_${chatId}`).emit('new_message', { message: populated });
    }

    return sendSuccess(res, 201, 'Message sent', { message: populated });
  } catch (error) {
    console.error('sendMessage error:', error);
    return sendError(res, 500, error.message);
  }
};

// @desc    Get all chats for logged-in user
// @route   GET /api/chat/my-chats
// @access  Private
const getMyChats = async (req, res) => {
  try {
    const chats = await Chat.find({
      participants: req.user._id,
      isActive: true,
    })
      .populate('taskId', 'serviceType status helperId userId')
      .populate('participants', 'name phone')
      .sort({ updatedAt: -1 })
      .lean();

    return sendSuccess(res, 200, 'Chats fetched', { chats });
  } catch (error) {
    console.error('getMyChats error:', error);
    return sendError(res, 500, error.message);
  }
};

module.exports = { getChatByTask, sendMessage, getMyChats };
