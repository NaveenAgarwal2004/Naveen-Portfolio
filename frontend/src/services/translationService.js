class TranslationService {
  constructor() {
    this.cache = new Map();
    this.cacheExpiry = new Map();
    this.CACHE_DURATION = 24 * 60 * 60 * 1000;
    this.isOnline = navigator.onLine;
    this.requestQueue = new Map();
    this.pendingRequests = new Map();
    this.rateLimitDelay = 10000;
    this.batchDelay = 15000;
    this.lastRequestTime = 0;
    this.maxRetries = 0;
    this.requestCount = 0;
    this.requestWindowStart = Date.now();
    this.maxRequestsPerMinute = 5;
    this.translationEnabled = true;
    this.backoffUntil = 0;
    this.listeners = new Set();

    this.initializeOfflineDetection();
    this.loadFromLocalStorage();
    this.startBatchProcessor();
    this.startRequestMonitor();
    this.checkBackendAvailability();
  }

  addListener(callback) {
    this.listeners.add(callback);
    return () => this.listeners.delete(callback);
  }

  notifyListeners(status) {
    this.listeners.forEach(callback => callback(status));
  }

  async checkBackendAvailability() {
    try {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${BACKEND_URL}/api/health`, {
        method: 'GET',
        timeout: 5000
      });
      
      if (!response.ok) {
        this.translationEnabled = false;
        console.warn('Translation service disabled: Backend not available');
      }
    } catch (error) {
      this.translationEnabled = false;
      console.warn('Translation service disabled: Backend not reachable');
    }
  }

  initializeOfflineDetection() {
    window.addEventListener('online', () => {
      this.isOnline = true;
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  getCacheKey(text, targetLang, sourceLang = 'en') {
    return `${sourceLang}:${targetLang}:${text}`;
  }

  isCacheValid(key) {
    const expiry = this.cacheExpiry.get(key);
    return expiry && Date.now() < expiry;
  }

  getFromCache(text, targetLang, sourceLang = 'en') {
    const key = this.getCacheKey(text, targetLang, sourceLang);
    if (this.cache.has(key) && this.isCacheValid(key)) {
      return this.cache.get(key);
    }
    return null;
  }

  setCache(text, targetLang, translation, sourceLang = 'en') {
    const key = this.getCacheKey(text, targetLang, sourceLang);
    this.cache.set(key, translation);
    this.cacheExpiry.set(key, Date.now() + this.CACHE_DURATION);
    
    try {
      const localStorageKey = `translation_${key}`;
      localStorage.setItem(localStorageKey, JSON.stringify({
        translation,
        expiry: Date.now() + this.CACHE_DURATION
      }));
    } catch (e) {
      console.warn('Failed to store translation in localStorage:', e);
    }
  }

  loadFromLocalStorage() {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('translation_')) {
          const data = JSON.parse(localStorage.getItem(key));
          if (data && data.expiry > Date.now()) {
            const translationKey = key.replace('translation_', '');
            this.cache.set(translationKey, data.translation);
            this.cacheExpiry.set(translationKey, data.expiry);
          } else {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      console.warn('Failed to load translations from localStorage:', e);
    }
  }

  cleanExpiredCache() {
    const now = Date.now();
    for (const [key, expiry] of this.cacheExpiry.entries()) {
      if (now >= expiry) {
        this.cache.delete(key);
        this.cacheExpiry.delete(key);
        try {
          localStorage.removeItem(`translation_${key}`);
        } catch (e) {
          // Silent fail
        }
      }
    }
  }

  async rateLimitedRequest(requestFn) {
    // FIXED: Check if we're in backoff period due to rate limiting
    const now = Date.now();
    if (this.backoffUntil > now) {
      const waitTime = this.backoffUntil - now;
      console.warn(`Translation in backoff period. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }

    // Check request count window
    const timeSinceWindowStart = now - this.requestWindowStart;
    if (timeSinceWindowStart >= 60000) {
      this.requestCount = 0;
      this.requestWindowStart = now;
    }

    if (this.requestCount >= this.maxRequestsPerMinute) {
      const waitTime = 60000 - timeSinceWindowStart;
      console.warn(`Translation rate limit reached. Waiting ${waitTime}ms`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
      this.requestCount = 0;
      this.requestWindowStart = Date.now();
    }

    // Ensure minimum delay between requests
    const timeSinceLastRequest = Date.now() - this.lastRequestTime;
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve =>
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }

    this.lastRequestTime = Date.now();
    this.requestCount++;

    try {
      return await requestFn();
    } catch (error) {
      // FIXED: Handle 429 errors with exponential backoff
      if (error.message && error.message.includes('429')) {
        const backoffTime = Math.min(30000 * Math.pow(2, this.requestCount), 300000); // Max 5 minutes
        this.backoffUntil = Date.now() + backoffTime;
        console.warn(`Rate limited. Backing off for ${backoffTime}ms`);
      }
      throw error;
    }
  }

  startRequestMonitor() {
    setInterval(() => {
      const now = Date.now();
      const timeSinceWindowStart = now - this.requestWindowStart;

      if (timeSinceWindowStart >= 60000) {
        this.requestCount = 0;
        this.requestWindowStart = now;
      }
    }, 10000);
  }

  async translateWithBackend(text, targetLang, sourceLang = 'en') {
    if (!this.translationEnabled || Date.now() < this.backoffUntil) {
      return text;
    }

    return this.rateLimitedRequest(async () => {
      const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
      const response = await fetch(`${BACKEND_URL}/api/translate/translate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: text,
          source: sourceLang,
          target: targetLang,
          service: 'auto'
        })
      });

      if (response.status === 429) {
        throw new Error('429 Rate limited');
      }

      if (!response.ok) {
        throw new Error(`Backend translation API error: ${response.status}`);
      }

      const data = await response.json();
      return data.translation || text;
    });
  }

  async translate(text, targetLang, sourceLang = 'en') {
    if (targetLang === sourceLang || targetLang === 'en' || !this.translationEnabled || Date.now() < this.backoffUntil) {
      return text;
    }

    const cached = this.getFromCache(text, targetLang, sourceLang);
    if (cached) {
      return cached;
    }

    if (!this.isOnline) {
      console.warn('Offline: returning original text');
      return text;
    }

    const requestKey = this.getCacheKey(text, targetLang, sourceLang);
    if (this.requestQueue.has(requestKey)) {
      return this.requestQueue.get(requestKey);
    }

    const translationPromise = this.performTranslation(text, targetLang, sourceLang);
    this.requestQueue.set(requestKey, translationPromise);

    try {
      const result = await translationPromise;
      this.requestQueue.delete(requestKey);
      return result;
    } catch (error) {
      this.requestQueue.delete(requestKey);
      console.warn('Translation failed, returning original text:', error.message);
      return text;
    }
  }

  async performTranslation(text, targetLang, sourceLang) {
    try {
      const translation = await this.translateWithBackend(text, targetLang, sourceLang);
      if (translation && translation !== text) {
        this.setCache(text, targetLang, translation, sourceLang);
        return translation;
      }
    } catch (error) {
      console.warn('Backend translation failed:', error.message);
    }

    return text;
  }

  async translateBatch(texts, targetLang, sourceLang = 'en') {
    if (!this.translationEnabled || Date.now() < this.backoffUntil) {
      return texts.reduce((acc, text) => {
        acc[text] = text;
        return acc;
      }, {});
    }

    const translations = {};
    const uncachedTexts = [];

    for (const text of texts) {
      if (targetLang === sourceLang || targetLang === 'en') {
        translations[text] = text;
        continue;
      }

      const cached = this.getFromCache(text, targetLang, sourceLang);
      if (cached) {
        translations[text] = cached;
      } else {
        uncachedTexts.push(text);
      }
    }

    // FIXED: Only process a few uncached texts at a time to prevent rate limiting
    if (uncachedTexts.length > 0) {
      const batchSize = Math.min(uncachedTexts.length, 3); // Max 3 at a time
      const textsToBatch = uncachedTexts.slice(0, batchSize);
      
      try {
        const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001';
        const response = await this.rateLimitedRequest(async () => {
          return fetch(`${BACKEND_URL}/api/translate/translate/batch`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              texts: textsToBatch,
              source: sourceLang,
              target: targetLang,
              service: 'auto'
            })
          });
        });

        if (response.ok) {
          const data = await response.json();
          Object.assign(translations, data.translations);

          for (const [original, translation] of Object.entries(data.translations)) {
            if (translation && translation !== original) {
              this.setCache(original, targetLang, translation, sourceLang);
            }
          }
        } else {
          console.warn('Batch translation failed, using original texts');
          textsToBatch.forEach(text => {
            translations[text] = text;
          });
        }

        // For remaining texts, just use originals to avoid more rate limiting
        uncachedTexts.slice(batchSize).forEach(text => {
          translations[text] = text;
        });
      } catch (error) {
        console.warn('Batch translation failed:', error.message);
        uncachedTexts.forEach(text => {
          translations[text] = text;
        });
      }
    }

    return translations;
  }

  // FIXED: Much more conservative preloading
  async preloadTranslations(targetLang, sourceLang = 'en') {
    if (!this.translationEnabled || targetLang === 'en' || Date.now() < this.backoffUntil) {
      return;
    }

    // Only preload the most essential texts
    const essentialTexts = ['Home', 'About', 'Projects', 'Contact'];

    try {
      await this.translateBatch(essentialTexts, targetLang, sourceLang);
      console.log(`Preloaded ${essentialTexts.length} essential translations for ${targetLang}`);
    } catch (error) {
      console.warn('Failed to preload translations:', error);
    }
  }

  async preloadEssentialTranslations(targetLang, sourceLang = 'en') {
    // FIXED: Don't preload during development to reduce requests
    if (import.meta.env.DEV) {
      console.log('Skipping translation preload in development');
      return;
    }

    if (!this.translationEnabled || targetLang === 'en' || Date.now() < this.backoffUntil) {
      return;
    }

    const essentialTexts = ['Home', 'About', 'Projects', 'Contact'];

    try {
      await this.translateBatch(essentialTexts, targetLang, sourceLang);
      console.log(`Preloaded ${essentialTexts.length} essential translations for ${targetLang}`);
    } catch (error) {
      console.warn('Failed to preload essential translations:', error);
    }
  }

  startBatchProcessor() {
    setInterval(() => {
      this.processPendingRequests();
    }, this.batchDelay);
  }

  async processPendingRequests() {
    if (this.pendingRequests.size === 0 || Date.now() < this.backoffUntil) return;

    const requestsByLang = new Map();

    for (const [key, request] of this.pendingRequests) {
      const { targetLang, sourceLang } = request;
      const langKey = `${sourceLang}:${targetLang}`;

      if (!requestsByLang.has(langKey)) {
        requestsByLang.set(langKey, []);
      }
      requestsByLang.get(langKey).push(request);
    }

    for (const [langKey, requests] of requestsByLang) {
      const [sourceLang, targetLang] = langKey.split(':');
      
      // FIXED: Process only a few requests at a time
      const requestsToProcess = requests.slice(0, 3);
      const texts = requestsToProcess.map(r => r.text);

      try {
        const translations = await this.translateBatch(texts, targetLang, sourceLang);

        for (const request of requestsToProcess) {
          const translation = translations[request.text] || request.text;
          request.resolve(translation);
        }

        // Remove processed requests
        requestsToProcess.forEach(request => {
          const key = this.getCacheKey(request.text, request.targetLang, request.sourceLang);
          this.pendingRequests.delete(key);
        });
      } catch (error) {
        for (const request of requestsToProcess) {
          request.resolve(request.text);
          const key = this.getCacheKey(request.text, request.targetLang, request.sourceLang);
          this.pendingRequests.delete(key);
        }
      }
    }
  }

  async translateWithBatching(text, targetLang, sourceLang = 'en') {
    return new Promise((resolve, reject) => {
      const requestKey = this.getCacheKey(text, targetLang, sourceLang);

      if (this.pendingRequests.has(requestKey)) {
        return this.pendingRequests.get(requestKey);
      }

      this.pendingRequests.set(requestKey, {
        text,
        targetLang,
        sourceLang,
        resolve,
        reject
      });
    });
  }
}

export const translationService = new TranslationService();

// FIXED: Reduce cache cleaning frequency to prevent additional load
setInterval(() => {
  translationService.cleanExpiredCache();
}, 24 * 60 * 60 * 1000); // Every 24 hours instead of every hour

export default translationService;