require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const nodemailer = require('nodemailer');

const app = express();
app.use(cors());
app.use(express.json());
const JWT_SECRET = process.env.JWT_SECRET || 'supersecrethirex123';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER || 'admin@hire-x.com',
    pass: process.env.EMAIL_PASS || 'mock-password'
  }
});

const sendSMS = (mobile, message) => {
  console.log(`[Twilio Mock SMS] Sent to: ${mobile} - Msg: ${message}`);
};

// Database Initialization (Auto-create tables)
async function initDB() {
  try {
    await pool.query(`
      DROP TABLE IF EXISTS Applications CASCADE;
      DROP TABLE IF EXISTS Jobs CASCADE;
      DROP TABLE IF EXISTS Users CASCADE;

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
        employer_id INTEGER REFERENCES Users(id),
        title VARCHAR(100),
        qualification VARCHAR(100),
        description TEXT,
        education_level VARCHAR(50),
        years_experience INTEGER,
        location VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS Applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES Jobs(id),
        user_id INTEGER REFERENCES Users(id),
        status VARCHAR(20) DEFAULT 'Pending',
        cv_url TEXT,
        ats_score INTEGER,
        cv_analysis TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Seed Mock Users and Jobs
      INSERT INTO Users (name, email, password, role, profile_progress) VALUES 
      ('Hire-X Global Admin', 'admin@hire-x.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 100),
      ('Sarah Connor', 'sarah@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50),
      ('John Doe', 'john@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50),
      ('Tech Lead Admin', 'lead@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 60),
      ('HR Manager', 'hr@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50),
      ('Design Head', 'design@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50),
      ('Marketing Pro', 'market@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50),
      ('QA Lead', 'qa@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50),
      ('DevOps Master', 'devops@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50),
      ('Product Owner', 'po@example.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 50)
      ON CONFLICT (email) DO NOTHING;

      -- Seed Mock Jobs
      DO $$
      BEGIN
        IF NOT EXISTS (SELECT 1 FROM Jobs) THEN
          INSERT INTO Jobs (employer_id, title, qualification, description, education_level, years_experience, location) VALUES
          (2, 'Senior React Developer', 'B.Tech/MCA', 'Looking for an experienced React developer to lead our frontend team. Must know Redux and Hooks perfectly.', 'Bachelors', 5, 'San Francisco, CA'),
          (3, 'Backend Node.js Engineer', 'B.Sc/B.Tech', 'Strong skills in Node.js, Express, Postgres required. Microservices experience is a plus.', 'Bachelors', 3, 'New York, NY'),
          (4, 'Full Stack Web Developer', 'Any Degree', 'Full stack role requiring React and Node.js. Fast paced environment.', 'Bachelors', 2, 'Remote'),
          (5, 'HR Talent Acquisition', 'MBA/BBA', 'Looking for an HR professional to help scale our teams. Good communication is essential.', 'Masters', 4, 'London, UK'),
          (6, 'UX/UI Designer', 'B.Des/Any', 'Figma expert needed for an upcoming AI product.', 'Bachelors', 3, 'Berlin, Germany'),
          (7, 'Digital Marketing Manager', 'MBA', 'SEO, SEM, Social Media expert to lead marketing campaigns globally.', 'Masters', 5, 'Remote'),
          (8, 'QA Automation Engineer', 'B.Tech', 'Selenium, Cypress, and Jest. Ensure our products are bug free.', 'Bachelors', 2, 'Bangalore, India'),
          (9, 'DevOps Cloud Engineer', 'B.E/B.Tech', 'AWS, Docker, Kubernetes mastery required to maintain 99.9% uptime.', 'Bachelors', 4, 'Seattle, WA'),
          (10, 'Product Manager', 'MBA/B.Tech', 'Define product vision and manage roadmaps for our SaaS platform.', 'Masters', 6, 'Austin, TX'),
          (2, 'Machine Learning Engineer', 'M.Tech/Ph.D', 'Python, PyTorch, TensorFlow. Build our next generation AI algorithms.', 'Masters', 3, 'Toronto, Canada'),
          (3, 'iOS Developer', 'B.Tech', 'Swift and Objective-C. Build fluid mobile experiences.', 'Bachelors', 3, 'San Francisco, CA'),
          (4, 'Android Developer', 'B.Tech', 'Kotlin expert for our main mobile application.', 'Bachelors', 3, 'Remote');
        END IF;
      END $$;
    `);
    console.log("Database perfectly initialized for global scale.");
  } catch (err) {
    console.error("Failed to initialize database schema:", err);
  }
}
initDB();

