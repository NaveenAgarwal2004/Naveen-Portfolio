import { useEffect, useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

export const useGracefulTransitions = () => {
  const { isTransitioning: isThemeTransitioning, theme } = useTheme();
  const { isLoading: isLanguageLoading, currentLanguage } = useLanguage();
  const [isAnyTransitioning, setIsAnyTransitioning] = useState(false);

  useEffect(() => {
    setIsAnyTransitioning(isThemeTransitioning || isLanguageLoading);
  }, [isThemeTransitioning, isLanguageLoading]);

  return {
    isTransitioning: isAnyTransitioning,
    isThemeTransitioning,
    isLanguageLoading,
    currentTheme: theme,
    currentLanguage,
    transitionStatus: {
      theme: isThemeTransitioning ? 'transitioning' : 'idle',
      language: isLanguageLoading ? 'loading' : 'ready'
    }
  };
};

export default useGracefulTransitions;
