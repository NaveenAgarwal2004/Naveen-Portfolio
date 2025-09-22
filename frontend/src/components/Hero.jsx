import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Github, Linkedin, Mail, ArrowRight, Sparkles, Code2, Terminal } from 'lucide-react';
import OptimizedImage, { ImagePresets } from './ui/OptimizedImage';


const Hero = ({ personalData }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [vantaEffect, setVantaEffect] = useState(null);
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);
  const vantaRef = useRef(null);

  // Mobile screen detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fullText = personalData?.title || 'Front-End Web Developer';
  const name = personalData?.name || 'Naveen Agarwal';
  const tagline = personalData?.tagline || 'Building modern, responsive web experiences with clean code and creative design';
  const socialLinks = personalData?.socialLinks || {};

  // Vanta.js effect initialization
  useEffect(() => {

    if (isMobile) return;

    let vanta;
    
    const initVanta = () => {
      try {
        if (vantaRef.current && !vantaEffect && window.VANTA && window.VANTA.NET) {
          const vanta = window.VANTA.NET({
            el: vantaRef.current,
            mouseControls: true,
            touchControls: true,
            gyroControls: false,
            minHeight: 200.0,
            minWidth: 200.0,
            scale: 1.0,
            scaleMobile: 0.8,
            color: 0x3b82f6,
            backgroundColor: 0x0f172a,
            points: window.innerWidth < 768 ? 8.0 : 12.0,
            maxDistance: window.innerWidth < 768 ? 15.0 : 20.0,
            spacing: window.innerWidth < 740 ? 12.0 : 16.0
          });
          setVantaEffect(vanta);
          console.log('Vanta effect initialized');
        }
      } catch (error) {
        console.error('Vanta.js initialization error:', error);
      }
    };

    const timer = setTimeout(() => {
      initVanta();
    }, 100);

    return () => {
      clearTimeout(timer);
      if (vanta) {
        console.log('Destroying local vanta instance');
        vanta.destroy();
      }
      if (vantaEffect) {
        console.log('Destroying state vantaEffect instance');
        vantaEffect.destroy();
      }
    };
  }, [vantaEffect, isMobile]);

  // Handle resize for Vanta effect
  useEffect(() => {
    const handleResize = () => {
      if (vantaEffect) {
        vantaEffect.resize();
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [vantaEffect]);

  // Mouse tracking for interactive effects (disabled on mobile)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth >= 768) { // Only on desktop
        setMousePosition({ x: e.clientX, y: e.clientY });
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

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

  const scrollToProjects = () => {
    const element = document.getElementById('projects');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    const element = document.getElementById('about');
    if (element) element.scrollIntoView({ behavior: 'smooth' });
  };

  // Floating particles component (reduced for mobile)
  const FloatingParticles = () => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {[...Array(isMobile ? 8 : 15)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-blue-400/30 rounded-full animate-float"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${3 + Math.random() * 4}s`
          }}
        />
      ))}
    </div>
  );

  return (
    <section
      id="hero"
      ref={heroRef}
      className="relative min-h-screen overflow-hidden flex items-center justify-center pt-16 pb-16"
    >
      {/* Vanta.js Background - Desktop only */}
      {!isMobile && (
        <div 
          ref={vantaRef} 
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 1 }}
        />
      )}

      {/* Enhanced background with tech image overlay */}
      <div className="absolute inset-0" style={{ zIndex: 0 }}>
        <OptimizedImage
          src="https://images.unsplash.com/photo-1576272531110-2a342fe22342?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjB3b3Jrc3BhY2V8ZW58MHx8fGJsdWV8MTc1ODQ2NjI0NHww&ixlib=rb-4.1.0&q=85"
          alt="Developer workspace with coding environment"
          {...ImagePresets.hero}
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/95 via-blue-950/90 to-slate-900/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent" />
      </div>

      {/* Fallback Blobs for Mobile */}
      {isMobile && (
        <div className="absolute inset-0 overflow-hidden" style={{ zIndex: 2 }}>
          <div className="absolute -top-20 sm:-top-40 -right-20 sm:-right-40 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-20 sm:-bottom-40 -left-20 sm:-left-40 w-40 h-40 sm:w-60 sm:h-60 md:w-80 md:h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-48 h-48 sm:w-72 sm:h-72 md:w-96 md:h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      )}

      <FloatingParticles />

      {/* Interactive cursor following effect (desktop only) */}
      {!isMobile && (
        <div 
          className="fixed w-4 h-4 bg-blue-400/20 rounded-full pointer-events-none z-10 transition-all duration-300 hidden lg:block"
          style={{
            left: mousePosition.x - 8,
            top: mousePosition.y - 8,
            transform: `scale(${isVisible ? 1 : 0})`,
            zIndex: 30
          }}
        />
      )}

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative" style={{ zIndex: 20 }}>
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Greeting with tech elements */}
          <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-500/10 backdrop-blur-sm border border-blue-500/20 rounded-full mb-4 sm:mb-6 group hover:bg-blue-500/15 transition-colors duration-300">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-blue-400 text-xs sm:text-sm lg:text-base font-medium">Available for work</span>
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 animate-pulse group-hover:animate-spin transition-all duration-300" />
            </div>
            
            {/* Tech stack preview */}
            <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Code2 className="h-3 w-3 text-green-400" />
                <span className="text-xs text-gray-300">MERN</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg border border-slate-700/50">
                <Terminal className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-gray-300">Full Stack</span>
              </div>
            </div>
            
            <p className="text-base sm:text-lg lg:text-xl text-blue-400 mb-3 sm:mb-4 font-medium">
              👋 Hello, I'm
            </p>
          </div>

          {/* Name with gradient effect */}
          <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent">
                {name}
              </span>
            </h1>
          </div>

          {/* Typing animation */}
          <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-gray-300 mb-6 sm:mb-8 h-8 sm:h-10 lg:h-12 xl:h-16 flex items-center justify-center">
              <span className="relative px-2">
                {displayText}
                <span className="inline-block w-0.5 h-6 sm:h-8 lg:h-10 bg-blue-500 ml-1 animate-pulse"></span>
              </span>
            </div>
          </div>

          {/* Tagline */}
          <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <p className="text-sm sm:text-base md:text-lg lg:text-xl text-gray-400 max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4">
              {tagline}
            </p>
          </div>

          {/* CTA Buttons */}
          <div className={`transform transition-all duration-1000 delay-800 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <button
                onClick={scrollToProjects}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-base sm:text-lg font-medium
                transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-blue-500/25 flex items-center gap-3 overflow-hidden w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10 flex items-center gap-2">
                  View My Work
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </button>
              
              <button
                onClick={scrollToAbout}
                className="group relative bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-base sm:text-lg font-medium
                transition-all duration-300 hover:bg-white/10 hover:scale-105 w-full sm:w-auto max-w-xs sm:max-w-none"
              >
                <span className="relative z-10">About Me</span>
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>
              </button>
            </div>
          </div>

          {/* Social Links */}
          <div className={`transform transition-all duration-1000 delay-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex justify-center space-x-4 sm:space-x-6 mb-12 sm:mb-16 px-4">
              {socialLinks.github && (
                <a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 transition-all duration-300 hover:scale-110 hover:bg-white/10"
                >
                  <Github className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </a>
              )}
              {socialLinks.linkedin && (
                <a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-blue-400/50 transition-all duration-300 hover:scale-110 hover:bg-blue-500/10"
                >
                  <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </a>
              )}
              {socialLinks.email && (
                <a
                  href={`mailto:${socialLinks.email}`}
                  className="group relative p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-red-400/50 transition-all duration-300 hover:scale-110 hover:bg-red-500/10"
                >
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </a>
              )}
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className={`transform transition-all duration-1000 delay-1200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
            <div className="flex flex-col items-center">
              <span className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4">Scroll to explore</span>
              <button
                onClick={scrollToAbout}
                className="group p-1.5 sm:p-2 rounded-full border border-gray-600 hover:border-gray-400 transition-all duration-300 hover:bg-white/5"
              >
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-hover:text-gray-300 animate-bounce transition-colors duration-300" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.3; 
          }
          50% { 
            transform: translateY(-20px) rotate(180deg); 
            opacity: 0.8; 
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </section>
  );
};

export default Hero;