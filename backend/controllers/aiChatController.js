const AIChat = require('../models/AIChat');

// Get chat history
exports.getHistory = async (req, res) => {
  try {
    let chat = await AIChat.findOne({ user: req.user._id });
    if (!chat) {
      chat = await AIChat.create({
        user: req.user._id,
        messages: [{
          id: Date.now().toString(),
          sender: 'ai',
          text: 'Namaste! 🙏 I am your RetireAssist AI powered by Gemini. I can help you with pension, Aadhaar, insurance, and government schemes in Hindi or English.\n\nWhat do you need help with today?',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }]
      });
    }
    res.json({ success: true, data: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Add new messages
exports.addMessages = async (req, res) => {
  try {
    const { messages } = req.body;
    let chat = await AIChat.findOne({ user: req.user._id });
    if (!chat) chat = new AIChat({ user: req.user._id, messages: [] });
    
    chat.messages.push(...messages);
    await chat.save();
    
    res.json({ success: true, data: chat.messages });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.clearHistory = async (req, res) => {
  try {
    await AIChat.findOneAndDelete({ user: req.user._id });
    res.json({ success: true, message: 'Chat cleared' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
