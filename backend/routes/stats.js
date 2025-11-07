const express = require('express');
const db = require('../database/init');
const router = express.Router();

// Get user statistics
router.get('/users', (req, res) => {
  // Get total users count
  db.get('SELECT COUNT(*) as total FROM users', (err, totalResult) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    // Get active users count
    db.get('SELECT COUNT(*) as active FROM users WHERE isActive = 1', (err, activeResult) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      // Get blocked users count
      db.get('SELECT COUNT(*) as blocked FROM users WHERE isActive = 0', (err, blockedResult) => {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        // Get users by panel type
        db.all('SELECT panel, COUNT(*) as count FROM users WHERE isActive = 1 GROUP BY panel', (err, panelResults) => {
          if (err) {
            console.error('Database error:', err.message);
            return res.status(500).json({ 
              success: false, 
              message: 'Database error' 
            });
          }

          // Process panel results
          const panelStats = {
            admin: 0,
            company: 0,
            government: 0
          };

          panelResults.forEach(result => {
            panelStats[result.panel] = result.count;
          });

          // Get recent login activity (last 30 days)
          const thirtyDaysAgo = new Date();
          thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
          const thirtyDaysAgoISO = thirtyDaysAgo.toISOString();

          db.get('SELECT COUNT(*) as recentLogins FROM users WHERE lastLogin >= ?', [thirtyDaysAgoISO], (err, recentResult) => {
            if (err) {
              console.error('Database error:', err.message);
              return res.status(500).json({ 
                success: false, 
                message: 'Database error' 
              });
            }

            res.json({
              success: true,
              data: {
                totalUsers: totalResult.total,
                activeUsers: activeResult.active,
                blockedUsers: blockedResult.blocked,
                adminUsers: panelStats.admin,
                companyUsers: panelStats.company,
                governmentUsers: panelStats.government,
                recentLogins: recentResult.recentLogins,
                lastUpdated: new Date().toISOString()
              }
            });
          });
        });
      });
    });
  });
});

// Get detailed user list
router.get('/users/detailed', (req, res) => {
  db.all('SELECT id, email, panel, name, organization, isActive, createdAt, updatedAt, lastLogin FROM users ORDER BY createdAt DESC', (err, users) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({ 
        success: false, 
        message: 'Database error' 
      });
    }

    res.json({
      success: true,
      data: {
        users: users.map(user => ({
          id: user.id,
          email: user.email,
          panel: user.panel,
          name: user.name,
          organization: user.organization,
          isActive: user.isActive,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt,
          lastLogin: user.lastLogin
        })),
        totalCount: users.length
      }
    });
  });
});

// Get recent login activities
router.get('/login-activities', (req, res) => {
  const limit = req.query.limit || 10;
  const offset = req.query.offset || 0;
  
  // Use audit database for login activities
  const auditDb = require('../database/init-audit');
  
  auditDb.all(`SELECT 
            id,
            user_id as userId,
            email,
            login_status as loginStatus,
            ip_address as ipAddress,
            user_agent as userAgent,
            login_timestamp as loginTimestamp,
            session_duration as sessionDuration,
            logout_timestamp as logoutTimestamp
          FROM login_activities
          ORDER BY login_timestamp DESC
          LIMIT ? OFFSET ?`, 
    [limit, offset], 
    (err, activities) => {
      if (err) {
        console.error('Database error:', err.message);
        return res.status(500).json({ 
          success: false, 
          message: 'Database error' 
        });
      }

      // Get total count from audit database
      auditDb.get('SELECT COUNT(*) as total FROM login_activities', (err, countResult) => {
        if (err) {
          console.error('Database error:', err.message);
          return res.status(500).json({ 
            success: false, 
            message: 'Database error' 
          });
        }

        // Get user details for each activity
        const activitiesWithUserDetails = activities.map(activity => {
          return new Promise((resolve) => {
            // Get user details from main database
            db.get('SELECT name, panel, organization FROM users WHERE id = ?', [activity.userId], (err, user) => {
              const formattedTime = formatTimestamp(activity.loginTimestamp);
              resolve({
                id: activity.id,
                userId: activity.userId,
                email: activity.email,
                name: user?.name || 'Unknown User',
                panel: user?.panel || 'unknown',
                organization: user?.organization || 'Not specified',
                loginTimestamp: activity.loginTimestamp,
                formattedDate: formattedTime.date,
                formattedTime: formattedTime.time,
                timeAgo: getTimeAgo(activity.loginTimestamp),
                ipAddress: activity.ipAddress,
                userAgent: activity.userAgent,
                loginStatus: activity.loginStatus,
                sessionDuration: activity.sessionDuration,
                logoutTimestamp: activity.logoutTimestamp
              });
            });
          });
        });

        Promise.all(activitiesWithUserDetails).then(enrichedActivities => {
          res.json({
            success: true,
            data: {
              activities: enrichedActivities,
              totalCount: countResult.total,
              limit: parseInt(limit),
              offset: parseInt(offset)
            }
          });
        }).catch(error => {
          console.error('Error enriching activities:', error);
          res.status(500).json({
            success: false,
            message: 'Error processing login activities'
          });
        });
      });
    }
  );
});

// Helper function to calculate time ago
function getTimeAgo(timestamp) {
  const now = new Date();
  
  // Handle both ISO format (2025-11-02T15:20:18.823Z) and SQLite format (2025-10-31 17:32:58)
  let loginTime;
  if (timestamp.includes('T') && timestamp.includes('Z')) {
    // ISO format with Z (UTC) - parse directly
    loginTime = new Date(timestamp);
  } else {
    // SQLite format - convert to ISO and parse as UTC
    const isoTimestamp = timestamp.replace(' ', 'T') + 'Z';
    loginTime = new Date(isoTimestamp);
  }
  
  const diffMs = now - loginTime;
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);
  
  if (diffMinutes < 1) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

// Helper function to format timestamp for display
function formatTimestamp(timestamp) {
  // Handle both ISO format (2025-11-02T15:20:18.823Z) and SQLite format (2025-10-31 17:32:58)
  let loginTime;
  if (timestamp.includes('T') && timestamp.includes('Z')) {
    // ISO format with Z (UTC) - parse directly
    loginTime = new Date(timestamp);
  } else {
    // SQLite format - convert to ISO and parse as UTC
    const isoTimestamp = timestamp.replace(' ', 'T') + 'Z';
    loginTime = new Date(isoTimestamp);
  }
  
  // Format for local display
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  
  return {
    date: loginTime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }),
    time: loginTime.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }),
    iso: loginTime.toISOString(),
    full: loginTime.toLocaleString('en-US', options)
  };
}

module.exports = router;