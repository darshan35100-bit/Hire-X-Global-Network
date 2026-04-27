const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sendEmail = async ({ to, subject, text, fromName }) => {
  try {
    // If Resend API Key is provided, use Resend for higher limits
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      console.log(`Attempting to send email via Resend to ${to} from ${fromEmail}`);

      const { data, error } = await resend.emails.send({
        from: `${fromName || 'Hire-X Global Network'} <${fromEmail}>`, 
        to: [to],
        subject: subject,
        text: text,
      });
      if (error) {
        console.error("Resend Email failed:", error.message || error);
        // Fallback to Nodemailer if resend fails (if we want to)
        return false;
      }
      console.log("Email sent successfully via Resend:", data);
      return true;
    }

    // Fallback to Nodemailer (Gmail) totally free automation
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    const mailOptions = {
      from: `"${fromName || 'Hire-X Global Network'}" <${process.env.EMAIL_USER || 'no-reply@hire-x.com'}>`,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error("Email sending failed:", error);
    return false;
  }
};

module.exports = sendEmail;