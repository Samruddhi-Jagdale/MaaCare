// middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Protect routes
const protect = asyncHandler(async (req, res, next) => {
  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(decoded.id).select('-password');
      if (!req.user) {
        res.status(401);
        throw new Error('User no longer exists');
      }
      if (req.user.isActive === false) {
        res.status(403);
        throw new Error('User account has been deactivated. Please contact your administrator.');
      }
      return next();
    } catch (error) {
      if (res.statusCode === 403) {
        throw error;
      }
      console.error('Auth verification error:', error.message);
      res.status(401);
      throw new Error('Not authorized, token failed');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token provided');
  }
});

// Role-based access control
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403);
      throw new Error(`Forbidden: User role '${req.user?.role || 'anonymous'}' is not authorized to access this resource`);
    }
    next();
  };
};

module.exports = { protect, authorize };
