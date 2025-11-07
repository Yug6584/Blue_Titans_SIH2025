const express = require('express');
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const db = require('../database/init');
const { encrypt, decrypt } = require('../utils/encryption');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/kyc');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}-${Date.now()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images and documents are allowed'));
    }
  }
});

// Middleware to log security events
const logSecurityEvent = (userId, eventType, description, req, riskLevel = 'low', metadata = {}) => {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown';
  const userAgent = req.get('User-Agent') || 'unknown';
  
  db.run(`INSERT INTO security_events 
          (userId, eventType, eventDescription, ipAddress, userAgent, riskLevel, metadata) 
          VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [userId, eventType, description, clientIP, userAgent, riskLevel, JSON.stringify(metadata)],
    (err) => {
      if (err) console.error('Error logging security event:', err.message);
    }
  );
};

// ==================== KYC VERIFICATION ENDPOINTS ====================

// Get KYC status for a user
router.get('/kyc/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.get(`SELECT k.*, u.email, u.name 
          FROM kyc_verifications k 
          JOIN users u ON k.userId = u.id 
          WHERE k.userId = ? 
          ORDER BY k.submittedAt DESC 
          LIMIT 1`, [userId], (err, kyc) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!kyc) {
      return res.json({
        success: true,
        data: {
          status: 'not_submitted',
          message: 'No KYC verification found'
        }
      });
    }
    
    // Get associated documents
    db.all(`SELECT * FROM verification_documents WHERE kycId = ?`, [kyc.id], (err, documents) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({
        success: true,
        data: {
          ...kyc,
          documents: documents || []
        }
      });
    });
  });
});

// Submit KYC verification
router.post('/kyc/submit', upload.array('documents', 5), (req, res) => {
  const {
    userId, fullName, dateOfBirth, nationality, address, phoneNumber,
    businessName, businessRegistrationNumber, taxId, verificationType = 'basic'
  } = req.body;
  
  if (!userId || !fullName) {
    return res.status(400).json({
      success: false,
      message: 'User ID and full name are required'
    });
  }
  
  // Check if user already has pending or approved KYC
  db.get(`SELECT * FROM kyc_verifications WHERE userId = ? AND status IN ('pending', 'approved')`, [userId], (err, existing) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'KYC verification already exists for this user'
      });
    }
    
    // Create KYC record
    db.run(`INSERT INTO kyc_verifications 
            (userId, status, verificationType, fullName, dateOfBirth, nationality, address, phoneNumber, businessName, businessRegistrationNumber, taxId) 
            VALUES (?, 'pending', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [userId, verificationType, fullName, dateOfBirth, nationality, address, phoneNumber, businessName, businessRegistrationNumber, taxId],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Failed to create KYC record' });
        }
        
        const kycId = this.lastID;
        
        // Save uploaded documents
        if (req.files && req.files.length > 0) {
          const documentPromises = req.files.map(file => {
            return new Promise((resolve, reject) => {
              db.run(`INSERT INTO verification_documents 
                      (kycId, documentType, fileName, filePath, fileSize, mimeType) 
                      VALUES (?, ?, ?, ?, ?, ?)`,
                [kycId, 'identity_document', file.originalname, file.path, file.size, file.mimetype],
                (err) => {
                  if (err) reject(err);
                  else resolve();
                }
              );
            });
          });
          
          Promise.all(documentPromises)
            .then(() => {
              logSecurityEvent(userId, 'kyc_submitted', `KYC verification submitted for ${fullName}`, req, 'low');
              res.json({
                success: true,
                message: 'KYC verification submitted successfully',
                data: { kycId, documentsUploaded: req.files.length }
              });
            })
            .catch(err => {
              console.error('Error saving documents:', err);
              res.status(500).json({ success: false, message: 'Failed to save documents' });
            });
        } else {
          logSecurityEvent(userId, 'kyc_submitted', `KYC verification submitted for ${fullName}`, req, 'low');
          res.json({
            success: true,
            message: 'KYC verification submitted successfully',
            data: { kycId, documentsUploaded: 0 }
          });
        }
      }
    );
  });
});

// Approve/Reject KYC (Admin only)
router.post('/kyc/:kycId/review', (req, res) => {
  const { kycId } = req.params;
  const { status, rejectionReason, reviewedBy } = req.body;
  
  if (!['approved', 'rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: 'Status must be either approved or rejected'
    });
  }
  
  if (status === 'rejected' && !rejectionReason) {
    return res.status(400).json({
      success: false,
      message: 'Rejection reason is required when rejecting KYC'
    });
  }
  
  db.run(`UPDATE kyc_verifications 
          SET status = ?, rejectionReason = ?, reviewedBy = ?, reviewedAt = CURRENT_TIMESTAMP 
          WHERE id = ?`,
    [status, rejectionReason, reviewedBy, kycId],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ success: false, message: 'KYC record not found' });
      }
      
      // Get user info for logging
      db.get(`SELECT userId, fullName FROM kyc_verifications WHERE id = ?`, [kycId], (err, kyc) => {
        if (!err && kyc) {
          logSecurityEvent(kyc.userId, status === 'approved' ? 'kyc_approved' : 'kyc_rejected', 
            `KYC verification ${status} for ${kyc.fullName}`, req, 'medium');
        }
      });
      
      res.json({
        success: true,
        message: `KYC verification ${status} successfully`
      });
    }
  );
});

