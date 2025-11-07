const express = require('express');
const { authenticateToken } = require('../middleware/auth');
const fileUploadService = require('../services/fileUploadService');
const companyDatabaseManager = require('../services/companyDatabaseManager');
const router = express.Router();

// Upload image for company
router.post('/images/upload', authenticateToken, (req, res) => {
  // Only company users can upload to their own database
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can upload files'
    });
  }

  const upload = fileUploadService.getMulterConfig(req.user.userId, 'images');
  
  upload.single('image')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No image file provided'
      });
    }

    try {
      const fileMetadata = await fileUploadService.saveFileMetadata(
        req.user.userId,
        {
          ...req.file,
          category: req.body.category || 'general',
          description: req.body.description || ''
        },
        'image'
      );

      res.json({
        success: true,
        message: 'Image uploaded successfully',
        file: fileMetadata
      });
    } catch (error) {
      console.error('Error saving image metadata:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error saving image metadata'
      });
    }
  });
});

// Upload file for company
router.post('/files/upload', authenticateToken, (req, res) => {
  // Only company users can upload to their own database
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can upload files'
    });
  }

  const upload = fileUploadService.getMulterConfig(req.user.userId, 'files');
  
  upload.single('file')(req, res, async (err) => {
    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message
      });
    }

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file provided'
      });
    }

    try {
      const fileMetadata = await fileUploadService.saveFileMetadata(
        req.user.userId,
        {
          ...req.file,
          category: req.body.category || 'general',
          description: req.body.description || '',
          project_id: req.body.project_id || null
        },
        'file'
      );

      res.json({
        success: true,
        message: 'File uploaded successfully',
        file: fileMetadata
      });
    } catch (error) {
      console.error('Error saving file metadata:', error.message);
      res.status(500).json({
        success: false,
        message: 'Error saving file metadata'
      });
    }
  });
});

// Get all files for company
router.get('/files', authenticateToken, async (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access their files'
    });
  }

  try {
    const files = await fileUploadService.getCompanyFiles(req.user.userId, 'all');
    
    res.json({
      success: true,
      files: files
    });
  } catch (error) {
    console.error('Error fetching company files:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching files'
    });
  }
});

// Get images only
router.get('/images', authenticateToken, async (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access their images'
    });
  }

  try {
    const images = await fileUploadService.getCompanyFiles(req.user.userId, 'image');
    
    res.json({
      success: true,
      images: images
    });
  } catch (error) {
    console.error('Error fetching company images:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching images'
    });
  }
});

// Get documents only
router.get('/documents', authenticateToken, async (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access their documents'
    });
  }

  try {
    const documents = await fileUploadService.getCompanyFiles(req.user.userId, 'file');
    
    res.json({
      success: true,
      documents: documents
    });
  } catch (error) {
    console.error('Error fetching company documents:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error fetching documents'
    });
  }
});

// Delete file
router.delete('/files/:id', authenticateToken, async (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can delete their files'
    });
  }

  const fileId = req.params.id;
  const fileType = req.query.type || 'file'; // 'image' or 'file'

  try {
    const result = await fileUploadService.deleteFile(req.user.userId, fileId, fileType);
    
    if (result.deleted) {
      res.json({
        success: true,
        message: 'File deleted successfully'
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'File not found'
      });
    }
  } catch (error) {
    console.error('Error deleting file:', error.message);
    res.status(500).json({
      success: false,
      message: 'Error deleting file'
    });
  }
});

// Store custom company data
router.post('/data', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can store data'
    });
  }

  const { dataKey, dataValue, dataType, category } = req.body;

  if (!dataKey || dataValue === undefined) {
    return res.status(400).json({
      success: false,
      message: 'Data key and value are required'
    });
  }

  const db = companyDatabaseManager.getCompanyDatabase(req.user.userId);
  
  if (!db) {
    return res.status(500).json({
      success: false,
      message: 'Company database not found'
    });
  }

  db.run(
    `INSERT INTO company_data (data_key, data_value, data_type, category, created_by) 
     VALUES (?, ?, ?, ?, ?)`,
    [dataKey, dataValue, dataType || 'string', category || 'general', req.user.userId],
    function(err) {
      db.close();
      
      if (err) {
        console.error('Error storing company data:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Error storing data'
        });
      }

      res.json({
        success: true,
        message: 'Data stored successfully',
        dataId: this.lastID
      });
    }
  );
});

// Get company data
router.get('/data', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access their data'
    });
  }

  const db = companyDatabaseManager.getCompanyDatabase(req.user.userId);
  
  if (!db) {
    return res.status(500).json({
      success: false,
      message: 'Company database not found'
    });
  }

  const category = req.query.category;
  let query = 'SELECT * FROM company_data ORDER BY created_at DESC';
  let params = [];

  if (category) {
    query = 'SELECT * FROM company_data WHERE category = ? ORDER BY created_at DESC';
    params = [category];
  }

  db.all(query, params, (err, rows) => {
    db.close();
    
    if (err) {
      console.error('Error fetching company data:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Error fetching data'
      });
    }

    res.json({
      success: true,
      data: rows
    });
  });
});

// Get company profile
router.get('/profile', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can access their profile'
    });
  }

  const db = companyDatabaseManager.getCompanyDatabase(req.user.userId);
  
  if (!db) {
    return res.status(500).json({
      success: false,
      message: 'Company database not found'
    });
  }

  db.get('SELECT * FROM company_profile WHERE user_id = ?', [req.user.userId], (err, row) => {
    db.close();
    
    if (err) {
      console.error('Error fetching company profile:', err.message);
      return res.status(500).json({
        success: false,
        message: 'Error fetching profile'
      });
    }

    res.json({
      success: true,
      profile: row
    });
  });
});

// Update company profile
router.put('/profile', authenticateToken, (req, res) => {
  if (req.user.panel !== 'company') {
    return res.status(403).json({
      success: false,
      message: 'Only company users can update their profile'
    });
  }

  const { companyName, industry, address, phone, website, description } = req.body;

  const db = companyDatabaseManager.getCompanyDatabase(req.user.userId);
  
  if (!db) {
    return res.status(500).json({
      success: false,
      message: 'Company database not found'
    });
  }

  db.run(
    `UPDATE company_profile SET 
     company_name = ?, industry = ?, address = ?, phone = ?, 
     website = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
     WHERE user_id = ?`,
    [companyName, industry, address, phone, website, description, req.user.userId],
    function(err) {
      db.close();
      
      if (err) {
        console.error('Error updating company profile:', err.message);
        return res.status(500).json({
          success: false,
          message: 'Error updating profile'
        });
      }

      res.json({
        success: true,
        message: 'Profile updated successfully'
      });
    }
  );
});

module.exports = router;