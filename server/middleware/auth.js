const jwt = require('jsonwebtoken');

// Matches the key in your routes/auth.js
const JWT_SECRET = "super_secret_key_123"; 

module.exports = function(req, res, next) {
  // Get token from header
  const token = req.header('x-auth-token');

  // Check if not token
  if (!token) {
    return res.status(401).json({ msg: 'No token, authorization denied' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // ✅ FIX: Assign the decoded object directly to req.user
    // because your token payload is simply { id: ... }
    req.user = decoded; 
    
    next();
  } catch (err) {
    res.status(401).json({ msg: 'Token is not valid' });
  }
};