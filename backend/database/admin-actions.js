const db = require('./init');

// Create admin_actions table for tracking all administrative actions
db.serialize(() => {
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

  console.log('✅ Admin actions table created successfully');
});

// Function to log admin actions
function logAdminAction(adminId, adminEmail, actionType, targetType, targetId, targetEmail, actionDetails, severity, ipAddress, userAgent, callback) {
  const stmt = db.prepare(`
    INSERT INTO admin_actions (
      admin_id, admin_email, action_type, target_type, target_id, 
      target_email, action_details, severity, ip_address, user_agent
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  stmt.run([
    adminId, adminEmail, actionType, targetType, targetId,
    targetEmail, actionDetails, severity, ipAddress, userAgent
  ], callback);

  stmt.finalize();
}

// Function to get admin actions with filtering and pagination
function getAdminActions(filters = {}, callback) {
  let query = `
    SELECT 
      aa.*,
      u.name as admin_name
    FROM admin_actions aa
    LEFT JOIN users u ON aa.admin_id = u.id
    WHERE 1=1
  `;
  
  const params = [];

  if (filters.severity) {
    query += ' AND aa.severity = ?';
    params.push(filters.severity);
  }

  if (filters.actionType) {
    query += ' AND aa.action_type = ?';
    params.push(filters.actionType);
  }

  if (filters.adminId) {
    query += ' AND aa.admin_id = ?';
    params.push(filters.adminId);
  }

  if (filters.dateFrom) {
    query += ' AND DATE(aa.timestamp) >= DATE(?)';
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    query += ' AND DATE(aa.timestamp) <= DATE(?)';
    params.push(filters.dateTo);
  }

  query += ' ORDER BY aa.timestamp DESC';

  if (filters.limit) {
    query += ' LIMIT ?';
    params.push(filters.limit);
  }

  if (filters.offset) {
    query += ' OFFSET ?';
    params.push(filters.offset);
  }

  db.all(query, params, callback);
}

// Function to get admin action statistics
function getAdminActionStats(callback) {
  // Use a single query with conditional counting
  const query = `
    SELECT 
      COUNT(*) as total,
      SUM(CASE WHEN severity = 'high' THEN 1 ELSE 0 END) as high,
      SUM(CASE WHEN severity = 'medium' THEN 1 ELSE 0 END) as medium,
      SUM(CASE WHEN severity = 'low' THEN 1 ELSE 0 END) as low,
      SUM(CASE WHEN DATE(timestamp) = DATE('now') THEN 1 ELSE 0 END) as today,
      SUM(CASE WHEN timestamp >= datetime('now', '-7 days') THEN 1 ELSE 0 END) as thisWeek,
      SUM(CASE WHEN timestamp >= datetime('now', '-30 days') THEN 1 ELSE 0 END) as thisMonth
    FROM admin_actions
  `;

  db.get(query, (err, row) => {
    if (err) {
      console.error('Error getting admin action stats:', err);
      return callback(err);
    }

    callback(null, row || {
      total: 0,
      high: 0,
      medium: 0,
      low: 0,
      today: 0,
      thisWeek: 0,
      thisMonth: 0
    });
  });
}

module.exports = {
  logAdminAction,
  getAdminActions,
  getAdminActionStats
};