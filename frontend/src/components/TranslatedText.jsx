import React, { useState, useEffect, useMemo } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TranslatedText = ({ 
  children, 
  fallback, 
  className = '', 
  tag: Tag = 'span',
  showLoader = false,
  ...props 
}) => {
  const { tSync, currentLanguage } = useLanguage();
  const [translatedText, setTranslatedText] = useState('');
  const [isTranslating, setIsTranslating] = useState(false);

  // Memoize the original text to prevent unnecessary re-renders
  const originalText = useMemo(() => {
    return children || fallback || '';
  }, [children, fallback]);

  useEffect(() => {
    // If language is English or text is empty, use original text
    if (currentLanguage === 'en' || !originalText) {
      setTranslatedText(originalText);
      setIsTranslating(false);
      return;
    }

    // Try to get cached translation first
    const cachedTranslation = tSync('', originalText);
    
    if (cachedTranslation && cachedTranslation !== originalText) {
      // We have a cached translation
      setTranslatedText(cachedTranslation);
      setIsTranslating(false);
    } else {
      // No cached translation available, use original text as fallback
      setTranslatedText(originalText);
      setIsTranslating(false);
      
      // Note: We don't make individual translation requests here anymore
      // Instead, we rely on the parent components to batch translate
      // the texts they need using useTranslation hook
    }
  }, [originalText, currentLanguage, tSync]);

  return (
    <Tag className={`${className} ${isTranslating ? 'opacity-75' : ''}`} {...props}>
      {translatedText}
      {showLoader && isTranslating && (
        <span className="ml-1 animate-pulse text-xs">...</span>
      )}
    </Tag>
  );
};

export default TranslatedText;