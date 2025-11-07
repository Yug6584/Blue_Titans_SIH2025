const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

/**
 * Create automated backup system
 */
class BackupManager {
  constructor() {
    this.backupDir = path.join(__dirname, '../backups');
    this.dbPath = path.join(__dirname, '../database/users.db');
    this.maxBackups = 30; // Keep 30 days of backups
    
    // Ensure backup directory exists
    if (!fs.existsSync(this.backupDir)) {
      fs.mkdirSync(this.backupDir, { recursive: true });
    }
  }

  /**
   * Create a database backup
   */
  async createBackup() {
    try {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const backupFileName = `users_backup_${timestamp}.db`;
      const backupPath = path.join(this.backupDir, backupFileName);

      // Copy database file
      await fs.promises.copyFile(this.dbPath, backupPath);
      
      console.log(`✅ Backup created: ${backupFileName}`);
      
      // Clean old backups
      await this.cleanOldBackups();
      
      return {
        success: true,
        fileName: backupFileName,
        path: backupPath,
        size: (await fs.promises.stat(backupPath)).size
      };
      
    } catch (error) {
      console.error('❌ Backup failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Clean old backup files
   */
  async cleanOldBackups() {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const backupFiles = files
        .filter(file => file.startsWith('users_backup_') && file.endsWith('.db'))
        .map(file => ({
          name: file,
          path: path.join(this.backupDir, file),
          mtime: fs.statSync(path.join(this.backupDir, file)).mtime
        }))
        .sort((a, b) => b.mtime - a.mtime); // Sort by modification time, newest first

      // Keep only the most recent backups
      if (backupFiles.length > this.maxBackups) {
        const filesToDelete = backupFiles.slice(this.maxBackups);
        
        for (const file of filesToDelete) {
          await fs.promises.unlink(file.path);
          console.log(`🗑️ Deleted old backup: ${file.name}`);
        }
      }
      
    } catch (error) {
      console.error('Error cleaning old backups:', error);
    }
  }

  /**
   * Get backup statistics
   */
  async getBackupStats() {
    try {
      const files = await fs.promises.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('users_backup_') && file.endsWith('.db'));
      
      let totalSize = 0;
      const backups = [];
      
      for (const file of backupFiles) {
        const filePath = path.join(this.backupDir, file);
        const stats = await fs.promises.stat(filePath);
        totalSize += stats.size;
        
        backups.push({
          name: file,
          size: stats.size,
          created: stats.mtime,
          age: Math.floor((Date.now() - stats.mtime.getTime()) / (1000 * 60 * 60 * 24)) // days
        });
      }
      
      return {
        totalBackups: backupFiles.length,
        totalSize: totalSize,
        totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
        backups: backups.sort((a, b) => b.created - a.created),
        lastBackup: backups.length > 0 ? backups[0].created : null
      };
      
    } catch (error) {
      console.error('Error getting backup stats:', error);
      return {
        totalBackups: 0,
        totalSize: 0,
        totalSizeMB: '0.00',
        backups: [],
        lastBackup: null
      };
    }
  }

  /**
   * Schedule automatic backups
   */
  scheduleBackups() {
    // Create backup every 24 hours
    const backupInterval = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
    
    setInterval(async () => {
      console.log('🔄 Starting scheduled backup...');
      await this.createBackup();
    }, backupInterval);
    
    console.log('⏰ Automatic backups scheduled every 24 hours');
  }
}

module.exports = BackupManager;