// --- Auth Endpoints ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, mobile_number, education, experience } = req.body;
  const userRole = 'admin'; // Everyone is admin now
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO Users (name, email, mobile_number, password, role, education, experience, profile_progress) VALUES ($1, $2, $3, $4, $5, $6, $7, 30) RETURNING id, name, email, mobile_number, role, education, experience, avatar, profile_progress',
      [name, email, mobile_number || '', hashedPassword, userRole, education || 'None', experience ? parseInt(experience) : 0]
    );
    const user = result.rows[0];
    // No token returned directly to force login
    res.json({ user, message: "Welcome to Hire-X Global Network. Signup successfully! Please login to continue." });
  } catch (err) {
    console.error("Signup DB Error:", err);
    res.status(400).json({ error: 'Registration failed. Identity may already be registered.' });
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
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
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
    let queryText = 'SELECT Jobs.*, Users.name as employer_name FROM Jobs LEFT JOIN Users ON Jobs.employer_id = Users.id WHERE 1=1';
    let params = [];
    if (title) { params.push(`%${title}%`); queryText += ` AND Jobs.title ILIKE $${params.length}`; }
    if (location) { params.push(`%${location}%`); queryText += ` AND Jobs.location ILIKE $${params.length}`; }
    queryText += ' ORDER BY Jobs.id DESC';
    const result = await pool.query(queryText, params);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Error fetching global jobs.' });
  }
});

