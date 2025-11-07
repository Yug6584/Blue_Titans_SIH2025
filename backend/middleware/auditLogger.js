const db = require('../database/init-audit');

// Audit logger middleware to automatically track all system activities
const auditLogger = (actionType, resourceType, severity = 'info') => {
  return (req, res, next) => {
    // Store original res.json to intercept responses
    const originalJson = res.json;
    
    res.json = function(data) {
      // Log the audit entry after successful response
      if (data && data.success !== false) {
        logAuditEntry(req, actionType, resourceType, severity, data);
      }
      
      // Call original json method
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Function to log audit entries
const logAuditEntry = (req, actionType, resourceType, severity, responseData) => {
  try {
    const user = req.user || {};
    const ipAddress = req.ip || req.connection.remoteAddress || req.headers['x-forwarded-for'];
    const userAgent = req.get('User-Agent');
    const sessionId = req.sessionID || req.headers['x-session-id'];
    
    // Extract resource information from request
    const resourceId = req.params.id || req.params.userId || req.body.id;
    const resourceName = req.body.name || req.body.title || req.body.email;
    
    // Determine old and new values based on request method
    let oldValues = null;
    let newValues = null;
    let status = 'success';
    
    if (req.method === 'PUT' || req.method === 'PATCH') {
      // For updates, capture the changes
      oldValues = req.originalData || null; // This would be set by another middleware
      newValues = req.body;
    } else if (req.method === 'POST') {
      // For creates, capture the new data
      newValues = req.body;
    } else if (req.method === 'DELETE') {
      // For deletes, capture what was deleted
      oldValues = req.originalData || null;
    }
    
    // Determine status from response
    if (responseData && responseData.success === false) {
      status = 'failed';
    }
    
    // Create metadata
    const metadata = {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      response_time: Date.now() - req.startTime,
      user_agent_parsed: parseUserAgent(userAgent)
    };
    
    // Insert audit entry
    const insertQuery = `
      INSERT INTO audit_trail (
        user_id, user_email, user_name, user_role, action_type, resource_type,
        resource_id, resource_name, old_values, new_values, severity, status,
        ip_address, user_agent, session_id, metadata, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      user.id || null,
      user.email || 'anonymous',
      user.name || 'Anonymous User',
      user.panel || 'unknown',
      actionType,
      resourceType,
      resourceId || null,
      resourceName || null,
      oldValues ? JSON.stringify(oldValues) : null,
      newValues ? JSON.stringify(newValues) : null,
      severity,
      status,
      ipAddress,
      userAgent,
      sessionId,
      JSON.stringify(metadata),
      responseData && responseData.message && status === 'failed' ? responseData.message : null
    ], (err) => {
      if (err) {
        console.error('Error logging audit entry:', err);
      }
    });
    
  } catch (error) {
    console.error('Error in audit logger:', error);
  }
};

// Enhanced audit logger for specific actions
const createAuditLogger = (actionType, resourceType, severity = 'info', options = {}) => {
  return (req, res, next) => {
    // Add start time for response time calculation
    req.startTime = Date.now();
    
    // Store original methods
    const originalJson = res.json;
    const originalSend = res.send;
    
    // Override res.json
    res.json = function(data) {
      logDetailedAuditEntry(req, res, actionType, resourceType, severity, data, options);
      return originalJson.call(this, data);
    };
    
    // Override res.send for non-JSON responses
    res.send = function(data) {
      if (!res.headersSent) {
        logDetailedAuditEntry(req, res, actionType, resourceType, severity, data, options);
      }
      return originalSend.call(this, data);
    };
    
    next();
  };
};

// Detailed audit entry logging
const logDetailedAuditEntry = (req, res, actionType, resourceType, severity, responseData, options) => {
  try {
    const user = req.user || {};
    const ipAddress = getClientIP(req);
    const userAgent = req.get('User-Agent');
    const sessionId = req.sessionID || req.headers['x-session-id'];
    
    // Extract resource information
    const resourceId = options.getResourceId ? options.getResourceId(req) : 
                      (req.params.id || req.params.userId || req.body.id);
    const resourceName = options.getResourceName ? options.getResourceName(req) : 
                        (req.body.name || req.body.title || req.body.email);
    
    // Determine values and status
    let oldValues = req.originalData || null;
    let newValues = null;
    let status = 'success';
    let errorMessage = null;
    
    // Handle different response types
    if (typeof responseData === 'object' && responseData !== null) {
      if (responseData.success === false) {
        status = 'failed';
        errorMessage = responseData.message || responseData.error;
      }
      
      if (req.method === 'POST' || req.method === 'PUT' || req.method === 'PATCH') {
        newValues = req.body;
      }
    } else if (res.statusCode >= 400) {
      status = 'failed';
      errorMessage = `HTTP ${res.statusCode}: ${res.statusMessage}`;
    }
    
    // Create comprehensive metadata
    const metadata = {
      method: req.method,
      url: req.originalUrl,
      query: req.query,
      headers: sanitizeHeaders(req.headers),
      response_time: Date.now() - req.startTime,
      response_status: res.statusCode,
      user_agent_parsed: parseUserAgent(userAgent),
      request_size: req.get('content-length') || 0,
      response_size: res.get('content-length') || 0,
      timestamp: new Date().toISOString()
    };
    
    // Add custom metadata from options
    if (options.metadata) {
      Object.assign(metadata, options.metadata);
    }
    
    // Insert comprehensive audit entry
    const insertQuery = `
      INSERT INTO audit_trail (
        user_id, user_email, user_name, user_role, action_type, resource_type,
        resource_id, resource_name, old_values, new_values, severity, status,
        ip_address, user_agent, session_id, metadata, error_message
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      user.id || null,
      user.email || 'anonymous',
      user.name || 'Anonymous User',
      user.panel || 'unknown',
      actionType,
      resourceType,
      resourceId || null,
      resourceName || null,
      oldValues ? JSON.stringify(sanitizeData(oldValues)) : null,
      newValues ? JSON.stringify(sanitizeData(newValues)) : null,
      severity,
      status,
      ipAddress,
      userAgent,
      sessionId,
      JSON.stringify(metadata),
      errorMessage
    ], (err) => {
      if (err) {
        console.error('Error logging detailed audit entry:', err);
      }
    });
    
  } catch (error) {
    console.error('Error in detailed audit logger:', error);
  }
};

// Security event logger
const logSecurityEvent = (eventType, req, eventData, severity = 'medium', threatLevel = 5) => {
  try {
    const user = req.user || {};
    const ipAddress = getClientIP(req);
    const userAgent = req.get('User-Agent');
    
    const insertQuery = `
      INSERT INTO security_events (
        event_type, user_id, user_email, ip_address, user_agent,
        event_data, severity, status, threat_level
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      eventType,
      user.id || null,
      user.email || 'anonymous',
      ipAddress,
      userAgent,
      JSON.stringify(eventData),
      severity,
      'active',
      threatLevel
    ], (err) => {
      if (err) {
        console.error('Error logging security event:', err);
      }
    });
    
  } catch (error) {
    console.error('Error in security event logger:', error);
  }
};

// Login activity logger
const logLoginActivity = (req, loginStatus, failureReason = null, sessionDuration = null) => {
  try {
    const user = req.user || {};
    const email = req.body.email || user.email || 'unknown';
    const ipAddress = getClientIP(req);
    const userAgent = req.get('User-Agent');
    const sessionId = req.sessionID || req.headers['x-session-id'];
    
    // Explicitly set login_timestamp to current UTC time
    const loginTimestamp = new Date().toISOString();
    
    const insertQuery = `
      INSERT INTO login_activities (
        user_id, email, login_status, failure_reason, ip_address,
        user_agent, session_id, session_duration, login_timestamp
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    db.run(insertQuery, [
      user.id || null,
      email,
      loginStatus,
      failureReason,
      ipAddress,
      userAgent,
      sessionId,
      sessionDuration,
      loginTimestamp
    ], (err) => {
      if (err) {
        console.error('Error logging login activity:', err);
      } else {
        console.log(`✅ Login activity logged: ${email} - ${loginStatus} at ${loginTimestamp}`);
      }
    });
    
  } catch (error) {
    console.error('Error in login activity logger:', error);
  }
};

// Utility functions
const getClientIP = (req) => {
  return req.ip || 
         req.connection.remoteAddress || 
         req.socket.remoteAddress ||
         (req.connection.socket ? req.connection.socket.remoteAddress : null) ||
         req.headers['x-forwarded-for'] ||
         req.headers['x-real-ip'] ||
         'unknown';
};

const parseUserAgent = (userAgent) => {
  if (!userAgent) return null;
  
  // Simple user agent parsing
  const browser = userAgent.includes('Chrome') ? 'Chrome' :
                 userAgent.includes('Firefox') ? 'Firefox' :
                 userAgent.includes('Safari') ? 'Safari' :
                 userAgent.includes('Edge') ? 'Edge' : 'Unknown';
                 
  const os = userAgent.includes('Windows') ? 'Windows' :
            userAgent.includes('Mac') ? 'macOS' :
            userAgent.includes('Linux') ? 'Linux' :
            userAgent.includes('Android') ? 'Android' :
            userAgent.includes('iOS') ? 'iOS' : 'Unknown';
            
  return { browser, os };
};

const sanitizeHeaders = (headers) => {
  const sanitized = { ...headers };
  // Remove sensitive headers
  delete sanitized.authorization;
  delete sanitized.cookie;
  delete sanitized['x-api-key'];
  return sanitized;
};

const sanitizeData = (data) => {
  if (typeof data !== 'object' || data === null) return data;
  
  const sanitized = { ...data };
  // Remove sensitive fields
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  delete sanitized.apiKey;
  
  return sanitized;
};

module.exports = {
  auditLogger,
  createAuditLogger,
  logSecurityEvent,
  logLoginActivity,
  logAuditEntry
};