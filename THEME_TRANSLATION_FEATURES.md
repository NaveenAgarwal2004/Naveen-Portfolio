# Theme & Translation Features Documentation

## Overview

The portfolio now features gracefully coordinated theme switching and multi-language translation capabilities that work seamlessly together.

## Theme System

### Features

1. **Smooth Transitions**
   - 500ms cubic-bezier transitions for all theme changes
   - Disabled state during transitions to prevent rapid toggling
   - Visual feedback with animated sun/moon icons
   - Persistent theme preference in localStorage

2. **Theme Toggle Component**
   - Animated sun icon with slow rotation in light mode
   - Smooth moon/sun transition with rotation and scale effects
   - Hover and active states for better UX
   - Keyboard accessible with proper ARIA labels

3. **Theme Context**
   - `isTransitioning` state to track theme changes
   - System preference detection on first load
   - Meta theme-color updates for mobile browsers
   - Global transition state management

### Usage

```javascript
import { useTheme } from './contexts/ThemeContext';

const MyComponent = () => {
  const { theme, toggleTheme, isDark, isLight, isTransitioning } = useTheme();

  return (
    <button onClick={toggleTheme} disabled={isTransitioning}>
      Switch to {isDark ? 'light' : 'dark'} mode
    </button>
  );
};
```

## Translation System

### Features

1. **Multi-Language Support**
   - 12 languages: English, Spanish, French, German, Hindi, Chinese, Japanese, Portuguese, Russian, Arabic, Korean, Italian
   - Automatic browser language detection
   - Persistent language preference
   - RTL support for Arabic and other RTL languages

2. **Loading Overlay**
   - Theme-aware loading screen
   - Animated flag display
   - Smooth fade-in/out transitions
   - Bounce animation for visual feedback

3. **Rate Limiting & Caching**
   - 24-hour translation cache
   - Rate limiting (5 requests per minute)
   - Exponential backoff on 429 errors
   - LocalStorage persistence
   - Offline fallback support

4. **Batch Translation**
   - Efficient batch API calls
   - Reduced API requests
   - Cache-first strategy
   - Progressive loading

### Usage

```javascript
import { useLanguage } from './contexts/LanguageContext';
import { useTranslation } from './hooks/useTranslation';

const MyComponent = () => {
  const { currentLanguage, changeLanguage, isLoading } = useLanguage();
  const { t, tSync } = useTranslation(['Hello', 'Welcome', 'About']);

  return (
    <div>
      <h1>{tSync('greeting', 'Hello')}</h1>
      <button onClick={() => changeLanguage('es')}>
        Switch to Spanish
      </button>
    </div>
  );
};
```

## Coordinated Features

### Graceful Transitions Hook

A custom hook to coordinate theme and translation transitions:

```javascript
import { useGracefulTransitions } from './hooks/useGracefulTransitions';

const MyComponent = () => {
  const {
    isTransitioning,
    isThemeTransitioning,
    isLanguageLoading,
    transitionStatus
  } = useGracefulTransitions();

  // Use this to show loading states or disable interactions
  return <div>{isTransitioning ? 'Loading...' : 'Ready'}</div>;
};
```

## CSS Enhancements

### Custom Animations

```css
/* Slow rotating sun icon */
.animate-spin-slow {
  animation: spin-slow 20s linear infinite;
}

/* Smooth theme transitions */
.theme-transition-smooth {
  transition: background-color 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              color 0.5s cubic-bezier(0.4, 0, 0.2, 1),
              border-color 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}
```

### Global Transitions

All elements automatically receive theme transition properties:

```css
* {
  transition-property: background-color, border-color, color, fill, stroke;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 0.3s;
}
```

## Component Updates

### Enhanced Components

1. **LanguageLoadingOverlay**
   - Now theme-aware with conditional styling
   - Smooth animations using Tailwind animate classes
   - Better visual feedback with bounce animation

2. **ThemeToggle**
   - Prevents rapid clicking during transitions
   - Enhanced icon animations
   - Better accessibility

3. **LanguageSelector**
   - Theme-aware dropdown styling
   - Check icon for current language
   - Smooth dropdown animations
   - Better mobile support

## Best Practices

### Theme Integration

1. Always use CSS variables for colors
2. Apply `theme-transition` class for smooth changes
3. Check `isTransitioning` before allowing theme toggle
4. Use semantic class names (`theme-bg-primary`, etc.)

### Translation Integration

1. Use `tSync` for synchronous cached translations
2. Use `t` for async translations with loading states
3. Batch translate related text groups
4. Always provide fallback text
5. Cache translations for 24 hours

### Performance Optimization

1. Lazy load translation API calls
2. Use cached translations first
3. Batch related translation requests
4. Implement rate limiting
5. Use local storage for persistence

## Accessibility

Both features maintain high accessibility standards:

- Proper ARIA labels and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- Reduced motion support
- High contrast ratios

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- RTL language support
- System preference detection
- LocalStorage fallback

## Future Enhancements

Potential improvements for future versions:

1. Additional language support
2. Custom theme colors
3. Theme scheduling (auto dark mode at night)
4. Translation quality improvements
5. Offline translation support
6. Voice-to-text translations
