CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) UNIQUE NOT NULL,
  role VARCHAR(100) NOT NULL
);

CREATE TABLE achievements (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date VARCHAR(50),
  status VARCHAR(50) DEFAULT 'Pending',
  document_url VARCHAR(255)
);

CREATE TABLE reimbursements (
  id VARCHAR(50) PRIMARY KEY,
  user_id INTEGER REFERENCES users(id),
  category VARCHAR(100) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status VARCHAR(50) DEFAULT 'Pending HOD',
  date VARCHAR(50) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  document_url VARCHAR(255)
);

CREATE TABLE achievement_approvals (
  id SERIAL PRIMARY KEY,
  achievement_id INTEGER REFERENCES achievements(id),
  approver_id INTEGER REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  remarks TEXT,
  date VARCHAR(50) NOT NULL
);

CREATE TABLE reimbursement_approvals (
  id SERIAL PRIMARY KEY,
  reimbursement_id VARCHAR(50) REFERENCES reimbursements(id),
  approver_id INTEGER REFERENCES users(id),
  status VARCHAR(50) NOT NULL,
  remarks TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  date VARCHAR(50) NOT NULL
);
