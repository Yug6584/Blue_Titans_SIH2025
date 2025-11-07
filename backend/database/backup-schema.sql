-- Production Backup & Restore Database Schema
-- Complete backup management and restore functionality

-- Backup jobs table for scheduled and manual backups
CREATE TABLE IF NOT EXISTS backup_jobs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_name TEXT NOT NULL,
    job_type TEXT NOT NULL, -- manual, scheduled, automatic
    backup_type TEXT NOT NULL, -- full, incremental, differential
    schedule_cron TEXT, -- cron expression for scheduled backups
    databases TEXT NOT NULL, -- JSON array of databases to backup
    include_files BOOLEAN DEFAULT 0, -- include file system backup
    compression_enabled BOOLEAN DEFAULT 1,
    encryption_enabled BOOLEAN DEFAULT 0,
    retention_days INTEGER DEFAULT 30,
    status TEXT DEFAULT 'active', -- active, paused, disabled
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Backup history table for tracking all backup operations
CREATE TABLE IF NOT EXISTS backup_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_id INTEGER,
    backup_name TEXT NOT NULL,
    backup_type TEXT NOT NULL,
    backup_size INTEGER DEFAULT 0, -- size in bytes
    file_path TEXT NOT NULL,
    file_name TEXT NOT NULL,
    compression_ratio REAL DEFAULT 0,
    databases_included TEXT, -- JSON array
    files_included BOOLEAN DEFAULT 0,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER, -- duration in seconds
    status TEXT NOT NULL, -- running, completed, failed, cancelled
    success BOOLEAN DEFAULT 0,
    error_message TEXT,
    checksum TEXT, -- file integrity checksum
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (job_id) REFERENCES backup_jobs(id)
);

-- Restore operations table for tracking restore activities
CREATE TABLE IF NOT EXISTS restore_operations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_id INTEGER NOT NULL,
    restore_type TEXT NOT NULL, -- full, selective, point_in_time
    target_location TEXT, -- where to restore
    databases_to_restore TEXT, -- JSON array
    files_to_restore BOOLEAN DEFAULT 0,
    overwrite_existing BOOLEAN DEFAULT 0,
    start_time DATETIME NOT NULL,
    end_time DATETIME,
    duration INTEGER, -- duration in seconds
    status TEXT NOT NULL, -- running, completed, failed, cancelled
    success BOOLEAN DEFAULT 0,
    error_message TEXT,
    restored_items_count INTEGER DEFAULT 0,
    created_by TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (backup_id) REFERENCES backup_history(id)
);

-- Backup verification table for integrity checks
CREATE TABLE IF NOT EXISTS backup_verification (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    backup_id INTEGER NOT NULL,
    verification_type TEXT NOT NULL, -- checksum, restore_test, integrity_check
    verification_status TEXT NOT NULL, -- passed, failed, warning
    verification_details TEXT, -- JSON with detailed results
    verified_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    verified_by TEXT,
    FOREIGN KEY (backup_id) REFERENCES backup_history(id)
);

-- Backup storage locations table
CREATE TABLE IF NOT EXISTS backup_storage (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    storage_name TEXT NOT NULL,
    storage_type TEXT NOT NULL, -- local, cloud, network, ftp
    storage_path TEXT NOT NULL,
    storage_config TEXT, -- JSON configuration
    is_default BOOLEAN DEFAULT 0,
    is_active BOOLEAN DEFAULT 1,
    available_space INTEGER, -- in bytes
    used_space INTEGER DEFAULT 0, -- in bytes
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Backup notifications table
CREATE TABLE IF NOT EXISTS backup_notifications (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    notification_type TEXT NOT NULL, -- success, failure, warning, info
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    backup_id INTEGER,
    restore_id INTEGER,
    is_read BOOLEAN DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (backup_id) REFERENCES backup_history(id),
    FOREIGN KEY (restore_id) REFERENCES restore_operations(id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_backup_jobs_status ON backup_jobs(status);
CREATE INDEX IF NOT EXISTS idx_backup_jobs_type ON backup_jobs(job_type, backup_type);
CREATE INDEX IF NOT EXISTS idx_backup_history_status ON backup_history(status, created_at);
CREATE INDEX IF NOT EXISTS idx_backup_history_job ON backup_history(job_id, created_at);
CREATE INDEX IF NOT EXISTS idx_restore_operations_status ON restore_operations(status, created_at);
CREATE INDEX IF NOT EXISTS idx_restore_operations_backup ON restore_operations(backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_verification_backup ON backup_verification(backup_id);
CREATE INDEX IF NOT EXISTS idx_backup_storage_active ON backup_storage(is_active, is_default);
CREATE INDEX IF NOT EXISTS idx_backup_notifications_read ON backup_notifications(is_read, created_at);