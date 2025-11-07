const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class TradingDatabaseManager {
  constructor() {
    this.tradingDir = path.join(__dirname, '../database/trading');
    this.ensureTradingDirectory();
  }

  ensureTradingDirectory() {
    if (!fs.existsSync(this.tradingDir)) {
      fs.mkdirSync(this.tradingDir, { recursive: true });
      console.log('📁 Created trading database directory');
    }
  }

  /**
   * Create a new trading database for a company user
   * @param {number} userId - The user ID
   * @param {string} email - Company email
   * @param {string} organization - Organization name
   * @returns {Promise<string>} Database path
   */
  async createTradingDatabase(userId, email, organization) {
    return new Promise((resolve, reject) => {
      const sanitizedEmail = email.replace(/[^a-zA-Z0-9]/g, '_');
      const dbName = `trading_${userId}_${sanitizedEmail}.db`;
      const dbPath = path.join(this.tradingDir, dbName);

      console.log(`🏪 Creating trading database for: ${organization}`);

      const db = new sqlite3.Database(dbPath, (err) => {
        if (err) {
          console.error('Error creating trading database:', err);
          reject(err);
          return;
        }

        // Create all trading tables
        this.createTradingTables(db, userId, (tableErr) => {
          if (tableErr) {
            console.error('Error creating trading tables:', tableErr);
            db.close();
            reject(tableErr);
            return;
          }

          db.close((closeErr) => {
            if (closeErr) {
              console.error('Error closing trading database:', closeErr);
              reject(closeErr);
              return;
            }

            console.log(`✅ Trading database initialized for user ${userId}`);
            resolve(dbPath);
          });
        });
      });
    });
  }

  /**
   * Get trading database connection for a user
   * @param {number} userId - The user ID
   * @returns {sqlite3.Database|null} Database connection or null if not found
   */
  getTradingDatabase(userId) {
    try {
      // Find the trading database file for this user
      const files = fs.readdirSync(this.tradingDir);
      const dbFile = files.find(file => file.startsWith(`trading_${userId}_`) && file.endsWith('.db'));
      
      if (!dbFile) {
        console.log(`No trading database found for user ${userId}`);
        return null;
      }

      const dbPath = path.join(this.tradingDir, dbFile);
      return new sqlite3.Database(dbPath);
    } catch (error) {
      console.error('Error accessing trading database:', error);
      return null;
    }
  }

  /**
   * Delete trading database for a user
   * @param {number} userId - The user ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTradingDatabase(userId) {
    return new Promise((resolve) => {
      try {
        const files = fs.readdirSync(this.tradingDir);
        const dbFile = files.find(file => file.startsWith(`trading_${userId}_`) && file.endsWith('.db'));
        
        if (!dbFile) {
          console.log(`No trading database found for user ${userId}`);
          resolve(true);
          return;
        }

        const dbPath = path.join(this.tradingDir, dbFile);
        fs.unlinkSync(dbPath);
        console.log(`🗑️ Trading database deleted for user ${userId}`);
        resolve(true);
      } catch (error) {
        console.error('Error deleting trading database:', error);
        resolve(false);
      }
    });
  }

  /**
   * List all trading databases
   * @returns {Array} List of trading database info
   */
  listTradingDatabases() {
    try {
      const files = fs.readdirSync(this.tradingDir);
      return files
        .filter(file => file.startsWith('trading_') && file.endsWith('.db'))
        .map(file => {
          const parts = file.replace('.db', '').split('_');
          return {
            userId: parseInt(parts[1]),
            email: parts.slice(2).join('_').replace(/_/g, '@'),
            filename: file,
            path: path.join(this.tradingDir, file)
          };
        });
    } catch (error) {
      console.error('Error listing trading databases:', error);
      return [];
    }
  }

  /**
   * Create all required tables in the trading database
   * @param {sqlite3.Database} db - Database connection
   * @param {number} userId - User ID for foreign key references
   * @param {Function} callback - Callback function
   */
  createTradingTables(db, userId, callback) {
    const tables = [
      // Trading transactions table
      `CREATE TABLE IF NOT EXISTS trading_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        transaction_type TEXT NOT NULL CHECK (transaction_type IN ('buy', 'sell')),
        credit_type TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price_per_credit DECIMAL(10,2) NOT NULL CHECK (price_per_credit > 0),
        total_value DECIMAL(15,2) NOT NULL CHECK (total_value > 0),
        transaction_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        order_id INTEGER,
        counterparty_id INTEGER,
        market_price DECIMAL(10,2),
        fees DECIMAL(10,2) DEFAULT 0,
        status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
        notes TEXT,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Active orders table
      `CREATE TABLE IF NOT EXISTS active_orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_type TEXT NOT NULL CHECK (order_type IN ('buy', 'sell')),
        credit_type TEXT NOT NULL,
        quantity INTEGER NOT NULL CHECK (quantity > 0),
        price_limit DECIMAL(10,2) NOT NULL CHECK (price_limit > 0),
        filled_quantity INTEGER DEFAULT 0 CHECK (filled_quantity >= 0),
        remaining_quantity INTEGER NOT NULL CHECK (remaining_quantity >= 0),
        status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'partial', 'completed', 'cancelled')),
        order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
        expiry_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Trading statistics table
      `CREATE TABLE IF NOT EXISTS trading_statistics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        total_trades INTEGER DEFAULT 0,
        total_volume DECIMAL(15,2) DEFAULT 0,
        total_credits_bought INTEGER DEFAULT 0,
        total_credits_sold INTEGER DEFAULT 0,
        average_buy_price DECIMAL(10,2) DEFAULT 0,
        average_sell_price DECIMAL(10,2) DEFAULT 0,
        profit_loss DECIMAL(15,2) DEFAULT 0,
        last_updated DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Order history table
      `CREATE TABLE IF NOT EXISTS order_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_order_id INTEGER NOT NULL,
        order_type TEXT NOT NULL,
        credit_type TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        price_limit DECIMAL(10,2) NOT NULL,
        final_status TEXT NOT NULL,
        completion_date DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    // Create tables sequentially, then indexes, then initialize data
    this.createTablesSequentially(db, tables, 0, (err) => {
      if (err) {
        callback(err);
        return;
      }

      // After tables are created, create indexes
      this.createIndexes(db, (indexErr) => {
        if (indexErr) {
          callback(indexErr);
          return;
        }

        // Initialize trading statistics record
        db.run(
          'INSERT OR IGNORE INTO trading_statistics (id) VALUES (1)',
          (statsErr) => {
            if (statsErr) {
              console.error('Error initializing trading statistics:', statsErr);
              callback(statsErr);
              return;
            }
            callback(null);
          }
        );
      });
    });
  }

  createTablesSequentially(db, tables, index, callback) {
    if (index >= tables.length) {
      callback(null);
      return;
    }

    db.run(tables[index], (err) => {
      if (err) {
        console.error(`Error creating table ${index}:`, err);
        callback(err);
        return;
      }
      this.createTablesSequentially(db, tables, index + 1, callback);
    });
  }

  createIndexes(db, callback) {
    const indexes = [
      'CREATE INDEX IF NOT EXISTS idx_transactions_date ON trading_transactions(transaction_date)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_type ON trading_transactions(transaction_type)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_credit_type ON trading_transactions(credit_type)',
      'CREATE INDEX IF NOT EXISTS idx_transactions_status ON trading_transactions(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_status ON active_orders(status)',
      'CREATE INDEX IF NOT EXISTS idx_orders_type ON active_orders(order_type)',
      'CREATE INDEX IF NOT EXISTS idx_orders_date ON active_orders(order_date)'
    ];

    this.createIndexesSequentially(db, indexes, 0, callback);
  }

  createIndexesSequentially(db, indexes, index, callback) {
    if (index >= indexes.length) {
      callback(null);
      return;
    }

    db.run(indexes[index], (err) => {
      if (err) {
        console.error(`Error creating index ${index}:`, err);
        callback(err);
        return;
      }
      this.createIndexesSequentially(db, indexes, index + 1, callback);
    });
  }
}

module.exports = new TradingDatabaseManager();