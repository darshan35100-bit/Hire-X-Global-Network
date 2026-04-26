const nodemailer = require('nodemailer');
const { Resend } = require('resend');

const sendEmail = async ({ to, subject, text, fromName }) => {
  try {
    // If Resend API Key is provided, use Resend for higher limits
    if (process.env.RESEND_API_KEY) {
      const resend = new Resend(process.env.RESEND_API_KEY);
      const { data, error } = await resend.emails.send({
        from: `${fromName || 'Hire-X Global Network'} <hello@hirexglobalnetwork.com>`, // Replace with your verified domain in Resend
        to: [to],
        subject: subject,
        text: text,
      });
      if (error) {
        console.error("Resend Email failed:", error);
        return false;
      }
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