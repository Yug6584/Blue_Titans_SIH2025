const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class CompanyDatabaseManager {
  constructor() {
    this.companiesDir = path.join(__dirname, '../database/companies');
    this.ensureCompaniesDirectory();
  }

  /**
   * Generate a unique project ID
   * @returns {string} Unique project ID in format PRJ-YYYYMMDD-XXXXX
   */
  generateProjectId() {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const random = Math.random().toString(36).substr(2, 5).toUpperCase();
    
    return `PRJ-${year}${month}${day}-${random}`;
  }

  ensureCompaniesDirectory() {
    if (!fs.existsSync(this.companiesDir)) {
      fs.mkdirSync(this.companiesDir, { recursive: true });
      console.log('📁 Created companies database directory');
    }
  }

  /**
   * Create a new database for a company user
   * @param {number} userId - The user ID
   * @param {string} email - Company email
   * @param {string} organization - Organization name
   * @returns {Promise<string>} Database path
   */
  async createCompanyDatabase(userId, email, organization) {
    return new Promise((resolve, reject) => {
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
      const dbName = `company_${userId}_${sanitizedEmail}.db`;
      const dbPath = path.join(this.companiesDir, dbName);

      // Create database connection
      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error creating company database:', err.message);
          return reject(err);
        }
        console.log(`🏢 Created database for company: ${organization || email}`);
      });

      // Create company-specific tables
      db.serialize(() => {
        // Company profile table
        db.run(`CREATE TABLE IF NOT EXISTS company_profile (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL,
          company_name TEXT,
          industry TEXT,
          address TEXT,
          phone TEXT,
          website TEXT,
          description TEXT,
          logo_path TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Files table for document storage
        db.run(`CREATE TABLE IF NOT EXISTS files (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          file_path TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT,
          category TEXT DEFAULT 'general',
          description TEXT,
          project_id INTEGER,
          status TEXT DEFAULT 'uploaded',
          uploaded_by INTEGER,
          is_public BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Add project_id column to existing files tables
        db.run(`ALTER TABLE files ADD COLUMN project_id INTEGER DEFAULT NULL`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: project_id column already exists in files table or migration not needed');
          }
        });

        // Add status column to existing files tables
        db.run(`ALTER TABLE files ADD COLUMN status TEXT DEFAULT 'uploaded'`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: status column already exists in files table or migration not needed');
          }
        });

        // Images table for image storage
        db.run(`CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          filename TEXT NOT NULL,
          original_name TEXT NOT NULL,
          image_path TEXT NOT NULL,
          file_size INTEGER,
          mime_type TEXT,
          width INTEGER,
          height INTEGER,
          category TEXT DEFAULT 'general',
          alt_text TEXT,
          project_id INTEGER,
          uploaded_by INTEGER,
          is_public BOOLEAN DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Add project_id column to existing images tables
        db.run(`ALTER TABLE images ADD COLUMN project_id INTEGER DEFAULT NULL`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: project_id column already exists in images table or migration not needed');
          }
        });

        // Company data table for custom data storage
        db.run(`CREATE TABLE IF NOT EXISTS company_data (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          data_key TEXT NOT NULL,
          data_value TEXT,
          data_type TEXT DEFAULT 'string',
          category TEXT DEFAULT 'general',
          is_encrypted BOOLEAN DEFAULT 0,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Projects table
        db.run(`CREATE TABLE IF NOT EXISTS projects (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id TEXT UNIQUE NOT NULL,
          project_name TEXT NOT NULL,
          description TEXT,
          project_type TEXT NOT NULL,
          area_hectares DECIMAL(10,2),
          location TEXT,
          status TEXT DEFAULT 'planning',
          start_date DATE,
          end_date DATE,
          budget DECIMAL(15,2),
          expected_credits INTEGER DEFAULT 0,
          created_by INTEGER,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Migrate existing projects table to add new columns
        db.run(`ALTER TABLE projects ADD COLUMN project_type TEXT DEFAULT 'mangrove'`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: project_type column already exists or migration not needed');
          }
        });
        
        db.run(`ALTER TABLE projects ADD COLUMN area_hectares DECIMAL(10,2) DEFAULT 0`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: area_hectares column already exists or migration not needed');
          }
        });
        
        db.run(`ALTER TABLE projects ADD COLUMN location TEXT DEFAULT ''`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: location column already exists or migration not needed');
          }
        });
        
        db.run(`ALTER TABLE projects ADD COLUMN expected_credits INTEGER DEFAULT 0`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: expected_credits column already exists or migration not needed');
          }
        });

        // Add unique project_id column
        db.run(`ALTER TABLE projects ADD COLUMN project_id TEXT`, (err) => {
          if (err && !err.message.includes('duplicate column name')) {
            console.log('Note: project_id column already exists or migration not needed');
          } else if (!err) {
            // Generate unique project IDs for existing projects that don't have them
            db.all(`SELECT id FROM projects WHERE project_id IS NULL OR project_id = ''`, (err, rows) => {
              if (!err && rows && rows.length > 0) {
                console.log(`Generating unique project IDs for ${rows.length} existing projects...`);
                rows.forEach(row => {
                  const uniqueId = this.generateProjectId();
                  db.run(`UPDATE projects SET project_id = ? WHERE id = ?`, [uniqueId, row.id], (updateErr) => {
                    if (updateErr) {
                      console.error(`Error updating project ${row.id} with unique ID:`, updateErr.message);
                    }
                  });
                });
              }
            });
          }
        });

        // Carbon credits table for marketplace
        db.run(`CREATE TABLE IF NOT EXISTS carbon_credits (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          project_id INTEGER,
          owner_id INTEGER,
          credits INTEGER NOT NULL,
          price_per_credit DECIMAL(10,2),
          description TEXT,
          status TEXT DEFAULT 'owned',
          verification_status TEXT DEFAULT 'pending',
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id)
        )`);

        // Credit transactions table for marketplace
        db.run(`CREATE TABLE IF NOT EXISTS credit_transactions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          credit_id INTEGER,
          buyer_id INTEGER,
          seller_id INTEGER,
          quantity INTEGER NOT NULL,
          amount DECIMAL(15,2),
          status TEXT DEFAULT 'pending',
          transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (credit_id) REFERENCES carbon_credits(id)
        )`);

        // Activity logs for company actions
        db.run(`CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          action_type TEXT NOT NULL,
          action_description TEXT,
          target_type TEXT,
          target_id INTEGER,
          ip_address TEXT,
          user_agent TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Insert initial company profile
        db.run(`INSERT INTO company_profile (user_id, company_name) VALUES (?, ?)`, 
          [userId, organization || 'New Company'], 
          function(err) {
            if (err) {
              console.error('Error creating initial company profile:', err.message);
              return reject(err);
            }
            
            console.log(`✅ Company database initialized for user ${userId}`);
            db.close((err) => {
              if (err) {
                console.error('Error closing database:', err.message);
                return reject(err);
              }
              resolve(dbPath);
            });
          }
        );
      });
    });
  }

  /**
   * Get database connection for a company
   * @param {number} userId - The user ID
   * @returns {sqlite3.Database|null} Database connection
   */
  getCompanyDatabase(userId) {
    const files = fs.readdirSync(this.companiesDir);
    const dbFile = files.find(file => file.startsWith(`company_${userId}_`));
    
    if (!dbFile) {
      console.error(`No database found for company user ${userId}`);
      return null;
    }

    const dbPath = path.join(this.companiesDir, dbFile);
    return new sqlite3.Database(dbPath);
  }

  /**
   * Delete company database
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteCompanyDatabase(userId) {
    return new Promise((resolve, reject) => {
      try {
        const files = fs.readdirSync(this.companiesDir);
        const dbFile = files.find(file => file.startsWith(`company_${userId}_`));
        
        if (!dbFile) {
          console.log(`No database found for company user ${userId}`);
          return resolve(true);
        }

        const dbPath = path.join(this.companiesDir, dbFile);
        fs.unlinkSync(dbPath);
        console.log(`🗑️ Deleted company database for user ${userId}`);
        resolve(true);
      } catch (error) {
        console.error('Error deleting company database:', error.message);
        reject(error);
      }
    });
  }

  /**
   * List all company databases
   * @returns {Array} List of company databases
   */
  listCompanyDatabases() {
    try {
      const files = fs.readdirSync(this.companiesDir);
      return files
        .filter(file => file.startsWith('company_') && file.endsWith('.db'))
        .map(file => {
          const match = file.match(/company_(\d+)_(.+)\.db/);
          if (match) {
            return {
              userId: parseInt(match[1]),
              filename: file,
              path: path.join(this.companiesDir, file)
            };
          }
          return null;
        })
        .filter(Boolean);
    } catch (error) {
      console.error('Error listing company databases:', error.message);
      return [];
    }
  }
}

module.exports = new CompanyDatabaseManager();