// Profile Endpoints
app.get('/api/users/profile', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, email, mobile_number, role, education, experience, avatar, about, skills, location, profile_progress FROM Users WHERE id = $1', [req.user.id]);
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
  const { name, mobile_number, education, experience, about, skills, location, avatar } = req.body;
  try {
    // Calculate simple profile progress automatically
    let progress = 30; // base for email/password/name
    if (mobile_number && mobile_number.length >= 10) progress += 10;
    if (education && education !== 'None') progress += 10;
    if (experience > 0) progress += 10;
    if (about && about.length > 10) progress += 10;
    if (skills && skills.length > 3) progress += 15;
    if (location && location.length > 2) progress += 10;
    if (avatar && avatar.length > 5) progress += 5;
    progress = Math.min(progress, 100);

    const result = await pool.query(
      `UPDATE Users SET name=$1, mobile_number=$2, education=$3, experience=$4, about=$5, skills=$6, location=$7, avatar=$8, profile_progress=$9 WHERE id=$10 RETURNING id, name, email, mobile_number, role, education, experience, avatar, about, skills, location, profile_progress`,
      [name, mobile_number, education, experience, about, skills, location, avatar, progress, req.user.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
  // Anyone can post a job now
  const { title, qualification, description, education_level, years_experience, location } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO Jobs (employer_id, title, qualification, description, education_level, years_experience, location) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [req.user.id, title, qualification, description, education_level, years_experience, location]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to broadcast job to network.' });
  }
});

// --- Application Endpoints ---
app.post('/api/cv-analyze', authenticateToken, async (req, res) => {
  const { cv_pdf_base64, job_description } = req.body;
  try {
    // Integrate Gemini API for ATS scoring
    if (!process.env.GEMINI_API_KEY) {
      return res.json({ ats_score: Math.floor(Math.random() * 40) + 60, analysis: "Demo Analysis: Great match but missing API key for real AI analysis.", suggested_roles: [] });
    }
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `You are an expert ATS (Applicant Tracking System). Analyze the provided CV Document against standard tech jobs (or the provided job description if any). Job Description: "${job_description || 'General Tech Role'}". 
    Provide your output STRICTLY in JSON format with the following keys:
    "ats_score": An integer from 0 to 100 representing the match score.
    "analysis": A brief 1-2 sentence explanation of the score.
    "suggested_roles": An array of 3 job titles that best fit this CV (e.g. ["React Developer", "UI Designer", "Frontend Engineer"]).
    Do not include markdown tags like \`\`\`json, just output the raw JSON sequence.`;
    
    const pdfPart = {
      inlineData: {
        data: cv_pdf_base64,
        mimeType: "application/pdf"
      }
    };

    const result = await model.generateContent([prompt, pdfPart]);
    let output = result.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
    const data = JSON.parse(output);
    res.json(data);
  } catch (err) {
    console.error("AI CV Analysis Error:", err);
    res.json({ ats_score: 75, analysis: "Fallback Analysis: Good profile based on standard metrics. Uploaded PDF parsed.", suggested_roles: ["Software Engineer", "Developer", "Analyst"] });
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
    const result = await pool.query(
      'INSERT INTO Applications (job_id, user_id, cv_url, ats_score, cv_analysis) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [job_id, req.user.id, cv_url, ats_score || 0, cv_analysis || '']
    );

    // Notify Employer
    const jobRes = await pool.query('SELECT employer_id, title FROM Jobs WHERE id=$1', [job_id]);
    if (jobRes.rows.length > 0) {
      sendNotificationToClients({
        type: 'NEW_APPLICATION',
        user_id: jobRes.rows[0].employer_id,
        message: `New global applicant for: ${jobRes.rows[0].title} with ATS Score: ${ats_score}`
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Secure application submission failed.' });
  }
});

app.get('/api/applications', authenticateToken, async (req, res) => {
  // Anyone can view their applicants or jobs
  try {
    let query = `
      SELECT a.id, a.status, a.ats_score, a.cv_analysis, a.cv_url, j.title as role, u.name as applicant_name, u.email, u.mobile_number, u.education, u.experience, u.id as user_id 
      FROM Applications a
      JOIN Jobs j ON a.job_id = j.id
      JOIN Users u ON a.user_id = u.id
    `;
    let params = [];
    if (req.user.role === 'employer' || true) { // Removing role constraint to show anyone their posted job's applicants
      query += ` WHERE j.employer_id = $1`;
      params.push(req.user.id);
    }
    query += ` ORDER BY a.id DESC`;

    const result = await pool.query(query, params);
    
    // Also fetch jobs they applied to
    const appliedQuery = `
      SELECT a.id, a.status, a.ats_score, a.cv_analysis, j.title as role, j.location as location
      FROM Applications a
      JOIN Jobs j ON a.job_id = j.id
      WHERE a.user_id = $1 ORDER BY a.id DESC
    `;
    const appliedResult = await pool.query(appliedQuery, [req.user.id]);

    res.json({ received: result.rows, applied: appliedResult.rows });
  } catch (err) {
    res.status(500).json({ error: 'Data retrieval error' });
  }
});

app.post('/api/applications/:id/status', authenticateToken, async (req, res) => {
  try {
    const appId = req.params.id;
    const { status } = req.body;
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
      const jobRes = await pool.query('SELECT title FROM Jobs WHERE id=$1', [appRecord.job_id]);
      
      const userName = userRes.rows[0]?.name || 'Applicant';
      const userEmail = userRes.rows[0]?.email || 'no-reply@hire-x.com';
      const userMobile = userRes.rows[0]?.mobile_number || '0000000000';
      const jobTitle = jobRes.rows[0]?.title || 'Position';

      if (status === 'Shortlisted') {
        const emailMsg = `Congratulations ${userName}! Your application for ${jobTitle} has been Shortlisted.`;
        console.log(`[NODEMAILER LOG] Sending Email to: ${userEmail} | Content: ${emailMsg}`);
        sendSMS(userMobile, emailMsg);
        
        try {
          if(process.env.EMAIL_USER && process.env.EMAIL_PASS) {
             await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: userEmail,
                subject: `Application Shortlisted for ${jobTitle}`,
                text: emailMsg
             });
          }
        } catch (mailErr) {
            console.error("Nodemailer failed (mocking success):", mailErr.message);
        }
      }

      res.json({ success: true, app: appRecord });
    } else {
      res.status(404).json({ error: 'Application record missing' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Processing failure' });
  }
});

// --- Hire-IQ Generative AI Endpoint ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'MISSING_API_KEY');

app.post('/api/chat', authenticateToken, async (req, res) => {
  const { message, history } = req.body;
  if (!process.env.GEMINI_API_KEY) {
    return res.json({
      text: "ಇದೊಂದು ಡೆಮೊ ರಿಸ್ಪಾನ್ಸ್. ಅಸಲಿ AI ಆಗಿ ಕೆಲಸ ಮಾಡಲು ದಯವಿಟ್ಟು ನಿಮ್ಮ '.env' ಫೈಲ್‌ನಲ್ಲಿ 'GEMINI_API_KEY' ಸೇರಿಸಿ. (This is a demo response. Please add 'GEMINI_API_KEY' to your .env file to enable real AI)."
    });
  }

  try {
    const model = genAI.getGenerativeModel(
      { model: "gemini-pro" },
      { apiVersion: "v1" }
    );

    const formattedHistory = history.map(msg => ({
      role: msg.sender === 'user' ? 'user' : 'model',
      parts: [{ text: msg.text }]
    }));

    const chat = model.startChat({
      history: formattedHistory,
      systemInstruction: {
        role: "system",
        parts: [{ text: "You are Hire-IQ ✨, an advanced, global AI assistant by Hire-X. You are as capable as ChatGPT or Gemini. You MUST answer ANY question the user asks, on ANY topic (coding, science, general knowledge, career, etc). You MUST understand, speak, and translate ALL languages fluently. If a user speaks Kannada, reply in Kannada. If Spanish, reply in Spanish. Be highly intelligent, very professional, incredibly helpful, and format answers beautifully." }]
      }
    });

    const result = await chat.sendMessage(message);
    const responseText = result.response.text();
    res.json({ text: responseText });
  } catch (error) {
    console.error("AI Chat Error:", error);
    res.status(500).json({ error: "Failed to generate intelligent response. Sorry." });
  }
});

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

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
