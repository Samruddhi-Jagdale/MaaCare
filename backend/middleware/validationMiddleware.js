// middleware/validationMiddleware.js
const { body, param, query, validationResult } = require('express-validator');

// Error formatter and responder
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    res.status(400);
    return res.json({
      message: firstError.msg,
      field: firstError.path || firstError.param,
      errors: errors.array(),
    });
  }
  next();
};

// Validation rules
const validateRegister = [
  body('name')
    .trim()
    .notEmpty().withMessage('Full Name is required')
    .isLength({ min: 3, max: 80 }).withMessage('Full Name must be between 3 and 80 characters')
    .custom((value) => {
      const trimmed = value.trim();
      const letterMatches = trimmed.match(/[a-zA-Z]/g) || [];
      if (letterMatches.length < 2) {
        throw new Error('Full Name must contain at least 2 alphabetic characters');
      }
      if (!/^[a-zA-Z]+(?:[\s'-][a-zA-Z]+)*$/.test(trimmed)) {
        throw new Error('Full Name can only contain letters and normal spaces between names');
      }
      return true;
    }),
  body('email')
    .trim()
    .notEmpty().withMessage('Email address is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('phone')
    .trim()
    .notEmpty().withMessage('Mobile number is required')
    .custom((value) => {
      const trimmed = value.trim();
      if (!/^\d+$/.test(trimmed)) {
        throw new Error('Mobile number must contain only digits');
      }
      if (trimmed.length !== 10) {
        throw new Error('Mobile number must be exactly 10 digits');
      }
      if (!/^[6-9]/.test(trimmed)) {
        throw new Error('Mobile number must start with a digit between 6 and 9');
      }
      if (/^(\d)\1{9}$/.test(trimmed)) {
        throw new Error('Mobile number cannot be a repeated invalid pattern');
      }
      return true;
    }),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .custom((value) => {
      if (!/[A-Z]/.test(value)) {
        throw new Error('Password must contain at least one uppercase letter');
      }
      if (!/[a-z]/.test(value)) {
        throw new Error('Password must contain at least one lowercase letter');
      }
      if (!/\d/.test(value)) {
        throw new Error('Password must contain at least one number');
      }
      return true;
    }),
  handleValidationErrors,
];

const validateLogin = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required'),
  handleValidationErrors,
];

const validateWorkerCreate = [
  body('name')
    .trim()
    .notEmpty().withMessage('Worker name is required')
    .isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('email')
    .trim()
    .notEmpty().withMessage('Valid email is required')
    .isEmail().withMessage('Please enter a valid email address')
    .normalizeEmail(),
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim(),
  handleValidationErrors,
];

const validateWomanCreate = [
  body('userId')
    .notEmpty().withMessage('Registered user ID is required')
    .isMongoId().withMessage('Invalid registered user ID format'),
  body('age')
    .notEmpty().withMessage('Age is required')
    .isInt({ min: 12, max: 70 }).withMessage('Age must be between 12 and 70'),
  body('phone')
    .optional({ checkFalsy: true })
    .trim(),
  body('pregnancyWeek')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 45 }).withMessage('Pregnancy week must be between 1 and 45'),
  body('bloodGroup')
    .optional({ checkFalsy: true })
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Valid blood group is required'),
  handleValidationErrors,
];

const validateCheckupCreate = [
  body('womanId')
    .notEmpty().withMessage('Woman ID is required')
    .isMongoId().withMessage('Invalid woman ID format'),
  body('date')
    .notEmpty().withMessage('Checkup date is required')
    .isISO8601().withMessage('Valid checkup date is required'),
  body('type')
    .trim()
    .notEmpty().withMessage('Appointment type is required'),
  body('status')
    .optional()
    .isIn(['Upcoming', 'Completed', 'Cancelled', 'Overdue', 'Missed']).withMessage('Invalid status'),
  handleValidationErrors,
];

module.exports = {
  handleValidationErrors,
  validateRegister,
  validateLogin,
  validateWorkerCreate,
  validateWomanCreate,
  validateCheckupCreate,
};
