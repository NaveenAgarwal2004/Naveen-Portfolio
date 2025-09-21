const NodeCache = require('node-cache');

// Initialize cache instances for different data types
const portfolioCache = new NodeCache({ stdTTL: 600 }); // 10 minutes for portfolio data
const certificatesCache = new NodeCache({ stdTTL: 300 }); // 5 minutes for certificates
const statsCache = new NodeCache({ stdTTL: 1800 }); // 30 minutes for stats

/**
 * Generic cache middleware factory
 * @param {NodeCache} cacheInstance - The cache instance to use
 * @param {number} ttl - Time to live in seconds (optional override)
 */
const createCacheMiddleware = (cacheInstance, ttl) => {
  return (req, res, next) => {
    // Create cache key from request URL and query parameters
    const key = req.originalUrl || req.url;
    
    // Try to get cached data
    const cachedData = cacheInstance.get(key);
    
    if (cachedData) {
      console.log(`📋 Cache HIT for ${key}`);
      return res.json(cachedData);
    }
    
    console.log(`📝 Cache MISS for ${key}`);
    
    // Store original res.json method
    const originalJson = res.json;
    
    // Override res.json to cache successful responses
    res.json = function(data) {
      // Only cache successful responses
      if (data && data.success !== false) {
        const cacheOptions = ttl ? { ttl } : {};
        cacheInstance.set(key, data, cacheOptions.ttl);
        console.log(`💾 Cached data for ${key} (TTL: ${cacheOptions.ttl || cacheInstance.options.stdTTL}s)`);
      }
      
      // Call original res.json
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Cache invalidation helper
 */
const invalidateCache = {
  portfolio: (pattern) => {
    const keys = portfolioCache.keys();
    keys.forEach(key => {
      if (!pattern || key.includes(pattern)) {
        portfolioCache.del(key);
        console.log(`🗑️ Invalidated cache key: ${key}`);
      }
    });
  },
  
  certificates: (pattern) => {
    const keys = certificatesCache.keys();
    keys.forEach(key => {
      if (!pattern || key.includes(pattern)) {
        certificatesCache.del(key);
        console.log(`🗑️ Invalidated cache key: ${key}`);
      }
    });
  },
  
  stats: () => {
    statsCache.flushAll();
    console.log(`🗑️ Invalidated all stats cache`);
  },
  
  all: () => {
    portfolioCache.flushAll();
    certificatesCache.flushAll();
    statsCache.flushAll();
    console.log(`🗑️ Invalidated all caches`);
  }
};

/**
 * Cache statistics
 */
const getCacheStats = () => {
  return {
    portfolio: {
      keys: portfolioCache.keys().length,
      hits: portfolioCache.getStats().hits,
      misses: portfolioCache.getStats().misses
    },
    certificates: {
      keys: certificatesCache.keys().length,
      hits: certificatesCache.getStats().hits,
      misses: certificatesCache.getStats().misses
    },
    stats: {
      keys: statsCache.keys().length,
      hits: statsCache.getStats().hits,
      misses: statsCache.getStats().misses
    }
  };
};

// Pre-configured middleware instances
const cachePortfolio = createCacheMiddleware(portfolioCache);
const cacheCertificates = createCacheMiddleware(certificatesCache);
const cacheStats = createCacheMiddleware(statsCache, 1800); // 30 minutes

module.exports = {
  createCacheMiddleware,
  cachePortfolio,
  cacheCertificates,
  cacheStats,
  invalidateCache,
  getCacheStats,
  portfolioCache,
  certificatesCache,
  statsCache
};