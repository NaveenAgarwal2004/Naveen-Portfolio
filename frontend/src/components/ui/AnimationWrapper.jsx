import React, { useState, useEffect, useRef } from 'react';

// Scroll-triggered animation wrapper
export const ScrollAnimationWrapper = ({ 
  children, 
  className = '', 
  animation = 'slideUp', 
  delay = 0, 
  threshold = 0.1,
  triggerOnce = true 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setTimeout(() => setIsVisible(true), delay);
          if (triggerOnce) {
            observer.disconnect();
          }
        } else if (!triggerOnce) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (elementRef.current) {
      observer.observe(elementRef.current);
    }

    return () => observer.disconnect();
  }, [delay, threshold, triggerOnce]);

  const getAnimationClasses = () => {
    const baseClasses = 'transition-all duration-1000 ease-out';
    
    switch (animation) {
      case 'slideUp':
        return `${baseClasses} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`;
      case 'slideDown':
        return `${baseClasses} ${isVisible ? 'translate-y-0 opacity-100' : '-translate-y-12 opacity-0'}`;
      case 'slideLeft':
        return `${baseClasses} ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0'}`;
      case 'slideRight':
        return `${baseClasses} ${isVisible ? 'translate-x-0 opacity-100' : '-translate-x-12 opacity-0'}`;
      case 'fade':
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
      case 'scale':
        return `${baseClasses} ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;
      case 'rotate':
        return `${baseClasses} ${isVisible ? 'rotate-0 opacity-100' : 'rotate-3 opacity-0'}`;
      default:
        return `${baseClasses} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-12 opacity-0'}`;
    }
  };

  return (
    <div ref={elementRef} className={`${getAnimationClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Stagger children animation
export const StaggerWrapper = ({ children, className = '', delay = 100 }) => {
  return (
    <div className={className}>
      {React.Children.map(children, (child, index) => (
        <ScrollAnimationWrapper delay={index * delay}>
          {child}
        </ScrollAnimationWrapper>
      ))}
    </div>
  );
};

// Hover animation wrapper - Workshop Theme
export const HoverAnimationWrapper = ({ 
  children, 
  className = '', 
  hoverEffect = 'lift',
  disabled = false 
}) => {
  if (disabled) return children;

  const getHoverClasses = () => {
    switch (hoverEffect) {
      case 'lift':
        return 'transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-xl';
      case 'glow':
        return 'transition-all duration-300 hover:shadow-2xl hover:shadow-forge-orange/25';
      case 'rotate':
        return 'transform transition-all duration-300 hover:rotate-1 hover:scale-105';
      case 'pulse':
        return 'transition-all duration-300 hover:animate-pulse';
      case 'bounce':
        return 'transform transition-all duration-300 hover:animate-bounce';
      case 'float':
        return 'transform transition-all duration-300 hover:-translate-y-2 hover:shadow-lg';
      default:
        return 'transform transition-all duration-300 hover:scale-105';
    }
  };

  return (
    <div className={`${getHoverClasses()} ${className}`}>
      {children}
    </div>
  );
};

// Typing animation hook
export const useTypingAnimation = (text, speed = 50, startDelay = 0) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isStarted, setIsStarted] = useState(false);

  useEffect(() => {
    const startTimer = setTimeout(() => setIsStarted(true), startDelay);
    return () => clearTimeout(startTimer);
  }, [startDelay]);

  useEffect(() => {
    if (!isStarted || currentIndex >= text.length) return;
    
    const timer = setTimeout(() => {
      setDisplayText(prev => prev + text[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, speed);

    return () => clearTimeout(timer);
  }, [currentIndex, text, speed, isStarted]);

  return { displayText, isComplete: currentIndex >= text.length };
};

// Parallax scroll effect
export const useParallaxScroll = (speed = 0.5) => {
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const handleScroll = () => setOffset(window.pageYOffset);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return { transform: `translateY(${offset * speed}px)` };
};

export default {
  ScrollAnimationWrapper,
  StaggerWrapper,
  HoverAnimationWrapper,
  useTypingAnimation,
  useParallaxScroll
};
