const fs = require('fs');
const path = require('path');
const archiver = require('archiver');
const extract = require('extract-zip');
const crypto = require('crypto');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class BackupService {
  constructor(db) {
    this.db = db;
    this.backupDir = path.join(__dirname, '../backups');
    this.tempDir = path.join(this.backupDir, 'temp');
    this.archiveDir = path.join(this.backupDir, 'archive');
    
    // Ensure directories exist
    this.ensureDirectories();
  }

  ensureDirectories() {
    [this.backupDir, this.tempDir, this.archiveDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });
  }

  // Create a new backup
  async createBackup(jobConfig, userId = 'System') {
    const backupId = await this.startBackupRecord(jobConfig, userId);
    
    try {
      console.log(`🔄 Starting backup: ${jobConfig.backup_name}`);
      
      // Create temporary directory for this backup
      const tempBackupDir = path.join(this.tempDir, `backup_${backupId}_${Date.now()}`);
      fs.mkdirSync(tempBackupDir, { recursive: true });

      const backupItems = [];

      // Backup databases
      if (jobConfig.databases && jobConfig.databases.length > 0) {
        console.log('📊 Backing up databases...');
        for (const dbName of jobConfig.databases) {
          const dbBackupPath = await this.backupDatabase(dbName, tempBackupDir);
          if (dbBackupPath) {
            backupItems.push(dbBackupPath);
          }
        }
      }

      // Backup files if requested
      if (jobConfig.include_files) {
        console.log('📁 Backing up files...');
        const filesBackupPath = await this.backupFiles(tempBackupDir);
        if (filesBackupPath) {
          backupItems.push(filesBackupPath);
        }
      }

      // Create compressed archive
      console.log('🗜️ Creating compressed archive...');
      const archivePath = await this.createArchive(tempBackupDir, jobConfig);

      // Calculate file size and checksum
      const stats = fs.statSync(archivePath);
      const checksum = await this.calculateChecksum(archivePath);

      // Update backup record with completion
      await this.completeBackupRecord(backupId, {
        file_path: archivePath,
        file_name: path.basename(archivePath),
        backup_size: stats.size,
        checksum: checksum,
        success: true,
        status: 'completed'
      });

      // Clean up temporary directory
      fs.rmSync(tempBackupDir, { recursive: true, force: true });

      // Create notification
      await this.createNotification({
        type: 'success',
        title: 'Backup Completed Successfully',
        message: `Backup "${jobConfig.backup_name}" completed. Size: ${this.formatBytes(stats.size)}`,
        backup_id: backupId
      });

      console.log(`✅ Backup completed: ${archivePath}`);
      return { success: true, backup_id: backupId, file_path: archivePath };

    } catch (error) {
      console.error('❌ Backup failed:', error);
      
      // Update backup record with failure
      await this.completeBackupRecord(backupId, {
        success: false,
        status: 'failed',
        error_message: error.message
      });

      // Create error notification
      await this.createNotification({
        type: 'failure',
        title: 'Backup Failed',
        message: `Backup "${jobConfig.backup_name}" failed: ${error.message}`,
        backup_id: backupId
      });

      throw error;
    }
  }

  // Restore from backup
  async restoreBackup(backupId, restoreConfig, userId = 'System') {
    const restoreId = await this.startRestoreRecord(backupId, restoreConfig, userId);
    
    try {
      console.log(`🔄 Starting restore operation: ${restoreId}`);

      // Get backup information
      const backup = await this.getBackupById(backupId);
      if (!backup) {
        throw new Error('Backup not found');
      }

      // Verify backup file exists
      if (!fs.existsSync(backup.file_path)) {
        throw new Error('Backup file not found');
      }

      // Create temporary directory for extraction
      const tempRestoreDir = path.join(this.tempDir, `restore_${restoreId}_${Date.now()}`);
      fs.mkdirSync(tempRestoreDir, { recursive: true });

      // Extract backup archive
      console.log('📦 Extracting backup archive...');
      await this.extractArchive(backup.file_path, tempRestoreDir);

      let restoredItems = 0;

      // Restore databases
      if (restoreConfig.databases_to_restore && restoreConfig.databases_to_restore.length > 0) {
        console.log('📊 Restoring databases...');
        for (const dbName of restoreConfig.databases_to_restore) {
          const restored = await this.restoreDatabase(dbName, tempRestoreDir, restoreConfig.overwrite_existing);
          if (restored) restoredItems++;
        }
      }

      // Restore files if requested
      if (restoreConfig.files_to_restore) {
        console.log('📁 Restoring files...');
        const restored = await this.restoreFiles(tempRestoreDir, restoreConfig.overwrite_existing);
        if (restored) restoredItems++;
      }

      // Update restore record with completion
      await this.completeRestoreRecord(restoreId, {
        success: true,
        status: 'completed',
        restored_items_count: restoredItems
      });

      // Clean up temporary directory
      fs.rmSync(tempRestoreDir, { recursive: true, force: true });

      // Create notification
      await this.createNotification({
        type: 'success',
        title: 'Restore Completed Successfully',
        message: `Restore operation completed. ${restoredItems} items restored.`,
        restore_id: restoreId
      });

      console.log(`✅ Restore completed: ${restoredItems} items restored`);
      return { success: true, restore_id: restoreId, restored_items: restoredItems };

    } catch (error) {
      console.error('❌ Restore failed:', error);
      
      // Update restore record with failure
      await this.completeRestoreRecord(restoreId, {
        success: false,
        status: 'failed',
        error_message: error.message
      });

      // Create error notification
      await this.createNotification({
        type: 'failure',
        title: 'Restore Failed',
        message: `Restore operation failed: ${error.message}`,
        restore_id: restoreId
      });

      throw error;
    }
  }

  // Backup individual database
  async backupDatabase(dbName, outputDir) {
    try {
      const dbPath = path.join(__dirname, '../database', `${dbName}.db`);
      
      if (!fs.existsSync(dbPath)) {
        console.log(`⚠️ Database not found: ${dbName}`);
        return null;
      }

      const backupPath = path.join(outputDir, `${dbName}.db`);
      
      // Copy database file
      fs.copyFileSync(dbPath, backupPath);
      
      console.log(`✅ Database backed up: ${dbName}`);
      return backupPath;
    } catch (error) {
      console.error(`❌ Failed to backup database ${dbName}:`, error);
      return null;
    }
  }

  // Backup files
  async backupFiles(outputDir) {
    try {
      const filesToBackup = [
        path.join(__dirname, '../uploads'),
        path.join(__dirname, '../logs'),
        path.join(__dirname, '../config')
      ];

      const filesBackupDir = path.join(outputDir, 'files');
      fs.mkdirSync(filesBackupDir, { recursive: true });

      let backedUpCount = 0;

      for (const sourcePath of filesToBackup) {
        if (fs.existsSync(sourcePath)) {
          const targetPath = path.join(filesBackupDir, path.basename(sourcePath));
          await this.copyDirectory(sourcePath, targetPath);
          backedUpCount++;
        }
      }

      if (backedUpCount > 0) {
        console.log(`✅ Files backed up: ${backedUpCount} directories`);
        return filesBackupDir;
      }

      return null;
    } catch (error) {
      console.error('❌ Failed to backup files:', error);
      return null;
    }
  }

  // Create compressed archive
  async createArchive(sourceDir, jobConfig) {
    return new Promise((resolve, reject) => {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const archiveName = `${jobConfig.backup_name || 'backup'}_${timestamp}.zip`;
      const archivePath = path.join(this.backupDir, archiveName);

      const output = fs.createWriteStream(archivePath);
      const archive = archiver('zip', {
        zlib: { level: jobConfig.compression_enabled ? 9 : 0 }
      });

      output.on('close', () => {
        console.log(`📦 Archive created: ${archivePath} (${archive.pointer()} bytes)`);
        resolve(archivePath);
      });

      archive.on('error', (err) => {
        reject(err);
      });

      archive.pipe(output);
      archive.directory(sourceDir, false);
      archive.finalize();
    });
  }

  // Extract archive
  async extractArchive(archivePath, outputDir) {
    try {
      await extract(archivePath, { dir: outputDir });
      console.log(`📦 Archive extracted: ${archivePath}`);
    } catch (error) {
      console.error('❌ Failed to extract archive:', error);
      throw error;
    }
  }

  // Restore database
  async restoreDatabase(dbName, sourceDir, overwrite = false) {
    try {
      const sourcePath = path.join(sourceDir, `${dbName}.db`);
      const targetPath = path.join(__dirname, '../database', `${dbName}.db`);

      if (!fs.existsSync(sourcePath)) {
        console.log(`⚠️ Database backup not found: ${dbName}`);
        return false;
      }

      if (fs.existsSync(targetPath) && !overwrite) {
        // Create backup of existing database
        const backupPath = `${targetPath}.backup.${Date.now()}`;
        fs.copyFileSync(targetPath, backupPath);
        console.log(`📋 Existing database backed up: ${backupPath}`);
      }

      // Restore database
      fs.copyFileSync(sourcePath, targetPath);
      console.log(`✅ Database restored: ${dbName}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to restore database ${dbName}:`, error);
      return false;
    }
  }

  // Restore files
  async restoreFiles(sourceDir, overwrite = false) {
    try {
      const filesSourceDir = path.join(sourceDir, 'files');
      
      if (!fs.existsSync(filesSourceDir)) {
        console.log('⚠️ No files to restore');
        return false;
      }

      const targetDirs = [
        { source: 'uploads', target: path.join(__dirname, '../uploads') },
        { source: 'logs', target: path.join(__dirname, '../logs') },
        { source: 'config', target: path.join(__dirname, '../config') }
      ];

      let restoredCount = 0;

      for (const { source, target } of targetDirs) {
        const sourcePath = path.join(filesSourceDir, source);
        
        if (fs.existsSync(sourcePath)) {
          if (fs.existsSync(target) && !overwrite) {
            // Create backup of existing directory
            const backupPath = `${target}.backup.${Date.now()}`;
            await this.copyDirectory(target, backupPath);
            console.log(`📋 Existing directory backed up: ${backupPath}`);
          }

          await this.copyDirectory(sourcePath, target);
          restoredCount++;
        }
      }

      if (restoredCount > 0) {
        console.log(`✅ Files restored: ${restoredCount} directories`);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Failed to restore files:', error);
      return false;
    }
  }

  // Utility functions
  async copyDirectory(source, target) {
    if (!fs.existsSync(target)) {
      fs.mkdirSync(target, { recursive: true });
    }

    const items = fs.readdirSync(source);

    for (const item of items) {
      const sourcePath = path.join(source, item);
      const targetPath = path.join(target, item);

      if (fs.statSync(sourcePath).isDirectory()) {
        await this.copyDirectory(sourcePath, targetPath);
      } else {
        fs.copyFileSync(sourcePath, targetPath);
      }
    }
  }

  async calculateChecksum(filePath) {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);

      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(`sha256:${hash.digest('hex')}`));
      stream.on('error', reject);
    });
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Database operations
  async startBackupRecord(jobConfig, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO backup_history (
          job_id, backup_name, backup_type, databases_included,
          files_included, start_time, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        jobConfig.job_id || null,
        jobConfig.backup_name,
        jobConfig.backup_type,
        JSON.stringify(jobConfig.databases || []),
        jobConfig.include_files ? 1 : 0,
        new Date().toISOString(),
        'running',
        userId
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async completeBackupRecord(backupId, updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      fields.push('end_time = ?', 'duration = ?');
      values.push(
        new Date().toISOString(),
        Math.floor((Date.now() - new Date().getTime()) / 1000)
      );
      values.push(backupId);

      const query = `UPDATE backup_history SET ${fields.join(', ')} WHERE id = ?`;

      this.db.run(query, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async startRestoreRecord(backupId, restoreConfig, userId) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO restore_operations (
          backup_id, restore_type, target_location, databases_to_restore,
          files_to_restore, overwrite_existing, start_time, status, created_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        backupId,
        restoreConfig.restore_type,
        restoreConfig.target_location || 'current',
        JSON.stringify(restoreConfig.databases_to_restore || []),
        restoreConfig.files_to_restore ? 1 : 0,
        restoreConfig.overwrite_existing ? 1 : 0,
        new Date().toISOString(),
        'running',
        userId
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }

  async completeRestoreRecord(restoreId, updateData) {
    return new Promise((resolve, reject) => {
      const fields = [];
      const values = [];

      Object.entries(updateData).forEach(([key, value]) => {
        fields.push(`${key} = ?`);
        values.push(value);
      });

      fields.push('end_time = ?', 'duration = ?');
      values.push(
        new Date().toISOString(),
        Math.floor((Date.now() - new Date().getTime()) / 1000)
      );
      values.push(restoreId);

      const query = `UPDATE restore_operations SET ${fields.join(', ')} WHERE id = ?`;

      this.db.run(query, values, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async getBackupById(backupId) {
    return new Promise((resolve, reject) => {
      const query = 'SELECT * FROM backup_history WHERE id = ?';
      this.db.get(query, [backupId], (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  }

  async createNotification(notification) {
    return new Promise((resolve, reject) => {
      const query = `
        INSERT INTO backup_notifications (
          notification_type, title, message, backup_id, restore_id
        ) VALUES (?, ?, ?, ?, ?)
      `;

      this.db.run(query, [
        notification.type,
        notification.title,
        notification.message,
        notification.backup_id || null,
        notification.restore_id || null
      ], function(err) {
        if (err) reject(err);
        else resolve(this.lastID);
      });
    });
  }
}

module.exports = BackupService;