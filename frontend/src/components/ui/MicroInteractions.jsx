import React, { useState, useEffect, useRef } from 'react';

// Ripple Effect Component
export const RippleButton = ({ 
  children, 
  onClick, 
  className = '', 
  rippleColor = 'rgba(255, 255, 255, 0.3)',
  ...props 
}) => {
  const [ripples, setRipples] = useState([]);
  const buttonRef = useRef();

  const handleClick = (e) => {
    const rect = buttonRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = {
      x,
      y,
      id: Date.now()
    };
    
    setRipples(prev => [...prev, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 1000);
    
    if (onClick) onClick(e);
  };

  return (
    <button
      ref={buttonRef}
      onClick={handleClick}
      className={`relative overflow-hidden ${className}`}
      {...props}
    >
      {children}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute rounded-full animate-ping"
          style={{
            left: ripple.x - 10,
            top: ripple.y - 10,
            width: 20,
            height: 20,
            backgroundColor: rippleColor,
            pointerEvents: 'none',
            animation: 'ripple 1s ease-out'
          }}
        />
      ))}
      <style>{`
        @keyframes ripple {
          0% {
            transform: scale(0);
            opacity: 1;
          }
          100% {
            transform: scale(4);
            opacity: 0;
          }
        }
      `}</style>
    </button>
  );
};

// Magnetic Effect Component
export const MagneticWrapper = ({ children, strength = 0.3, className = '' }) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const elementRef = useRef();
  const animationRef = useRef();

  const handleMouseMove = (e) => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = (e.clientX - centerX) * strength;
    const deltaY = (e.clientY - centerY) * strength;
    
    setPosition({ x: deltaX, y: deltaY });
  };

  const handleMouseLeave = () => {
    setPosition({ x: 0, y: 0 });
  };

  return (
    <div
      ref={elementRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: `translate(${position.x}px, ${position.y}px)`
      }}
    >
      {children}
    </div>
  );
};

// Tilt Effect Component
export const TiltWrapper = ({ children, maxTilt = 10, className = '' }) => {
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const elementRef = useRef();

  const handleMouseMove = (e) => {
    if (!elementRef.current) return;
    
    const rect = elementRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const tiltX = ((y - centerY) / centerY) * maxTilt;
    const tiltY = ((centerX - x) / centerX) * maxTilt;
    
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = () => {
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      ref={elementRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={`transition-transform duration-300 ease-out ${className}`}
      style={{
        transform: `perspective(1000px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
      }}
    >
      {children}
    </div>
  );
};

// Glow Effect Component
export const GlowWrapper = ({ 
  children, 
  glowColor = '#3b82f6', 
  intensity = 0.5, 
  className = '' 
}) => {
  const [isGlowing, setIsGlowing] = useState(false);

  return (
    <div
      onMouseEnter={() => setIsGlowing(true)}
      onMouseLeave={() => setIsGlowing(false)}
      className={`transition-all duration-300 ${className}`}
      style={{
        boxShadow: isGlowing 
          ? `0 0 20px ${glowColor}${Math.round(intensity * 255).toString(16)}, 0 0 40px ${glowColor}${Math.round(intensity * 128).toString(16)}` 
          : 'none'
      }}
    >
      {children}
    </div>
  );
};

// Floating Animation Component
export const FloatingWrapper = ({ 
  children, 
  duration = 3, 
  distance = 10, 
  className = '' 
}) => {
  return (
    <div
      className={`animate-float ${className}`}
      style={{
        animation: `float ${duration}s ease-in-out infinite`,
        '--float-distance': `${distance}px`
      }}
    >
      {children}
      <style>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(var(--float-distance, -10px));
          }
        }
      `}</style>
    </div>
  );
};

// Pulse Effect Component
export const PulseWrapper = ({ 
  children, 
  scale = 1.05, 
  duration = 1, 
  className = '' 
}) => {
  return (
    <div
      className={`animate-pulse-custom ${className}`}
      style={{
        animation: `pulse-custom ${duration}s ease-in-out infinite`,
        '--pulse-scale': scale
      }}
    >
      {children}
      <style>{`
        @keyframes pulse-custom {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(var(--pulse-scale, 1.05));
          }
        }
      `}</style>
    </div>
  );
};

// Morphing Button Component
export const MorphingButton = ({ 
  children, 
  morphTo, 
  onClick, 
  className = '',
  ...props 
}) => {
  const [isMorphed, setIsMorphed] = useState(false);

  const handleClick = (e) => {
    setIsMorphed(!isMorphed);
    if (onClick) onClick(e);
  };

  return (
    <button
      onClick={handleClick}
      className={`transition-all duration-500 ease-out ${className}`}
      {...props}
    >
      <span className={`block transition-opacity duration-300 ${isMorphed ? 'opacity-0' : 'opacity-100'}`}>
        {children}
      </span>
      {morphTo && (
        <span className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ${isMorphed ? 'opacity-100' : 'opacity-0'}`}>
          {morphTo}
        </span>
      )}
    </button>
  );
};

export default {
  RippleButton,
  MagneticWrapper,
  TiltWrapper,
  GlowWrapper,
  FloatingWrapper,
  PulseWrapper,
  MorphingButton
};