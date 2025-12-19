const SibApiV3Sdk = require('sib-api-v3-sdk');
const defaultClient = SibApiV3Sdk.ApiClient.instance;

// Configure API key
const apiKey = defaultClient.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const apiInstance = new SibApiV3Sdk.TransactionalEmailsApi();

class EmailService {
  constructor() {
    this.adminEmail = process.env.EMAIL_USER || 'naveenagarwal7624@gmail.com';
    this.senderEmail = process.env.EMAIL_USER;
    console.log('🚀 EMAIL SYSTEM: BREVO API INITIALIZED');
  }

  /**
   * Sends contact email to admin
   */
  async sendContactEmail({ name, email, message }) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `New Portfolio Message from ${name}`;
    sendSmtpEmail.htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
        <h2>📩 New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong></p>
        <div style="background: #f9f9f9; padding: 15px; border-left: 4px solid #3b82f6;">
          ${message.replace(/\n/g, '<br>')}
        </div>
      </div>
    `;
    sendSmtpEmail.sender = { "name": "Portfolio System", "email": this.senderEmail };
    sendSmtpEmail.to = [{ "email": this.adminEmail }];
    sendSmtpEmail.replyTo = { "email": email };

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Admin notification sent via Brevo API');
      return { success: true };
    } catch (error) {
      console.error('❌ BREVO ADMIN EMAIL FAILURE:', error.message);
      throw error;
    }
  }

  /**
   * Sends auto-reply to the user
   */
  async sendAutoReply({ name, email }) {
    const sendSmtpEmail = new SibApiV3Sdk.SendSmtpEmail();

    sendSmtpEmail.subject = `Thanks for reaching out, ${name}!`;
    sendSmtpEmail.htmlContent = `
      <div style="font-family: sans-serif; padding: 20px; text-align: center;">
        <h1>✨ Message Received!</h1>
        <p>Hi ${name}, thank you for contacting me through my portfolio. I will get back to you within 24-48 hours.</p>
        <p>Best regards,<br><strong>Naveen Agarwal</strong></p>
      </div>
    `;
    sendSmtpEmail.sender = { "name": "Naveen Agarwal", "email": this.senderEmail };
    sendSmtpEmail.to = [{ "email": email }];

    try {
      await apiInstance.sendTransacEmail(sendSmtpEmail);
      console.log('✅ Auto-reply sent via Brevo API');
      return { success: true };
    } catch (error) {
      console.warn('⚠️ Auto-reply failed (Visitor email may be invalid):', error.message);
      return { success: false };
    }
  }

  /**
   * Main process method
   */
  async processContactForm(contactData) {
    const { name, email, message } = contactData;
    await this.sendContactEmail({ name, email, message });
    // Try auto-reply but don't crash if it fails
    await this.sendAutoReply({ name, email }).catch(() => {});
    return { success: true };
  }
}

const emailService = new EmailService();

module.exports = {
  sendContactEmail: emailService.sendContactEmail.bind(emailService),
  sendAutoReply: emailService.sendAutoReply.bind(emailService),
  processContactForm: emailService.processContactForm.bind(emailService)
};
