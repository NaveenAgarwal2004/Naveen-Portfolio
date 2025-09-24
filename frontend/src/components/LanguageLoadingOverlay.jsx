import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const LanguageLoadingOverlay = () => {
  const { isLoading, currentLanguage, languages } = useLanguage();

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999]">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-8 text-center max-w-sm mx-4">
        <div className="text-6xl mb-4">{languages[currentLanguage]?.flag}</div>
        <div className="animate-spin w-8 h-8 border-2 border-blue-500/30 border-t-blue-500 rounded-full mx-auto mb-4"></div>
        <h3 className="text-white text-lg font-semibold mb-2">
          Switching Language
        </h3>
        <p className="text-gray-400 text-sm">
          Loading {languages[currentLanguage]?.nativeName}...
        </p>
      </div>
    </div>
  );
};

export default LanguageLoadingOverlay;