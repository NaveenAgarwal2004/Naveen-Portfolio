const express = require('express');
const Contact = require('../models/Contact');
const { sendContactEmail, sendAutoReply } = require('../config/emailService');
const rateLimit = require('express-rate-limit');
const { validate } = require('../src/middleware/validate');
const { contactSchema } = require('../src/validators/contactValidator');

// Contact form specific rate limiting
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10,
  message: {
    success: false,
    message: 'Too many contact submissions. Please try again later.'
  },
  // Skip rate limiting in development or if bypass header is present
  skip: (req, res) => {
    return process.env.NODE_ENV === 'development' || 
           req.headers['x-bypass-rate-limit'] === 'true' ||
           req.query.bypassRateLimit === 'true' ||
           req.headers['x-render-proxy-verify'] !== undefined; // Render proxy verification
  }
});

const router = express.Router();

// 📩 POST /api/contact - Submit contact form with Zod validation
router.post('/', contactLimiter, validate(contactSchema), async (req, res) => {
  try {
    console.log('📧 Processing contact form submission:', req.body);
    
    const { name, email, message } = req.body;

    // Get client IP and user agent
    // Check for headers that might contain the real client IP
    const ipAddress = req.headers['x-forwarded-for'] || 
                     req.headers['x-real-ip'] || 
                     req.ip || 
                     req.connection.remoteAddress || 
                     req.socket.remoteAddress;
    const userAgent = req.get('User-Agent');
    
    console.log('🔍 Client info:', { ipAddress, userAgent });
    
    // Get client IP for tracking submissions
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    Contact.countDocuments({ 
      ipAddress: ipAddress,
      createdAt: { $gte: oneHourAgo }
    })
    .catch(err => {
      console.error('Error tracking submissions:', err);
    });

    // 💾 Save contact submission to database
    const contact = new Contact({
      name,
      email,
      message,
      ipAddress,
      userAgent
    });

    console.log('💾 Saving contact to database...');
    await contact.save();
    console.log('✅ Contact saved successfully');

    // 📧 Send admin notification
    try {
      console.log('📧 Sending admin notification...');
      const adminResult = await sendContactEmail({ name, email, message });
      console.log('✅ Admin notification sent:', adminResult.messageId);
    } catch (emailError) {
      console.error('❌ Failed to send admin email:', emailError);
      // If admin email fails, return error since it's critical
      return res.status(500).json({
        success: false,
        message: 'Error sending email'
      });
    }

    // 🤖 Send auto-reply
    try {
      console.log('🤖 Sending auto-reply...');
      const autoReplyResult = await sendAutoReply({ name, email });
      console.log('✅ Auto-reply sent:', autoReplyResult.messageId);
    } catch (replyError) {
      console.error('❌ Failed to send auto-reply:', replyError);
      // Auto-reply failure doesn't affect success since admin email worked
    }

    // 🎉 Final Response
    res.status(201).json({
      success: true,
      message: 'Message sent successfully!',
      data: {
        id: contact._id,
        timestamp: contact.createdAt
      }
    });

  } catch (error) {
    console.error('❌ Contact form submission error:', error);
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error sending email'
    });
  }
});

module.exports = router;
