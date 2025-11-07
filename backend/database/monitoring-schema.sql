-- Production System Monitoring Database Schema
-- Real-time system performance and health monitoring

-- System metrics table for performance monitoring
CREATE TABLE IF NOT EXISTS system_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL, -- cpu, memory, disk, network, database
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit TEXT NOT NULL, -- percentage, bytes, ms, count
    threshold_warning REAL,
    threshold_critical REAL,
    status TEXT DEFAULT 'normal', -- normal, warning, critical
    node_id TEXT DEFAULT 'main',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System health checks table
CREATE TABLE IF NOT EXISTS health_checks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_name TEXT NOT NULL,
    service_type TEXT NOT NULL, -- database, api, external_service, file_system
    endpoint_url TEXT,
    status TEXT NOT NULL, -- healthy, degraded, unhealthy
    response_time INTEGER, -- in milliseconds
    status_code INTEGER,
    error_message TEXT,
    last_success DATETIME,
    last_failure DATETIME,
    uptime_percentage REAL DEFAULT 100.0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System alerts table
CREATE TABLE IF NOT EXISTS system_alerts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    alert_type TEXT NOT NULL, -- performance, security, error, warning
    severity TEXT NOT NULL, -- low, medium, high, critical
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    source_service TEXT,
    metric_name TEXT,
    metric_value REAL,
    threshold_value REAL,
    status TEXT DEFAULT 'active', -- active, acknowledged, resolved
    acknowledged_by TEXT,
    acknowledged_at DATETIME,
    resolved_at DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Performance logs table
CREATE TABLE IF NOT EXISTS performance_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    endpoint TEXT NOT NULL,
    method TEXT NOT NULL,
    response_time INTEGER NOT NULL, -- in milliseconds
    status_code INTEGER NOT NULL,
    user_id INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    request_size INTEGER DEFAULT 0,
    response_size INTEGER DEFAULT 0,
    error_message TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- System resources table
CREATE TABLE IF NOT EXISTS system_resources (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    resource_type TEXT NOT NULL, -- process, connection, file_handle, thread
    resource_name TEXT NOT NULL,
    current_usage INTEGER NOT NULL,
    max_limit INTEGER,
    usage_percentage REAL,
    status TEXT DEFAULT 'normal',
    process_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Database performance table
CREATE TABLE IF NOT EXISTS database_performance (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    database_name TEXT NOT NULL,
    query_type TEXT NOT NULL, -- SELECT, INSERT, UPDATE, DELETE
    query_count INTEGER DEFAULT 0,
    avg_execution_time REAL DEFAULT 0,
    max_execution_time REAL DEFAULT 0,
    slow_queries INTEGER DEFAULT 0,
    failed_queries INTEGER DEFAULT 0,
    connections_active INTEGER DEFAULT 0,
    connections_total INTEGER DEFAULT 0,
    database_size INTEGER DEFAULT 0, -- in bytes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_system_metrics_type_time ON system_metrics(metric_type, created_at);
CREATE INDEX IF NOT EXISTS idx_system_metrics_status ON system_metrics(status);
CREATE INDEX IF NOT EXISTS idx_health_checks_service ON health_checks(service_name, created_at);
CREATE INDEX IF NOT EXISTS idx_health_checks_status ON health_checks(status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_severity ON system_alerts(severity, status);
CREATE INDEX IF NOT EXISTS idx_system_alerts_type ON system_alerts(alert_type, created_at);
CREATE INDEX IF NOT EXISTS idx_performance_logs_endpoint ON performance_logs(endpoint, created_at);
CREATE INDEX IF NOT EXISTS idx_performance_logs_time ON performance_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_system_resources_type ON system_resources(resource_type, created_at);
CREATE INDEX IF NOT EXISTS idx_database_performance_name ON database_performance(database_name, created_at);