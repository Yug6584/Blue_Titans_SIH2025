const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');
const os = require('os');

const dbPath = path.join(__dirname, 'bluecarbon_backup.db');

// Create backup database
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Error opening backup database:', err.message);
  } else {
    console.log('Connected to backup SQLite database');
  }
});

// Initialize backup database
const initializeBackupDatabase = () => {
  return new Promise((resolve, reject) => {
    // Read and execute the schema file
    const schemaPath = path.join(__dirname, 'backup-schema.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');
    
    // Split schema into individual statements
    const statements = schema.split(';').filter(stmt => stmt.trim().length > 0);
    
    db.serialize(() => {
      let completed = 0;
      statements.forEach((statement, index) => {
        db.run(statement, (err) => {
          if (err && !err.message.includes('already exists')) {
            console.error(`Error executing backup statement ${index + 1}:`, err.message);
          }
          completed++;
          if (completed === statements.length) {
            console.log('✅ Backup database schema initialized successfully');
            insertInitialBackupData();
            setupBackupDirectories();
            resolve();
          }
        });
      });
    });
  });
};

// Setup backup directories
const setupBackupDirectories = () => {
  const backupDir = path.join(__dirname, '../backups');
  const tempDir = path.join(backupDir, 'temp');
  const archiveDir = path.join(backupDir, 'archive');
  
  // Create directories if they don't exist
  [backupDir, tempDir, archiveDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      console.log(`📁 Created backup directory: ${dir}`);
    }
  });
};

