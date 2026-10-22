// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const workerRoutes = require('./routes/worker');
const womanRoutes = require('./routes/woman');

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maacare';
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/woman', womanRoutes);

// Health check root endpoint
app.get('/', (req, res) => {
  res.json({ message: 'MaaCare API is running' });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
