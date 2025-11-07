const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const xss = require('xss');
const db = require('../database/init');
const { logLoginActivity, logSecurityEvent } = require('../middleware/auditLogger');
const router = express.Router();

// In-memory storage for login attempts (in production, use Redis or database)
const loginAttempts = new Map();

// Maximum login attempts before lockout
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

// Function to get client IP
const getClientIP = (req) => {
  return req.ip || req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
};

// Function to check and update login attempts
const checkLoginAttempts = (email, ip) => {
  const key = `${email}_${ip}`;
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
  
  const now = Date.now();
  
  // Reset attempts if lockout period has passed
  if (attempts.lockedUntil && now > attempts.lockedUntil) {
    attempts.count = 0;
    attempts.lockedUntil = 0;
  }
  
  // Check if currently locked out
  if (attempts.lockedUntil && now < attempts.lockedUntil) {
    const remainingTime = Math.ceil((attempts.lockedUntil - now) / 1000 / 60);
    return {
      isLocked: true,
      remainingTime,
      attemptsRemaining: 0,
      totalAttempts: attempts.count
    };
  }
  
  return {
    isLocked: false,
    remainingTime: 0,
    attemptsRemaining: MAX_LOGIN_ATTEMPTS - attempts.count,
    totalAttempts: attempts.count
  };
};

// Function to record failed login attempt
const recordFailedAttempt = (email, ip) => {
  const key = `${email}_${ip}`;
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: 0, lockedUntil: 0 };
  
  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  
  // Lock account if max attempts reached
  if (attempts.count >= MAX_LOGIN_ATTEMPTS) {
    attempts.lockedUntil = Date.now() + LOCKOUT_DURATION;
  }
  
  loginAttempts.set(key, attempts);
  
  return {
    attemptsRemaining: Math.max(0, MAX_LOGIN_ATTEMPTS - attempts.count),
    isLocked: attempts.count >= MAX_LOGIN_ATTEMPTS,
    lockoutTime: attempts.lockedUntil,
    totalAttempts: attempts.count
  };
};

// Function to clear login attempts on successful login
const clearLoginAttempts = (email, ip) => {
  const key = `${email}_${ip}`;
  loginAttempts.delete(key);
};

// Input validation middleware for login (less strict - just basic validation)
const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email address'),
  body('password')
    .isLength({ min: 1 })
    .withMessage('Password is required')
    .trim()
];

// Login endpoint with validation
router.post('/login', loginValidation, (req, res) => {
  // Check validation results
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input data',
      errors: errors.array()
    });
  }
  
  // Sanitize inputs
  const email = xss(req.body.email.toLowerCase().trim());
  const password = req.body.password;
  const clientIP = getClientIP(req);
  
  // Check login attempts before proceeding
  const attemptStatus = checkLoginAttempts(email, clientIP);
  
  if (attemptStatus.isLocked) {
    logSecurityEvent('account_locked_login_attempt', req, {
      attempted_email: email,
      remaining_lockout_time: attemptStatus.remainingTime,
      total_attempts: attemptStatus.totalAttempts
    }, 'high', 8);
    
    return res.status(429).json({
      success: false,
      message: `Account temporarily locked due to too many failed attempts. Try again in ${attemptStatus.remainingTime} minutes.`,
      locked: true,
      remainingTime: attemptStatus.remainingTime,
      attemptsRemaining: 0
    });
  }

  // Find user in database (including inactive users to check suspension)
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }

    if (!user) {
      // Record failed attempt
      const failedAttempt = recordFailedAttempt(email, clientIP);
      
      // Log failed login attempt for unknown user
      logLoginActivity(req, 'failed', 'user_not_found');
      logSecurityEvent('failed_login_attempt', req, {
        attempted_email: email,
        failure_reason: 'user_not_found',
        attempts_remaining: failedAttempt.attemptsRemaining,
        total_attempts: failedAttempt.totalAttempts
      }, 'medium', 4);
      
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid email or password',
        attemptsRemaining: failedAttempt.attemptsRemaining,
        totalAttempts: failedAttempt.totalAttempts,
        maxAttempts: MAX_LOGIN_ATTEMPTS
      });
    }

    // Check if user account is suspended
    if (!user.isActive) {
      // Set user context for audit logging
      req.user = user;
      
      // Log suspended user login attempt
      logLoginActivity(req, 'failed', 'account_suspended');
      logSecurityEvent('suspended_user_login_attempt', req, {
        user_id: user.id,
        user_email: user.email,
        account_status: 'suspended'
      }, 'high', 7);

      return res.status(403).json({ 
        success: false, 
        message: 'Your account has been suspended. Please contact the administrator for assistance.',
        suspended: true
      });
    }

    // Verify password
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        console.error('Password comparison error:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }

      if (!isMatch) {
        // Record failed attempt
        const failedAttempt = recordFailedAttempt(email, clientIP);
        
        // Set user context for audit logging
        req.user = user;
        
        // Log failed login attempt with invalid password
        logLoginActivity(req, 'failed', 'invalid_password');
        logSecurityEvent('failed_login_attempt', req, {
          user_id: user.id,
          user_email: user.email,
          failure_reason: 'invalid_password',
          attempts_remaining: failedAttempt.attemptsRemaining,
          total_attempts: failedAttempt.totalAttempts,
          is_locked: failedAttempt.isLocked
        }, 'medium', 5);

        const responseMessage = failedAttempt.isLocked 
          ? `Account temporarily locked due to too many failed attempts. Try again in ${Math.ceil(LOCKOUT_DURATION / 1000 / 60)} minutes.`
          : 'Invalid email or password';

        return res.status(failedAttempt.isLocked ? 429 : 401).json({ 
          success: false, 
          message: responseMessage,
          attemptsRemaining: failedAttempt.attemptsRemaining,
          totalAttempts: failedAttempt.totalAttempts,
          maxAttempts: MAX_LOGIN_ATTEMPTS,
          locked: failedAttempt.isLocked,
          remainingTime: failedAttempt.isLocked ? Math.ceil(LOCKOUT_DURATION / 1000 / 60) : 0
        });
      }

      // Clear login attempts on successful login
      clearLoginAttempts(email, clientIP);
      
      // Update last login
      db.run('UPDATE users SET lastLogin = CURRENT_TIMESTAMP WHERE id = ?', [user.id]);

      // Set user context for audit logging
      req.user = user;
      
      // Log successful login
      logLoginActivity(req, 'success', null, null);

      // Generate JWT token
      const token = jwt.sign(
        { 
          userId: user.id, 
          email: user.email, 
          panel: user.panel,
          name: user.name,
          organization: user.organization
        },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          email: user.email,
          panel: user.panel,
          name: user.name,
          organization: user.organization,
          lastLogin: user.lastLogin
        }
      });
    });
  });
});

// Verify token endpoint
router.post('/verify', (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ 
      success: false, 
      message: 'Token is required' 
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Check if user still exists and is active
    db.get('SELECT * FROM users WHERE id = ? AND isActive = 1', [decoded.userId], (err, user) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }

      if (!user) {
        return res.status(401).json({ 
          success: false, 
          message: 'User not found or inactive' 
        });
      }

      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          panel: user.panel,
          name: user.name,
          organization: user.organization,
          lastLogin: user.lastLogin
        }
      });
    });
  } catch (error) {
    return res.status(401).json({ 
      success: false, 
      message: 'Invalid token' 
    });
  }
});

// Logout endpoint
router.post('/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful'
  });
});

module.exports = router;