const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, 'bluecarbon_audit.db');

// Create database and tables
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening audit database:', err.message);
  } else {
    console.log('Connected to audit SQLite database');
  }
});

// Initialize audit database with all tables
const initializeAuditDatabase = () => {
  return new Promise((resolve, reject) => {
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, 'audit-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    db.serialize(() => {
      // Create original users table first if it doesn't exist
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

      // Execute all schema statements
      let completed = 0;
      statements.forEach((statement, index) => {
        db.run(statement, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error(`Error executing statement ${index + 1}:`, err.message);
          }
          completed++;
          if (completed === statements.length) {
            console.log('✅ Audit database schema initialized successfully');
            insertSampleAuditData();
            resolve();
          }
        });
      });
    });
  });
};

// Insert comprehensive sample audit data (DISABLED - only genuine data from now on)
const insertSampleAuditData = () => {
  console.log('🔧 Skipping mock data insertion - only genuine data will be recorded...');
  return; // Skip all mock data insertion

  // Sample audit trail entries
  const auditEntries = [
    {
      user_id: 1,
      user_email: 'yugadmin@gmail.com',
      user_name: 'System Administrator',
      user_role: 'admin',
      action_type: 'user_login',
      resource_type: 'authentication',
      resource_id: null,
      resource_name: 'Login System',
      old_values: null,
      new_values: JSON.stringify({ 
        login_time: new Date().toISOString(), 
        ip_address: '192.168.1.100',
        session_id: 'sess_' + Date.now()
      }),
      severity: 'info',
      status: 'success',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'sess_' + Date.now(),
      metadata: JSON.stringify({ device_type: 'desktop', browser: 'Chrome' })
    },
    {
      user_id: 1,
      user_email: 'yugadmin@gmail.com',
      user_name: 'System Administrator',
      user_role: 'admin',
      action_type: 'system_settings_change',
      resource_type: 'system_configuration',
      resource_id: 'security_settings',
      resource_name: 'Security Configuration',
      old_values: JSON.stringify({ mfaRequired: false, sessionTimeout: 30 }),
      new_values: JSON.stringify({ mfaRequired: true, sessionTimeout: 45 }),
      severity: 'high',
      status: 'success',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'sess_' + Date.now(),
      metadata: JSON.stringify({ change_reason: 'Security enhancement', approval_required: false })
    },
    {
      user_id: 1,
      user_email: 'yugadmin@gmail.com',
      user_name: 'System Administrator',
      user_role: 'admin',
      action_type: 'user_create',
      resource_type: 'user_management',
      resource_id: '2',
      resource_name: 'New Company User',
      old_values: null,
      new_values: JSON.stringify({ 
        email: 'company@example.com', 
        role: 'company', 
        name: 'Company Representative',
        organization: 'Green Energy Corp'
      }),
      severity: 'medium',
      status: 'success',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'sess_' + Date.now(),
      metadata: JSON.stringify({ created_via: 'admin_panel', verification_required: true })
    },
    {
      user_id: null,
      user_email: 'unknown@malicious.com',
      user_name: 'Unknown User',
      user_role: 'unknown',
      action_type: 'failed_login_attempt',
      resource_type: 'authentication',
      resource_id: null,
      resource_name: 'Login System',
      old_values: null,
      new_values: JSON.stringify({ 
        attempted_email: 'admin@bluecarbon.com',
        failure_reason: 'invalid_credentials',
        attempt_count: 5
      }),
      severity: 'critical',
      status: 'failed',
      ip_address: '203.0.113.42',
      user_agent: 'curl/7.68.0',
      session_id: null,
      metadata: JSON.stringify({ threat_detected: true, blocked: true })
    },
    {
      user_id: 1,
      user_email: 'yugadmin@gmail.com',
      user_name: 'System Administrator',
      user_role: 'admin',
      action_type: 'data_export',
      resource_type: 'data_management',
      resource_id: 'user_data_export',
      resource_name: 'User Data Export',
      old_values: null,
      new_values: JSON.stringify({ 
        export_type: 'csv',
        records_exported: 150,
        date_range: '2024-10-01 to 2024-11-01',
        file_size: '2.5MB'
      }),
      severity: 'medium',
      status: 'success',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'sess_' + Date.now(),
      metadata: JSON.stringify({ export_reason: 'compliance_audit', retention_period: '7_years' })
    }
  ];

  // Insert audit entries with varied timestamps
  const insertAuditEntry = db.prepare(`
    INSERT INTO audit_trail (
      user_id, user_email, user_name, user_role, action_type, resource_type, 
      resource_id, resource_name, old_values, new_values, severity, status, 
      ip_address, user_agent, session_id, metadata, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  auditEntries.forEach((entry, index) => {
    // Create timestamps spread over the last 7 days
    const daysAgo = Math.floor(index / 2);
    const hoursAgo = Math.floor(Math.random() * 24);
    const minutesAgo = Math.floor(Math.random() * 60);
    
    const timestamp = new Date();
    timestamp.setDate(timestamp.getDate() - daysAgo);
    timestamp.setHours(timestamp.getHours() - hoursAgo);
    timestamp.setMinutes(timestamp.getMinutes() - minutesAgo);

    insertAuditEntry.run(
      entry.user_id, entry.user_email, entry.user_name, entry.user_role,
      entry.action_type, entry.resource_type, entry.resource_id, entry.resource_name,
      entry.old_values, entry.new_values, entry.severity, entry.status,
      entry.ip_address, entry.user_agent, entry.session_id, entry.metadata,
      timestamp.toISOString()
    );
  });
  insertAuditEntry.finalize();

  // Insert security events
  const securityEvents = [
    {
      event_type: 'suspicious_login_pattern',
      user_id: null,
      user_email: 'attacker@malicious.com',
      ip_address: '198.51.100.25',
      user_agent: 'Python-requests/2.25.1',
      event_data: JSON.stringify({
        pattern: 'multiple_failed_logins',
        attempts: 15,
        time_window: '5 minutes',
        blocked: true
      }),
      severity: 'critical',
      status: 'active',
      threat_level: 9
    },
    {
      event_type: 'privilege_escalation_attempt',
      user_id: 2,
      user_email: 'company@example.com',
      ip_address: '192.168.1.105',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      event_data: JSON.stringify({
        attempted_action: 'admin_panel_access',
        current_role: 'company',
        attempted_role: 'admin',
        blocked: true
      }),
      severity: 'high',
      status: 'resolved',
      threat_level: 7
    }
  ];

  const insertSecurityEvent = db.prepare(`
    INSERT INTO security_events (
      event_type, user_id, user_email, ip_address, user_agent, 
      event_data, severity, status, threat_level, created_at
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  securityEvents.forEach((event, index) => {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - (index * 2));
    
    insertSecurityEvent.run(
      event.event_type, event.user_id, event.user_email, event.ip_address,
      event.user_agent, event.event_data, event.severity, event.status,
      event.threat_level, timestamp.toISOString()
    );
  });
  insertSecurityEvent.finalize();

  // Insert login activities
  const loginActivities = [
    {
      user_id: 1,
      email: 'yugadmin@gmail.com',
      login_status: 'success',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
      session_id: 'sess_' + Date.now(),
      mfa_used: 1,
      session_duration: 3600
    },
    {
      user_id: null,
      email: 'hacker@malicious.com',
      login_status: 'failed',
      failure_reason: 'invalid_credentials',
      ip_address: '203.0.113.42',
      user_agent: 'curl/7.68.0',
      session_id: null,
      mfa_used: 0
    },
    {
      user_id: 2,
      email: 'company@example.com',
      login_status: 'success',
      ip_address: '192.168.1.105',
      user_agent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
      session_id: 'sess_' + (Date.now() + 1000),
      mfa_used: 0,
      session_duration: 1800
    }
  ];

  const insertLoginActivity = db.prepare(`
    INSERT INTO login_activities (
      user_id, email, login_status, failure_reason, ip_address, 
      user_agent, session_id, mfa_used, session_duration, login_timestamp
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  loginActivities.forEach((activity, index) => {
    const timestamp = new Date();
    timestamp.setHours(timestamp.getHours() - (index * 3));
    
    insertLoginActivity.run(
      activity.user_id, activity.email, activity.login_status, activity.failure_reason,
      activity.ip_address, activity.user_agent, activity.session_id, activity.mfa_used,
      activity.session_duration, timestamp.toISOString()
    );
  });
  insertLoginActivity.finalize();

  console.log('✅ Comprehensive audit data inserted successfully');
  console.log('📊 Audit system populated with:');
  console.log('   - 5 detailed audit trail entries');
  console.log('   - 2 security events with threat analysis');
  console.log('   - 3 login activity records');
  console.log('   - Real-time data with proper relationships');
  console.log('   - Production-level metadata and tracking');
};

// Create default admin user if not exists
const createDefaultAdmin = async () => {
  return new Promise((resolve, reject) => {
    db.get('SELECT id FROM users WHERE email = ?', ['yugadmin@gmail.com'], async (err, row) => {
      if (err) {
        reject(err);
        return;
      }

      if (!row) {
        const hashedPassword = await bcrypt.hash('@Samyakadmin', 10);
        db.run(
          'INSERT INTO users (email, password, panel, name, organization, isActive) VALUES (?, ?, ?, ?, ?, ?)',
          ['yugadmin@gmail.com', hashedPassword, 'admin', 'System Administrator', 'BlueCarbon Ledger', 1],
          function(err) {
            if (err) {
              reject(err);
            } else {
              console.log('✅ Default admin user created: yugadmin@gmail.com / @Samyakadmin');
              resolve(this.lastID);
            }
          }
        );
      } else {
        console.log('✅ Default admin user already exists');
        resolve(row.id);
      }
    });
  });
};

// Initialize everything
const initialize = async () => {
  try {
    await initializeAuditDatabase();
    await createDefaultAdmin();
    console.log('🚀 Production audit database initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing audit database:', error);
  }
};

// Run initialization
initialize();

module.exports = db;