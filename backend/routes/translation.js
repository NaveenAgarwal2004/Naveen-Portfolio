const express = require('express');
const router = express.Router();

// In-memory cache for translations
const translationCache = new Map();
const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours
let requestCount = 0;
let lastResetTime = Date.now();
const MAX_REQUESTS_PER_MINUTE = 30;

// Rate limiting middleware specifically for translation
const translationRateLimit = (req, res, next) => {
  const now = Date.now();
  
  // Reset counter every minute
  if (now - lastResetTime > 60000) {
    requestCount = 0;
    lastResetTime = now;
  }
  
  if (requestCount >= MAX_REQUESTS_PER_MINUTE) {
    return res.status(429).json({
      success: false,
      error: 'Translation rate limit exceeded. Please try again later.',
      translation: req.body.text || ''
    });
  }
  
  requestCount++;
  next();
};

// Helper function to get from cache
const getCachedTranslation = (text, source, target) => {
  const key = `${source}:${target}:${text}`;
  const cached = translationCache.get(key);
  
  if (cached && Date.now() < cached.expiry) {
    return cached.translation;
  }
  
  // Clean expired entries
  if (cached && Date.now() >= cached.expiry) {
    translationCache.delete(key);
  }
  
  return null;
};

// Helper function to set cache
const setCachedTranslation = (text, source, target, translation) => {
  const key = `${source}:${target}:${text}`;
  translationCache.set(key, {
    translation,
    expiry: Date.now() + CACHE_DURATION
  });
  
  // Cleanup old cache entries if cache gets too large
  if (translationCache.size > 10000) {
    const entriesToDelete = [];
    for (const [cacheKey, value] of translationCache.entries()) {
      if (Date.now() >= value.expiry) {
        entriesToDelete.push(cacheKey);
      }
    }
    entriesToDelete.forEach(key => translationCache.delete(key));
  }
};

// Helper function to translate via external service
const translateText = async (text, source, target, service = 'auto') => {
  // Mock implementation - replace with actual translation service
  // For now, just return the original text to prevent errors
  console.log(`Translation request: "${text}" from ${source} to ${target} using ${service}`);
  
  // You can implement actual translation services here:
  // - Google Translate API
  // - LibreTranslate
  // - MyMemory
  // - Azure Translator
  
  // For development, return original text
  if (target === source || target === 'en') {
    return text;
  }
  
  // Basic mock translations for common phrases
  const mockTranslations = {
    'es': {
      'Home': 'Inicio',
      'About': 'Acerca de',
      'Projects': 'Proyectos',
      'Contact': 'Contacto',
      'Skills': 'Habilidades',
      'Resume': 'Currículum',
      'Certificates': 'Certificados',
      'Loading...': 'Cargando...',
      'Error': 'Error',
      'Success': 'Éxito',
      'Available for work': 'Disponible para trabajar'
    },
    'fr': {
      'Home': 'Accueil',
      'About': 'À propos',
      'Projects': 'Projets',
      'Contact': 'Contact',
      'Skills': 'Compétences',
      'Resume': 'CV',
      'Certificates': 'Certificats',
      'Loading...': 'Chargement...',
      'Error': 'Erreur',
      'Success': 'Succès',
      'Available for work': 'Disponible pour le travail'
    },
    'de': {
      'Home': 'Startseite',
      'About': 'Über',
      'Projects': 'Projekte',
      'Contact': 'Kontakt',
      'Skills': 'Fähigkeiten',
      'Resume': 'Lebenslauf',
      'Certificates': 'Zertifikate',
      'Loading...': 'Laden...',
      'Error': 'Fehler',
      'Success': 'Erfolg',
      'Available for work': 'Verfügbar für Arbeit'
    },
    'hi': {
      'Home': 'होम',
      'About': 'के बारे में',
      'Projects': 'परियोजनाएं',
      'Contact': 'संपर्क',
      'Skills': 'कौशल',
      'Resume': 'बायोडेटा',
      'Certificates': 'प्रमाणपत्र',
      'Loading...': 'लोड हो रहा है...',
      'Error': 'त्रुटि',
      'Success': 'सफलता',
      'Available for work': 'काम के लिए उपलब्ध'
    }
  };
  
  // Return mock translation if available
  if (mockTranslations[target] && mockTranslations[target][text]) {
    return mockTranslations[target][text];
  }
  
  // Return original text as fallback
  return text;
};