// Get all KYC verifications (Admin only)
router.get('/kyc/all', (req, res) => {
  const { status, limit = 50, offset = 0 } = req.query;
  
  let query = `SELECT k.*, u.email, u.name, u.panel 
               FROM kyc_verifications k 
               JOIN users u ON k.userId = u.id`;
  let params = [];
  
  if (status) {
    query += ` WHERE k.status = ?`;
    params.push(status);
  }
  
  query += ` ORDER BY k.submittedAt DESC LIMIT ? OFFSET ?`;
  params.push(parseInt(limit), parseInt(offset));
  
  db.all(query, params, (err, verifications) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    // Get total count
    let countQuery = `SELECT COUNT(*) as total FROM kyc_verifications k`;
    let countParams = [];
    
    if (status) {
      countQuery += ` WHERE k.status = ?`;
      countParams.push(status);
    }
    
    db.get(countQuery, countParams, (err, countResult) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Database error' });
      }
      
      res.json({
        success: true,
        data: {
          verifications,
          total: countResult.total,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      });
    });
  });
});

// ==================== MFA ENDPOINTS ====================

// Generate MFA secret and QR code
router.post('/mfa/setup/:userId', (req, res) => {
  const { userId } = req.params;
  
  // Check if user exists
  db.get('SELECT email, name FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Generate secret
    const secret = speakeasy.generateSecret({
      name: `BlueCarbon (${user.email})`,
      issuer: 'BlueCarbon Ledger',
      length: 32
    });
    
    // Generate backup codes
    const backupCodes = Array.from({ length: 10 }, () => 
      Math.random().toString(36).substring(2, 8).toUpperCase()
    );
    
    // Save to database (but don't enable yet)
    db.run(`INSERT OR REPLACE INTO user_mfa 
            (userId, isEnabled, mfaType, secret, backupCodes) 
            VALUES (?, 0, 'totp', ?, ?)`,
      [userId, encrypt(secret.base32), JSON.stringify(backupCodes)],
      function(err) {
        if (err) {
          return res.status(500).json({ success: false, message: 'Failed to save MFA setup' });
        }
        
        // Generate QR code
        QRCode.toDataURL(secret.otpauth_url, (err, qrCodeUrl) => {
          if (err) {
            return res.status(500).json({ success: false, message: 'Failed to generate QR code' });
          }
          
          logSecurityEvent(userId, 'mfa_setup', 'MFA setup initiated', req, 'low');
          
          res.json({
            success: true,
            data: {
              secret: secret.base32,
              qrCode: qrCodeUrl,
              backupCodes: backupCodes,
              manualEntryKey: secret.base32
            }
          });
        });
      }
    );
  });
});

// Verify and enable MFA
router.post('/mfa/verify/:userId', (req, res) => {
  const { userId } = req.params;
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ success: false, message: 'Token is required' });
  }
  
  // Get MFA record
  db.get('SELECT * FROM user_mfa WHERE userId = ?', [userId], (err, mfa) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!mfa) {
      return res.status(404).json({ success: false, message: 'MFA not set up for this user' });
    }
    
    // Decrypt secret
    const secret = decrypt(mfa.secret);
    
    // Verify token
    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: 'base32',
      token: token,
      window: 2
    });
    
    if (!verified) {
      logSecurityEvent(userId, 'mfa_verification_failed', 'Invalid MFA token provided', req, 'medium');
      return res.status(400).json({ success: false, message: 'Invalid token' });
    }
    
    // Enable MFA
    db.run(`UPDATE user_mfa SET isEnabled = 1, lastUsed = CURRENT_TIMESTAMP WHERE userId = ?`, [userId], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to enable MFA' });
      }
      
      logSecurityEvent(userId, 'mfa_enabled', 'MFA successfully enabled', req, 'low');
      
      res.json({
        success: true,
        message: 'MFA enabled successfully'
      });
    });
  });
});

// Disable MFA
router.post('/mfa/disable/:userId', (req, res) => {
  const { userId } = req.params;
  const { password, backupCode } = req.body;
  
  // Verify user password or backup code before disabling
  db.get('SELECT password FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // For now, just disable (in production, verify password/backup code)
    db.run(`UPDATE user_mfa SET isEnabled = 0 WHERE userId = ?`, [userId], (err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to disable MFA' });
      }
      
      logSecurityEvent(userId, 'mfa_disabled', 'MFA disabled', req, 'medium');
      
      res.json({
        success: true,
        message: 'MFA disabled successfully'
      });
    });
  });
});

