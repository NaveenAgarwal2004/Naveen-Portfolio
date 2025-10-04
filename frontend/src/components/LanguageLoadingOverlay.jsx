import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';

const LanguageLoadingOverlay = () => {
  const { isLoading, currentLanguage, languages } = useLanguage();
  const { isDark } = useTheme();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] transition-opacity duration-300 animate-in fade-in">
      <div className={`rounded-2xl p-8 text-center max-w-sm mx-4 shadow-2xl transform transition-all duration-300 animate-in slide-in-from-bottom-4 zoom-in-95 ${
        isDark
          ? 'bg-gray-900 border border-gray-700'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="text-6xl mb-4 animate-bounce">{languages[currentLanguage]?.flag}</div>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"></div>
        <h3 className={`text-lg font-semibold mb-2 ${
          isDark ? 'text-white' : 'text-gray-900'
        }`}>
          Switching Language
        </h3>
        <p className={`text-sm ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          Loading {languages[currentLanguage]?.nativeName}...
        </p>
      </div>
    </div>
  );
};

export default LanguageLoadingOverlay;