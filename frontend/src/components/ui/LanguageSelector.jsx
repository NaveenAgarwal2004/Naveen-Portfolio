import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Globe, Check } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { useTheme } from '../../contexts/ThemeContext';

const LanguageSelector = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, languages, isLoading } = useLanguage();
  const { isDark } = useTheme();
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
          hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-500
          disabled:opacity-50 disabled:cursor-not-allowed
        "
        disabled={isLoading}
        aria-label="Select language"
        aria-expanded={isOpen}
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
        <div className={`
          absolute top-full left-0 mt-2 min-w-48 z-50
          rounded-xl shadow-2xl border
          animate-in fade-in slide-in-from-top-4 zoom-in-95 duration-300
          ${isDark
            ? 'bg-gray-900/95 border-gray-700/50 backdrop-blur-xl'
            : 'bg-white/95 border-gray-200/50 backdrop-blur-xl'
          }
        `}>
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
                  <Check className="w-4 h-4 text-blue-500 shrink-0" />
                )}
              </button>
            ))}
          </div>
          
          <div className={`border-t px-4 py-2 ${
            isDark ? 'border-gray-700/50' : 'border-gray-200/50'
          }`}>
            <p className={`text-xs text-center ${
              isDark ? 'text-gray-500' : 'text-gray-400'
            }`}>
              More languages coming soon
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;