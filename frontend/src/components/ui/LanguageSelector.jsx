import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

const LanguageSelector = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, languages, isLoading } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef();

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLanguageChange = (languageCode) => {
    changeLanguage(languageCode);
    setIsOpen(false);
  };

  const currentLang = languages[currentLanguage];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="
          flex items-center gap-2 px-3 py-2 rounded-lg
          theme-button-secondary theme-transition
          hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        disabled={isLoading}
        aria-label="Select language"
      >
        <Globe className="w-4 h-4" />
        <span className="text-lg">{currentLang.flag}</span>
        <span className="text-sm font-medium hidden sm:inline">
          {currentLang.nativeName}
        </span>
        <ChevronDown 
          className={`w-4 h-4 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`} 
        />
      </button>

      {isOpen && (
        <div className="
          absolute top-full left-0 mt-2 min-w-48 z-50
          theme-card rounded-xl shadow-xl border theme-border
          animate-in fade-in slide-in-from-top-2 duration-200
        ">
          <div className="py-2">
            {Object.values(languages).map((language) => (
              <button
                key={language.code}
                onClick={() => handleLanguageChange(language.code)}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 text-left
                  hover:theme-bg-tertiary theme-transition
                  ${currentLanguage === language.code 
                    ? 'theme-bg-tertiary theme-text-primary' 
                    : 'theme-text-secondary'
                  }
                `}
              >
                <span className="text-lg">{language.flag}</span>
                <div className="flex-1">
                  <div className="font-medium">{language.nativeName}</div>
                  <div className="text-xs theme-text-tertiary">{language.name}</div>
                </div>
                {currentLanguage === language.code && (
                  <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                )}
              </button>
            ))}
          </div>
          
          <div className="border-t theme-border px-4 py-2">
            <p className="text-xs theme-text-tertiary text-center">
              🌍 More languages coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;