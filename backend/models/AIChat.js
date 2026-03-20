const mongoose = require('mongoose');

const aiChatSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  messages: [{
    id: String,
    sender: { type: String, enum: ['user', 'ai'] },
    text: String,
    time: String,
    timestamp: { type: Date, default: Date.now },
  }]
}, { timestamps: true });

module.exports = mongoose.model('AIChat', aiChatSchema);
