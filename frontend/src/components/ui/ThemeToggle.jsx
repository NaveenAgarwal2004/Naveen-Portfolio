import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark, isTransitioning } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      disabled={isTransitioning}
      className={`
        relative inline-flex items-center justify-center p-2 rounded-lg
        transition-all duration-300 ease-in-out
        hover:bg-gray-200 dark:hover:bg-gray-700
        hover:scale-110 active:scale-95
        focus:outline-none focus:ring-2 focus:ring-forge-orange focus:ring-offset-2
        focus:ring-offset-white dark:focus:ring-offset-gray-900
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        <Sun
          className={`
            absolute inset-0 w-5 h-5 text-yellow-500
            transition-all duration-500 ease-in-out
            ${isDark
              ? 'opacity-0 rotate-90 scale-0'
              : 'opacity-100 rotate-0 scale-100'
            }
            ${!isDark && 'animate-spin-slow'}
          `}
        />

        <Moon
          className={`
            absolute inset-0 w-5 h-5 text-clay
            transition-all duration-500 ease-in-out
            ${isDark
              ? 'opacity-100 rotate-0 scale-100'
              : 'opacity-0 -rotate-90 scale-0'
            }
          `}
        />
      </div>
    </button>
  );
};

export default ThemeToggle;
