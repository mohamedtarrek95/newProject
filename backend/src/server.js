require('dotenv').config();
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const rateRoutes = require('./routes/rate');
const transactionRoutes = require('./routes/transactions');

const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./middleware/logger');

const app = express();

// Basic middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const isDev = process.env.NODE_ENV !== 'production';
const limiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 1000 : 100,
  message: { error: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Auth rate limiting (stricter)
const authLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 1000 : 10,
  message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

// Logger middleware
app.use(logger);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rate', rateRoutes);
app.use('/api/transactions', transactionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    const mongoose = require('mongoose');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to MongoDB:', error.message);
    process.exit(1);
  }
};

startServer();