// Single translation endpoint
router.post('/translate', translationRateLimit, async (req, res) => {
  try {
    const { text, source = 'en', target, service = 'auto' } = req.body;

    if (!text || !target) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: text and target language',
        translation: text || ''
      });
    }

    // Return original text if same language or targeting English
    if (source === target || target === 'en') {
      return res.json({
        success: true,
        translation: text,
        original: text,
        source,
        target
      });
    }

    // Check cache first
    const cachedTranslation = getCachedTranslation(text, source, target);
    if (cachedTranslation) {
      return res.json({
        success: true,
        translation: cachedTranslation,
        original: text,
        source,
        target,
        cached: true
      });
    }

    try {
      const translation = await translateText(text, source, target, service);
      
      // Cache the result
      setCachedTranslation(text, source, target, translation);

      res.json({
        success: true,
        translation,
        original: text,
        source,
        target
      });

    } catch (error) {
      console.error('Translation error:', error);
      res.json({
        success: false,
        error: 'Translation service unavailable',
        translation: text, // Return original text as fallback
        original: text,
        source,
        target
      });
    }

  } catch (error) {
    console.error('Translation route error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      translation: req.body.text || '',
      original: req.body.text || '',
      source: req.body.source || 'en',
      target: req.body.target || 'en'
    });
  }
});

// Batch translation endpoint
router.post('/translate/batch', translationRateLimit, async (req, res) => {
  try {
    const { texts, source = 'en', target, service = 'auto' } = req.body;

    if (!texts || !Array.isArray(texts) || !target) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameters: texts array and target language',
        translations: {}
      });
    }

    const translations = {};
    const uncachedTexts = [];

    // Check cache for each text
    for (const text of texts) {
      if (source === target || target === 'en') {
        translations[text] = text;
        continue;
      }

      const cachedTranslation = getCachedTranslation(text, source, target);
      if (cachedTranslation) {
        translations[text] = cachedTranslation;
      } else {
        uncachedTexts.push(text);
      }
    }

    // Translate uncached texts
    for (const text of uncachedTexts) {
      try {
        const translation = await translateText(text, source, target, service);
        translations[text] = translation;
        
        // Cache the result
        setCachedTranslation(text, source, target, translation);
        
        // Add small delay to avoid overwhelming services
        if (uncachedTexts.length > 1) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.warn(`Failed to translate: "${text}"`, error);
        translations[text] = text; // Fallback to original
      }
    }

    res.json({
      success: true,
      translations,
      source,
      target
    });

  } catch (error) {
    console.error('Batch translation error:', error);
    res.status(500).json({
      success: false,
      error: 'Batch translation failed',
      translations: {}
    });
  }
});

// Get supported languages
router.get('/languages', (req, res) => {
  res.json({
    success: true,
    languages: {
      en: { name: 'English', nativeName: 'English' },
      es: { name: 'Spanish', nativeName: 'Español' },
      fr: { name: 'French', nativeName: 'Français' },
      de: { name: 'German', nativeName: 'Deutsch' },
      hi: { name: 'Hindi', nativeName: 'हिन्दी' },
      zh: { name: 'Chinese', nativeName: '中文' },
      ja: { name: 'Japanese', nativeName: '日本語' },
      pt: { name: 'Portuguese', nativeName: 'Português' },
      ru: { name: 'Russian', nativeName: 'Русский' },
      ar: { name: 'Arabic', nativeName: 'العربية' },
      ko: { name: 'Korean', nativeName: '한국어' },
      it: { name: 'Italian', nativeName: 'Italiano' }
    }
  });
});

// Cache statistics endpoint (for debugging)
router.get('/cache/stats', (req, res) => {
  const now = Date.now();
  let validEntries = 0;
  let expiredEntries = 0;
  
  for (const [key, value] of translationCache.entries()) {
    if (now < value.expiry) {
      validEntries++;
    } else {
      expiredEntries++;
    }
  }
  
  res.json({
    success: true,
    cache: {
      totalEntries: translationCache.size,
      validEntries,
      expiredEntries,
      requestCount,
      lastResetTime: new Date(lastResetTime).toISOString()
    }
  });
});

// Clear cache endpoint (admin only)
router.post('/cache/clear', (req, res) => {
  translationCache.clear();
  requestCount = 0;
  lastResetTime = Date.now();
  
  res.json({
    success: true,
    message: 'Translation cache cleared'
  });
});

module.exports = router;