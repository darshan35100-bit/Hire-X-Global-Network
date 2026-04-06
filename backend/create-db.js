const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  password: 'admin123',
  host: 'localhost',
  port: 5432,
  database: 'postgres'
});

async function setup() {
  try {
    await client.connect();
    const res = await client.query("SELECT 1 FROM pg_database WHERE datname='job_portal'");
    if (res.rowCount === 0) {
      await client.query('CREATE DATABASE job_portal');
      console.log("Database job_portal created.");
    } else {
      console.log("Database job_portal already exists.");
    }
    
    // Now create tables
    const dbClient = new Client({
      user: 'postgres',
      password: 'admin123',
      host: 'localhost',
      port: 5432,
      database: 'job_portal'
    });
    await dbClient.connect();
    
    await dbClient.query(`
      CREATE TABLE IF NOT EXISTS Users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100),
        email VARCHAR(100) UNIQUE NOT NULL,
        role VARCHAR(20) NOT NULL DEFAULT 'Aspirant',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      
      CREATE TABLE IF NOT EXISTS Jobs (
        id SERIAL PRIMARY KEY,
        title VARCHAR(200) NOT NULL,
        qualification VARCHAR(200),
        description TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS Applications (
        id SERIAL PRIMARY KEY,
        job_id INTEGER REFERENCES Jobs(id),
        user_id INTEGER REFERENCES Users(id),
        status VARCHAR(50) DEFAULT 'Applied',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log("Tables created successfully.");
    await dbClient.end();
  } catch (err) {
    console.error("Error setting up DB:", err);
  } finally {
    await client.end();
  }
}

setup();
