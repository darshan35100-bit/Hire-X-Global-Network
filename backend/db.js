require('dotenv').config();
const { Pool } = require('pg');

const pool = process.env.DATABASE_URL 
  ? new Pool({ 
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false } // Required for cloud databases
    })
  : new Pool({
      user: process.env.DB_USER || 'postgres',
      host: process.env.DB_HOST || 'localhost',
      database: process.env.DB_NAME || 'job_portal',
      password: process.env.DB_PASSWORD || 'admin123',
      port: process.env.DB_PORT || 5432,
    });

module.exports = pool;
