const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const pdfParse = require('pdf-parse');
const Groq = require('groq-sdk');
const sendEmail = require('./utils/sendEmail');
const emailValidator = require('deep-email-validator');

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const JWT_SECRET = process.env.JWT_SECRET || 'supersecrethirex123';

// Database Initialization (Auto-create tables)
async function initDB() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE,
        mobile_number VARCHAR(20),
        password VARCHAR(100),
        role VARCHAR(20) DEFAULT 'admin',
        education VARCHAR(50),
        experience INTEGER DEFAULT 0,
        avatar TEXT DEFAULT '',
        about TEXT DEFAULT '',
        skills VARCHAR(255) DEFAULT '',
        location VARCHAR(100) DEFAULT '',
        profile_progress INTEGER DEFAULT 30
      );
      CREATE TABLE IF NOT EXISTS Jobs (
        id SERIAL PRIMARY KEY,
        employer_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
        company_name VARCHAR(150),
        title VARCHAR(100),
        qualification VARCHAR(100),
        description TEXT,
        education_level VARCHAR(50),
        years_experience VARCHAR(50),
        location VARCHAR(100),
        company_logo TEXT,
        official_notification TEXT,
        end_date DATE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS Applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES Jobs(id) ON DELETE SET NULL,
        user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
        employer_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
        status VARCHAR(20) DEFAULT 'Pending',
        cv_url TEXT,
        ats_score INTEGER,
        cv_analysis TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Feedbacks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        role VARCHAR(100),
        text TEXT,
        avatar TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Suggestions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL,
        name VARCHAR(100),
        email VARCHAR(100),
        text TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Articles (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255),
        category VARCHAR(100),
        description TEXT,
        content TEXT,
        read_time VARCHAR(50),
        image_url TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      ALTER TABLE Jobs ADD COLUMN IF NOT EXISTS company_name VARCHAR(150);
      ALTER TABLE Users ADD COLUMN IF NOT EXISTS dob VARCHAR(30);
      ALTER TABLE Feedbacks ADD COLUMN IF NOT EXISTS user_id INTEGER REFERENCES Users(id) ON DELETE SET NULL;
      DO $$ 
      BEGIN
        
        ALTER TABLE Applications DROP CONSTRAINT IF EXISTS applications_job_id_fkey;
        ALTER TABLE Applications ADD CONSTRAINT applications_job_id_fkey FOREIGN KEY (job_id) REFERENCES Jobs(id) ON DELETE SET NULL;
        ALTER TABLE Applications DROP CONSTRAINT IF EXISTS applications_user_id_fkey;
        ALTER TABLE Applications ADD CONSTRAINT applications_user_id_fkey FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE SET NULL;
        ALTER TABLE Applications ADD COLUMN IF NOT EXISTS employer_id INTEGER REFERENCES Users(id) ON DELETE SET NULL;
      EXCEPTION WHEN OTHERS THEN 
        -- Ignore errors if constraints don't exist or syntax varies
      END $$;
      
      -- Seed Mock Users and Jobs
      INSERT INTO Users (name, email, password, role, profile_progress, mobile_number, about, location) VALUES 
      ('Hire-X Global Network', 'darshankm35100@gmail.com', '$2b$10$5Tf5iB1.zwUJNkEfX11CE.ksmKLfbIR28BaI0pi44TbwigC9R8vWC', 'main_admin', 100, '0000000000', 'Main Administrator Account for Hire-X Global Network.', 'Global')
      ON CONFLICT (email) DO NOTHING;
    `);

    // Seed 15 Articles if table is empty
    const articlesCheck = await pool.query('SELECT COUNT(*) FROM Articles');
    if (parseInt(articlesCheck.rows[0].count) === 0) {
      const sampleArticles = [
        { title: 'Mastering React in 2026', category: 'Tech News', desc: 'A deep dive into Server Components and state management.', time: '5 min read' },
        { title: 'Resume Building for Big Tech', category: 'Career Guidance', desc: 'How to bypass the modern ATS systems efficiently.', time: '8 min read' },
        { title: 'AI in 2026: The New Normal', category: 'Tech News', desc: 'Generative AI is changing the landscape of software engineering.', time: '6 min read' },
        { title: 'Top 10 Interview Tips', category: 'Interview Tips', desc: 'Stand out in your next technical interview.', time: '4 min read' },
        { title: 'The Future of Remote Work', category: 'Career Guidance', desc: 'Why hybrid models are winning in the global market.', time: '7 min read' },
        { title: 'Understanding System Design', category: 'Tech News', desc: 'A beginner\'s guide to scalable architecture.', time: '10 min read' },
        { title: 'Salary Negotiation Tactics', category: 'Career Guidance', desc: 'Never leave money on the table again.', time: '5 min read' },
        { title: 'Tailwind CSS vs Custom CSS', category: 'Tech News', desc: 'Why utility-first CSS frameworks are dominating.', time: '4 min read' },
        { title: 'Behavioral Interviews 101', category: 'Interview Tips', desc: 'Mastering the STAR method for leadership roles.', time: '6 min read' },
        { title: 'PostgreSQL Advanced Indexing', category: 'Tech News', desc: 'Speed up your queries with proper index strategies.', time: '8 min read' },
        { title: 'Navigating Layoffs', category: 'Career Guidance', desc: 'How to bounce back stronger after losing your job.', time: '5 min read' },
        { title: 'Live Coding Interview Prep', category: 'Interview Tips', desc: 'Overcoming stage fright during technical screens.', time: '7 min read' },
        { title: 'Next.js 16 Features', category: 'Tech News', desc: 'What to expect in the next major release of Next.js.', time: '4 min read' },
        { title: 'Building a Personal Brand', category: 'Career Guidance', desc: 'Why developers need to market themselves online.', time: '6 min read' },
        { title: 'Mock Interviews: Do They Help?', category: 'Interview Tips', desc: 'The psychology behind practice interviews.', time: '3 min read' },
      ];
      for (const a of sampleArticles) {
        await pool.query('INSERT INTO Articles (title, category, description, read_time, image_url) VALUES ($1, $2, $3, $4, $5)', [a.title, a.category, a.desc, a.time, 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1000&q=80']);
      }
    }

    console.log("Database perfectly initialized for global scale.");
  } catch (err) {
    console.error("Failed to initialize database schema:", err);
  }
}
initDB();

// --- Auth Endpoints ---
app.post('/api/auth/send-verify-otp', async (req, res) => {
  const { type, identifier } = req.body; // type is 'email'
  try {
    const adminCheck = await pool.query("SELECT email FROM Users WHERE role = 'main_admin'");
    if (adminCheck.rows.length > 0 && identifier.toLowerCase() === adminCheck.rows[0].email.toLowerCase()) {
      return res.status(400).json({ error: 'You are the Main Administrator, your account is already registered. Please login to continue.' });
    }

    const existing = await pool.query(`SELECT id FROM Users WHERE email = $1`, [identifier]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'Account already registered, please try with another account or log in.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps['verify_' + identifier] = otp;

    const emailSent = await sendEmail({
      to: identifier,
      subject: `Hire-X Global Network Verification OTP`,
      text: `Welcome to Hire-X!\n\nYou have successfully requested an email verification.\n\nYour Verification OTP is: ${otp}\n\nBest regards,\nHire-X Team`
    });

    if (!emailSent) {
      delete otps['verify_' + identifier];
      return res.status(400).json({ error: 'Failed to send OTP email. If using Resend, please check if your domain is verified, or switch to Gmail/Nodemailer as explained.' });
    }

    res.json({ message: "Email OTP sent successfully." });
  } catch (err) {
    res.status(500).json({ error: 'System error.' });
  }
});

app.post('/api/auth/check-verify-otp', (req, res) => {
  const { identifier, otp } = req.body;
  if (otps['verify_' + identifier] && otps['verify_' + identifier] === otp) {
    res.json({ success: true, message: "Verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, mobile_number, education, experience, emailOtp } = req.body;
  const userRole = 'admin'; // Everyone is admin now
  try {
    const adminCheck = await pool.query("SELECT email FROM Users WHERE role = 'main_admin'");
    if (adminCheck.rows.length > 0 && email.toLowerCase() === adminCheck.rows[0].email.toLowerCase()) {
      return res.status(400).json({ error: 'You are the Main Administrator, your account is already registered. Please login to continue.' });
    }
    if (otps['verify_' + email] !== emailOtp) {
      return res.status(400).json({ error: 'Invalid or missing OTP for Email.' });
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    let progress = 30;
    if (mobile_number && mobile_number.length >= 10) progress += 10;
    if (education && education !== 'None') progress += 10;
    if (experience !== null && experience !== undefined && experience !== '') progress += 10;

    const result = await pool.query(
      'INSERT INTO Users (name, email, mobile_number, password, role, education, experience, profile_progress) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id, name, email, mobile_number, role, education, experience, avatar, profile_progress',
      [name, email, mobile_number || '', hashedPassword, userRole, education || 'None', experience ? parseInt(experience) : 0, progress]
    );
    const user = result.rows[0];
    delete otps['verify_' + email];
    res.json({ user, message: "Welcome to Hire-X Global Network. Signup successfully! Please login to continue." });
  } catch (err) {
    if (err.code === '23505') { // postgres unique violation
      return res.status(400).json({ error: 'Account already registered, please try with another account or log in.' });
    }
    console.error("Signup DB Error:", err);
    res.status(400).json({ error: 'Registration failed. Identity may already exist.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const validPass = await bcrypt.compare(password, user.password);
      if (validPass) {
        delete user.password;
        const token = jwt.sign({ id: user.id, role: user.role, email: user.email }, JWT_SECRET);
        res.json({ token, user, message: "Login successfully! Welcome back." });
      } else {
        res.status(401).json({ error: 'invalid password' });
      }
    } else {
      res.status(401).json({ error: 'invalid id' });
    }
  } catch (err) {
    res.status(500).json({ error: 'System error during login.' });
  }
});

// Mock OTP storage (in memory for simplicity)
const otps = {};

app.post('/api/auth/destroy', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM Users WHERE email = $1', [email]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const validPass = await bcrypt.compare(password, user.password);
      if (validPass) {
        await pool.query('DELETE FROM Users WHERE id = $1', [user.id]);
        res.json({ message: "Account destroyed successfully." });
      } else {
        res.status(401).json({ error: 'Invalid password.' });
      }
    } else {
      res.status(404).json({ error: 'Account not found.' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'System error during account destruction.' });
  }
});

app.post('/api/auth/forgot-password', async (req, res) => {
  const identifier = req.body.identifier?.trim().toLowerCase(); // email only
  try {
    const result = await pool.query('SELECT * FROM Users WHERE LOWER(email) = $1', [identifier]);
    if (result.rows.length > 0) {
      const user = result.rows[0];
      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      otps[identifier] = otp;

      const emailSent = await sendEmail({
        to: identifier,
        subject: `Password Reset OTP`,
        text: `Hello,\n\nYou have successfully requested a password reset.\n\nYour OTP for resetting password is: ${otp}\n\nPlease do not share this with anyone.\n\nBest regards,\nHire-X Team`
      });

      if (!emailSent) {
        delete otps[identifier];
        return res.status(400).json({ error: 'Failed to send OTP email. If using Resend, please check if your domain is verified, or switch to Gmail/Nodemailer as explained.' });
      }

      res.json({ message: "OTP sent to your Registered Email." });
    } else {
      res.status(404).json({ error: 'This is not a registered email, please enter a registered email.' });
    }
  } catch (err) {
    res.status(500).json({ error: 'System error.' });
  }
});

app.post('/api/auth/check-forgot-otp', (req, res) => {
  const identifier = req.body.identifier?.trim().toLowerCase();
  const { otp } = req.body;
  if (otps[identifier] && otps[identifier] === otp) {
    res.json({ success: true, message: "Verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid or expired OTP." });
  }
});

app.post('/api/auth/reset-password', async (req, res) => {
  const identifier = req.body.identifier?.trim().toLowerCase();
  const { otp, newPassword } = req.body;
  try {
    if (otps[identifier] && otps[identifier] === otp) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      await pool.query('UPDATE Users SET password = $1 WHERE LOWER(email) = $2', [hashedPassword, identifier]);
      delete otps[identifier];
      res.json({ message: "Credentials successfully modified." });
    } else {
      res.status(400).json({ error: "Invalid or expired OTP." });
    }
  } catch (err) {
    res.status(500).json({ error: 'System error.' });
  }
});

// Middleware to verify JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Authentication token missing.' });
  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: 'Token expired or invalid.' });
    req.user = user;
    next();
  });
}

// --- SSE Setup for Global Notifications ---
let clients = [];
app.get('/api/notifications/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  res.write(`data: {"message": "connected"}\n\n`);
  clients.push(res);
  req.on('close', () => {
    clients = clients.filter(c => c !== res);
  });
});

function sendNotificationToClients(notification) {
  clients.forEach(c => c.write(`data: ${JSON.stringify(notification)}\n\n`));
}

// --- Job Endpoints ---
app.get('/api/jobs', async (req, res) => {
  try {
    const { title, location } = req.query;
    let queryText = 'SELECT Jobs.id, Jobs.employer_id, Jobs.company_name, Jobs.title, Jobs.qualification, LEFT(Jobs.description, 300) as description, Jobs.education_level, Jobs.years_experience, Jobs.location, Jobs.company_logo, Jobs.end_date, Jobs.created_at, (length(Jobs.official_notification) > 10) as has_notification, Users.name as employer_name FROM Jobs LEFT JOIN Users ON Jobs.employer_id = Users.id WHERE (Jobs.end_date::timestamp >= NOW() OR Jobs.end_date IS NULL)';
    let params = [];
    if (title) { params.push(`%${title}%`); queryText += ` AND Jobs.title ILIKE $${params.length}`; }
    if (location) { params.push(`%${location}%`); queryText += ` AND Jobs.location ILIKE $${params.length}`; }
    queryText += ' ORDER BY Jobs.id DESC';
    
    const limit = parseInt(req.query.limit) || 30;
    const offset = parseInt(req.query.offset) || 0;
    queryText += ` LIMIT ${limit} OFFSET ${offset}`;

    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching global jobs.' });
  }
});

app.get('/api/jobs/:id/notification', async (req, res) => {
  try {
    const result = await pool.query('SELECT official_notification FROM Jobs WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json({ notification: result.rows[0].official_notification });
    } else {
      res.status(404).json({ error: 'Not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'System error' });
  }
});

// Profile Endpoints
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, mobile_number, role, education, experience, avatar, about, skills, location, dob, profile_progress FROM Users WHERE id = $1', [req.user.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, mobile_number, education, experience, about, skills, location, avatar, dob } = req.body;
  try {
    // Calculate simple profile progress automatically
    let progress = 30; // base for email/password/name
    if (mobile_number && mobile_number.length >= 10) progress += 10;
    if (education && education !== 'None') progress += 10;
    if (experience !== null && experience !== undefined && experience !== '') progress += 10;
    if (about && about.length > 5) progress += 10;
    if (skills && skills.length > 2) progress += 15;
    if (location && location.length > 2) progress += 10;
    if (avatar && avatar.length > 5) progress += 10;
    if (dob && dob.trim() !== '') progress += 5;
    progress = Math.min(progress, 100);

    const result = await pool.query(
      `UPDATE Users SET name=$1, mobile_number=$2, education=$3, experience=$4, about=$5, skills=$6, location=$7, avatar=$8, dob=$9, profile_progress=$10 WHERE id=$11 RETURNING id, name, email, mobile_number, role, education, experience, avatar, about, skills, location, dob, profile_progress`,
      [name, mobile_number, education, experience, about, skills, location, avatar, dob, progress, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

app.post('/api/users/destroy-request-otp', authenticateToken, async (req, res) => {
  const identifier = req.body.identifier?.trim().toLowerCase();
  try {
    const existing = await pool.query('SELECT email FROM Users WHERE id = $1 AND LOWER(email) = $2', [req.user.id, identifier]);
    if (existing.rows.length === 0) return res.status(400).json({ error: 'This is not a registered email, please enter a registered email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps['destroy_' + identifier] = otp;

    const emailSent = await sendEmail({
      to: identifier,
      subject: `Account Destruction Warning OTP`,
      text: `CRITICAL ALERT:\n\nYou have successfully requested to destroy your account.\n\nYour OTP to completely and permanently destroy your Hire-X account is: ${otp}\n\nDo not share this with anyone.`
    });

    if (!emailSent) {
      delete otps['destroy_' + identifier];
      return res.status(400).json({ error: 'Failed to send OTP email. If using Resend, please check if your domain is verified, or switch to Gmail/Nodemailer as explained.' });
    }

    res.json({ message: "Destruction verification OTP sent successfully." });
  } catch (err) {
    res.status(500).json({ error: 'System error' });
  }
});

app.post('/api/users/destroy-verify', authenticateToken, async (req, res) => {
  const identifier = req.body.identifier?.trim().toLowerCase();
  const { otp } = req.body;
  if (otps['destroy_' + identifier] && otps['destroy_' + identifier] === otp) {
    try {
      const userId = req.user.id;
      await pool.query('DELETE FROM Applications WHERE user_id = $1', [userId]);
      await pool.query('DELETE FROM Applications WHERE job_id IN (SELECT id FROM Jobs WHERE employer_id = $1)', [userId]);
      await pool.query('DELETE FROM Jobs WHERE employer_id = $1', [userId]);
      await pool.query('DELETE FROM Users WHERE id = $1', [userId]);
      delete otps['destroy_' + identifier];
      res.json({ message: "Account destroyed successfully." });
    } catch (err) {
      res.status(500).json({ error: 'System error during destruction' });
    }
  } else {
    res.status(400).json({ error: "Invalid or expired OTP." });
  }
});

// Unauthenticated destruction
app.post('/api/auth/destroy-request-otp', async (req, res) => {
  const identifier = req.body.identifier?.trim().toLowerCase();
  try {
    const existing = await pool.query('SELECT id FROM Users WHERE LOWER(email) = $1', [identifier]);
    if (existing.rows.length === 0) return res.status(400).json({ error: 'This is not a registered email, please enter a registered email.' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps['destroy_unauth_' + identifier] = otp;

    const emailSent = await sendEmail({
      to: identifier,
      subject: `Account Destruction OTP`,
      text: `CRITICAL ALERT:\n\nYou have successfully requested to destroy your account.\n\nYour OTP to permanently destroy your Hire-X account is: ${otp}\n\nDo not share this with anyone.`
    });

    if (!emailSent) {
      delete otps['destroy_unauth_' + identifier];
      return res.status(400).json({ error: 'Failed to send OTP email. If using Resend, please check if your domain is verified, or switch to Gmail/Nodemailer as explained.' });
    }

    res.json({ message: "Destruction verification OTP sent successfully." });
  } catch (err) {
    res.status(500).json({ error: 'System error' });
  }
});

app.post('/api/auth/destroy-verify-unauth', async (req, res) => {
  const identifier = req.body.identifier?.trim().toLowerCase();
  const { otp } = req.body;
  if (otps['destroy_unauth_' + identifier] && otps['destroy_unauth_' + identifier] === otp) {
    try {
      const userRes = await pool.query('SELECT id FROM Users WHERE LOWER(email) = $1', [identifier]);
      if (userRes.rows.length > 0) {
        const userId = userRes.rows[0].id;
        await pool.query('DELETE FROM Applications WHERE user_id = $1', [userId]);
        await pool.query('DELETE FROM Applications WHERE job_id IN (SELECT id FROM Jobs WHERE employer_id = $1)', [userId]);
        await pool.query('DELETE FROM Jobs WHERE employer_id = $1', [userId]);
        await pool.query('DELETE FROM Users WHERE id = $1', [userId]);
      }
      delete otps['destroy_unauth_' + identifier];
      res.json({ message: "Account successfully terminated" });
    } catch (err) {
      res.status(500).json({ error: 'System error during destruction' });
    }
  } else {
    res.status(400).json({ error: "Invalid or expired OTP." });
  }
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
  const { company_name, title, qualification, description, education_level, years_experience, location, company_logo, official_notification, end_date } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Jobs (employer_id, company_name, title, qualification, description, education_level, years_experience, location, company_logo, official_notification, end_date) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
      [req.user.id, company_name || 'Unknown Company', title, qualification, description, education_level, years_experience, location, company_logo || null, official_notification || null, end_date || null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to broadcast job to network.' });
  }
});

app.delete('/api/jobs/:id', authenticateToken, async (req, res) => {
  try {
    const jobId = req.params.id;
    const check = await pool.query('SELECT employer_id FROM Jobs WHERE id = $1', [jobId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    if (check.rows[0].employer_id !== req.user.id && req.user.role !== 'main_admin' && req.user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this job' });
    }

    // Only delete strictly non-shortlisted applications to retain history. Or actually, just set them aside if we need permanence. Let's delete non-shortlisted only.
    await pool.query("DELETE FROM Applications WHERE job_id = $1 AND status != 'Shortlisted'", [jobId]);
    // For shortlisted, we could nullify job_id if we want to delete job, but job_id is cascading in DB if we didn't change it initially.
    // So we'll just not delete the job if it has shortlisted apps? Or we delete job. The DB schema ON DELETE CASCADE will erase the app.
    // Without direct DB alter, we can set status of job to 'Expired' instead of DELETE. "delete kotre delete aagutte"
    // Let's actually execute an ALTER TABLE just in case on initDB to remove CASCADE.
    // In this route we will just execute:
    await pool.query('DELETE FROM Jobs WHERE id = $1', [jobId]);
    res.json({ success: true, message: 'Job deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete job.' });
  }
});

// --- Application Endpoints ---
app.post('/api/cv-analyze', authenticateToken, async (req, res) => {
  const { cv_pdf_base64, job_description, profile_name } = req.body;
  try {
    // Integrate Groq Llama API for ATS scoring
    if (!process.env.GROQ_API_KEY) {
      return res.json({ ats_score: Math.floor(Math.random() * 40) + 60, analysis: "Demo Analysis: Great match but missing API key.", suggested_roles: [], top_skills: ["Demo Skill 1", "Demo Skill 2"], experience_summary: "Demo Experience 2+ years" });
    }

    const prompt = `You are an expert ATS (Applicant Tracking System) recruiter. Deeply analyze the provided CV text against the provided job description. 
    Job Description: "${job_description || 'General Tech Role'}". 
    Candidate Profile Registration Name: "${profile_name || 'N/A'}".
    
    SCORING CRITERIA:
    - 70 to 100: Excellent match, high relevancy of skills and qualifications.
    - 40 to 69: Moderate match, some relevant skills or academic background.
    - 15 to 39: Weak match, but contains some professional or educational keywords.
    - 1 to 14: Very poor match, but the document is clearly a CV/Resume.
    - 0: The document is COMPLETELY empty, unreadable, or NOT a CV/Resume at all (e.g., random image, marks card only, or generic certificate).

    Note: If the candidate has even a few matching skills or relevant education, DO NOT give a 0. Give a score that reflects the partial match.

    Provide your output STRICTLY in JSON format with the following exact keys. ALL TEXT MUST BE IN ENGLISH:
    "ats_score": Integer (0 to 100).
    "analysis": A MASSIVE, incredibly detailed, strictly factual paragraph (at least 8-15 long sentences). Deeply explain exactly WHY the CV matched or did not match the job. If the document is not a CV, explain exactly what it is and why the score is 0. NEVER write generic text; analyze the exact content of the document.
    "suggested_roles": Array of 3 job titles matching the document facts (leave empty if not a CV).
    "top_skills": Array of factual skills EXACTLY extracted from the document text. DO NOT HALLUCINATE OR INVENT SKILLS.
    "experience_summary": Detailed string of EXACT total years of experience and key roles (e.g. "2 years as Frontend Developer").
    "mismatch_alert": Check if the name written inside the CV matches the 'Candidate Profile Registration Name'. If the names obviously DO NOT MATCH, output an alert string (e.g. "Warning: The name on the CV does not match your registered profile name."). If they match or no name is found, return an empty string "".
    
    Output ONLY raw valid JSON without any markdown formatting like \`\`\`json.`;

    // Extract text from PDF
    const pdfBuffer = Buffer.from(cv_pdf_base64, 'base64');
    let cvText = "";
    try {
      const pdfData = await pdfParse(pdfBuffer);
      cvText = pdfData.text;
      console.log("Extracted CV Text (First 500 chars):", cvText.substring(0, 500));
    } catch (parseErr) {
      console.error("PDF Parse Error:", parseErr);
      return res.json({ ats_score: 0, analysis: "ERROR: Failed to read text from the provided PDF document. Please ensure it is a valid text-based PDF.", suggested_roles: [], top_skills: [], experience_summary: "N/A", mismatch_alert: "" });
    }

      let output = "{}";
      try {
        const chatCompletion = await groqClient.chat.completions.create({
          messages: [
            { role: "system", content: prompt },
            { role: "user", content: `Here is the extracted text from the candidate's CV:\n\n${cvText}` }
          ],
          model: "llama-3.3-70b-versatile",
          response_format: { type: "json_object" },
          temperature: 0.2
        });
        output = chatCompletion.choices[0]?.message?.content || "{}";
      } catch (groqErr) {
        console.error("Groq API failed, falling back to Gemini API:", groqErr);
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING');
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });
        const geminiPrompt = prompt + "\n\n" + `Here is the extracted text from the candidate's CV:\n\n${cvText}`;
        const result = await model.generateContent({
          contents: [{ role: "user", parts: [{ text: geminiPrompt }] }],
          generationConfig: { responseMimeType: "application/json" }
        });
        output = result.response.text() || "{}";
      }

      const data = JSON.parse(output);
    res.json(data);
  } catch (err) {
    console.error("CV Analysis Error:", err);
    res.json({ ats_score: 0, analysis: "ERROR: This document could not be analyzed. Please upload a valid, clear text-based PDF CV.", suggested_roles: [], top_skills: [], experience_summary: "N/A", mismatch_alert: "" });
  }
});