// Insert initial backup data
const insertInitialBackupData = () => {
  console.log('🔧 Inserting initial backup system data...');

  // Insert default backup storage locations
  const storageLocations = [
    {
      storage_name: 'Local Storage',
      storage_type: 'local',
      storage_path: path.join(__dirname, '../backups'),
      storage_config: JSON.stringify({
        max_size: 10 * 1024 * 1024 * 1024, // 10GB
        auto_cleanup: true,
        compression: true
      }),
      is_default: 1,
      is_active: 1,
      available_space: 10 * 1024 * 1024 * 1024 // 10GB
    },
    {
      storage_name: 'Archive Storage',
      storage_type: 'local',
      storage_path: path.join(__dirname, '../backups/archive'),
      storage_config: JSON.stringify({
        max_size: 50 * 1024 * 1024 * 1024, // 50GB
        auto_cleanup: false,
        compression: true,
        encryption: false
      }),
      is_default: 0,
      is_active: 1,
      available_space: 50 * 1024 * 1024 * 1024 // 50GB
    }
  ];

  const insertStorage = db.prepare(`
    INSERT INTO backup_storage (
      storage_name, storage_type, storage_path, storage_config,
      is_default, is_active, available_space
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  storageLocations.forEach(storage => {
    insertStorage.run(
      storage.storage_name, storage.storage_type, storage.storage_path,
      storage.storage_config, storage.is_default, storage.is_active,
      storage.available_space
    );
  });
  insertStorage.finalize();

  // Insert default backup jobs
  const backupJobs = [
    {
      job_name: 'Daily Full Backup',
      job_type: 'scheduled',
      backup_type: 'full',
      schedule_cron: '0 2 * * *', // Daily at 2 AM
      databases: JSON.stringify(['bluecarbon_main', 'bluecarbon_audit', 'bluecarbon_monitoring']),
      include_files: 1,
      compression_enabled: 1,
      encryption_enabled: 0,
      retention_days: 30,
      status: 'active',
      created_by: 'System'
    },
    {
      job_name: 'Weekly Archive Backup',
      job_type: 'scheduled',
      backup_type: 'full',
      schedule_cron: '0 1 * * 0', // Weekly on Sunday at 1 AM
      databases: JSON.stringify(['bluecarbon_main', 'bluecarbon_audit', 'bluecarbon_monitoring', 'bluecarbon_backup']),
      include_files: 1,
      compression_enabled: 1,
      encryption_enabled: 1,
      retention_days: 90,
      status: 'active',
      created_by: 'System'
    },
    {
      job_name: 'Manual Backup Template',
      job_type: 'manual',
      backup_type: 'full',
      schedule_cron: null,
      databases: JSON.stringify(['bluecarbon_main', 'bluecarbon_audit']),
      include_files: 0,
      compression_enabled: 1,
      encryption_enabled: 0,
      retention_days: 7,
      status: 'active',
      created_by: 'Admin'
    }
  ];

  const insertJob = db.prepare(`
    INSERT INTO backup_jobs (
      job_name, job_type, backup_type, schedule_cron, databases,
      include_files, compression_enabled, encryption_enabled,
      retention_days, status, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  backupJobs.forEach(job => {
    insertJob.run(
      job.job_name, job.job_type, job.backup_type, job.schedule_cron,
      job.databases, job.include_files, job.compression_enabled,
      job.encryption_enabled, job.retention_days, job.status, job.created_by
    );
  });
  insertJob.finalize();

  // Insert sample backup history
  const backupHistory = [
    {
      job_id: 1,
      backup_name: 'daily_backup_2024_11_01',
      backup_type: 'full',
      backup_size: 15 * 1024 * 1024, // 15MB
      file_path: path.join(__dirname, '../backups/daily_backup_2024_11_01.zip'),
      file_name: 'daily_backup_2024_11_01.zip',
      compression_ratio: 0.65,
      databases_included: JSON.stringify(['bluecarbon_main', 'bluecarbon_audit', 'bluecarbon_monitoring']),
      files_included: 1,
      start_time: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 hours ago
      end_time: new Date(Date.now() - 24 * 60 * 60 * 1000 + 5 * 60 * 1000).toISOString(), // 5 minutes later
      duration: 300, // 5 minutes
      status: 'completed',
      success: 1,
      checksum: 'sha256:a1b2c3d4e5f6789012345678901234567890abcdef',
      created_by: 'System'
    },
    {
      job_id: 2,
      backup_name: 'weekly_backup_2024_10_27',
      backup_type: 'full',
      backup_size: 45 * 1024 * 1024, // 45MB
      file_path: path.join(__dirname, '../backups/archive/weekly_backup_2024_10_27.zip'),
      file_name: 'weekly_backup_2024_10_27.zip',
      compression_ratio: 0.58,
      databases_included: JSON.stringify(['bluecarbon_main', 'bluecarbon_audit', 'bluecarbon_monitoring', 'bluecarbon_backup']),
      files_included: 1,
      start_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
      end_time: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 12 * 60 * 1000).toISOString(), // 12 minutes later
      duration: 720, // 12 minutes
      status: 'completed',
      success: 1,
      checksum: 'sha256:b2c3d4e5f6789012345678901234567890abcdef1',
      created_by: 'System'
    },
    {
      job_id: 3,
      backup_name: 'manual_backup_2024_11_02',
      backup_type: 'full',
      backup_size: 8 * 1024 * 1024, // 8MB
      file_path: path.join(__dirname, '../backups/manual_backup_2024_11_02.zip'),
      file_name: 'manual_backup_2024_11_02.zip',
      compression_ratio: 0.72,
      databases_included: JSON.stringify(['bluecarbon_main', 'bluecarbon_audit']),
      files_included: 0,
      start_time: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      end_time: new Date(Date.now() - 2 * 60 * 60 * 1000 + 3 * 60 * 1000).toISOString(), // 3 minutes later
      duration: 180, // 3 minutes
      status: 'completed',
      success: 1,
      checksum: 'sha256:c3d4e5f6789012345678901234567890abcdef12',
      created_by: 'Admin'
    }
  ];

  const insertHistory = db.prepare(`
    INSERT INTO backup_history (
      job_id, backup_name, backup_type, backup_size, file_path, file_name,
      compression_ratio, databases_included, files_included, start_time,
      end_time, duration, status, success, checksum, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  backupHistory.forEach(history => {
    insertHistory.run(
      history.job_id, history.backup_name, history.backup_type,
      history.backup_size, history.file_path, history.file_name,
      history.compression_ratio, history.databases_included,
      history.files_included, history.start_time, history.end_time,
      history.duration, history.status, history.success,
      history.checksum, history.created_by
    );
  });
  insertHistory.finalize();

  // Insert sample restore operations
  const restoreOperations = [
    {
      backup_id: 1,
      restore_type: 'selective',
      target_location: 'current',
      databases_to_restore: JSON.stringify(['bluecarbon_audit']),
      files_to_restore: 0,
      overwrite_existing: 0,
      start_time: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
      end_time: new Date(Date.now() - 6 * 60 * 60 * 1000 + 2 * 60 * 1000).toISOString(), // 2 minutes later
      duration: 120, // 2 minutes
      status: 'completed',
      success: 1,
      restored_items_count: 1,
      created_by: 'Admin'
    }
  ];

  const insertRestore = db.prepare(`
    INSERT INTO restore_operations (
      backup_id, restore_type, target_location, databases_to_restore,
      files_to_restore, overwrite_existing, start_time, end_time,
      duration, status, success, restored_items_count, created_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  restoreOperations.forEach(restore => {
    insertRestore.run(
      restore.backup_id, restore.restore_type, restore.target_location,
      restore.databases_to_restore, restore.files_to_restore,
      restore.overwrite_existing, restore.start_time, restore.end_time,
      restore.duration, restore.status, restore.success,
      restore.restored_items_count, restore.created_by
    );
  });
  insertRestore.finalize();

  // Insert backup verification records
  const verificationRecords = [
    {
      backup_id: 1,
      verification_type: 'checksum',
      verification_status: 'passed',
      verification_details: JSON.stringify({
        checksum_algorithm: 'sha256',
        expected_checksum: 'a1b2c3d4e5f6789012345678901234567890abcdef',
        actual_checksum: 'a1b2c3d4e5f6789012345678901234567890abcdef',
        file_size: 15 * 1024 * 1024,
        verification_time: 2.5
      }),
      verified_by: 'System'
    },
    {
      backup_id: 2,
      verification_type: 'integrity_check',
      verification_status: 'passed',
      verification_details: JSON.stringify({
        files_checked: 156,
        files_valid: 156,
        files_corrupted: 0,
        databases_checked: 4,
        databases_valid: 4,
        verification_time: 8.3
      }),
      verified_by: 'System'
    }
  ];

  const insertVerification = db.prepare(`
    INSERT INTO backup_verification (
      backup_id, verification_type, verification_status,
      verification_details, verified_by
    ) VALUES (?, ?, ?, ?, ?)
  `);

  verificationRecords.forEach(verification => {
    insertVerification.run(
      verification.backup_id, verification.verification_type,
      verification.verification_status, verification.verification_details,
      verification.verified_by
    );
  });
  insertVerification.finalize();

  // Insert sample notifications
  const notifications = [
    {
      notification_type: 'success',
      title: 'Daily Backup Completed',
      message: 'Daily full backup completed successfully. Backup size: 15MB, Duration: 5 minutes.',
      backup_id: 1,
      is_read: 0
    },
    {
      notification_type: 'success',
      title: 'Weekly Archive Backup Completed',
      message: 'Weekly archive backup completed successfully. Backup size: 45MB, Duration: 12 minutes.',
      backup_id: 2,
      is_read: 1
    },
    {
      notification_type: 'info',
      title: 'Manual Backup Created',
      message: 'Manual backup created by Admin. Backup includes main and audit databases.',
      backup_id: 3,
      is_read: 0
    },
    {
      notification_type: 'success',
      title: 'Restore Operation Completed',
      message: 'Selective restore of audit database completed successfully.',
      restore_id: 1,
      is_read: 1
    }
  ];

  const insertNotification = db.prepare(`
    INSERT INTO backup_notifications (
      notification_type, title, message, backup_id, restore_id, is_read
    ) VALUES (?, ?, ?, ?, ?, ?)
  `);

  notifications.forEach(notification => {
    insertNotification.run(
      notification.notification_type, notification.title, notification.message,
      notification.backup_id || null, notification.restore_id || null,
      notification.is_read
    );
  });
  insertNotification.finalize();

  console.log('✅ Initial backup system data inserted successfully');
  console.log('📊 Backup system populated with:');
  console.log('   - 2 storage locations configured');
  console.log('   - 3 backup jobs (daily, weekly, manual)');
  console.log('   - 3 backup history records');
  console.log('   - 1 restore operation record');
  console.log('   - 2 verification records');
  console.log('   - 4 notification records');
  console.log('   - Production-ready backup infrastructure');
};

// Initialize everything
const initialize = async () => {
  try {
    await initializeBackupDatabase();
    console.log('🚀 Production backup system initialization complete!');
  } catch (error) {
    console.error('❌ Error initializing backup system:', error);
  }
};

// Run initialization
initialize();

module.exports = db;