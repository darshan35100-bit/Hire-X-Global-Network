require('dotenv').config();
const { Client } = require('pg');

async function upgrade() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'job_portal',
    password: process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    await client.query('ALTER TABLE Jobs ADD COLUMN IF NOT EXISTS location VARCHAR(200);');
    console.log("Column 'location' added successfully.");
  } catch (err) {
    console.error("Failed to add location column:", err);
  } finally {
    await client.end();
  }
}
upgrade();