app.post('/api/applications', authenticateToken, async (req, res) => {
  // Anyone can apply for roles now
  const { job_id, cv_url, ats_score, cv_analysis } = req.body;
  try {
    // Check if already applied
    const existing = await pool.query('SELECT * FROM Applications WHERE job_id=$1 AND user_id=$2', [job_id, req.user.id]);
    if (existing.rows.length > 0) return res.status(400).json({ error: 'You have already applied for this role.' });

    // Insert
    const jobRes = await pool.query('SELECT employer_id, title, company_name, company_logo FROM Jobs WHERE id=$1', [job_id]);
    if (jobRes.rows.length === 0) return res.status(404).json({ error: 'Job not found' });
    const employerId = jobRes.rows[0].employer_id;
    const jobTitle = jobRes.rows[0].title;
    const appliedCompany = jobRes.rows[0].company_name || 'the Company';
    const companyLogo = jobRes.rows[0].company_logo || null;

    const result = await pool.query(
      'INSERT INTO Applications (job_id, user_id, employer_id, cv_url, ats_score, cv_analysis) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [job_id, req.user.id, employerId, cv_url, ats_score || 0, cv_analysis || '']
    );

    // Notify Employer and send automated emails

    sendNotificationToClients({
      type: 'NEW_APPLICATION',
      user_id: employerId,
      message: `New global applicant for: ${jobTitle} with ATS Score: ${ats_score}`
    });

    const now = new Date();
    const istTime = new Date(now.getTime() + (5.5 * 60 * 60 * 1000));
    const dd = String(istTime.getUTCDate()).padStart(2, '0');
    const mm = String(istTime.getUTCMonth() + 1).padStart(2, '0');
    const yyyy = istTime.getUTCFullYear();
    const submitDateStr = `${dd}-${mm}-${yyyy}`;
    let hours = istTime.getUTCHours();
    const minutes = String(istTime.getUTCMinutes()).padStart(2, '0');
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const submitTimeStr = `${hours}:${minutes} ${ampm}`;

    // Send Real Email to Applicant
    const applicantRes = await pool.query('SELECT name, email FROM Users WHERE id=$1', [req.user.id]);
    if (applicantRes.rows.length > 0) {
      sendEmail({
        to: applicantRes.rows[0].email,
        subject: `Application Submitted: ${jobTitle}`,
        text: `Hello ${applicantRes.rows[0].name},

Congratulations! You have successfully submitted your application to ${appliedCompany} for the job role: ${jobTitle}.

Next Process (Submission Details):
Date: ${submitDateStr}
Time: ${submitTimeStr}
Mode: Online Evaluation
Location: ${appliedCompany} (ATS System)

Please prepare well and wait for the employer to review your profile. All the best!

Warm Regards,
Hire-X Global Network`
      });
    }

    // Send Real Email to Employer
    const empRes = await pool.query('SELECT name, email FROM Users WHERE id=$1', [employerId]);
    if (empRes.rows.length > 0) {
      sendEmail({
        to: empRes.rows[0].email,
        subject: `New Application Received: ${jobTitle}`,
        text: `Hello ${empRes.rows[0].name},

Congratulations! You have successfully received a new application for the job role: ${jobTitle}.

Next Process (Applicant Details):
Date: ${submitDateStr}
Time: ${submitTimeStr}
Mode: Name - ${applicantRes.rows.length > 0 ? applicantRes.rows[0].name : "A new candidate"}
Location: Match Score - ${ats_score}%

Please log in to your Hire-X dashboard to review the full details and CV. All the best!

Warm Regards,
Hire-X Global Network`
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Secure application submission failed.' });
  }
});

app.get('/api/feedbacks', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Feedbacks ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch feedbacks' });
  }
});

app.post('/api/feedbacks', authenticateToken, async (req, res) => {
  const { text } = req.body;
  try {
    const userRes = await pool.query('SELECT name, role, avatar FROM Users WHERE id=$1', [req.user.id]);
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];
      const result = await pool.query(
        'INSERT INTO Feedbacks (name, role, text, avatar, user_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [user.name, user.role || 'Member', text, user.avatar || '', req.user.id]
      );
      res.json({ success: true, feedback: result.rows[0] });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
});

app.delete('/api/feedbacks/:id', authenticateToken, async (req, res) => {
  try {
    const feedbackId = req.params.id;
    const check = await pool.query('SELECT user_id FROM Feedbacks WHERE id = $1', [feedbackId]);
    if (check.rows.length === 0) return res.status(404).json({ error: 'Feedback not found' });
    if (check.rows[0].user_id !== req.user.id && req.user.role !== 'main_admin' && req.user.role !== 'main_admin') {
      return res.status(403).json({ error: 'Unauthorized to delete this feedback' });
    }

    await pool.query('DELETE FROM Feedbacks WHERE id = $1', [feedbackId]);
    res.json({ success: true, message: 'Feedback deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete feedback' });
  }
});

app.get('/api/applications', authenticateToken, async (req, res) => {
  // Anyone can view their applicants or jobs
  try {
    let query = `
      SELECT a.id, a.status, a.ats_score, a.cv_analysis, a.cv_url, COALESCE(j.title, 'Deleted Role') as role, a.job_id, u.name as applicant_name, u.email, u.mobile_number, u.education, u.experience, u.id as user_id, u.skills, u.location, u.about
      FROM Applications a
      LEFT JOIN Jobs j ON a.job_id = j.id
      LEFT JOIN Users u ON a.user_id = u.id
    `;
    let params = [];
    if (req.user.role === 'employer' || true) {
      query += ` WHERE a.employer_id = $1 OR j.employer_id = $1`;
      params.push(req.user.id);
    }
    query += ` ORDER BY a.id DESC`;

    const result = await pool.query(query, params);

    // Also fetch jobs they applied to
    const appliedQuery = `
      SELECT a.id, a.status, a.ats_score, a.cv_analysis, j.title as role, j.company_name, j.location as location, j.description, j.education_level, j.qualification, j.years_experience, j.end_date, j.company_logo, j.official_notification
      FROM Applications a
      JOIN Jobs j ON a.job_id = j.id
      WHERE a.user_id = $1 ORDER BY a.id DESC
    `;
    const appliedResult = await pool.query(appliedQuery, [req.user.id]);

    // Also fetch jobs they posted
    const postedQuery = `
      SELECT * FROM Jobs WHERE employer_id = $1 ORDER BY id DESC
    `;
    const postedResult = await pool.query(postedQuery, [req.user.id]);

    res.json({ received: result.rows, applied: appliedResult.rows, posted: postedResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Data retrieval error' });
  }
});

app.post('/api/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const appId = req.params.id;
    const { status, interviewDate, interviewTime, interviewMode, interviewLocation } = req.body;
    const update = await pool.query('UPDATE Applications SET status = $1 WHERE id = $2 RETURNING *', [status, appId]);
    if (update.rows.length > 0) {
      const appRecord = update.rows[0];

      // Notify Applicant via SSE
      sendNotificationToClients({
        type: 'STATUS_UPDATE',
        user_id: appRecord.user_id,
        message: `Network Alert: Your application status is now ${status}!`
      });

      // Simulation of Emails and SMS
      const userRes = await pool.query('SELECT name, email, mobile_number FROM Users WHERE id=$1', [appRecord.user_id]);
      const jobRes = await pool.query('SELECT title, employer_id FROM Jobs WHERE id=$1', [appRecord.job_id]);

      const userName = userRes.rows[0]?.name || 'Applicant';
      const userEmail = userRes.rows[0]?.email || 'no-reply@hire-x.com';
      const jobTitle = jobRes.rows[0]?.title || 'Position';

      let emailMsg = `Hello ${userName},

Your application status for the role of ${jobTitle} has been updated to: ${status}.

Please log in to your Hire-X portal to view more details.

Best Regards,
Hire-X Team`;

      if (status === 'Shortlisted') {
        const empNameQuery = await pool.query('SELECT email, name FROM Users WHERE id=$1', [jobRes.rows[0]?.employer_id]);
        const jobCompanyRes = await pool.query('SELECT company_name FROM Jobs WHERE id=$1', [appRecord.job_id]);
        const companyName = jobCompanyRes.rows.length > 0 && jobCompanyRes.rows[0].company_name ? jobCompanyRes.rows[0].company_name : (empNameQuery.rows.length > 0 ? empNameQuery.rows[0].name : 'the Company');

        let formattedDate = 'TBD';
        if (interviewDate) {
          const [yyyy, mm, dd] = interviewDate.split('-');
          const dateObj = new Date(interviewDate);
          const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' });
          formattedDate = `${dd}-${mm}-${yyyy}, ${dayName}`;
        }

        emailMsg = `Hello ${userName},

Congratulations! You have been successfully shortlisted by ${companyName} for the job role: ${jobTitle}.

Next Process (Interview Details):
Date: ${formattedDate}
Time: ${interviewTime || 'TBD'}
Mode: ${interviewMode || 'Online'}
Location: ${interviewLocation || 'N/A'}

Please prepare well and attend the interview on time. All the best!

Warm Regards,
Hire-X Global Network`;

        if (empNameQuery.rows.length > 0) {
          await sendEmail({
            to: empNameQuery.rows[0].email,
            subject: `Candidate Shortlisted: ${jobTitle}`,
            text: `Hello ${empNameQuery.rows[0].name},

You have successfully shortlisted "${userName}" for the role of ${jobTitle}. The candidate has been formally notified about the interview schedule:

Date: ${formattedDate}
Time: ${interviewTime}
Mode: ${interviewMode}
Location: ${interviewLocation || 'N/A'}

Friendly reminder to be prepared for the interview at the allocated time.

Best regards,
Hire-X Team`
          });
        }

        // Notify Admin as requested
        await sendEmail({
          to: 'admin@hire-x.com',
          subject: `Admin Alert: Candidate Shortlisted: ${jobTitle}`,
          text: `Hello Admin,

Aspirant "${userName}" was just shortlisted for "${jobTitle}".

Employer scheduled interview on:
Date: ${formattedDate}
Time: ${interviewTime}
Mode: ${interviewMode}
Location: ${interviewLocation || 'N/A'}

System Auto-Generated.`
        });
      }

      // Send Real Email to Applicant
      await sendEmail({
        to: userEmail,
        subject: `Application Update: ${jobTitle} - ${status}`,
        text: emailMsg
      });

      res.json({ success: true, app: appRecord });
    } else {
      res.status(404).json({ error: 'Application record missing' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Processing failure' });
  }
});

// --- Hire-IQ Generative AI Endpoint ---
const groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY || 'MISSING_API_KEY' });

app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message, history } = req.body;
  if (!process.env.GROQ_API_KEY) {
    return res.json({
      text: "This is a demo response. Please add 'GROQ_API_KEY' to your .env file to enable real Assistant features."
    });
  }

  try {
    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'assistant',
      content: msg.text
    }));

    const systemPrompt = "You are Hire-IQ ✨, an advanced conversational Assistant by Hire-X. You must answer ANY user queries, whether science, coding, history, or casual talk, exactly like a generic highly-intelligent Assistant. DO NOT bring up jobs or Hire-X randomly unless explicitly asked by the user.\n\nCRITICAL DIRECTIVES:\n1. Only respond with what is asked. If they say hi, respond normally.\n2. You are practically omniscient. Answer all general knowledge.\n3. MASTER OF LANGUAGES & SCRIPTS: Always reply in proper English script. If the user speaks in broken English, correct them and respond in English.\n4. ONLY if the user explicitly asks for jobs, present jobs from the context. If they ask for 'developer jobs', ONLY show matching developer jobs.\n5. When you list a job, include the direct link exactly formatted like this: [Apply for {Job Title} here](/jobs?title={Job Title}).";

    const chatCompletion = await groqClient.chat.completions.create({
      messages: [
        { role: "system", content: systemPrompt },
        ...formattedHistory,
        { role: "user", content: message }
      ],
      model: "llama-3.1-8b-instant"
    });

    const responseText = chatCompletion.choices[0]?.message?.content || "";
    res.json({ text: responseText });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to generate intelligent response. Sorry." });
  }
});

