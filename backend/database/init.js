const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');

const dbPath = path.join(__dirname, 'users.db');

// Create database and tables
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening database:', err.message);
  } else {
    console.log('Connected to SQLite database');
  }
});

// Create users table with exact structure requested
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    panel TEXT NOT NULL CHECK(panel IN ('admin', 'company', 'government')),
    name TEXT,
    organization TEXT,
    isActive BOOLEAN DEFAULT 1,
    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastLogin DATETIME
  )`);

  console.log('Users table created successfully with structure:');
  console.log('- id (Primary Key)');
  console.log('- email (Unique)');
  console.log('- password (Encrypted)');
  console.log('- panel (admin/company/government)');
  console.log('- name');
  console.log('- organization');
  console.log('- isActive');
  console.log('- createdAt');
  console.log('- updatedAt');
  console.log('- lastLogin');

  console.log('✅ Users table is ready for data entry');

  // Create admin_actions table for tracking all administrative actions
  db.run(`CREATE TABLE IF NOT EXISTS admin_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    admin_id INTEGER NOT NULL,
    admin_email TEXT NOT NULL,
    action_type TEXT NOT NULL,
    target_type TEXT NOT NULL,
    target_id INTEGER,
    target_email TEXT,
    action_details TEXT,
    severity TEXT NOT NULL CHECK(severity IN ('high', 'medium', 'low')),
    ip_address TEXT,
    user_agent TEXT,
    status TEXT NOT NULL DEFAULT 'completed',
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES users (id)
  )`);

  console.log('✅ Admin actions table is ready for tracking');
});

module.exports = db;