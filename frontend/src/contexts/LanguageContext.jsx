import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Language configurations
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
  }
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    // Check for saved language preference
    const savedLanguage = localStorage.getItem('portfolio-language');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
      return savedLanguage;
    }
    
    // Check browser language
    const browserLanguage = navigator.language.split('-')[0];
    if (LANGUAGES[browserLanguage]) {
      return browserLanguage;
    }
    
    return 'en'; // Default to English
  });

  const [translations, setTranslations] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    loadTranslations(currentLanguage);
    localStorage.setItem('portfolio-language', currentLanguage);
    
    // Update HTML lang attribute
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const loadTranslations = async (languageCode) => {
    if (languageCode === 'en') {
      // English is the default, no need to load translations
      setTranslations({});
      return;
    }

    setIsLoading(true);
    try {
      const response = await import(`../translations/${languageCode}.json`);
      setTranslations(response.default);
    } catch (error) {
      console.warn(`Failed to load translations for ${languageCode}:`, error);
      setTranslations({});
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (languageCode) => {
    if (LANGUAGES[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const t = (key, fallback = key) => {
    if (currentLanguage === 'en') {
      return fallback;
    }
    
    const keys = key.split('.');
    let value = translations;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return fallback;
      }
    }
    
    return typeof value === 'string' ? value : fallback;
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isLoading,
    languages: LANGUAGES,
    isRTL: ['ar', 'he', 'fa'].includes(currentLanguage)
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export default LanguageContext;