// --- Suggestion Box Endpoint ---
app.post('/api/suggestions', authenticateToken, async (req, res) => {
  const { text } = req.body;
  try {
    const userRes = await pool.query('SELECT name, email FROM Users WHERE id=$1', [req.user.id]);
    if (userRes.rows.length > 0) {
      const user = userRes.rows[0];

      await pool.query('INSERT INTO Suggestions (user_id, name, email, text) VALUES ($1, $2, $3, $4)', [req.user.id, user.name, user.email, text]);

      const adminQ = await pool.query("SELECT email FROM Users WHERE role = 'main_admin'");
      const adminEmail = adminQ.rows.length > 0 ? adminQ.rows[0].email : 'darshankm35100@gmail.com';
      await sendEmail({
        to: adminEmail,
        subject: `New Suggestion from Hire-X Global Network`,
        text: `Hello Main Admin,\n\nYou have received a new suggestion from a user on the Hire-X platform.\n\nUser Details:\nName: ${user.name}\nEmail: ${user.email}\n\nSuggestion/Complaint:\n"${text}"\n\nPlease take the necessary actions according to Hire-X Global Network guidelines.\n\nWarm Regards,\nHire-X System Automations`,
        fromName: user.name
      });

      res.json({ success: true, message: 'Suggestion sent to Main Admin successfully.' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to submit suggestion' });
  }
});

app.get('/api/suggestions', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query('SELECT * FROM Suggestions ORDER BY id DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

app.delete('/api/suggestions/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM Suggestions WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Suggestion deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete suggestion' });
  }
});

app.post('/api/suggestions/:id/reply', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { replyText } = req.body;
  try {
    const sug = await pool.query('SELECT name, email, text FROM Suggestions WHERE id = $1', [req.params.id]);
    if (sug.rows.length === 0) return res.status(404).json({ error: 'Suggestion not found' });

    await sendEmail({
      to: sug.rows[0].email,
      subject: `Reply to your Suggestion on Hire-X`,
      text: `Hello ${sug.rows[0].name},\n\n${replyText}\n\nWarm Regards,\nHire-X Team`,
      fromName: 'Hire-X Global Network'
    });

    res.json({ success: true, message: 'Reply sent successfully.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to send reply' });
  }
});

