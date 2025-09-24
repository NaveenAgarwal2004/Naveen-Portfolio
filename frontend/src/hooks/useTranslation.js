import { useCallback, useEffect, useState, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

export const useTranslation = (texts = []) => {
  const { tSync, translateBatch, currentLanguage, isLoading } = useLanguage();
  const [translations, setTranslations] = useState({});
  const [isTranslating, setIsTranslating] = useState(false);
  const [hasInitialized, setHasInitialized] = useState(false);
  const textsRef = useRef([]);
  const timeoutRef = useRef(null);

  // Memoize texts array to prevent unnecessary re-renders
  const textsChanged = JSON.stringify(texts) !== JSON.stringify(textsRef.current);
  
  useEffect(() => {
    // Only proceed if texts have changed or language has changed
    if (!textsChanged && hasInitialized) {
      return;
    }

    textsRef.current = texts;

    // Clear any pending timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Return early for English or empty texts
    if (currentLanguage === 'en' || texts.length === 0) {
      setTranslations({});
      setIsTranslating(false);
      setHasInitialized(true);
      return;
    }

    // Debounce translation requests to avoid rapid-fire calls
    timeoutRef.current = setTimeout(async () => {
      setIsTranslating(true);
      
      try {
        const translatedTexts = await translateBatch(texts);
        setTranslations(translatedTexts);
      } catch (error) {
        console.warn('Translation batch failed:', error);
        // Set fallback translations (original text)
        const fallbackTranslations = {};
        texts.forEach(text => {
          fallbackTranslations[text] = text;
        });
        setTranslations(fallbackTranslations);
      } finally {
        setIsTranslating(false);
        setHasInitialized(true);
      }
    }, 300); // 300ms debounce

    // Cleanup function
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [texts, currentLanguage, translateBatch, textsChanged, hasInitialized]);

  const getText = useCallback((key, fallback) => {
    if (currentLanguage === 'en') return fallback || key;
    
    // Use the passed fallback first, then try sync translation, then use key
    const text = fallback || key;
    return translations[text] || tSync(key, text);
  }, [translations, tSync, currentLanguage]);

  return {
    t: getText,
    isTranslating: isTranslating || (isLoading && currentLanguage !== 'en'),
    translations,
    currentLanguage
  };
};