const db = require('./init.js');

console.log('🔄 CREATING LOGIN ACTIVITIES TABLE...\n');

// Create login_activities table
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS login_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    email TEXT NOT NULL,
    name TEXT,
    panel TEXT NOT NULL,
    organization TEXT,
    loginTimestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    ipAddress TEXT,
    userAgent TEXT,
    loginStatus TEXT DEFAULT 'success',
    sessionDuration INTEGER,
    logoutTimestamp DATETIME,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating login_activities table:', err.message);
    } else {
      console.log('✅ Login activities table created successfully');
      
      // Create index for better performance
      db.run(`CREATE INDEX IF NOT EXISTS idx_login_activities_timestamp 
              ON login_activities (loginTimestamp DESC)`, (err) => {
        if (err) {
          console.error('Error creating index:', err.message);
        } else {
          console.log('✅ Login activities index created');
        }
      });
      
      // Create index for user lookups
      db.run(`CREATE INDEX IF NOT EXISTS idx_login_activities_user 
              ON login_activities (userId, loginTimestamp DESC)`, (err) => {
        if (err) {
          console.error('Error creating user index:', err.message);
        } else {
          console.log('✅ User login activities index created');
        }
        
        console.log('\n📊 LOGIN ACTIVITIES TABLE STRUCTURE:');
        console.log('- id (Primary Key)');
        console.log('- userId (Foreign Key to users table)');
        console.log('- email (User email)');
        console.log('- name (User name)');
        console.log('- panel (admin/company/government)');
        console.log('- organization (User organization)');
        console.log('- loginTimestamp (When login occurred)');
        console.log('- ipAddress (User IP address)');
        console.log('- userAgent (Browser/device info)');
        console.log('- loginStatus (success/failed)');
        console.log('- sessionDuration (How long logged in)');
        console.log('- logoutTimestamp (When logged out)');
        
        console.log('\n🎯 Login activities tracking is ready!');
        process.exit(0);
      });
    }
  });
});