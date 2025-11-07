const jwt = require('jsonwebtoken');

// Middleware to authenticate JWT token
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ 
      success: false, 
      message: 'Access token required' 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false, 
        message: 'Invalid or expired token' 
      });
    }
    
    req.user = user;
    next();
  });
};

// Middleware to require admin access
const requireAdmin = (req, res, next) => {
  if (req.user.panel !== 'admin') {
    return res.status(403).json({ 
      success: false, 
      message: 'Admin access required' 
    });
  }
  next();
};

// Middleware to require specific panel access
const requirePanel = (allowedPanels) => {
  return (req, res, next) => {
    if (!allowedPanels.includes(req.user.panel)) {
      return res.status(403).json({ 
        success: false, 
        message: `Access denied. Required panels: ${allowedPanels.join(', ')}` 
      });
    }
    next();
  };
};

module.exports = {
  authenticateToken,
  requireAdmin,
  requirePanel
};