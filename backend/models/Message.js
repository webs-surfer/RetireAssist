const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  chatId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Chat',
    required: true,
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  text: {
    type: String,
    trim: true,
  },
  attachments: [{
    url: String,
    type: { type: String, enum: ['image', 'pdf', 'document'] },
    name: String,
  }],
  isRead: {
    type: Boolean,
    default: false,
  },
  messageType: {
    type: String,
    enum: ['text', 'file', 'system'],
    default: 'text',
  },
}, { timestamps: true });

module.exports = mongoose.model('Message', messageSchema);