// Get MFA status
router.get('/mfa/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.get('SELECT isEnabled, mfaType, setupAt, lastUsed FROM user_mfa WHERE userId = ?', [userId], (err, mfa) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({
      success: true,
      data: {
        isEnabled: mfa ? mfa.isEnabled : false,
        mfaType: mfa ? mfa.mfaType : null,
        setupAt: mfa ? mfa.setupAt : null,
        lastUsed: mfa ? mfa.lastUsed : null
      }
    });
  });
});

// ==================== BIOMETRIC ENDPOINTS ====================

// Enroll biometric
router.post('/biometric/enroll', (req, res) => {
  const { userId, biometricType, deviceId, deviceName, biometricData } = req.body;
  
  if (!userId || !biometricType || !biometricData) {
    return res.status(400).json({
      success: false,
      message: 'User ID, biometric type, and biometric data are required'
    });
  }
  
  // Encrypt biometric data
  const encryptedData = encrypt(biometricData);
  
  db.run(`INSERT INTO user_biometrics 
          (userId, biometricType, biometricData, deviceId, deviceName) 
          VALUES (?, ?, ?, ?, ?)`,
    [userId, biometricType, encryptedData, deviceId, deviceName],
    function(err) {
      if (err) {
        return res.status(500).json({ success: false, message: 'Failed to enroll biometric' });
      }
      
      logSecurityEvent(userId, 'biometric_enrolled', `${biometricType} biometric enrolled`, req, 'low');
      
      res.json({
        success: true,
        message: 'Biometric enrolled successfully',
        data: { biometricId: this.lastID }
      });
    }
  );
});

// Get user biometrics
router.get('/biometric/:userId', (req, res) => {
  const { userId } = req.params;
  
  db.all(`SELECT id, biometricType, deviceId, deviceName, isActive, enrolledAt, lastUsed 
          FROM user_biometrics 
          WHERE userId = ? AND isActive = 1`, [userId], (err, biometrics) => {
    if (err) {
      return res.status(500).json({ success: false, message: 'Database error' });
    }
    
    res.json({
      success: true,
      data: biometrics || []
    });
  });
});

// ==================== SECURITY STATISTICS ====================

// Get security overview
router.get('/overview', (req, res) => {
  const queries = [
    // KYC stats
    new Promise((resolve, reject) => {
      db.all(`SELECT status, COUNT(*) as count FROM kyc_verifications GROUP BY status`, (err, kycStats) => {
        if (err) reject(err);
        else resolve({ type: 'kyc', data: kycStats });
      });
    }),
    
    // MFA stats
    new Promise((resolve, reject) => {
      db.all(`SELECT isEnabled, COUNT(*) as count FROM user_mfa GROUP BY isEnabled`, (err, mfaStats) => {
        if (err) reject(err);
        else resolve({ type: 'mfa', data: mfaStats });
      });
    }),
    
    // Biometric stats
    new Promise((resolve, reject) => {
      db.all(`SELECT biometricType, COUNT(*) as count FROM user_biometrics WHERE isActive = 1 GROUP BY biometricType`, (err, bioStats) => {
        if (err) reject(err);
        else resolve({ type: 'biometric', data: bioStats });
      });
    }),
    
    // Total users
    new Promise((resolve, reject) => {
      db.get(`SELECT COUNT(*) as total FROM users`, (err, userCount) => {
        if (err) reject(err);
        else resolve({ type: 'users', data: userCount });
      });
    })
  ];
  
  Promise.all(queries)
    .then(results => {
      const overview = {
        kyc: {
          pending: 0,
          approved: 0,
          rejected: 0,
          under_review: 0
        },
        mfa: {
          enabled: 0,
          disabled: 0
        },
        biometric: {
          fingerprint: 0,
          face: 0,
          hardware_key: 0
        },
        totalUsers: 0
      };
      
      results.forEach(result => {
        if (result.type === 'kyc') {
          result.data.forEach(item => {
            overview.kyc[item.status] = item.count;
          });
        } else if (result.type === 'mfa') {
          result.data.forEach(item => {
            overview.mfa[item.isEnabled ? 'enabled' : 'disabled'] = item.count;
          });
        } else if (result.type === 'biometric') {
          result.data.forEach(item => {
            overview.biometric[item.biometricType] = item.count;
          });
        } else if (result.type === 'users') {
          overview.totalUsers = result.data.total;
        }
      });
      
      res.json({
        success: true,
        data: overview
      });
    })
    .catch(err => {
      console.error('Error getting security overview:', err);
      res.status(500).json({ success: false, message: 'Failed to get security overview' });
    });
});

module.exports = router;