// --- Contact Details Endpoint ---
app.get('/api/contact', async (req, res) => {
  try {
    const result = await pool.query("SELECT email, mobile_number, location FROM Users WHERE role = 'main_admin'");
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.json({ email: 'admin@hire-x.com', mobile_number: 'Not Specified', location: 'Not Specified' });
    }
  } catch (err) {
    res.json({ email: 'admin@hire-x.com', mobile_number: 'Not Specified', location: 'Not Specified' });
  }
});

// --- Articles Endpoints ---
app.get('/api/articles', async (req, res) => {
  try {
    // Exclude 'content' from list view to improve performance
    const limit = parseInt(req.query.limit) || 30;
    const offset = parseInt(req.query.offset) || 0;
    const result = await pool.query('SELECT id, title, category, description, read_time, image_url, created_at FROM Articles ORDER BY id DESC LIMIT $1 OFFSET $2', [limit, offset]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch articles' });
  }
});

app.get('/api/articles/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM Articles WHERE id = $1', [req.params.id]);
    if (result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'Article not found' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch article details' });
  }
});

app.post('/api/articles', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin' && req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { title, category, description, content, read_time, image_url } = req.body;
  if (!title || !category || !description || !content || !image_url) return res.status(400).json({ error: 'All fields are mandatory, including background image.' });
  try {
    const result = await pool.query(
      'INSERT INTO Articles (title, category, description, content, read_time, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
      [title, category, description, content, read_time || '5 min read', image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to create article' });
  }
});

app.put('/api/articles/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin' && req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  const articleId = req.params.id;
  const { title, category, description, content, read_time, image_url } = req.body;
  if (!title || !category || !description || !content || !image_url) return res.status(400).json({ error: 'All fields are mandatory, including background image.' });
  try {
    const result = await pool.query(
      'UPDATE Articles SET title=$1, category=$2, description=$3, content=$4, read_time=$5, image_url=$6 WHERE id=$7 RETURNING *',
      [title, category, description, content, read_time, image_url, articleId]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update article' });
  }
});

app.delete('/api/articles/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin' && req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM Articles WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Article deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete article' });
  }
});

