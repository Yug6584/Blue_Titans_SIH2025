const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const auditDb = require('../database/init-audit');
const router = express.Router();

// Resolve a security event
router.post('/:id/resolve', authenticateToken, requireAdmin, (req, res) => {
  const eventId = req.params.id;
  const { resolution_notes, resolved_by } = req.body;

  auditDb.run(
    `UPDATE security_events 
     SET status = 'resolved', 
         resolution_notes = ?, 
         resolved_by = ?, 
         resolved_at = CURRENT_TIMESTAMP 
     WHERE id = ?`,
    [resolution_notes || 'Resolved by administrator', resolved_by || req.user.email, eventId],
    function(err) {
      if (err) {
        console.error('Error resolving security event:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to resolve security event'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Security event not found'
        });
      }

      console.log(`✅ Security event ${eventId} resolved by ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Security event resolved successfully'
      });
    }
  );
});

// Reopen a security event
router.post('/:id/reopen', authenticateToken, requireAdmin, (req, res) => {
  const eventId = req.params.id;
  const { reopen_reason } = req.body;

  auditDb.run(
    `UPDATE security_events 
     SET status = 'active', 
         reopen_reason = ?, 
         reopened_by = ?, 
         reopened_at = CURRENT_TIMESTAMP,
         resolution_notes = NULL,
         resolved_by = NULL,
         resolved_at = NULL
     WHERE id = ?`,
    [reopen_reason || 'Reopened for further investigation', req.user.email, eventId],
    function(err) {
      if (err) {
        console.error('Error reopening security event:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to reopen security event'
        });
      }

      if (this.changes === 0) {
        return res.status(404).json({
          success: false,
          message: 'Security event not found'
        });
      }

      console.log(`🔄 Security event ${eventId} reopened by ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Security event reopened successfully'
      });
    }
  );
});

// Block IP address from a security event
router.post('/:id/block-ip', authenticateToken, requireAdmin, (req, res) => {
  const eventId = req.params.id;
  const { ip_address, block_reason } = req.body;

  // First, get the security event to verify it exists
  auditDb.get('SELECT * FROM security_events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      console.error('Error fetching security event:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Security event not found'
      });
    }

    // Create or update blocked IPs table
    auditDb.run(`CREATE TABLE IF NOT EXISTS blocked_ips (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      ip_address TEXT UNIQUE NOT NULL,
      block_reason TEXT,
      blocked_by TEXT,
      blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      security_event_id INTEGER,
      is_active BOOLEAN DEFAULT 1
    )`, (err) => {
      if (err) {
        console.error('Error creating blocked_ips table:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      // Insert the blocked IP
      auditDb.run(
        `INSERT OR REPLACE INTO blocked_ips 
         (ip_address, block_reason, blocked_by, security_event_id) 
         VALUES (?, ?, ?, ?)`,
        [ip_address || event.ip_address, block_reason, req.user.email, eventId],
        function(err) {
          if (err) {
            console.error('Error blocking IP:', err);
            return res.status(500).json({
              success: false,
              message: 'Failed to block IP address'
            });
          }

          // Also update the security event status to 'blocked'
          auditDb.run(
            'UPDATE security_events SET status = ?, resolved_by = ?, resolved_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['blocked', req.user.email, eventId],
            (updateErr) => {
              if (updateErr) {
                console.error('Error updating security event status:', updateErr);
              }
            }
          );

          console.log(`🚫 IP address ${ip_address || event.ip_address} blocked by ${req.user.email}`);
          
          res.json({
            success: true,
            message: `IP address ${ip_address || event.ip_address} has been blocked successfully`
          });
        }
      );
    });
  });
});

// Delete a security event
router.delete('/:id', authenticateToken, requireAdmin, (req, res) => {
  const eventId = req.params.id;

  // First, get the security event details for logging
  auditDb.get('SELECT * FROM security_events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      console.error('Error fetching security event:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Security event not found'
      });
    }

    // Delete the security event
    auditDb.run('DELETE FROM security_events WHERE id = ?', [eventId], function(err) {
      if (err) {
        console.error('Error deleting security event:', err);
        return res.status(500).json({
          success: false,
          message: 'Failed to delete security event'
        });
      }

      console.log(`🗑️ Security event ${eventId} (${event.event_type}) deleted by ${req.user.email}`);
      
      res.json({
        success: true,
        message: 'Security event deleted successfully'
      });
    });
  });
});

// Get security event details
router.get('/:id', authenticateToken, requireAdmin, (req, res) => {
  const eventId = req.params.id;

  auditDb.get('SELECT * FROM security_events WHERE id = ?', [eventId], (err, event) => {
    if (err) {
      console.error('Error fetching security event:', err);
      return res.status(500).json({
        success: false,
        message: 'Database error'
      });
    }

    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Security event not found'
      });
    }

    res.json({
      success: true,
      event: event
    });
  });
});

// Get blocked IPs
router.get('/blocked-ips', authenticateToken, requireAdmin, (req, res) => {
  auditDb.all(
    'SELECT * FROM blocked_ips WHERE is_active = 1 ORDER BY blocked_at DESC',
    (err, blockedIps) => {
      if (err) {
        console.error('Error fetching blocked IPs:', err);
        return res.status(500).json({
          success: false,
          message: 'Database error'
        });
      }

      res.json({
        success: true,
        blocked_ips: blockedIps || []
      });
    }
  );
});

module.exports = router;