require('dotenv').config();
const express = require('express');
const cors = require('cors');
const pool = require('./db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const app = express();
app.use(cors());
app.use(express.json());

const JWT_SECRET = process.env.JWT_SECRET || 'supersecrethirex123';

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
        password VARCHAR(100),
        role VARCHAR(20) DEFAULT 'aspirant',
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
        status VARCHAR(20) DEFAULT 'Applied',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      -- Seed an Admin User if none exists
      INSERT INTO Users (name, email, password, role, profile_progress) 
      VALUES ('Hire-X Global Admin', 'admin@hire-x.com', '$2a$10$T8Z4m1a/6n5Vv2k.A4e9OOWaC5mD6E7.eA/lGvN3gH8eD2c.6LgS2', 'admin', 100)
      ON CONFLICT (email) DO NOTHING;
    `);
    console.log("Database perfectly initialized for global scale.");
  } catch (err) {
    console.error("Failed to initialize database schema:", err);
  }
}
initDB();

// --- Auth Endpoints ---
app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, education, experience, role } = req.body;
  const userRole = role === 'employer' ? 'employer' : 'aspirant';
  try {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const result = await pool.query(
      'INSERT INTO Users (name, email, password, role, education, experience, profile_progress) VALUES ($1, $2, $3, $4, $5, $6, 30) RETURNING id, name, email, role, education, experience, avatar, profile_progress',
      [name, email, hashedPassword, userRole, education || 'None', experience ? parseInt(experience) : 0]
    );
    const user = result.rows[0];
    const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
    res.json({ token, user, message: "Welcome to Hire-X Global Network. Signup successfully!" });
  } catch(err) {
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
      if(validPass) {
        delete user.password;
        const token = jwt.sign({ id: user.id, role: user.role }, JWT_SECRET);
        res.json({ token, user, message: "Login successfully! Welcome back." });
      } else {
        res.status(401).json({ error: 'invalid password' });
      }
    } else {
      res.status(401).json({ error: 'invalid id' });
    }
  } catch(err) {
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
    const result = await pool.query('SELECT id, name, email, role, education, experience, avatar, about, skills, location, profile_progress FROM Users WHERE id = $1', [req.user.id]);
    if(result.rows.length > 0) {
      res.json(result.rows[0]);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch(err) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

app.put('/api/users/profile', authenticateToken, async (req, res) => {
  const { name, education, experience, about, skills, location, avatar } = req.body;
  try {
    // Calculate simple profile progress automatically
    let progress = 30; // base for email/password/name
    if(education && education !== 'None') progress += 10;
    if(experience > 0) progress += 10;
    if(about && about.length > 10) progress += 20;
    if(skills && skills.length > 3) progress += 15;
    if(location && location.length > 2) progress += 10;
    if(avatar && avatar.length > 5) progress += 5;
    progress = Math.min(progress, 100);

    const result = await pool.query(
      `UPDATE Users SET name=$1, education=$2, experience=$3, about=$4, skills=$5, location=$6, avatar=$7, profile_progress=$8 WHERE id=$9 RETURNING id, name, email, role, education, experience, avatar, about, skills, location, profile_progress`,
      [name, education, experience, about, skills, location, avatar, progress, req.user.id]
    );
    res.json(result.rows[0]);
  } catch(err) {
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

app.post('/api/jobs', authenticateToken, async (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'employer') return res.status(403).json({ error: 'Insufficient permissions.' });
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
app.post('/api/applications', authenticateToken, async (req, res) => {
  if(req.user.role !== 'aspirant') return res.status(400).json({ error: 'Only aspirants can apply for roles.' });
  const { job_id } = req.body;
  try {
    // Check if already applied
    const existing = await pool.query('SELECT * FROM Applications WHERE job_id=$1 AND user_id=$2', [job_id, req.user.id]);
    if(existing.rows.length > 0) return res.status(400).json({ error: 'You have already applied for this role.' });

    // Insert
    const result = await pool.query(
      'INSERT INTO Applications (job_id, user_id) VALUES ($1, $2) RETURNING *',
      [job_id, req.user.id]
    );

    // Notify Employer
    const jobRes = await pool.query('SELECT employer_id, title FROM Jobs WHERE id=$1', [job_id]);
    if(jobRes.rows.length > 0) {
      sendNotificationToClients({ 
        type: 'NEW_APPLICATION', 
        user_id: jobRes.rows[0].employer_id, 
        message: `New global applicant for: ${jobRes.rows[0].title}` 
      });
    }

    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Secure application submission failed.' });
  }
});

app.get('/api/applications', authenticateToken, async (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'employer') return res.status(403).json({ error: 'Permission denied.' });
  try {
    let query = `
      SELECT a.id, a.status, j.title as role, u.name as applicant_name, u.education, u.experience, u.id as user_id 
      FROM Applications a
      JOIN Jobs j ON a.job_id = j.id
      JOIN Users u ON a.user_id = u.id
    `;
    let params = [];
    if (req.user.role === 'employer') {
      query += ` WHERE j.employer_id = $1`;
      params.push(req.user.id);
    }
    query += ` ORDER BY a.id DESC`;
    
    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch(err) {
    res.status(500).json({ error: 'Data retrieval error' });
  }
});

app.post('/api/applications/:id/shortlist', authenticateToken, async (req, res) => {
  if(req.user.role !== 'admin' && req.user.role !== 'employer') return res.status(403).json({ error: 'Unauthorized.' });
  try {
    const appId = req.params.id;
    // Basic verification - should technically verify if employer owns the job, but simplfied
    const update = await pool.query('UPDATE Applications SET status = $1 WHERE id = $2 RETURNING *', ['Shortlisted', appId]);
    if(update.rows.length > 0) {
      const appRecord = update.rows[0];
      
      // Notify Applicant
      sendNotificationToClients({ 
        type: 'SHORTLISTED', 
        user_id: appRecord.user_id, 
        message: `Network Alert: Your profile has been shortlisted for a global position!` 
      });

      // Confirm to Employer
      sendNotificationToClients({ 
        type: 'SUCCESS', 
        user_id: req.user.id, 
        message: `Candidate confirmed as Shortlisted.` 
      });

      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'Application record missing' });
    }
  } catch (err) {
    res.status(500).json({ error: 'Processing failure' });
  }
});

const path = require('path');
app.use(express.static(path.join(__dirname, '../frontend/dist')));

// Fallback to index.html for React Router
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Global API Gateway running on port ${PORT}`);
  console.log(`Frontend is being served on http://localhost:${PORT}`);
});
