const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const responseTime = require('response-time');
const NodeCache = require('node-cache');
const path = require('path');
require('dotenv').config();

const app = express();

// Initialize cache with TTL (Time To Live) settings
const cache = new NodeCache({ 
  stdTTL: 600,      // Default TTL: 10 minutes
  checkperiod: 120, // Check for expired keys every 2 minutes
  useClones: false  // Don't clone cached objects for better performance
});

const { cachePortfolio, cacheCertificates, cacheStats } = require('./middleware/cache');

// Performance monitoring middleware
app.use(responseTime((req, res, time) => {
  console.log(`${req.method} ${req.url} - ${time.toFixed(2)}ms`);
}));

// Trust proxy - important for getting real client IP when behind a proxy
app.set('trust proxy', true);

// Security middleware
app.use(helmet());
app.use(compression());

// CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Get allowed origins from environment variable or use defaults
    const envAllowedOrigins = process.env.ALLOWED_ORIGINS
      ? process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim())
      : [];

    const defaultAllowedOrigins = [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'https://naveenagarwal-portfolio.vercel.app',
      'https://naveen-portfolio-il6e.onrender.com'
    ];

    const allowedOrigins = [...new Set([...defaultAllowedOrigins, ...envAllowedOrigins])];

    // Check if origin is in allowed list or is a Vercel/Render preview URL
    if (
      allowedOrigins.includes(origin) ||
      (origin && origin.includes('naveenagarwal-portfolio') && origin.includes('vercel.app')) ||
      (origin && origin.includes('naveen-portfolio') && origin.includes('onrender.com'))
    ) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'x-bypass-rate-limit',
    'Cache-Control',
    'Pragma',
    'Expires'
  ],
  exposedHeaders: ['Content-Range', 'X-Content-Range'],
  preflightContinue: false,
  optionsSuccessStatus: 204
}));

// Rate limiting for non-contact routes - Fixed trust proxy issue
const generalRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests. Please try again later.'
  },
  trustProxy: false // Disable trust proxy to avoid validation error
});

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const portfolioRoutes = require('./routes/portfolio');
const adminRoutes = require('./routes/admin');
const contactRoutes = require('./routes/contact');
const resumeRoutes = require('./routes/resume');
const certificatesRoutes = require('./routes/certificates');
const testPersonalRoutes = require('./routes/testPersonal');
const pdfProxyRoutes = require('./routes/pdf-proxy');
const localPdfRoutes = require('./routes/local-pdf');

// Apply routes with rate limiting and caching
app.use('/api/auth', generalRateLimiter, authRoutes);
app.use('/api/portfolio', generalRateLimiter, portfolioRoutes);
app.use('/api/resume', generalRateLimiter, resumeRoutes);
app.use('/api/certificates', generalRateLimiter, certificatesRoutes);

// Admin routes (no rate limiting for admin operations)
app.use('/api/admin', adminRoutes);
app.use('/api/admin/resume', resumeRoutes);
app.use('/api/admin/certificates', certificatesRoutes);

// Other routes
app.use('/api/test-personal', testPersonalRoutes);
app.use('/api/contact', contactRoutes); // Contact has its own rate limiting
app.use('/api/proxy', pdfProxyRoutes); // PDF proxy for serving resumes
app.use('/api/local', localPdfRoutes); // Local PDF serving (fallback)

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
}

// Connect to MongoDB with basic optimized settings
mongoose.connect(process.env.MONGO_URL)
  .then(() => {
    console.log('✅ Connected to MongoDB Atlas');
    
    // Initialize email service after DB connection
    try {
      const { emailService } = require('./config/emailService');
      console.log('✅ Email service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize email service:', error.message);
    }
  })
  .catch((error) => {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  });

// Monitor MongoDB connection events
mongoose.connection.on('connected', () => {
  console.log('📡 Mongoose connected to MongoDB Atlas');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('📵 Mongoose disconnected from MongoDB');
});

// Health check endpoints
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio API is running',
    timestamp: new Date().toISOString()
  });
});

// Performance monitoring endpoints
app.get('/api/performance', async (req, res) => {
  try {
    const { getDbStats } = require('./middleware/dbMonitor');
    const { getCacheStats } = require('./middleware/cache');
    
    const [dbStats, cacheStats] = await Promise.all([
      getDbStats(),
      Promise.resolve(getCacheStats())
    ]);
    
    res.json({
      success: true,
      data: {
        database: dbStats,
        cache: cacheStats,
        server: {
          uptime: process.uptime(),
          memory: process.memoryUsage(),
          pid: process.pid
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get performance stats',
      error: error.message
    });
  }
});

// Cache management endpoint (admin only)
app.post('/api/admin/cache/clear', async (req, res) => {
  try {
    const { invalidateCache } = require('./middleware/cache');
    const { type } = req.body;
    
    switch(type) {
      case 'portfolio':
        invalidateCache.portfolio();
        break;
      case 'certificates':
        invalidateCache.certificates();
        break;
      case 'stats':
        invalidateCache.stats();
        break;
      case 'all':
      default:
        invalidateCache.all();
        break;
    }
    
    res.json({
      success: true,
      message: `Cache cleared for: ${type || 'all'}`
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'Portfolio Backend API',
    version: '1.0.0'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Multer error handling
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'File too large. Maximum size is 5MB for resumes and 2MB for images.'
    });
  }

  if (
    err.message.includes('Only PDF files are allowed') ||
    err.message.includes('Only image files are allowed')
  ) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }

  // JWT error handling
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }

  // MongoDB error handling
  if (err.name === 'ValidationError') {
    const errors = Object.values(err.errors).map(e => e.message);
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors
    });
  }

  if (err.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production'
      ? 'Something went wrong!'
      : err.message
  });
});

// API 404 handler
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found'
  });
});

// Serve static files from frontend build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/build')));

  // Catch-all handler for React SPA - serve index.html for all non-API routes
  app.get('*', (req, res) => {
    if (req.path.startsWith('/api')) {
      return res.status(404).json({
        success: false,
        message: 'API endpoint not found'
      });
    }
    res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
  });
}

// Start server
const PORT = process.env.PORT || 8001;

const server = app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);

  // Signal that server is ready (important for Render)
  if (process.send) {
    process.send('ready');
  }
});

// Handle server startup errors
server.on('error', (err) => {
  console.error('Server failed to start:', err);
  process.exit(1);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    mongoose.connection.close().then(() => {
      console.log('MongoDB connection closed.');
      process.exit(0);
    });
  });
});

module.exports = app;
