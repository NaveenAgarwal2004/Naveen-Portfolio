import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Github, Linkedin, Mail, ArrowRight, Sparkles } from 'lucide-react';

const Hero = ({ personalData }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [vantaEffect, setVantaEffect] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);
  const vantaRef = useRef(null);

  const fullText = personalData?.title || 'Front-End Web Developer';
  const name = personalData?.name || 'Naveen Agarwal';
  const tagline = personalData?.tagline || 'Building modern, responsive web experiences with clean code and creative design';
  const socialLinks = personalData?.socialLinks || {};

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Vanta.js HALO effect initialization
  useEffect(() => {
    if (isMobile) return; // Skip Vanta on mobile for better performance
    
    const initVanta = () => {
      try {
        // Check if Vanta HALO and Three.js are available
        if (!window.VANTA || !window.THREE || !window.VANTA.HALO) {
          console.warn('Vanta.js HALO or Three.js not loaded, falling back to CSS background');
          return;
        }

        if (vantaRef.current && !vantaEffect) {
          const effect = window.VANTA.HALO({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            baseColor: 0x0f172a,
            backgroundColor: 0x0f172a,
            amplitudeFactor: 1.2,
            xOffset: 0.0,
            yOffset: 0.0,
            size: window.innerWidth < 1200 ? 1.0 : 1.4
          });
          
          setVantaEffect(effect);
          console.log('Vanta HALO effect initialized successfully');
        }
      } catch (error) {
        console.error('Vanta.js HALO initialization failed:', error);
      }
    };

    const timer = setTimeout(initVanta, 100);

    return () => {
      clearTimeout(timer);
      if (vantaEffect) {
        try {
          vantaEffect.destroy();
          console.log('Vanta HALO effect destroyed');
        } catch (error) {
          console.error('Error destroying Vanta HALO effect:', error);
        }
        setVantaEffect(null);
      }
    };
  }, [isMobile, vantaEffect]);

  // Handle resize for Vanta effect
  useEffect(() => {
    const handleResize = () => {
      if (vantaEffect && !isMobile) {
        try {
          vantaEffect.resize();
        } catch (error) {
          console.error('Error resizing Vanta HALO effect:', error);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vantaEffect, isMobile]);

  // Mouse tracking for interactive effects (desktop only)
  useEffect(() => {
    if (isMobile) return;

    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [isMobile]);

  // Initial visibility animation
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  // Enhanced typing animation with cursor blink
  useEffect(() => {
    if (currentIndex >= fullText.length) return;
    
    const timeout = setTimeout(() => {
      setDisplayText(prev => prev + fullText[currentIndex]);
      setCurrentIndex(prev => prev + 1);
    }, 80);
    
    return () => clearTimeout(timeout);
  }, [currentIndex, fullText]);

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // Floating particles component optimized for HALO effect
  const FloatingParticles = React.memo(() => {
    const particleCount = isMobile ? 4 : 8;
    
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {Array.from({ length: particleCount }, (_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-blue-400/10 rounded-full animate-float-gentle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animationDuration: `${6 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>
    );
  });

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen overflow-hidden flex items-center justify-center pt-16 pb-16"
    >
      {/* Vanta.js HALO Background (Desktop Only) */}
      {!isMobile && (
        <div 
          ref={vantaRef} 
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Enhanced fallback background for HALO-like effect */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950" />
        {/* HALO-like gradient orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-500/5 via-purple-500/3 to-transparent rounded-full blur-3xl animate-pulse-slow" />
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-cyan-500/4 via-blue-500/2 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '3s' }} />
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-radial from-purple-500/6 via-pink-500/3 to-transparent rounded-full blur-3xl animate-pulse-slow" style={{ animationDelay: '1.5s' }} />
      </div>

      <FloatingParticles />

      {/* Interactive cursor following effect (desktop only) - more subtle for HALO */}
      {!isMobile && (
        <div 
          className="fixed w-6 h-6 bg-gradient-radial from-blue-400/10 to-transparent rounded-full pointer-events-none transition-all duration-500"
          style={{
            left: mousePosition.x - 12,
            top: mousePosition.y - 12,
            transform: `scale(${isVisible ? 1 : 0})`,
            zIndex: 30
          }}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative" style={{ zIndex: 20 }}>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Greeting */}
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500/5 backdrop-blur-xl border border-blue-500/10 rounded-full mb-4 sm:mb-6">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-xs sm:text-sm lg:text-base font-medium">Available for work</span>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 animate-pulse" />
            </div>
            <p className="text-base sm:text-lg lg:text-xl text-blue-400 mb-3 sm:mb-4 font-medium">
              👋 Hello, I'm
            </p>
          </div>

          {/* Name with enhanced gradient for HALO effect */}
          <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent drop-shadow-lg">
                {name}
              </span>
            </h1>
          </div>

          {/* Typing animation with enhanced styling for HALO */}
          <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-300 mb-6 sm:mb-8 h-8 sm:h-10 lg:h-12 xl:h-16 flex items-center justify-center">
              <span className="relative px-2">
                {displayText}
                <span className="inline-block w-0.5 h-6 sm:h-8 lg:h-10 bg-gradient-to-t from-blue-500 to-purple-500 ml-1 animate-pulse"></span>
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              {tagline}
            </p>
          </div>

          {/* CTA Buttons with HALO-compatible styling */}
          <div className={`transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <button
                onClick={() => scrollToSection('projects')}
                className="group relative bg-gradient-to-r from-blue-600/80 to-purple-600/80 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-base sm:text-lg font-medium
                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/20 flex items-center gap-3 overflow-hidden w-full sm:w-auto max-w-xs sm:max-w-none backdrop-blur-sm"
              >
                <div className="absolute inset-0 bg-white/5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10 flex items-center gap-2">
                  View My Work
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              
              <button
                onClick={() => scrollToSection('about')}
                className="group relative bg-white/3 backdrop-blur-xl border border-white/10 hover:border-white/20 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-base sm:text-lg font-medium
                transition-all duration-300 hover:bg-white/5 hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <span className="relative z-10">About Me</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>
            </div>
          </div>

          {/* Social Links with HALO-style glow effects */}
          <div className={`transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex justify-center space-x-4 sm:space-x-6 mb-12 sm:mb-16 px-4">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 sm:p-3 bg-white/3 backdrop-blur-xl border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300 hover:scale-110 hover:bg-white/5"
                  aria-label="GitHub Profile"
                >
                  <Github className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/5 to-gray-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="absolute inset-0 rounded-xl group-hover:shadow-lg group-hover:shadow-white/10 transition-shadow duration-300"></div>
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 sm:p-3 bg-white/3 backdrop-blur-xl border border-white/10 rounded-xl hover:border-blue-400/30 transition-all duration-300 hover:scale-110 hover:bg-blue-500/5"
                  aria-label="LinkedIn Profile"
                >
                  <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-blue-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="absolute inset-0 rounded-xl group-hover:shadow-lg group-hover:shadow-blue-400/20 transition-shadow duration-300"></div>
                </a>
              )}
              {socialLinks.email && (
                <a
                  href={`mailto:${socialLinks.email}`}
                  className="group relative p-2.5 sm:p-3 bg-white/3 backdrop-blur-xl border border-white/10 rounded-xl hover:border-red-400/30 transition-all duration-300 hover:scale-110 hover:bg-red-500/5"
                  aria-label="Email Contact"
                >
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-red-300/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                  <div className="absolute inset-0 rounded-xl group-hover:shadow-lg group-hover:shadow-red-400/20 transition-shadow duration-300"></div>
                </a>
              )}
            </div>
          </div>

          {/* Scroll Indicator with HALO styling */}
          <div className={`transform transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Scroll to explore</span>
              <button
                onClick={() => scrollToSection('about')}
                className="group p-1.5 sm:p-2 rounded-full border border-gray-600/50 hover:border-gray-400/50 transition-all duration-300 hover:bg-white/5 backdrop-blur-sm hover:shadow-lg hover:shadow-white/10"
                aria-label="Scroll to next section"
              >
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-hover:text-gray-300 animate-bounce transition-colors duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes float-gentle {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg) scale(1); 
            opacity: 0.1; 
          }
          50% { 
            transform: translateY(-10px) rotate(90deg) scale(1.2); 
            opacity: 0.3; 
          }
        }
        
        @keyframes pulse-slow {
          0%, 100% { 
            opacity: 0.3;
            transform: scale(1);
          }
          50% { 
            opacity: 0.6;
            transform: scale(1.05);
          }
        }
        
        .animate-float-gentle {
          animation: float-gentle ease-in-out infinite;
        }
        
        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }
        
        .bg-gradient-radial {
          background: radial-gradient(circle, var(--tw-gradient-stops));
        }
        
        @media (prefers-reduced-motion: reduce) {
          .animate-float-gentle,
          .animate-pulse,
          .animate-pulse-slow,
          .animate-bounce {
            animation: none;
          }
          
          .transition-all,
          .transition-transform,
          .transition-colors,
          .transition-opacity,
          .transition-shadow {
            transition: none;
          }
        }
        
        @media (max-width: 768px) {
          .bg-gradient-radial {
            transform: scale(0.7);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;