const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database/init');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { createAdminLogger, getSeverityForAction } = require('../middleware/adminLogger');
const companyDatabaseManager = require('../services/companyDatabaseManager');
const tradingDatabaseManager = require('../services/tradingDatabaseManager');
const fileUploadService = require('../services/fileUploadService');
const router = express.Router();

// Get all users (Admin only)
router.get('/', authenticateToken, requireAdmin, (req, res) => {
  db.all(`
    SELECT id, email, panel, name, organization, isActive, createdAt, updatedAt, lastLogin 
    FROM users 
    ORDER BY createdAt DESC
  `, (err, users) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }

    res.json({
      success: true,
      users: users
    });
  });
});

// Get user statistics (Admin only)
router.get('/stats', authenticateToken, requireAdmin, (req, res) => {
  const queries = [
    'SELECT COUNT(*) as totalUsers FROM users WHERE isActive = 1',
    'SELECT COUNT(*) as activeCompanies FROM users WHERE panel = "company" AND isActive = 1',
    'SELECT COUNT(*) as verifiedGovernmentAccounts FROM users WHERE panel = "government" AND isActive = 1',
    'SELECT COUNT(*) as blockedAccounts FROM users WHERE isActive = 0',
    `SELECT id, email, panel, name, organization, lastLogin 
     FROM users 
     WHERE isActive = 1 AND lastLogin IS NOT NULL 
     ORDER BY lastLogin DESC 
     LIMIT 10`
  ];

  Promise.all(queries.map(query => {
    return new Promise((resolve, reject) => {
      if (query.includes('SELECT id')) {
        db.all(query, (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        });
      } else {
        db.get(query, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  }))
  .then(results => {
    const [totalUsers, activeCompanies, verifiedGovernmentAccounts, blockedAccounts, recentLogins] = results;
    
    res.json({
      success: true,
      stats: {
        totalUsers: totalUsers.totalUsers,
        activeCompanies: activeCompanies.activeCompanies,
        verifiedGovernmentAccounts: verifiedGovernmentAccounts.verifiedGovernmentAccounts,
        blockedAccounts: blockedAccounts.blockedAccounts,
        recentLogins: recentLogins.map(login => ({
          id: login.id,
          email: login.email,
          role: login.panel,
          name: login.name,
          organization: login.organization,
          timestamp: login.lastLogin
        }))
      }
    });
  })
  .catch(err => {
    console.error('Database error:', err.message);
    res.status(500).json({ 
      success: false, 
      message: 'Internal server error' 
    });
  });
});

// Create new user (Admin only)
router.post('/', authenticateToken, requireAdmin, createAdminLogger('user_create', 'user', 'medium'), (req, res) => {
  const { email, password, panel, name, organization } = req.body;

  if (!email || !password || !panel) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email, password, and panel are required' 
    });
  }

  if (!['admin', 'company', 'government'].includes(panel)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Panel must be admin, company, or government' 
    });
  }

  // Check if user already exists
  db.get('SELECT * FROM users WHERE email = ?', [email], (err, existingUser) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        console.error('Password hashing error:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }

      // Create user
      db.run(
        'INSERT INTO users (email, password, panel, name, organization) VALUES (?, ?, ?, ?, ?)',
        [email, hashedPassword, panel, name || null, organization || null],
        async function(err) {
          if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
              success: false, 
              message: 'Internal server error' 
            });
          }

          const userId = this.lastID;
          
          // If this is a company user, create their dedicated databases
          if (panel === 'company') {
            try {
              // Create company database for monitoring and audit data
              await companyDatabaseManager.createCompanyDatabase(userId, email, organization);
              console.log(`🏢 Created company database for user: ${email}`);
              
              // Create trading database for credit trading data
              await tradingDatabaseManager.createTradingDatabase(userId, email, organization);
              console.log(`💹 Created trading database for user: ${email}`);
              
              // Create file upload directory
              fileUploadService.createCompanyUploadDir(userId);
              console.log(`📁 Created storage directory for user: ${email}`);
              
              console.log(`✅ Complete setup finished for company user: ${email}`);
            } catch (dbError) {
              console.error('Error creating company databases:', dbError.message);
              // Note: We don't fail the user creation if database creation fails
              // The user can still be created and databases can be created later
            }
          }

          res.status(201).json({
            success: true,
            message: panel === 'company' ? 
              'Company user created successfully with dedicated database' : 
              'User created successfully',
            user: {
              id: userId,
              email,
              panel,
              name,
              organization,
              isActive: true,
              hasDedicatedDatabase: panel === 'company'
            }
          });
        }
      );
    });
  });
});

