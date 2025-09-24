const NodeCache = require('node-cache');

// FIXED: Longer cache times to reduce database hits
const portfolioCache = new NodeCache({ 
  stdTTL: 1800, // 30 minutes (increased from 10)
  checkperiod: 300, // Check every 5 minutes
  useClones: false 
});

const certificatesCache = new NodeCache({ 
  stdTTL: 900, // 15 minutes (increased from 5)
  checkperiod: 180, // Check every 3 minutes
  useClones: false 
});

const statsCache = new NodeCache({ 
  stdTTL: 3600, // 1 hour (increased from 30 minutes)
  checkperiod: 600, // Check every 10 minutes
  useClones: false 
});

/**
 * Enhanced cache middleware factory with better key generation
 */
const createCacheMiddleware = (cacheInstance, ttl) => {
  return (req, res, next) => {
    // FIXED: Better cache key that excludes problematic query params
    const { _t, timestamp, ...cleanQuery } = req.query || {};
    const queryString = Object.keys(cleanQuery).length > 0 
      ? '?' + new URLSearchParams(cleanQuery).toString() 
      : '';
    const key = req.route ? req.route.path + queryString : req.path + queryString;
    
    const cachedData = cacheInstance.get(key);
    
    if (cachedData) {
      console.log(`🔋 Cache HIT for ${key}`);
      // Add cache headers
      res.set('X-Cache', 'HIT');
      res.set('Cache-Control', 'public, max-age=300'); // 5 minutes client cache
      return res.json(cachedData);
    }
    
    console.log(`📝 Cache MISS for ${key}`);
    
    const originalJson = res.json;
    
    res.json = function(data) {
      if (data && data.success !== false) {
        const cacheOptions = ttl ? { ttl } : {};
        cacheInstance.set(key, data, cacheOptions.ttl);
        console.log(`💾 Cached data for ${key} (TTL: ${cacheOptions.ttl || cacheInstance.options.stdTTL}s)`);
        
        // Add cache headers
        res.set('X-Cache', 'MISS');
        res.set('Cache-Control', 'public, max-age=300'); // 5 minutes client cache
      }
      
      return originalJson.call(this, data);
    };
    
    next();
  };
};

/**
 * Conditional caching - only cache successful responses
 */
const conditionalCache = (cacheInstance, condition = () => true) => {
  return (req, res, next) => {
    if (!condition(req)) {
      return next();
    }
    
    return createCacheMiddleware(cacheInstance)(req, res, next);
  };
};

/**
 * Smart cache invalidation
 */
const invalidateCache = {
  portfolio: (pattern) => {
    const keys = portfolioCache.keys();
    const invalidatedKeys = [];
    
    keys.forEach(key => {
      if (!pattern || key.includes(pattern)) {
        portfolioCache.del(key);
        invalidatedKeys.push(key);
      }
    });
    
    if (invalidatedKeys.length > 0) {
      console.log(`🗑️ Invalidated ${invalidatedKeys.length} portfolio cache keys`);
    }
    return invalidatedKeys;
  },
  
  certificates: (pattern) => {
    const keys = certificatesCache.keys();
    const invalidatedKeys = [];
    
    keys.forEach(key => {
      if (!pattern || key.includes(pattern)) {
        certificatesCache.del(key);
        invalidatedKeys.push(key);
      }
    });
    
    if (invalidatedKeys.length > 0) {
      console.log(`🗑️ Invalidated ${invalidatedKeys.length} certificate cache keys`);
    }
    return invalidatedKeys;
  },
  
  stats: () => {
    const keyCount = statsCache.keys().length;
    statsCache.flushAll();
    console.log(`🗑️ Invalidated ${keyCount} stats cache keys`);
    return keyCount;
  },
  
  all: () => {
    const portfolioKeys = portfolioCache.keys().length;
    const certKeys = certificatesCache.keys().length;
    const statKeys = statsCache.keys().length;
    
    portfolioCache.flushAll();
    certificatesCache.flushAll();
    statsCache.flushAll();
    
    const total = portfolioKeys + certKeys + statKeys;
    console.log(`🗑️ Invalidated all caches (${total} keys total)`);
    return total;
  },
  
  // FIXED: Smart invalidation based on data changes
  onDataChange: (dataType, operation = 'update') => {
    switch(dataType) {
      case 'personal':
        invalidateCache.portfolio('/personal');
        invalidateCache.stats();
        break;
      case 'projects':
        invalidateCache.portfolio('/projects');
        invalidateCache.stats();
        break;
      case 'techstack':
        invalidateCache.portfolio('/tech-stack');
        break;
      case 'certificates':
        invalidateCache.certificates();
        invalidateCache.stats();
        break;
      default:
        console.warn(`Unknown data type for cache invalidation: ${dataType}`);
    }
  }
};

