const express = require('express');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const companyDatabaseManager = require('../services/companyDatabaseManager');
const fileUploadService = require('../services/fileUploadService');
const router = express.Router();

// Get all company databases (Admin only)
router.get('/databases', authenticateToken, requireAdmin, (req, res) => {
  try {
    const databases = companyDatabaseManager.listCompanyDatabases();
    
    res.json({
      success: true,
      message: 'Company databases retrieved successfully',
      databases: databases,
      totalDatabases: databases.length
    });
  } catch (error) {
    console.error('Error listing company databases:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error retrieving company databases'
    });
  }
});

// Create database for existing company user (Admin only)
router.post('/databases/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Valid user ID is required'
    });
  }

  // Check if user exists and is a company user
  const db = require('../database/init');
  
  db.get('SELECT * FROM users WHERE id = ? AND panel = "company"', [userId], async (err, user) => {
    if (err) {
      console.error('Database error:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Internal server error'
      });
    }

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Company user not found'
      });
    }

    try {
      const dbPath = await companyDatabaseManager.createCompanyDatabase(
        userId, 
        user.email, 
        user.organization
      );
      
      fileUploadService.createCompanyUploadDir(userId);
      
      res.json({
        success: true,
        message: `Database created successfully for company user: ${user.email}`,
        databasePath: dbPath,
        userId: userId
      });
    } catch (error) {
      console.error('Error creating company database:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error creating company database'
      });
    }
  });
});

// Delete company database (Admin only)
router.delete('/databases/:userId', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Valid user ID is required'
    });
  }

  try {
    await companyDatabaseManager.deleteCompanyDatabase(userId);
    
    res.json({
      success: true,
      message: `Database deleted successfully for user ID: ${userId}`
    });
  } catch (error) {
    console.error('Error deleting company database:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting company database'
    });
  }
});

// Get company database info (Admin only)
router.get('/databases/:userId/info', authenticateToken, requireAdmin, (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Valid user ID is required'
    });
  }

  const db = companyDatabaseManager.getCompanyDatabase(userId);
  
  if (!db) {
    return res.status(404).json({
      success: false,
      message: 'Company database not found'
    });
  }

  // Get database statistics
  const queries = [
    'SELECT COUNT(*) as fileCount FROM files',
    'SELECT COUNT(*) as imageCount FROM images',
    'SELECT COUNT(*) as dataCount FROM company_data',
    'SELECT COUNT(*) as projectCount FROM projects',
    'SELECT * FROM company_profile WHERE user_id = ?'
  ];

  Promise.all(queries.map((query, index) => {
    return new Promise((resolve, reject) => {
      if (index === 4) { // company_profile query
        db.get(query, [userId], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      } else {
        db.get(query, (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      }
    });
  }))
  .then(results => {
    const [fileCount, imageCount, dataCount, projectCount, profile] = results;
    
    db.close();
    
    res.json({
      success: true,
      databaseInfo: {
        userId: userId,
        profile: profile,
        statistics: {
          totalFiles: fileCount.fileCount,
          totalImages: imageCount.imageCount,
          totalDataEntries: dataCount.dataCount,
          totalProjects: projectCount.projectCount
        }
      }
    });
  })
  .catch(err => {
    db.close();
    console.error('Error fetching database info:', err.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching database information'
    });
  });
});

// Get company files (Admin only)
router.get('/databases/:userId/files', authenticateToken, requireAdmin, async (req, res) => {
  const userId = parseInt(req.params.userId);
  
  if (!userId) {
    return res.status(400).json({
      success: false,
      message: 'Valid user ID is required'
    });
  }

  try {
    const files = await fileUploadService.getCompanyFiles(userId, 'all');
    
    res.json({
      success: true,
      userId: userId,
      files: files,
      totalFiles: files.length
    });
  } catch (error) {
    console.error('Error fetching company files:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching company files'
    });
  }
});

module.exports = router;