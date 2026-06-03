const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const https = require('https');

const sendEmail = async ({ to, subject, text, fromName }) => {
  try {
    // 1. Check for Google Apps Script Web App URL (HTTP API - works on Render & uses direct Gmail)
    if (process.env.GOOGLE_SCRIPT_URL) {
      console.log(`[Email] Attempting to send email via Google Apps Script to: ${to}`);
      const success = await sendViaGoogleScript({ to, subject, text, fromName, url: process.env.GOOGLE_SCRIPT_URL });
      if (success) return true;
    }

    // 2. Check for Resend API Key (HTTP API - works on Render)
    if (process.env.RESEND_API_KEY) {
      console.log(`[Email] Attempting to send email via Resend API to: ${to}`);
      const resend = new Resend(process.env.RESEND_API_KEY);
      
      const fromEmail = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
      const { data, error } = await resend.emails.send({
        from: `${fromName || 'Hire-X Global Network'} <${fromEmail}>`, 
        to: [to],
        subject: subject,
        text: text,
      });
      if (error) {
        console.error("[Email] Resend API error:", error.message || error);
        return false;
      }
      console.log("[Email] Resend API sent successfully:", data);
      return true;
    }

    // 3. Check for Brevo (Sendinblue) API Key (starts with xkeysib- or SMTP key starting with xsmtpsib-)
    if (process.env.BREVO_API_KEY) {
      const apiKey = process.env.BREVO_API_KEY.trim();
      
      if (apiKey.startsWith('xkeysib-')) {
        console.log(`[Email] Brevo API Key detected. Attempting to send email via Brevo HTTP API to: ${to}`);
        const fromEmail = process.env.EMAIL_USER || 'no-reply@hire-x.com';
        const success = await sendViaBrevo({ to, subject, text, fromName, fromEmail, apiKey });
        if (success) return true;
      } else if (apiKey.startsWith('xsmtpsib-')) {
        console.log(`[Email] Brevo SMTP Key detected. Attempting to send email via Brevo SMTP Relay (Port 2525) to: ${to}`);
        const success = await sendViaBrevoSmtp({ to, subject, text, fromName, smtpKey: apiKey });
        if (success) return true;
      } else {
        // Unknown prefix, try HTTP first then SMTP port 2525
        console.log(`[Email] Unknown prefix for BREVO_API_KEY. Trying Brevo HTTP API first for: ${to}`);
        const fromEmail = process.env.EMAIL_USER || 'no-reply@hire-x.com';
        let success = await sendViaBrevo({ to, subject, text, fromName, fromEmail, apiKey });
        if (success) return true;

        console.log(`[Email] Brevo HTTP API failed. Trying Brevo SMTP Relay on Port 2525...`);
        success = await sendViaBrevoSmtp({ to, subject, text, fromName, smtpKey: apiKey });
        if (success) return true;
      }
    }

    // 4. Check for SendGrid API Key (HTTP API - works on Render)
    if (process.env.SENDGRID_API_KEY) {
      console.log(`[Email] Attempting to send email via SendGrid API to: ${to}`);
      const fromEmail = process.env.EMAIL_USER || 'no-reply@hire-x.com';
      const success = await sendViaSendGrid({ to, subject, text, fromName, fromEmail, apiKey: process.env.SENDGRID_API_KEY });
      if (success) return true;
    }

    // 5. Fallback to Nodemailer SMTP (Gmail)
    // IMPORTANT: On Render Free Tier, SMTP ports (25, 465, 587) are blocked.
    // If running on Render, this will fail. We use a 5-second timeout to avoid 502 Bad Gateway (Gateway Timeout).
    console.log(`[Email] No HTTP Email API keys found. Falling back to Gmail SMTP for: ${to}`);
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.error("[Email] Nodemailer Gmail credentials missing in environment variables.");
      return false;
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      },
      connectionTimeout: 5000, // 5 seconds connection timeout
      greetingTimeout: 5000,   // 5 seconds greeting timeout
      socketTimeout: 5000      // 5 seconds socket timeout
    });

    const mailOptions = {
      from: `"${fromName || 'Hire-X Global Network'}" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log("[Email] Gmail SMTP email sent successfully.");
    return true;
  } catch (error) {
    console.error("[Email] Email sending failed completely:", error.message || error);
    return false;
  }
};

// Helper function for Google Apps Script
const sendViaGoogleScript = async ({ to, subject, text, fromName, url }) => {
  const data = JSON.stringify({ to, subject, text, fromName });

  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const req = https.request({
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname + urlObj.search,
      method: 'POST',
      headers: {
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    }, (res) => {
      // Follow redirect (status 302)
      if (res.statusCode === 302 || res.statusCode === 301) {
        const redirectUrl = res.headers.location;
        const redirectUrlObj = new URL(redirectUrl);
        const redReq = https.request({
          hostname: redirectUrlObj.hostname,
          port: 443,
          path: redirectUrlObj.pathname + redirectUrlObj.search,
          method: 'POST',
          headers: {
            'content-type': 'application/json',
            'content-length': Buffer.byteLength(data)
          }
        }, (redRes) => {
          let body = '';
          redRes.on('data', chunk => body += chunk);
          redRes.on('end', () => {
            try {
              const parsed = JSON.parse(body);
              if (parsed.success) {
                console.log("[Email] Sent successfully via Google Apps Script");
                resolve(true);
              } else {
                console.error("[Email] Google Apps Script returned failure:", parsed.error);
                resolve(false);
              }
            } catch(e) {
              console.log("[Email] Sent successfully via Google Apps Script (HTML or redirect response)");
              resolve(true);
            }
          });
        });
        redReq.on('error', (err) => {
          console.error("[Email] Google Apps Script redirect request error:", err);
          resolve(false);
        });
        redReq.write(data);
        redReq.end();
      } else {
        let body = '';
        res.on('data', chunk => body += chunk);
        res.on('end', () => {
          if (res.statusCode >= 200 && res.statusCode < 300) {
            console.log("[Email] Sent successfully via Google Apps Script:", body);
            resolve(true);
          } else {
            console.error("[Email] Google Apps Script failed with status code:", res.statusCode, body);
            resolve(false);
          }
        });
      }
    });

    req.on('error', (err) => {
      console.error("[Email] Google Apps Script request error:", err);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
};

// Helper function for Brevo API
const sendViaBrevo = async ({ to, subject, text, fromName, fromEmail, apiKey }) => {
  const data = JSON.stringify({
    sender: {
      name: fromName || 'Hire-X Global Network',
      email: fromEmail
    },
    to: [{ email: to }],
    subject: subject,
    textContent: text
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.brevo.com',
      port: 443,
      path: '/v3/smtp/email',
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'api-key': apiKey,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("[Email] Sent successfully via Brevo API:", body);
          resolve(true);
        } else {
          console.error("[Email] Brevo API failed with status code:", res.statusCode, body);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error("[Email] Brevo API request connection error:", err);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
};

// Helper function for Brevo SMTP Relay on Port 2525
const sendViaBrevoSmtp = async ({ to, subject, text, fromName, smtpKey }) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'smtp-relay.brevo.com',
      port: 2525, // Port 2525 is NOT blocked by Render
      auth: {
        user: process.env.EMAIL_USER || 'hirexglobalnetworkbykm@gmail.com',
        pass: smtpKey
      },
      connectionTimeout: 5000,
      greetingTimeout: 5000,
      socketTimeout: 5000
    });

    const mailOptions = {
      from: `"${fromName || 'Hire-X Global Network'}" <${process.env.EMAIL_USER || 'hirexglobalnetworkbykm@gmail.com'}>`,
      to,
      subject,
      text
    };

    await transporter.sendMail(mailOptions);
    console.log("[Email] Sent successfully via Brevo SMTP Relay (Port 2525)");
    return true;
  } catch (error) {
    console.error("[Email] Brevo SMTP Relay failed:", error.message || error);
    return false;
  }
};

// Helper function for SendGrid API
const sendViaSendGrid = async ({ to, subject, text, fromName, fromEmail, apiKey }) => {
  const data = JSON.stringify({
    personalizations: [{ to: [{ email: to }] }],
    from: {
      email: fromEmail,
      name: fromName || 'Hire-X Global Network'
    },
    subject: subject,
    content: [{ type: 'text/plain', value: text }]
  });

  return new Promise((resolve) => {
    const req = https.request({
      hostname: 'api.sendgrid.com',
      port: 443,
      path: '/v3/mail/send',
      method: 'POST',
      headers: {
        'authorization': `Bearer ${apiKey}`,
        'content-type': 'application/json',
        'content-length': Buffer.byteLength(data)
      }
    }, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log("[Email] Sent successfully via SendGrid API:", body);
          resolve(true);
        } else {
          console.error("[Email] SendGrid API failed with status code:", res.statusCode, body);
          resolve(false);
        }
      });
    });

    req.on('error', (err) => {
      console.error("[Email] SendGrid API request connection error:", err);
      resolve(false);
    });

    req.write(data);
    req.end();
  });
};

module.exports = sendEmail;