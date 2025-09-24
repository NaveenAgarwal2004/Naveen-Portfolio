import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { translationService } from '../services/translationService';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LANGUAGES = {
  en: {
    code: 'en',
    name: 'English',
    nativeName: 'English',
    flag: '🇺🇸'
  },
  es: {
    code: 'es',
    name: 'Spanish',
    nativeName: 'Español',
    flag: '🇪🇸'
  },
  fr: {
    code: 'fr',
    name: 'French',
    nativeName: 'Français',
    flag: '🇫🇷'
  },
  de: {
    code: 'de',
    name: 'German',
    nativeName: 'Deutsch',
    flag: '🇩🇪'
  },
  hi: {
    code: 'hi',
    name: 'Hindi',
    nativeName: 'हिन्दी',
    flag: '🇮🇳'
  },
  zh: {
    code: 'zh',
    name: 'Chinese',
    nativeName: '中文',
    flag: '🇨🇳'
  },
  ja: {
    code: 'ja',
    name: 'Japanese',
    nativeName: '日本語',
    flag: '🇯🇵'
  },
  pt: {
    code: 'pt',
    name: 'Portuguese',
    nativeName: 'Português',
    flag: '🇵🇹'
  },
  ru: {
    code: 'ru',
    name: 'Russian',
    nativeName: 'Русский',
    flag: '🇷🇺'
  },
  ar: {
    code: 'ar',
    name: 'Arabic',
    nativeName: 'العربية',
    flag: '🇸🇦'
  },
  ko: {
    code: 'ko',
    name: 'Korean',
    nativeName: '한국어',
    flag: '🇰🇷'
  },
  it: {
    code: 'it',
    name: 'Italian',
    nativeName: 'Italiano',
    flag: '🇮🇹'
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('portfolio-language');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }
    
    const browserLanguage = navigator.language.split('-')[0];
    if (LANGUAGES[browserLanguage]) {
      return browserLanguage;
    }
    
    return 'en';
  });

  const [isLoading, setIsLoading] = useState(false);
  const [translationCache, setTranslationCache] = useState(new Map());
  const [preloadComplete, setPreloadComplete] = useState(false);

  useEffect(() => {
    localStorage.setItem('portfolio-language', currentLanguage);
    document.documentElement.lang = currentLanguage;
    document.documentElement.dir = ['ar', 'he', 'fa', 'ur'].includes(currentLanguage) ? 'rtl' : 'ltr';

    // Only preload translations if language is not English and preload hasn't been completed for this language
    if (currentLanguage !== 'en' && !preloadComplete) {
      setIsLoading(true);
      
      // Debounce preloading to avoid multiple calls
      const preloadTimer = setTimeout(async () => {
        try {
          await translationService.preloadEssentialTranslations(currentLanguage);
          setPreloadComplete(true);
        } catch (error) {
          console.warn('Preload failed:', error);
        } finally {
          setIsLoading(false);
        }
      }, 500);

      return () => clearTimeout(preloadTimer);
    } else {
      setIsLoading(false);
    }
  }, [currentLanguage, preloadComplete]);

  const changeLanguage = useCallback((languageCode) => {
    if (LANGUAGES[languageCode] && languageCode !== currentLanguage) {
      setIsLoading(true);
      setCurrentLanguage(languageCode);
      // Clear cache and preload status when language changes
      setTranslationCache(new Map());
      setPreloadComplete(false);
      
      // Reset loading state after a short delay
      setTimeout(() => setIsLoading(false), 1000);
    }
  }, [currentLanguage]);

  const t = useCallback(async (key, fallback = key) => {
    if (currentLanguage === 'en' || !key) {
      return fallback;
    }

    try {
      const cacheKey = `${currentLanguage}:${key}`;
      if (translationCache.has(cacheKey)) {
        return translationCache.get(cacheKey);
      }

      const translation = await translationService.translate(fallback, currentLanguage);
      
      setTranslationCache(prev => new Map(prev.set(cacheKey, translation)));
      
      return translation;
    } catch (error) {
      console.warn(`Translation failed for key: ${key}`, error);
      return fallback;
    }
  }, [currentLanguage, translationCache]);

  const tSync = useCallback((key, fallback = key) => {
    if (currentLanguage === 'en' || !key) {
      return fallback;
    }

    const cacheKey = `${currentLanguage}:${key}`;
    return translationCache.get(cacheKey) || fallback;
  }, [currentLanguage, translationCache]);

  const translateBatch = useCallback(async (texts) => {
    if (currentLanguage === 'en') {
      return texts.reduce((acc, text) => {
        acc[text] = text;
        return acc;
      }, {});
    }

    // Check cache first
    const cachedTranslations = {};
    const uncachedTexts = [];

    texts.forEach(text => {
      const cacheKey = `${currentLanguage}:${text}`;
      if (translationCache.has(cacheKey)) {
        cachedTranslations[text] = translationCache.get(cacheKey);
      } else {
        uncachedTexts.push(text);
      }
    });

    // Only make API call if there are uncached texts
    if (uncachedTexts.length === 0) {
      return cachedTranslations;
    }

    try {
      const translations = await translationService.translateBatch(uncachedTexts, currentLanguage);
      
      // Merge cached and new translations
      const allTranslations = { ...cachedTranslations, ...translations };
      
      // Update cache with new translations
      setTranslationCache(prev => {
        const newCache = new Map(prev);
        Object.entries(translations).forEach(([key, value]) => {
          newCache.set(`${currentLanguage}:${key}`, value);
        });
        return newCache;
      });
      
      return allTranslations;
    } catch (error) {
      console.warn('Batch translation failed:', error);
      // Return cached translations + original text for uncached
      const fallbackTranslations = { ...cachedTranslations };
      uncachedTexts.forEach(text => {
        fallbackTranslations[text] = text;
      });
      return fallbackTranslations;
    }
  }, [currentLanguage, translationCache]);

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    tSync,
    translateBatch,
    isLoading,
    languages: LANGUAGES,
    isRTL: ['ar', 'he', 'fa', 'ur'].includes(currentLanguage)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;