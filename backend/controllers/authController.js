// controllers/authController.js
const asyncHandler = require('express-async-handler');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Woman = require('../models/Woman');

// @desc    Register new user (Public registration defaults to pregnant woman)
// @route   POST /api/auth/register
// @access  Public
const registerUser = asyncHandler(async (req, res) => {
  let { name, email, phone, password, role } = req.body;

  if (!name || typeof name !== 'string' || !name.trim()) {
    res.status(400);
    throw new Error('Full Name is required');
  }

  name = name.trim();
  if (name.length < 3) {
    res.status(400);
    throw new Error('Full Name must be at least 3 characters');
  }
  if (name.length > 80) {
    res.status(400);
    throw new Error('Full Name must not exceed 80 characters');
  }
  const letterMatches = name.match(/[a-zA-Z]/g) || [];
  if (letterMatches.length < 2) {
    res.status(400);
    throw new Error('Full Name must contain at least 2 alphabetic characters');
  }
  if (!/^[a-zA-Z]+(?:[\s'-][a-zA-Z]+)*$/.test(name)) {
    res.status(400);
    throw new Error('Full Name can only contain letters and normal spaces between names');
  }

  if (!email || typeof email !== 'string' || !email.trim()) {
    res.status(400);
    throw new Error('Email address is required');
  }
  email = email.trim().toLowerCase();
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    res.status(400);
    throw new Error('Please enter a valid email address');
  }

  if (!phone || typeof phone !== 'string' || !phone.trim()) {
    res.status(400);
    throw new Error('Mobile number is required');
  }
  phone = phone.trim();
  if (!/^\d+$/.test(phone)) {
    res.status(400);
    throw new Error('Mobile number must contain only digits');
  }
  if (phone.length !== 10) {
    res.status(400);
    throw new Error('Mobile number must be exactly 10 digits');
  }
  if (!/^[6-9]/.test(phone)) {
    res.status(400);
    throw new Error('Mobile number must start with a digit between 6 and 9');
  }
  if (/^(\d)\1{9}$/.test(phone)) {
    res.status(400);
    throw new Error('Mobile number cannot be a repeated invalid pattern');
  }

  if (!password || typeof password !== 'string') {
    res.status(400);
    throw new Error('Password is required');
  }
  if (password.length < 8) {
    res.status(400);
    throw new Error('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least one uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least one lowercase letter');
  }
  if (!/\d/.test(password)) {
    res.status(400);
    throw new Error('Password must contain at least one number');
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

  // Automatically create linked maternal clinical profile for the pregnant woman
  try {
    await Woman.create({
      name: user.name,
      phone: user.phone || '',
      user: user._id,
      status: 'Active',
    });
  } catch (profileErr) {
    console.error('Initial clinical profile creation notice:', profileErr.message);
  }

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
