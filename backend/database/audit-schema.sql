-- Production Audit System Database Schema
-- Complete audit trail system for BlueCarbon Ledger

-- Enhanced audit_trail table with comprehensive tracking
CREATE TABLE IF NOT EXISTS audit_trail (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    user_email TEXT NOT NULL,
    user_name TEXT,
    user_role TEXT,
    action_type TEXT NOT NULL,
    resource_type TEXT NOT NULL,
    resource_id TEXT,
    resource_name TEXT,
    old_values TEXT, -- JSON of previous values
    new_values TEXT, -- JSON of new values
    ip_address TEXT,
    user_agent TEXT,
    session_id TEXT,
    request_id TEXT,
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'high', 'medium', 'low', 'info')),
    status TEXT NOT NULL DEFAULT 'success' CHECK(status IN ('success', 'failed', 'partial')),
    error_message TEXT,
    metadata TEXT, -- Additional JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Security events table for security-specific audit logs
CREATE TABLE IF NOT EXISTS security_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    user_id INTEGER,
    user_email TEXT,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    event_data TEXT, -- JSON data
    severity TEXT NOT NULL CHECK(severity IN ('critical', 'high', 'medium', 'low', 'info')),
    status TEXT NOT NULL CHECK(status IN ('active', 'resolved', 'investigating')),
    threat_level INTEGER DEFAULT 1 CHECK(threat_level BETWEEN 1 AND 10),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    resolved_at DATETIME,
    resolved_by INTEGER,
    resolution_notes TEXT,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (resolved_by) REFERENCES users (id)
);

-- Login activities table for authentication tracking
CREATE TABLE IF NOT EXISTS login_activities (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    email TEXT NOT NULL,
    login_status TEXT NOT NULL CHECK(login_status IN ('success', 'failed', 'blocked', 'mfa_required')),
    failure_reason TEXT,
    ip_address TEXT,
    user_agent TEXT,
    device_fingerprint TEXT,
    location_data TEXT, -- JSON with location info
    session_id TEXT,
    mfa_used BOOLEAN DEFAULT 0,
    login_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    logout_timestamp DATETIME,
    session_duration INTEGER, -- in seconds
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- System changes table for configuration changes
CREATE TABLE IF NOT EXISTS system_changes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    change_type TEXT NOT NULL,
    component TEXT NOT NULL,
    setting_name TEXT,
    old_value TEXT,
    new_value TEXT,
    changed_by INTEGER NOT NULL,
    change_reason TEXT,
    approval_required BOOLEAN DEFAULT 0,
    approved_by INTEGER,
    approved_at DATETIME,
    rollback_data TEXT, -- JSON data for rollback
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (changed_by) REFERENCES users (id),
    FOREIGN KEY (approved_by) REFERENCES users (id)
);

-- Data access logs for sensitive data access
CREATE TABLE IF NOT EXISTS data_access_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    data_type TEXT NOT NULL,
    data_id TEXT,
    access_type TEXT NOT NULL CHECK(access_type IN ('read', 'write', 'delete', 'export')),
    query_details TEXT,
    records_affected INTEGER DEFAULT 0,
    ip_address TEXT,
    user_agent TEXT,
    access_timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Compliance events for regulatory compliance
CREATE TABLE IF NOT EXISTS compliance_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    event_type TEXT NOT NULL,
    regulation_type TEXT, -- GDPR, SOX, etc.
    user_id INTEGER,
    data_subject TEXT,
    event_details TEXT, -- JSON
    compliance_status TEXT CHECK(compliance_status IN ('compliant', 'violation', 'pending_review')),
    risk_level TEXT CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    reviewed_by INTEGER,
    reviewed_at DATETIME,
    FOREIGN KEY (user_id) REFERENCES users (id),
    FOREIGN KEY (reviewed_by) REFERENCES users (id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_audit_trail_user_id ON audit_trail(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_trail_created_at ON audit_trail(created_at);
CREATE INDEX IF NOT EXISTS idx_audit_trail_action_type ON audit_trail(action_type);
CREATE INDEX IF NOT EXISTS idx_audit_trail_severity ON audit_trail(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_login_activities_user ON login_activities(user_id);
CREATE INDEX IF NOT EXISTS idx_login_activities_timestamp ON login_activities(login_timestamp);
CREATE INDEX IF NOT EXISTS idx_system_changes_component ON system_changes(component);
CREATE INDEX IF NOT EXISTS idx_data_access_user ON data_access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_compliance_events_type ON compliance_events(event_type);