const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const tradingDatabaseManager = require('../services/tradingDatabaseManager');
const router = express.Router();

// Get trading dashboard data (active orders + transaction history)
router.get('/dashboard', authenticateToken, (req, res) => {
  // Only company users can access trading data
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access trading data'
    });
  }

  const tradingDb = tradingDatabaseManager.getTradingDatabase(req.user.userId);
  
  if (!tradingDb) {
    return res.status(500).json({
      success: false,
      message: 'Trading database not found. Please contact administrator.'
    });
  }

  // Get comprehensive trading data
  const queries = {
    activeOrders: 'SELECT * FROM active_orders ORDER BY order_date DESC',
    transactions: 'SELECT * FROM trading_transactions ORDER BY transaction_date DESC LIMIT 20',
    statistics: 'SELECT * FROM trading_statistics WHERE id = 1'
  };

  const results = {};
  let completedQueries = 0;
  const totalQueries = Object.keys(queries).length;

  Object.entries(queries).forEach(([key, query]) => {
    if (key === 'statistics') {
      tradingDb.get(query, (err, row) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          results[key] = null;
        } else {
          results[key] = row || {
            total_trades: 0,
            total_volume: 0,
            total_credits_bought: 0,
            total_credits_sold: 0,
            average_buy_price: 0,
            average_sell_price: 0,
            profit_loss: 0
          };
        }
        
        completedQueries++;
        if (completedQueries === totalQueries) {
          sendTradingResponse();
        }
      });
    } else {
      tradingDb.all(query, (err, rows) => {
        if (err) {
          console.error(`Error in ${key} query:`, err);
          results[key] = [];
        } else {
          results[key] = rows || [];
        }
        
        completedQueries++;
        if (completedQueries === totalQueries) {
          sendTradingResponse();
        }
      });
    }
  });

  function sendTradingResponse() {
    const tradingData = {
      activeOrders: results.activeOrders || [],
      transactions: results.transactions || [],
      statistics: results.statistics || {
        total_trades: 0,
        total_volume: 0,
        total_credits_bought: 0,
        total_credits_sold: 0,
        average_buy_price: 0,
        average_sell_price: 0,
        profit_loss: 0
      }
    };

    res.json({
      success: true,
      data: tradingData
    });
  }
});

// Get active orders
router.get('/orders', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access orders'
    });
  }

  const tradingDb = tradingDatabaseManager.getTradingDatabase(req.user.userId);
  
  if (!tradingDb) {
    return res.status(500).json({
      success: false,
      message: 'Trading database not found'
    });
  }

  tradingDb.all('SELECT * FROM active_orders ORDER BY order_date DESC', (err, rows) => {
    if (err) {
      console.error('Error fetching active orders:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching active orders'
      });
    }

    res.json({
      success: true,
      orders: rows || []
    });
  });
});

// Create new order
router.post('/orders', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can create orders'
    });
  }

  const { order_type, credit_type, quantity, price_limit } = req.body;

  if (!order_type || !credit_type || !quantity || !price_limit) {
    return res.status(400).json({
      success: false,
      message: 'Order type, credit type, quantity, and price limit are required'
    });
  }

  const tradingDb = tradingDatabaseManager.getTradingDatabase(req.user.userId);
  
  if (!tradingDb) {
    return res.status(500).json({
      success: false,
      message: 'Trading database not found'
    });
  }

  tradingDb.run(
    `INSERT INTO active_orders 
     (order_type, credit_type, quantity, price_limit, remaining_quantity, status, order_date) 
     VALUES (?, ?, ?, ?, ?, 'pending', datetime('now'))`,
    [order_type, credit_type, quantity, price_limit, quantity],
    function(err) {
      if (err) {
        console.error('Error creating order:', err);
        return res.status(500).json({
          success: false,
          message: 'Error creating order'
        });
      }

      res.json({
        success: true,
        message: 'Order created successfully',
        orderId: this.lastID
      });
    }
  );
});

// Cancel order
router.delete('/orders/:id', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can cancel orders'
    });
  }

  const orderId = req.params.id;

  const tradingDb = tradingDatabaseManager.getTradingDatabase(req.user.userId);
  
  if (!tradingDb) {
    return res.status(500).json({
      success: false,
      message: 'Trading database not found'
    });
  }

  tradingDb.run(
    'UPDATE active_orders SET status = "cancelled", updated_at = datetime("now") WHERE id = ?',
    [orderId],
    function(err) {
      if (err) {
        console.error('Error cancelling order:', err);
        return res.status(500).json({
          success: false,
          message: 'Error cancelling order'
        });
      }

      res.json({
        success: true,
        message: 'Order cancelled successfully'
      });
    }
  );
});