// --- Admin Endpoints ---
app.get('/api/admin/users', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query('SELECT id, name, email, mobile_number, role, education, experience, avatar, about, skills, location, dob, profile_progress FROM Users ORDER BY name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

app.get('/api/admin/users/:id/details', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const userId = req.params.id;
    const userRes = await pool.query('SELECT * FROM Users WHERE id = $1', [userId]);
    const jobs = await pool.query('SELECT * FROM Jobs WHERE employer_id = $1', [userId]);
    const applied = await pool.query('SELECT a.*, j.title, j.company_name FROM Applications a JOIN Jobs j ON a.job_id = j.id WHERE a.user_id = $1', [userId]);
    const feedbacks = await pool.query('SELECT * FROM Feedbacks WHERE user_id = $1', [userId]);
    res.json({
      user: userRes.rows[0],
      postedJobs: jobs.rows,
      appliedJobs: applied.rows,
      feedbacks: feedbacks.rows
    });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch user details' });
  }
});

app.delete('/api/admin/users/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const userId = req.params.id;
    await pool.query('DELETE FROM Applications WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM Applications WHERE job_id IN (SELECT id FROM Jobs WHERE employer_id = $1)', [userId]);
    await pool.query('DELETE FROM Jobs WHERE employer_id = $1', [userId]);
    await pool.query('DELETE FROM Feedbacks WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM Suggestions WHERE user_id = $1', [userId]);
    await pool.query('DELETE FROM Users WHERE id = $1', [userId]);
    res.json({ success: true, message: 'User and all associated data deleted completely.' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

app.delete('/api/admin/applications/:id', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    await pool.query('DELETE FROM Applications WHERE id = $1', [req.params.id]);
    res.json({ success: true, message: 'Application deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete application' });
  }
});

app.get('/api/admin/jobs', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const result = await pool.query('SELECT Jobs.id, Jobs.employer_id, Jobs.company_name, Jobs.title, Jobs.qualification, Jobs.description, Jobs.education_level, Jobs.years_experience, Jobs.location, Jobs.company_logo, Jobs.end_date, Jobs.created_at, (length(Jobs.official_notification) > 10) as has_notification, Users.name as employer_name FROM Jobs LEFT JOIN Users ON Jobs.employer_id = Users.id ORDER BY company_name ASC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch all jobs' });
  }
});

