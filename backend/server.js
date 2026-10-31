// server.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');

const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const workerRoutes = require('./routes/worker');
const womanRoutes = require('./routes/woman');
const notificationRoutes = require('./routes/notification');
const educationRoutes = require('./routes/education');
const { apiLimiter } = require('./middleware/rateLimitMiddleware');

const app = express();

const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maacare';

// Security HTTP headers
app.use(helmet({
  crossOriginResourcePolicy: false,
}));

// CORS Configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || process.env.NODE_ENV !== 'production') {
      return callback(null, true);
    }
    return callback(new Error('CORS policy does not allow access from this origin'), false);
  },
  credentials: true,
}));

app.use(express.json());
app.use('/api', apiLimiter);

// Connect to MongoDB
// const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/maacare';
// mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
//   .then(() => console.log('MongoDB connected successfully'))
//   .catch(err => console.error('MongoDB connection error:', err));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/worker', workerRoutes);
app.use('/api/woman', womanRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/education', educationRoutes);

// Health check root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'MaaCare API is running',
    version: '2.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Database connection health check
app.get('/api/health/db', (req, res) => {
  const connected = mongoose.connection.readyState === 1;

  res.status(connected ? 200 : 503).json({
    server: 'Running',
    database: connected ? 'Connected' : 'Disconnected',
    databaseName: mongoose.connection.name || null
  });
});

// Centralized error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode).json({
    message: err.message || 'Server Error',
    field: err.field || undefined,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack,
  });
});

// Start server only after MongoDB connects
const PORT = process.env.PORT || 5001;

async function startServer() {
  try {
    await mongoose.connect(mongoURI);

    console.log('MongoDB connected successfully');
    console.log('Database name:', mongoose.connection.name);

    app.listen(PORT, () => {
      console.log(`MaaCare server running on port ${PORT}`);
    });

  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  startServer();
}

module.exports = app;
