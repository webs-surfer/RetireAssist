const jwt = require('jsonwebtoken');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

const socketHandler = (io) => {

  // Auth middleware for sockets
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.query?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      socket.userRole = decoded.role;
      next();
    } catch (err) {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.userId}`);

    // Join personal room (for notifications)
    socket.join(`user_${socket.userId}`);

    // Join a task room (for chat + task updates)
    socket.on('join_task', (taskId) => {
      socket.join(`task_${taskId}`);
      console.log(`📦 User ${socket.userId} joined task room: ${taskId}`);
    });

    // Leave a task room
    socket.on('leave_task', (taskId) => {
      socket.leave(`task_${taskId}`);
    });

    // Join a chat room
    socket.on('join_chat', (chatId) => {
      socket.join(`chat_${chatId}`);
    });

    // Send message via socket (also saves to DB)
    socket.on('send_message', async (data) => {
      try {
        const { chatId, text, attachments } = data;

        const message = await Message.create({
          chatId,
          senderId: socket.userId,
          text,
          attachments: attachments || [],
          messageType: text ? 'text' : 'file',
        });

        await Chat.findByIdAndUpdate(chatId, {
          lastMessage: { text, senderId: socket.userId, timestamp: new Date() },
        });

        const populated = await message.populate('senderId', 'name');

        io.to(`chat_${chatId}`).emit('new_message', { message: populated });
      } catch (err) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    // Typing indicator
    socket.on('typing', ({ chatId, isTyping }) => {
      socket.to(`chat_${chatId}`).emit('user_typing', {
        userId: socket.userId,
        isTyping,
      });
    });

    // Mark messages as read
    socket.on('mark_read', async ({ chatId }) => {
      try {
        await Message.updateMany(
          { chatId, senderId: { $ne: socket.userId }, isRead: false },
          { isRead: true }
        );
        socket.to(`chat_${chatId}`).emit('messages_read', { chatId, readBy: socket.userId });
      } catch (err) {
        console.error('Mark read error:', err);
      }
    });

    socket.on('disconnect', () => {
      console.log(`🔴 Socket disconnected: ${socket.userId}`);
    });
  });
};

module.exports = socketHandler;