// Get transaction history
router.get('/transactions', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access transactions'
    });
  }

  const tradingDb = tradingDatabaseManager.getTradingDatabase(req.user.userId);
  
  if (!tradingDb) {
    return res.status(500).json({
      success: false,
      message: 'Trading database not found'
    });
  }

  const limit = req.query.limit || 50;
  const offset = req.query.offset || 0;

  tradingDb.all(
    'SELECT * FROM trading_transactions ORDER BY transaction_date DESC LIMIT ? OFFSET ?',
    [limit, offset],
    (err, rows) => {
      if (err) {
        console.error('Error fetching transactions:', err);
        return res.status(500).json({
          success: false,
          message: 'Error fetching transactions'
        });
      }

      res.json({
        success: true,
        transactions: rows || []
      });
    }
  );
});

// Record new transaction
router.post('/transactions', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can record transactions'
    });
  }

  const { transaction_type, credit_type, quantity, price_per_credit, notes } = req.body;

  if (!transaction_type || !credit_type || !quantity || !price_per_credit) {
    return res.status(400).json({
      success: false,
      message: 'Transaction type, credit type, quantity, and price are required'
    });
  }

  const total_value = quantity * price_per_credit;

  const tradingDb = tradingDatabaseManager.getTradingDatabase(req.user.userId);
  
  if (!tradingDb) {
    return res.status(500).json({
      success: false,
      message: 'Trading database not found'
    });
  }

  tradingDb.run(
    `INSERT INTO trading_transactions 
     (transaction_type, credit_type, quantity, price_per_credit, total_value, notes, transaction_date) 
     VALUES (?, ?, ?, ?, ?, ?, datetime('now'))`,
    [transaction_type, credit_type, quantity, price_per_credit, total_value, notes],
    function(err) {
      if (err) {
        console.error('Error recording transaction:', err);
        return res.status(500).json({
          success: false,
          message: 'Error recording transaction'
        });
      }

      // Update trading statistics
      updateTradingStatistics(tradingDb, transaction_type, quantity, price_per_credit, total_value);

      res.json({
        success: true,
        message: 'Transaction recorded successfully',
        transactionId: this.lastID
      });
    }
  );
});

// Get trading statistics
router.get('/statistics', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access statistics'
    });
  }

  const tradingDb = tradingDatabaseManager.getTradingDatabase(req.user.userId);
  
  if (!tradingDb) {
    return res.status(500).json({
      success: false,
      message: 'Trading database not found'
    });
  }

  tradingDb.get('SELECT * FROM trading_statistics WHERE id = 1', (err, row) => {
    if (err) {
      console.error('Error fetching statistics:', err);
      return res.status(500).json({
        success: false,
        message: 'Error fetching statistics'
      });
    }

    res.json({
      success: true,
      statistics: row || {
        total_trades: 0,
        total_volume: 0,
        total_credits_bought: 0,
        total_credits_sold: 0,
        average_buy_price: 0,
        average_sell_price: 0,
        profit_loss: 0
      }
    });
  });
});

// Helper function to update trading statistics
function updateTradingStatistics(db, transactionType, quantity, pricePerCredit, totalValue) {
  db.get('SELECT * FROM trading_statistics WHERE id = 1', (err, stats) => {
    if (err) {
      console.error('Error fetching current statistics:', err);
      return;
    }

    const currentStats = stats || {
      total_trades: 0,
      total_volume: 0,
      total_credits_bought: 0,
      total_credits_sold: 0,
      average_buy_price: 0,
      average_sell_price: 0,
      profit_loss: 0
    };

    const newTotalTrades = currentStats.total_trades + 1;
    const newTotalVolume = currentStats.total_volume + totalValue;

    let newCreditsBought = currentStats.total_credits_bought;
    let newCreditsSold = currentStats.total_credits_sold;
    let newAvgBuyPrice = currentStats.average_buy_price;
    let newAvgSellPrice = currentStats.average_sell_price;

    if (transactionType === 'buy') {
      newCreditsBought += quantity;
      newAvgBuyPrice = newCreditsBought > 0 ? 
        ((currentStats.average_buy_price * currentStats.total_credits_bought) + totalValue) / newCreditsBought : 0;
    } else {
      newCreditsSold += quantity;
      newAvgSellPrice = newCreditsSold > 0 ? 
        ((currentStats.average_sell_price * currentStats.total_credits_sold) + totalValue) / newCreditsSold : 0;
    }

    db.run(`
      UPDATE trading_statistics SET
        total_trades = ?,
        total_volume = ?,
        total_credits_bought = ?,
        total_credits_sold = ?,
        average_buy_price = ?,
        average_sell_price = ?,
        last_updated = datetime('now')
      WHERE id = 1
    `, [
      newTotalTrades,
      newTotalVolume,
      newCreditsBought,
      newCreditsSold,
      newAvgBuyPrice,
      newAvgSellPrice
    ], (updateErr) => {
      if (updateErr) {
        console.error('Error updating statistics:', updateErr);
      }
    });
  });
}

module.exports = router;