/**
 * Enhanced cache statistics
 */
const getCacheStats = () => {
  const portfolioStats = portfolioCache.getStats();
  const certStats = certificatesCache.getStats();
  const statsStats = statsCache.getStats();
  
  return {
    portfolio: {
      keys: portfolioCache.keys().length,
      hits: portfolioStats.hits || 0,
      misses: portfolioStats.misses || 0,
      hitRate: portfolioStats.hits ? ((portfolioStats.hits / (portfolioStats.hits + portfolioStats.misses)) * 100).toFixed(2) + '%' : '0%'
    },
    certificates: {
      keys: certificatesCache.keys().length,
      hits: certStats.hits || 0,
      misses: certStats.misses || 0,
      hitRate: certStats.hits ? ((certStats.hits / (certStats.hits + certStats.misses)) * 100).toFixed(2) + '%' : '0%'
    },
    stats: {
      keys: statsCache.keys().length,
      hits: statsStats.hits || 0,
      misses: statsStats.misses || 0,
      hitRate: statsStats.hits ? ((statsStats.hits / (statsStats.hits + statsStats.misses)) * 100).toFixed(2) + '%' : '0%'
    },
    total: {
      keys: portfolioCache.keys().length + certificatesCache.keys().length + statsCache.keys().length,
      hits: (portfolioStats.hits || 0) + (certStats.hits || 0) + (statsStats.hits || 0),
      misses: (portfolioStats.misses || 0) + (certStats.misses || 0) + (statsStats.misses || 0)
    }
  };
};

/**
 * Cache warming - preload frequently accessed data
 */
const warmCache = async () => {
  console.log('🔥 Starting cache warming...');
  try {
    // This would be called by routes to pre-populate cache
    // Implementation depends on your specific data access patterns
    console.log('✅ Cache warming completed');
  } catch (error) {
    console.error('❌ Cache warming failed:', error);
  }
};

/**
 * Cache cleanup - remove expired entries
 */
const cleanupCache = () => {
  const before = {
    portfolio: portfolioCache.keys().length,
    certificates: certificatesCache.keys().length,
    stats: statsCache.keys().length
  };
  
  // Force cleanup of expired keys
  portfolioCache.flushExpired?.();
  certificatesCache.flushExpired?.();
  statsCache.flushExpired?.();
  
  const after = {
    portfolio: portfolioCache.keys().length,
    certificates: certificatesCache.keys().length,
    stats: statsCache.keys().length
  };
  
  const cleaned = {
    portfolio: before.portfolio - after.portfolio,
    certificates: before.certificates - after.certificates,
    stats: before.stats - after.stats
  };
  
  const totalCleaned = cleaned.portfolio + cleaned.certificates + cleaned.stats;
  if (totalCleaned > 0) {
    console.log(`🧹 Cleaned ${totalCleaned} expired cache entries`);
  }
  
  return cleaned;
};

// Pre-configured middleware instances
const cachePortfolio = conditionalCache(portfolioCache, (req) => {
  // Only cache GET requests that don't have admin paths
  return req.method === 'GET' && !req.path.includes('/admin/');
});

const cacheCertificates = conditionalCache(certificatesCache, (req) => {
  return req.method === 'GET' && !req.path.includes('/admin/');
});

const cacheStats = conditionalCache(statsCache, (req) => {
  return req.method === 'GET';
});

// FIXED: Periodic cleanup to prevent memory bloat
setInterval(() => {
  cleanupCache();
}, 30 * 60 * 1000); // Every 30 minutes

module.exports = {
  createCacheMiddleware,
  conditionalCache,
  cachePortfolio,
  cacheCertificates,
  cacheStats,
  invalidateCache,
  getCacheStats,
  warmCache,
  cleanupCache,
  portfolioCache,
  certificatesCache,
  statsCache
};