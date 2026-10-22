// controllers/authController.js
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @desc    Register new user (Public registration defaults to pregnant woman)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  let { name, email, phone, password, role } = req.body;

  if (!name || !email || !password) {
    res.status(400);
    throw new Error('Name, email, and password are required');
  }

  name = name.trim();
  email = email.trim().toLowerCase();
  phone = phone ? phone.trim() : '';

  // Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters');
  }

  // Public registration only allows 'woman'.
  // Admin and Health Worker accounts cannot be created publicly.
  const assignedRole = 'woman';

  const userExists = await User.findOne({ email });
  if (userExists) {
    res.status(400);
    throw new Error('User with this email already exists');
  }

  const user = await User.create({
    name,
    email,
    phone,
    password,
    role: assignedRole,
  });

  const token = generateToken(user._id);
  res.status(201).json({
    _id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    token,
  });
});

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const authUser = asyncHandler(async (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  email = email.trim().toLowerCase();
  const user = await User.findOne({ email });

  if (user && (await user.matchPassword(password))) {
    if (user.isActive === false) {
      res.status(403);
      throw new Error('This account has been deactivated. Please contact your system administrator.');
    }

    const token = generateToken(user._id);
    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      isActive: user.isActive,
      token,
    });
  } else {
    res.status(401);
    throw new Error('Invalid email or password');
  }
});

// Generate JWT
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

module.exports = { registerUser, authUser };
