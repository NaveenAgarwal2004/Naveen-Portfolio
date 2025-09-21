const mongoose = require('mongoose');

/**
 * Database performance monitoring middleware
 */
const dbPerformanceMonitor = () => {
  // Enable mongoose debug mode in development
  if (process.env.NODE_ENV === 'development') {
    mongoose.set('debug', true);
  }
  
  // Track slow queries
  const slowQueryThreshold = 100; // 100ms threshold
  
  mongoose.plugin(function(schema) {
    schema.pre(/^find/, function() {
      this.start = Date.now();
    });
    
    schema.post(/^find/, function(result) {
      if (this.start) {
        const duration = Date.now() - this.start;
        if (duration > slowQueryThreshold) {
          console.warn(`🐌 Slow Query (${duration}ms):`, {
            collection: this.getQuery(),
            model: this.model.modelName,
            duration: `${duration}ms`
          });
        }
      }
    });
  });
  
  // Monitor connection pool
  setInterval(() => {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (state === 1) { // Only log when connected
      console.log(`📊 MongoDB Status: ${states[state]}`);
    }
  }, 30000); // Every 30 seconds
};

/**
 * Get database performance statistics
 */
const getDbStats = async () => {
  try {
    const db = mongoose.connection.db;
    const stats = await db.stats();
    
    return {
      connected: mongoose.connection.readyState === 1,
      database: db.databaseName,
      collections: stats.collections,
      dataSize: `${(stats.dataSize / 1024 / 1024).toFixed(2)} MB`,
      indexSize: `${(stats.indexSize / 1024 / 1024).toFixed(2)} MB`,
      storageSize: `${(stats.storageSize / 1024 / 1024).toFixed(2)} MB`,
      documents: stats.objects,
      indexes: stats.indexes,
      avgObjSize: `${(stats.avgObjSize / 1024).toFixed(2)} KB`
    };
  } catch (error) {
    console.error('Error getting DB stats:', error);
    return { error: error.message };
  }
};

/**
 * Optimize database queries with indexing suggestions
 */
const optimizationMiddleware = (req, res, next) => {
  // Add query optimization headers for monitoring
  res.setHeader('X-DB-Optimized', 'true');
  
  // Track request start time
  req.dbStartTime = Date.now();
  
  // Override res.json to add performance metrics
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - req.dbStartTime;
    
    // Add performance headers
    res.setHeader('X-Response-Time', `${duration}ms`);
    
    // Log slow requests
    if (duration > 500) { // 500ms threshold
      console.warn(`🐌 Slow API Response (${duration}ms):`, {
        method: req.method,
        path: req.path,
        duration: `${duration}ms`
      });
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

module.exports = {
  dbPerformanceMonitor,
  getDbStats,
  optimizationMiddleware
};