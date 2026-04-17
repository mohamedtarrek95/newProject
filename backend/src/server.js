require('dotenv').config();
const express = require('express');
app.set('trust proxy', 1);
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const rateLimit = require('express-rate-limit');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');
const rateRoutes = require('./routes/rate');
const currencyRoutes = require('./routes/currency');
const transactionRoutes = require('./routes/transactions');

const { errorHandler } = require('./middleware/errorHandler');
const { logger } = require('./middleware/logger');

const app = express();
const PORT = process.env.PORT || 8080;

// CORS configuration - single, production-ready setup
const allowedOrigins = process.env.ALLOWED_ORIGINS
  ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
  : [];

if (allowedOrigins.length === 0 && process.env.NODE_ENV === 'production') {
  throw new Error('ALLOWED_ORIGINS environment variable is required in production');
}

const corsOptions = {
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cookie'],
  exposedHeaders: ['Set-Cookie'],
  optionsSuccessStatus: 204
};

app.use(cors(corsOptions));
// Body parsing - must be before routes
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

const authLimiter = rateLimit({
  windowMs: isDev ? 60 * 1000 : 15 * 60 * 1000,
  max: isDev ? 1000 : 10,
  message: { error: 'Too many authentication attempts, please try again later.' }
});
app.use('/api/auth', authLimiter);

// Logger middleware
app.use(logger);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/rate', rateRoutes);
app.use('/api/currencies', currencyRoutes);
app.use('/api/transactions', transactionRoutes);

// Root route for Railway health check
app.get('/', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Error handler - must be last
app.use(errorHandler);

// MongoDB connection with auto-retry (non-blocking)
let mongoose = require('mongoose');

const connectWithRetry = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    });
    console.log('MongoDB connected successfully');

    // Auto-seed currencies if none exist
    const Currency = require('./models/Currency');
    const count = await Currency.countDocuments();
    if (count === 0) {
      console.log('Seeding default currencies...');
      const { seedCurrencies } = require('./controllers/currencyController');
      // Call seed directly without req/res
      const defaultCurrencies = [
        { code: 'EGP', name: 'Egyptian Pound', buyPrice: 50, sellPrice: 48, paymentMethods: ['Instapay'] },
        { code: 'USD', name: 'US Dollar', buyPrice: 1, sellPrice: 1, paymentMethods: ['Payoneer', 'Revolut', 'Zelle'] },
        { code: 'EUR', name: 'Euro', buyPrice: 1.1, sellPrice: 1.08, paymentMethods: ['SEPA Instant', 'Revolut'] }
      ];
      for (const curr of defaultCurrencies) {
        await Currency.findOneAndUpdate({ code: curr.code }, curr, { upsert: true, new: true });
      }
      console.log('Default currencies seeded successfully');
    }
  } catch (error) {
    console.error('MongoDB connection failed (retrying in 5s):', error.message);
    setTimeout(connectWithRetry, 5000);
  }
};

mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected. Reconnecting...');
  connectWithRetry();
});

mongoose.connection.on('error', (err) => {
  console.error('MongoDB error:', err.message);
});

// Start server (non-blocking MongoDB connection)
const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  console.log(`${signal} received. Shutting down gracefully...`);
  server.close(() => {
    console.log('HTTP server closed');
    mongoose.connection.close(false, () => {
      console.log('MongoDB connection closed');
      process.exit(0);
    });
  });
  setTimeout(() => process.exit(1), 10000);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Connect to MongoDB (don't block server startup)
connectWithRetry();