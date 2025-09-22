import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

const ThemeToggle = ({ className = '' }) => {
  const { theme, toggleTheme, isDark } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className={`
        relative inline-flex items-center justify-center p-2 rounded-lg
        transition-all duration-300 ease-in-out
        hover:bg-gray-200 dark:hover:bg-gray-700
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        focus:ring-offset-white dark:focus:ring-offset-gray-900
        ${className}
      `}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
      title={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      <div className="relative w-5 h-5">
        {/* Sun Icon */}
        <Sun 
          className={`
            absolute inset-0 w-5 h-5 text-yellow-500
            transition-all duration-300 ease-in-out
            ${isDark 
              ? 'opacity-0 rotate-90 scale-0' 
              : 'opacity-100 rotate-0 scale-100'
            }
          `}
        />
        
        {/* Moon Icon */}
        <Moon 
          className={`
            absolute inset-0 w-5 h-5 text-blue-400
            transition-all duration-300 ease-in-out
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