// Update user (Admin only)
router.put('/:id', authenticateToken, requireAdmin, createAdminLogger('user_update', 'user', 'low'), (req, res) => {
  const userId = req.params.id;
  const { email, panel, name, organization, isActive } = req.body;

  if (!email || !panel) {
    return res.status(400).json({ 
      success: false, 
      message: 'Email and panel are required' 
    });
  }

  if (!['admin', 'company', 'government'].includes(panel)) {
    return res.status(400).json({ 
      success: false, 
      message: 'Panel must be admin, company, or government' 
    });
  }

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Store target user info for logging
    req.targetUser = user;

    // Check if email is already taken by another user
    db.get('SELECT * FROM users WHERE email = ? AND id != ?', [email, userId], (err, existingUser) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Internal server error' 
        });
      }

      if (existingUser) {
        return res.status(409).json({ 
          success: false, 
          message: 'Email is already taken by another user' 
        });
      }

      // Update user
      db.run(
        'UPDATE users SET email = ?, panel = ?, name = ?, organization = ?, isActive = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
        [email, panel, name || null, organization || null, isActive !== undefined ? isActive : 1, userId],
        function(err) {
          if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
              success: false, 
              message: 'Internal server error' 
            });
          }

          res.json({
            success: true,
            message: 'User updated successfully'
          });
        }
      );
    });
  });
});

// Delete user (Admin only)
router.delete('/:id', authenticateToken, requireAdmin, createAdminLogger('user_delete', 'user', 'high'), (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Store target user info for logging
    req.targetUser = user;

    // Prevent admin from deleting themselves
    if (user.id === req.user.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot delete your own account' 
      });
    }

    // Hard delete - completely remove user from database
    db.run(
      'DELETE FROM users WHERE id = ?',
      [userId],
      async function(err) {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        // If this was a company user, delete their dedicated databases
        if (user.panel === 'company') {
          try {
            // Delete company database
            await companyDatabaseManager.deleteCompanyDatabase(userId);
            console.log(`🗑️ Deleted company database for user ${user.email} (ID: ${userId})`);
            
            // Delete trading database
            await tradingDatabaseManager.deleteTradingDatabase(userId);
            console.log(`🗑️ Deleted trading database for user ${user.email} (ID: ${userId})`);
            
          } catch (dbError) {
            console.error('Error deleting company databases:', dbError.message);
          }
        }

        console.log(`🗑️ User ${user.email} (ID: ${userId}) permanently deleted from database`);
        
        res.json({
          success: true,
          message: user.panel === 'company' ? 
            'Company user and all dedicated databases permanently deleted' :
            'User permanently deleted from database'
        });
      }
    );
  });
});

// Suspend user (Admin only)
router.post('/:id/suspend', authenticateToken, requireAdmin, createAdminLogger('user_suspend', 'user', 'high'), (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Store target user info for logging
    req.targetUser = user;

    // Prevent admin from suspending themselves
    if (user.id === req.user.userId) {
      return res.status(400).json({ 
        success: false, 
        message: 'Cannot suspend your own account' 
      });
    }

    // Suspend user - set isActive to false
    db.run(
      'UPDATE users SET isActive = 0, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [userId],
      function(err) {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        console.log(`⚠️ User ${user.email} (ID: ${userId}) suspended`);
        
        res.json({
          success: true,
          message: 'User suspended successfully'
        });
      }
    );
  });
});

// Activate user (Admin only)
router.post('/:id/activate', authenticateToken, requireAdmin, createAdminLogger('user_activate', 'user', 'medium'), (req, res) => {
  const userId = req.params.id;

  // Check if user exists
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Internal server error' 
      });
    }

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    // Store target user info for logging
    req.targetUser = user;

    // Activate user - set isActive to true
    db.run(
      'UPDATE users SET isActive = 1, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [userId],
      function(err) {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Internal server error' 
          });
        }

        if (this.changes === 0) {
          return res.status(404).json({ 
            success: false, 
            message: 'User not found' 
          });
        }

        console.log(`✅ User ${user.email} (ID: ${userId}) activated`);
        
        res.json({
          success: true,
          message: 'User activated successfully'
        });
      }
    );
  });
});

module.exports = router;