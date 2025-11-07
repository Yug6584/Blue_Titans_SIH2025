const db = require('./init.js');

console.log('🔒 CREATING SECURITY & VERIFICATION TABLES...\n');

// Create all security-related tables
db.serialize(() => {
  
  // 1. KYC Verification Table
  db.run(`CREATE TABLE IF NOT EXISTS kyc_verifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'approved', 'rejected', 'under_review')),
    verificationType TEXT NOT NULL DEFAULT 'basic' CHECK(verificationType IN ('basic', 'standard', 'premium')),
    documentType TEXT CHECK(documentType IN ('passport', 'drivers_license', 'national_id', 'utility_bill', 'business_registration')),
    documentNumber TEXT,
    documentPath TEXT,
    fullName TEXT,
    dateOfBirth DATE,
    nationality TEXT,
    address TEXT,
    phoneNumber TEXT,
    businessName TEXT,
    businessRegistrationNumber TEXT,
    taxId TEXT,
    submittedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewedAt DATETIME,
    reviewedBy INTEGER,
    rejectionReason TEXT,
    expiryDate DATE,
    notes TEXT,
    FOREIGN KEY (userId) REFERENCES users (id),
    FOREIGN KEY (reviewedBy) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating kyc_verifications table:', err.message);
    } else {
      console.log('✅ KYC Verifications table created');
    }
  });

  // 2. MFA (Multi-Factor Authentication) Table
  db.run(`CREATE TABLE IF NOT EXISTS user_mfa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL UNIQUE,
    isEnabled BOOLEAN DEFAULT 0,
    mfaType TEXT DEFAULT 'totp' CHECK(mfaType IN ('totp', 'sms', 'email', 'hardware')),
    secret TEXT,
    backupCodes TEXT, -- JSON array of backup codes
    phoneNumber TEXT,
    emailVerified BOOLEAN DEFAULT 0,
    phoneVerified BOOLEAN DEFAULT 0,
    lastUsed DATETIME,
    setupAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    qrCodePath TEXT,
    recoveryEmail TEXT,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating user_mfa table:', err.message);
    } else {
      console.log('✅ MFA table created');
    }
  });

  // 3. Biometric Security Table
  db.run(`CREATE TABLE IF NOT EXISTS user_biometrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    biometricType TEXT NOT NULL CHECK(biometricType IN ('fingerprint', 'face', 'voice', 'hardware_key')),
    biometricData TEXT, -- Encrypted biometric template
    deviceId TEXT,
    deviceName TEXT,
    isActive BOOLEAN DEFAULT 1,
    enrolledAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    lastUsed DATETIME,
    failureCount INTEGER DEFAULT 0,
    FOREIGN KEY (userId) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating user_biometrics table:', err.message);
    } else {
      console.log('✅ Biometrics table created');
    }
  });

  // 4. Security Events Log Table
  db.run(`CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER,
    eventType TEXT NOT NULL CHECK(eventType IN ('kyc_submitted', 'kyc_approved', 'kyc_rejected', 'mfa_enabled', 'mfa_disabled', 'biometric_enrolled', 'login_attempt', 'password_change', 'suspicious_activity')),
    eventDescription TEXT,
    ipAddress TEXT,
    userAgent TEXT,
    location TEXT,
    riskLevel TEXT DEFAULT 'low' CHECK(riskLevel IN ('low', 'medium', 'high', 'critical')),
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    metadata TEXT, -- JSON for additional data
    FOREIGN KEY (userId) REFERENCES users (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating security_events table:', err.message);
    } else {
      console.log('✅ Security Events table created');
    }
  });

  // 5. Verification Documents Table
  db.run(`CREATE TABLE IF NOT EXISTS verification_documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    kycId INTEGER NOT NULL,
    documentType TEXT NOT NULL,
    fileName TEXT NOT NULL,
    filePath TEXT NOT NULL,
    fileSize INTEGER,
    mimeType TEXT,
    uploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
    isVerified BOOLEAN DEFAULT 0,
    verificationNotes TEXT,
    FOREIGN KEY (kycId) REFERENCES kyc_verifications (id)
  )`, (err) => {
    if (err) {
      console.error('Error creating verification_documents table:', err.message);
    } else {
      console.log('✅ Verification Documents table created');
    }
  });

  // Create indexes for better performance
  db.run('CREATE INDEX IF NOT EXISTS idx_kyc_user ON kyc_verifications (userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_kyc_status ON kyc_verifications (status)');
  db.run('CREATE INDEX IF NOT EXISTS idx_mfa_user ON user_mfa (userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_biometric_user ON user_biometrics (userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_security_events_user ON security_events (userId)');
  db.run('CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events (eventType)');

  console.log('\n📊 SECURITY TABLES STRUCTURE:');
  console.log('================================================================================');
  console.log('1. 🔍 KYC Verifications - Identity verification and document management');
  console.log('2. 🔐 MFA Management - Two-factor authentication settings');
  console.log('3. 🔬 Biometric Security - Fingerprint, face, and hardware key authentication');
  console.log('4. 📋 Security Events - Comprehensive audit trail');
  console.log('5. 📄 Verification Documents - Document storage and verification');
  console.log('\n🎯 Production-level security infrastructure is ready!');
  
  process.exit(0);
});