// Admin Credential Change Endpoints
app.post('/api/auth/admin-change-req-otp', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  try {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps['admin_change_' + req.user.email] = otp;
    const emailSent = await sendEmail({
      to: req.user.email,
      subject: `Admin Credential Change Request OTP`,
      text: `Hello Main Admin,\n\nYour OTP to initiate credential change is: ${otp}\n\nDo not share this with anyone.`,
      fromName: 'Hire-X Global Network'
    });
    if (!emailSent) return res.status(400).json({ error: 'Failed to send email.' });
    res.json({ message: "OTP sent to current email." });
  } catch (err) {
    res.status(500).json({ error: 'System error' });
  }
});

app.post('/api/auth/admin-verify-req-otp', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { otp } = req.body;
  if (otps['admin_change_' + req.user.email] && otps['admin_change_' + req.user.email] === otp) {
    delete otps['admin_change_' + req.user.email];
    res.json({ success: true, message: "Verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.post('/api/auth/admin-new-email-otp', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { newEmail } = req.body;
  try {
    const emailValidation = await emailValidator.validate(newEmail);
    if (!emailValidation.valid) return res.status(400).json({ error: 'Invalid email format or domain' });

    const existing = await pool.query('SELECT id FROM Users WHERE email = $1', [newEmail]);
    if (existing.rows.length > 0 && newEmail !== req.user.email) return res.status(400).json({ error: 'Email already exists' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    otps['admin_new_email_' + newEmail] = otp;
    const emailSent = await sendEmail({
      to: newEmail,
      subject: `Verify New Admin Email`,
      text: `Hello Main Admin,\n\nYour OTP to verify your new email is: ${otp}\n\nDo not share this with anyone.`,
      fromName: 'Hire-X Global Network'
    });
    if (!emailSent) return res.status(400).json({ error: 'Failed to send email.' });
    res.json({ message: "OTP sent to new email." });
  } catch (err) {
    res.status(500).json({ error: 'System error' });
  }
});

app.post('/api/auth/admin-verify-new-email-otp', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { newEmail, otp } = req.body;
  if (otps['admin_new_email_' + newEmail] && otps['admin_new_email_' + newEmail] === otp) {
    delete otps['admin_new_email_' + newEmail];
    res.json({ success: true, message: "Verified successfully" });
  } else {
    res.status(400).json({ error: "Invalid OTP" });
  }
});

app.post('/api/auth/admin-update-credentials', authenticateToken, async (req, res) => {
  if (req.user.role !== 'main_admin') return res.status(403).json({ error: 'Unauthorized' });
  const { newEmail, newPassword, otp } = req.body;

  if (!otps['admin_new_email_' + newEmail] || otps['admin_new_email_' + newEmail] !== otp) {
    return res.status(400).json({ error: "Invalid OTP" });
  }
  delete otps['admin_new_email_' + newEmail];

  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    await pool.query(
      'UPDATE Users SET email = $1, password = $2, name = $3, mobile_number = $4, location = $5, avatar = $6, profile_progress = 30 WHERE id = $7',
      [newEmail, hashedPassword, 'New Admin', '', '', '', req.user.id]
    );
    res.json({ success: true, message: "Credentials successfully modified." });
  } catch (err) {
    res.status(500).json({ error: 'System error' });
  }
});

const fs = require('fs');
const distPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(distPath)) {
  app.use(express.static(distPath));
  app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.json({ message: "Hire-X Global API Gateway is running.", status: "Active" });
  });
}

let currentPort = process.env.PORT || 5000;
const startServer = (port) => {
  const server = app.listen(port, () => {
    console.log(`Global API Gateway running on port ${port}`);
    console.log(`Frontend is being served on http://localhost:${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n======================================================`);
      console.error(`❌ ERROR: Port ${port} is already in use.`);
      console.error(`Please kill the existing process to free up the port.`);
      console.error(`You can run: npx kill-port ${port}`);
      console.error(`======================================================\n`);
      process.exit(1);
    } else {
      console.error('Server failed to start:', err);
      process.exit(1);
    }
  });
};

startServer(currentPort);
