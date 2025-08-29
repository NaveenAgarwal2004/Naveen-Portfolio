const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// 📩 Email to Admin (from contact form)
const sendContactEmail = async ({ name, email, message }) => {
  try {
    await resend.emails.send({
      from: 'Naveen Agarwal <onboarding@resend.dev>',
      to: 'naveenagarwal7624@gmail.com',
      replyTo: email,
      subject: 'New Contact Message from Portfolio',
      html: `
        <h2>New Contact Message</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Message:</strong><br>${message.replace(/\n/g, '<br>')}</p>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('❌ Failed to send admin email:', error);
    throw new Error('Failed to send contact email');
  }
};

// 🤖 Auto Reply to User
const sendAutoReply = async ({ name, email }) => {
  try {
    await resend.emails.send({
      from: 'Naveen Agarwal <onboarding@resend.dev>',
      to: email,
      subject: 'Thank You for Reaching Out – Let\'s Connect!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 8px; background-color: #f9f9f9;">

        <h2 style="color: #333;">Hi ${name},</h2>

        <p style="color: #555; line-height: 1.6;">
          Thank you so much for taking the time to reach out through my portfolio website. I'm thrilled to hear from you and appreciate your interest in my work!
        </p>

        <p style="color: #555; line-height: 1.6;">
          I've received your message and will review it carefully. I'll get back to you as soon as possible – typically within 24-48 hours – with a thoughtful response.
        </p>

        <p style="color: #555; line-height: 1.6;">
          In the meantime, feel free to explore more of my projects on my <a href="naveenagarwal-portfolio.vercel.app" style="color: #007bff; text-decoration: none;">portfolio site</a> or connect with me on <a href="https://linkedin.com/in/yourprofile" style="color: #007bff; text-decoration: none;">LinkedIn</a> for updates and insights.
        </p>

        <p style="color: #555; line-height: 1.6;">Looking forward to chatting soon!</p>

        <p style="color: #333; font-weight: bold;">
          Best regards,<br>Naveen Agarwal
        </p>

        <p style="font-size: 12px; color: #888; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
          This is an automated response from Naveen Agarwal's portfolio contact system.
        </p>

        </div>
      `
    });
    return { success: true };
  } catch (error) {
    console.error('⚠️ Failed to send auto-reply:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  resend,
  sendContactEmail,
  sendAutoReply
};
