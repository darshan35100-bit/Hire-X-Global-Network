require('dotenv').config();
const { Client } = require('pg');

async function fixTable() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'job_portal',
    password: process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    // Use IF NOT EXISTS to prevent error if it somehow exists
    await client.query('ALTER TABLE Jobs ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;');
    console.log("Column 'created_at' added successfully to 'Jobs' table or it already exists.");
  } catch (err) {
    console.error("Failed to add column:", err);
  } finally {
    await client.end();
  }
}

fixTable();
