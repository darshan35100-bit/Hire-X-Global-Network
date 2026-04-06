require('dotenv').config();
const { Client } = require('pg');

async function upgradeTable() {
  const client = new Client({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'job_portal',
    password: process.env.DB_PASSWORD || 'admin123',
    port: process.env.DB_PORT || 5432,
  });

  try {
    await client.connect();
    await client.query('ALTER TABLE Jobs ADD COLUMN IF NOT EXISTS education_level VARCHAR(100);');
    await client.query('ALTER TABLE Jobs ADD COLUMN IF NOT EXISTS years_experience INTEGER;');
    console.log("Columns 'education_level' and 'years_experience' added successfully.");
  } catch (err) {
    console.error("Failed to add columns:", err);
  } finally {
    await client.end();
  }
}

upgradeTable();
