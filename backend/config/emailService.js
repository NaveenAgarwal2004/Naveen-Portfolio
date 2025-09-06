const nodemailer = require('nodemailer');
const Personal = require('./../models/Personal');

class EmailService {
  constructor() {
    this.transporter = null;
    this.adminEmail = process.env.EMAIL_USER || 'naveenagarwal7624@gmail.com';
    this.portfolioUrl = 'https://naveenagarwal-portfolio.vercel.app';
    this.linkedinUrl = 'https://www.linkedin.com/in/naveen-agar';
    this.fallbackProfileImage = 'https://via.placeholder.com/90x90.png?text=NA';
    this.initializeTransporter();
  }

  /**
   * Initialize Nodemailer transporter with Gmail SMTP
   */
  initializeTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    // Verify connection at startup
    this.verifyConnection();
  }

  /**
   * Verify email server connection
   */
  async verifyConnection() {
    try {
      await this.transporter.verify();
      console.log('✅ Email server is ready');
    } catch (error) {
      console.error('❌ Email server not ready:', error.message);
    }
  }

  /**
   * Validates email parameters
   * @param {Object} params - Email parameters to validate
   * @param {string[]} requiredFields - Required field names
   * @throws {Error} If validation fails
   */
  validateEmailParams(params, requiredFields) {
    for (const field of requiredFields) {
      if (!params[field] || typeof params[field] !== 'string' || !params[field].trim()) {
        throw new Error(`Missing or invalid ${field}`);
      }
    }

    // Basic email validation
    if (params.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(params.email)) {
      throw new Error('Invalid email format');
    }
  }

  /**
   * Sanitizes HTML content to prevent XSS
   * @param {string} text - Text to sanitize
   * @returns {string} Sanitized text
   */
  sanitizeHtml(text) {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '<br>');
  }

  /**
   * Fetches user profile information from database
   * @returns {Promise<Object>} Profile information
   */
  async getProfileInfo() {
    try {
      const personalInfo = await Personal.findOne().lean();
      return {
        profileImageUrl: personalInfo?.profileImageUrl || this.fallbackProfileImage,
        name: personalInfo?.name || 'Naveen Agarwal'
      };
    } catch (error) {
      console.warn('⚠️ Failed to fetch profile info, using defaults:', error.message);
      return {
        profileImageUrl: this.fallbackProfileImage,
        name: 'Naveen Agarwal'
      };
    }
  }

  /**
   * Generates the admin notification email template
   * @param {Object} params - Email parameters
   * @returns {string} HTML email template
   */
  generateAdminEmailTemplate({ name, email, message }) {
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #1f2937, #374151); padding: 20px; border-radius: 8px 8px 0 0; color: white;">
          <h2 style="margin: 0; font-size: 20px;">📩 New Contact Message</h2>
        </div>
        
        <div style="background: #f9fafb; padding: 25px; border-radius: 0 0 8px 8px; border: 1px solid #e5e7eb;">
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Name:</strong>
            <span style="color: #6b7280;">${this.sanitizeHtml(name)}</span>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Email:</strong>
            <a href="mailto:${email}" style="color: #3b82f6; text-decoration: none;">${this.sanitizeHtml(email)}</a>
          </div>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #374151;">Message:</strong>
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 6px; border-left: 4px solid #3b82f6; color: #374151; line-height: 1.6;">
            ${this.sanitizeHtml(message)}
          </div>
          
          <div style="margin-top: 20px; padding-top: 15px; border-top: 1px solid #e5e7eb; font-size: 12px; color: #9ca3af;">
            Sent from portfolio contact form at ${new Date().toLocaleString()}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generates the auto-reply email template
   * @param {Object} params - Email parameters
   * @returns {string} HTML email template
   */
  generateAutoReplyTemplate({ name, profileImageUrl }) {
    return `
      <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border-radius: 14px; background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
        <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 30px 20px 20px; border-radius: 12px 12px 0 0; text-align: center; color: #fff;">
          <img src="${profileImageUrl}" 
            alt="Naveen Agarwal" 
            style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fff; margin-bottom: 15px; object-fit: cover;" />
          <h1 style="margin: 0; font-size: 22px;">✨ Thanks for Your Message!</h1>
        </div>
        <div style="padding: 25px; color: #333;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 15px;">
            Hi <strong>${this.sanitizeHtml(name)}</strong>, 👋
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 15px;">
            I truly appreciate you reaching out through my portfolio website. 🙌  
            Your message has been received, and I'll personally get back to you within <strong>24–48 hours</strong>.
          </p>
          <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 20px;">
            Meanwhile, feel free to check out my projects or connect with me directly using the links below.
          </p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${this.portfolioUrl}" target="_blank" 
              style="display: inline-block; margin: 8px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #fff; background: #4f46e5; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(0,0,0,0.2); transition: all 0.3s ease;">
              🌐 Visit Portfolio
            </a>
            <a href="${this.linkedinUrl}" target="_blank" 
              style="display: inline-block; margin: 8px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #fff; background: #2563eb; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(0,0,0,0.2); transition: all 0.3s ease;">
              💼 Connect on LinkedIn
            </a>
          </div>
          <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #10b981;">
            <p style="font-size: 14px; color: #374151; margin: 0; line-height: 1.5;">
              <strong>💡 Quick Tip:</strong> For urgent inquiries, feel free to connect with me directly on LinkedIn for faster response times.
            </p>
          </div>
          <p style="font-size: 15px; line-height: 1.6; color: #555; margin-bottom: 10px;">
            Looking forward to connecting soon! 🚀
          </p>
          <p style="font-weight: bold; font-size: 15px; margin-top: 20px; color: #374151;">
            Best regards,<br/>
            <span style="color: #4f46e5;">Naveen Agarwal</span>
          </p>
        </div>
        <div style="font-size: 12px; color: #9ca3af; text-align: center; margin-top: 20px; border-top: 1px solid #e5e7eb; padding-top: 15px;">
          ⚡ This is an automated response from Naveen Agarwal's portfolio system.<br/>
          <span style="color: #6b7280;">Sent on ${new Date().toLocaleDateString()}</span>
        </div>
      </div>
    `;
  }

  /**
   * Sends contact email to admin
   * @param {Object} params - Contact form data
   * @param {string} params.name - Sender's name
   * @param {string} params.email - Sender's email
   * @param {string} params.message - Contact message
   * @returns {Promise<Object>} Success status
   */
  async sendContactEmail({ name, email, message }) {
    try {
      this.validateEmailParams({ name, email, message }, ['name', 'email', 'message']);
      const mailOptions = {
        from: `"${this.sanitizeHtml(name)}" <${process.env.EMAIL_USER}>`,
        to: this.adminEmail,
        replyTo: email,
        subject: `New Contact Message from ${name} - Portfolio`,
        html: this.generateAdminEmailTemplate({ name, email, message })
      };
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Admin notification sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId,
        message: 'Contact email sent successfully'
      };
    } catch (error) {
      console.error('❌ Failed to send admin email:', error);
      throw new Error(`Admin email failed: ${error.message || 'Failed to send contact email'}`);
    }
  }

  /**
   * Sends auto-reply email to user
   * @param {Object} params - User data
   * @param {string} params.name - User's name
   * @param {string} params.email - User's email
   * @returns {Promise<Object>} Success status with detailed response
   */
  async sendAutoReply({ name, email }) {
    try {
      this.validateEmailParams({ name, email }, ['name', 'email']);
      const profileInfo = await this.getProfileInfo();
      const mailOptions = {
        from: `"Naveen Agarwal" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: `Thanks for contacting me!`,
        text: `Hi ${name}, Thanks for reaching out! I'll get back to you soon. – Naveen`,
        html: this.generateAutoReplyTemplate({ 
          name, 
          profileImageUrl: profileInfo.profileImageUrl 
        }),
        headers: {
          'X-Auto-Response-Suppress': 'DR, RN, NRN, OOF, AutoReply',
          'X-Mailer': 'Naveen Portfolio System',
          'Auto-Submitted': 'auto-replied',
          'Return-Path': process.env.EMAIL_USER
        },
        dsn: {
          id: `autoreply-${Date.now()}`,
          return: 'headers',
          notify: ['failure'],
          recipient: email
        }
      };
      const result = await this.transporter.sendMail(mailOptions);
      console.log('✅ Auto-reply sent successfully:', result.messageId);
      return { 
        success: true, 
        messageId: result.messageId,
        message: 'Auto-reply sent successfully',
        recipientEmail: email
      };
    } catch (error) {
      console.error('⚠️ Failed to send auto-reply:', error);
      return { 
        success: false, 
        error: error.message || 'Failed to send auto-reply',
        recipientEmail: email
      };
    }
  }

  /**
   * Sends both admin notification and auto-reply emails
   * @param {Object} contactData - Complete contact form data
   * @returns {Promise<Object>} Combined results from both email operations
   */
  async processContactForm(contactData) {
    const { name, email, message } = contactData;
    try {
      console.log(`📧 Processing contact form submission from ${name} (${email})`);
      const adminResult = await this.sendContactEmail({ name, email, message });
      console.log('⏳ Waiting 3 seconds before sending auto-reply...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      const autoReplyResult = await this.sendAutoReply({ name, email });
      const response = {
        success: adminResult.success,
        adminEmail: adminResult,
        autoReply: autoReplyResult,
        timestamp: new Date().toISOString()
      };
      if (adminResult.success && autoReplyResult.success) {
        console.log('✅ Contact form processed successfully - both emails sent');
      } else if (adminResult.success && !autoReplyResult.success) {
        console.log('⚠️ Contact form processed - admin email sent, auto-reply failed');
      }
      return response;
    } catch (error) {
      console.error('❌ Contact form processing failed:', error);
      throw new Error(`Contact form processing failed: ${error.message}`);
    }
  }

  /**
   * Health check for email service
   * @returns {Promise<boolean>} Service health status
   */
  async healthCheck() {
    try {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        throw new Error('EMAIL_USER or EMAIL_PASS not configured');
      }
      await this.transporter.verify();
      await this.getProfileInfo();
      console.log('✅ Email service health check passed');
      return true;
    } catch (error) {
      console.error('❌ Email service health check failed:', error);
      return false;
    }
  }

  /**
   * Gets email service configuration
   * @returns {Object} Current service configuration
   */
  getConfig() {
    return {
      service: 'gmail',
      adminEmail: this.adminEmail,
      portfolioUrl: this.portfolioUrl,
      linkedinUrl: this.linkedinUrl,
      emailConfigured: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS)
    };
  }
}

// Create singleton instance
const emailService = new EmailService();

// Export both class and instance methods for backward compatibility
module.exports = {
  sendContactEmail: emailService.sendContactEmail.bind(emailService),
  sendAutoReply: emailService.sendAutoReply.bind(emailService),
  EmailService,
  emailService,
  processContactForm: emailService.processContactForm.bind(emailService),
  healthCheck: emailService.healthCheck.bind(emailService),
  getConfig: emailService.getConfig.bind(emailService)
};
