const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);
const Personal = require('./../models/Personal'); 

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
    // Get profile image from database
    const personalInfo = await Personal.findOne().lean(); 
    const profileImageUrl = personalInfo?.profileImageUrl || 
      'https://via.placeholder.com/90x90.png?text=NA'; // fallback

    await resend.emails.send({
      from: 'Naveen Agarwal <onboarding@resend.dev>',
      to: email,
      subject: `Hi ${name}, thanks for reaching out 🚀`,
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 650px; margin: 0 auto; padding: 24px; border-radius: 14px; background: #ffffff; box-shadow: 0 4px 16px rgba(0,0,0,0.08);">
          
          <!-- Header with Logo -->
          <div style="background: linear-gradient(135deg, #4f46e5, #3b82f6); padding: 30px 20px 20px; border-radius: 12px 12px 0 0; text-align: center; color: #fff;">
            
            <!-- Profile Picture -->
            <img src="${profileImageUrl}" 
              alt="Naveen Agarwal" 
              style="width: 90px; height: 90px; border-radius: 50%; border: 3px solid #fff; margin-bottom: 15px;" />
            
            <h1 style="margin: 0; font-size: 22px;">✨ Thanks for Your Message!</h1>
          </div>

          <!-- Body -->
          <div style="padding: 20px; color: #333;">
            <p style="font-size: 16px; line-height: 1.6;">
              Hi <strong>${name}</strong>, 👋
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #555;">
              I truly appreciate you reaching out through my portfolio website. 🙌  
              Your message has been received, and I’ll personally get back to you within <strong>24–48 hours</strong>.
            </p>
            <p style="font-size: 15px; line-height: 1.6; color: #555;">
              Meanwhile, feel free to check out my projects or connect with me directly using the links below.
            </p>

            <!-- Buttons -->
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://naveenagarwal-portfolio.vercel.app" target="_blank" 
                style="display: inline-block; margin: 8px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #fff; background: #4f46e5; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                🌐 Visit Portfolio
              </a>
              <a href="https://www.linkedin.com/in/naveen-agar" target="_blank" 
                style="display: inline-block; margin: 8px; padding: 12px 24px; font-size: 15px; font-weight: 600; color: #fff; background: #2563eb; border-radius: 8px; text-decoration: none; box-shadow: 0 2px 6px rgba(0,0,0,0.2);">
                💼 Connect on LinkedIn
              </a>
            </div>

            <!-- Closing -->
            <p style="font-size: 15px; line-height: 1.6; color: #555;">
              Looking forward to connecting soon!  
            </p>
            <p style="font-weight: bold; font-size: 15px; margin-top: 20px;">
              Best,<br/>Naveen Agarwal
            </p>
          </div>

          <!-- Footer -->
          <div style="font-size: 12px; color: #888; text-align: center; margin-top: 20px; border-top: 1px solid #eee; padding-top: 10px;">
            ⚡ This is an automated response from Naveen Agarwal's portfolio system.
          </div>

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
