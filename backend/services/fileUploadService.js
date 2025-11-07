const multer = require('multer');
const path = require('path');
const fs = require('fs');
const companyDatabaseManager = require('./companyDatabaseManager');

class FileUploadService {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../uploads');
    this.ensureUploadsDirectory();
  }

  ensureUploadsDirectory() {
    if (!fs.existsSync(this.uploadsDir)) {
      fs.mkdirSync(this.uploadsDir, { recursive: true });
      console.log('📁 Created uploads directory');
    }
  }

  /**
   * Create company-specific upload directory
   * @param {number} userId - Company user ID
   */
  createCompanyUploadDir(userId) {
    const companyDir = path.join(this.uploadsDir, `company_${userId}`);
    const imagesDir = path.join(companyDir, 'images');
    const filesDir = path.join(companyDir, 'files');

    [companyDir, imagesDir, filesDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    return { companyDir, imagesDir, filesDir };
  }

  /**
   * Configure multer for company file uploads
   * @param {number} userId - Company user ID
   * @param {string} uploadType - 'images' or 'files'
   */
  getMulterConfig(userId, uploadType = 'files') {
    const { imagesDir, filesDir } = this.createCompanyUploadDir(userId);
    const uploadDir = uploadType === 'images' ? imagesDir : filesDir;

    const storage = multer.diskStorage({
      destination: (req, file, cb) => {
        cb(null, uploadDir);
      },
      filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const name = path.basename(file.originalname, ext);
        cb(null, `${name}-${uniqueSuffix}${ext}`);
      }
    });

    const fileFilter = (req, file, cb) => {
      if (uploadType === 'images') {
        // Allow only image files
        if (file.mimetype.startsWith('image/')) {
          cb(null, true);
        } else {
          cb(new Error('Only image files are allowed'), false);
        }
      } else {
        // Allow common document types
        const allowedTypes = [
          'application/pdf',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
          'application/vnd.ms-excel',
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'text/plain',
          'text/csv',
          'application/json'
        ];
        
        if (allowedTypes.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(new Error('File type not allowed'), false);
        }
      }
    };

    return multer({
      storage,
      fileFilter,
      limits: {
        fileSize: uploadType === 'images' ? 5 * 1024 * 1024 : 10 * 1024 * 1024 // 5MB for images, 10MB for files
      }
    });
  }

  /**
   * Save file metadata to company database
   * @param {number} userId - Company user ID
   * @param {Object} fileInfo - File information
   * @param {string} type - 'image' or 'file'
   */
  async saveFileMetadata(userId, fileInfo, type = 'file') {
    return new Promise((resolve, reject) => {
      const db = companyDatabaseManager.getCompanyDatabase(userId);
      
      if (!db) {
        return reject(new Error('Company database not found'));
      }

      const table = type === 'image' ? 'images' : 'files';
      const pathColumn = type === 'image' ? 'image_path' : 'file_path';

      const statusColumn = type === 'image' ? '' : ', status';
      const statusValue = type === 'image' ? '' : ', ?';
      
      const query = `INSERT INTO ${table} (
        filename, original_name, ${pathColumn}, file_size, mime_type, 
        category, description, project_id${statusColumn}, uploaded_by, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?${statusValue}, ?, ?)`;

      const currentTimestamp = new Date().toISOString();
      
      const values = [
        fileInfo.filename,
        fileInfo.originalname,
        fileInfo.path,
        fileInfo.size,
        fileInfo.mimetype,
        fileInfo.category || 'general',
        fileInfo.description || '',
        fileInfo.project_id || null,
        ...(type === 'file' ? ['uploaded'] : []),
        userId,
        currentTimestamp
      ];

      db.run(query, values, function(err) {
        db.close();
        
        if (err) {
          console.error('Error saving file metadata:', err.message);
          return reject(err);
        }

        resolve({
          id: this.lastID,
          filename: fileInfo.filename,
          originalName: fileInfo.originalname,
          path: fileInfo.path,
          size: fileInfo.size,
          mimeType: fileInfo.mimetype
        });
      });
    });
  }

  /**
   * Get files for a company
   * @param {number} userId - Company user ID
   * @param {string} type - 'image', 'file', or 'all'
   */
  async getCompanyFiles(userId, type = 'all') {
    return new Promise((resolve, reject) => {
      const db = companyDatabaseManager.getCompanyDatabase(userId);
      
      if (!db) {
        return reject(new Error('Company database not found'));
      }

      let query;
      if (type === 'image') {
        query = 'SELECT * FROM images ORDER BY created_at DESC';
      } else if (type === 'file') {
        query = 'SELECT * FROM files ORDER BY created_at DESC';
      } else {
        query = `
          SELECT 'image' as type, id, filename, original_name, image_path as file_path, 
                 file_size, mime_type, category, created_at FROM images
          UNION ALL
          SELECT 'file' as type, id, filename, original_name, file_path, 
                 file_size, mime_type, category, created_at FROM files
          ORDER BY created_at DESC
        `;
      }

      db.all(query, (err, rows) => {
        db.close();
        
        if (err) {
          console.error('Error fetching company files:', err.message);
          return reject(err);
        }

        resolve(rows);
      });
    });
  }

  /**
   * Delete file and its metadata
   * @param {number} userId - Company user ID
   * @param {number} fileId - File ID
   * @param {string} type - 'image' or 'file'
   */
  async deleteFile(userId, fileId, type = 'file') {
    return new Promise((resolve, reject) => {
      const db = companyDatabaseManager.getCompanyDatabase(userId);
      
      if (!db) {
        return reject(new Error('Company database not found'));
      }

      const table = type === 'image' ? 'images' : 'files';
      const pathColumn = type === 'image' ? 'image_path' : 'file_path';

      // First get file path
      db.get(`SELECT ${pathColumn} as file_path FROM ${table} WHERE id = ?`, [fileId], (err, row) => {
        if (err) {
          db.close();
          return reject(err);
        }

        if (!row) {
          db.close();
          return reject(new Error('File not found'));
        }

        // Delete file from filesystem
        try {
          if (fs.existsSync(row.file_path)) {
            fs.unlinkSync(row.file_path);
          }
        } catch (fsError) {
          console.error('Error deleting file from filesystem:', fsError.message);
        }

        // Delete from database
        db.run(`DELETE FROM ${table} WHERE id = ?`, [fileId], function(err) {
          db.close();
          
          if (err) {
            return reject(err);
          }

          resolve({ deleted: this.changes > 0 });
        });
      });
    });
  }
}

module.exports = new FileUploadService();