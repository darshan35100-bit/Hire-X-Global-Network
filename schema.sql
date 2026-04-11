CREATE TYPE user_role AS ENUM ('Admin', 'Aspirant');

CREATE TABLE Users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE Jobs (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    qualification TEXT NOT NULL,
    description TEXT NOT NULL,
    posted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TYPE application_status AS ENUM ('Pending', 'In Review', 'Shortlisted', 'Rejected');

CREATE TABLE Applications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES Users(id) ON DELETE CASCADE,
    job_id INTEGER REFERENCES Jobs(id) ON DELETE CASCADE,
    status application_status NOT NULL DEFAULT 'Pending',
    applied_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, job_id)
);
