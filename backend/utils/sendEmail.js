const nodemailer = require('nodemailer');

const sendEmail = async ({ to, subject, text, fromName }) => {
  try {
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