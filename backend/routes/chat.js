const express = require('express');
const router = express.Router();
const aiChatService = require('../services/aiChatService');

// Store chat sessions in memory (in production, use Redis or database)
const chatSessions = new Map();

// @route   POST /api/chat
// @desc    Send message to AI chat assistant
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { message, sessionId = 'default' } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Message is required and must be a non-empty string'
      });
    }

    if (message.length > 500) {
      return res.status(400).json({
        success: false,
        message: 'Message is too long. Please keep it under 500 characters.'
      });
    }

    // Get or create chat session
    if (!chatSessions.has(sessionId)) {
      chatSessions.set(sessionId, {
        messages: [],
        createdAt: new Date(),
        lastActivity: new Date()
      });
    }

    const session = chatSessions.get(sessionId);
    session.lastActivity = new Date();

    // Add user message to session
    session.messages.push({
      type: 'user',
      content: message.trim(),
      timestamp: new Date()
    });

    // Generate AI response
    const aiResponse = await aiChatService.generateResponse(message.trim());

    // Add AI response to session
    session.messages.push({
      type: 'assistant',
      content: aiResponse,
      timestamp: new Date()
    });

    // Keep only last 20 messages per session to manage memory
    if (session.messages.length > 20) {
      session.messages = session.messages.slice(-20);
    }

    res.json({
      success: true,
      data: {
        response: aiResponse,
        sessionId: sessionId,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error in chat endpoint:', error);
    res.status(500).json({
      success: false,
      message: 'Sorry, I encountered an error. Please try again.',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// @route   GET /api/chat/history/:sessionId
// @desc    Get chat history for a session
// @access  Public
router.get('/history/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = chatSessions.get(sessionId);

    if (!session) {
      return res.json({
        success: true,
        data: []
      });
    }

    res.json({
      success: true,
      data: session.messages.map(msg => ({
        type: msg.type,
        content: msg.content,
        timestamp: msg.timestamp
      }))
    });

  } catch (error) {
    console.error('Error fetching chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat history'
    });
  }
});

// @route   POST /api/chat/clear/:sessionId
// @desc    Clear chat history for a session
// @access  Public
router.post('/clear/:sessionId', (req, res) => {
  try {
    const { sessionId } = req.params;
    
    if (chatSessions.has(sessionId)) {
      chatSessions.delete(sessionId);
    }

    res.json({
      success: true,
      message: 'Chat history cleared successfully'
    });

  } catch (error) {
    console.error('Error clearing chat history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear chat history'
    });
  }
});

// @route   GET /api/chat/stats
// @desc    Get chat statistics (for admin)
// @access  Public
router.get('/stats', (req, res) => {
  try {
    const activeSessions = Array.from(chatSessions.values()).filter(
      session => Date.now() - session.lastActivity.getTime() < 24 * 60 * 60 * 1000 // Active in last 24 hours
    ).length;

    const totalSessions = chatSessions.size;
    const totalMessages = Array.from(chatSessions.values()).reduce(
      (total, session) => total + session.messages.length, 0
    );

    res.json({
      success: true,
      data: {
        activeSessions,
        totalSessions,
        totalMessages,
        timestamp: new Date()
      }
    });

  } catch (error) {
    console.error('Error fetching chat stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch chat statistics'
    });
  }
});

// Cleanup old sessions (run every hour)
setInterval(() => {
  const oneDayAgo = Date.now() - 24 * 60 * 60 * 1000;
  
  for (const [sessionId, session] of chatSessions.entries()) {
    if (session.lastActivity.getTime() < oneDayAgo) {
      chatSessions.delete(sessionId);
    }
  }
}, 60 * 60 * 1000);

module.exports = router;