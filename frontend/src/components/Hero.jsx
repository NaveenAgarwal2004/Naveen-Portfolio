// frontend/src/components/Hero.jsx - Updated with Translation System & Framer Motion
import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { ChevronDown, Github, Linkedin, Mail, ArrowRight, Sparkles, Code2, Terminal } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import TranslatedText from './TranslatedText';
import OptimizedImage, { ImagePresets } from './ui/OptimizedImage';
import { springConfig, buttonSpring, heroSpring, staggerContainer } from '../lib/animations';

const Hero = ({ personalData }) => {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const heroRef = useRef(null);

  // Translation setup
  const { tSync, currentLanguage } = useLanguage();
  const heroTexts = [
    'Available for work', 'View My Work', 'About Me', 'Scroll to explore',
    'Building modern, responsive web experiences with clean code and creative design'
  ];
  const { t, isTranslating } = useTranslation(heroTexts);

  // Mobile screen detection
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const fullText = personalData?.title || 'Full-Stack Craftsman';
  const name = personalData?.name || 'Naveen Agarwal';
  const tagline = personalData?.tagline || t('hero.tagline', 'Building digital experiences with precision and care');
  const socialLinks = personalData?.socialLinks || {};

  // Removed Vanta.js initialization - replaced with lightweight CSS gradient

  // Mouse tracking for interactive effects (disabled on mobile)
  useEffect(() => {
    const handleMouseMove = (e) => {
      if (window.innerWidth >= 768) {
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
          className="absolute w-1 h-1 bg-forge-orange/30 rounded-full animate-float"
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
      {/* Lightweight CSS Gradient Background - Replaces Vanta.js */}
      <div className="hero-bg absolute inset-0" style={{ zIndex: 0 }} />

      {/* Enhanced background with workshop image overlay */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <OptimizedImage
          src="https://images.unsplash.com/photo-1576272531110-2a342fe22342?crop=entropy&cs=srgb&fm=jpg&ixid=M3w3NDk1Nzh8MHwxfHNlYXJjaHwxfHxkZXZlbG9wZXIlMjB3b3Jrc3BhY2V8ZW58MHx8fGJsdWV8MTc1ODQ2NjI0NHww&ixlib=rb-4.1.0&q=85"
          alt="Developer workspace with coding environment"
          {...ImagePresets.hero}
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-carbon/95 via-slate-900/90 to-carbon/95" />
        <div className="absolute inset-0 bg-gradient-to-t from-carbon via-transparent to-transparent" />
      </div>

      <FloatingParticles />

      {/* Interactive cursor following effect (desktop only) */}
      {!isMobile && (
        <div 
          className="fixed w-4 h-4 bg-forge-orange/20 rounded-full pointer-events-none z-10 transition-all duration-300 hidden lg:block"
          style={{
            left: mousePosition.x - 8,
            top: mousePosition.y - 8,
            transform: `scale(${isVisible ? 1 : 0})`,
            zIndex: 30
          }}
        />
      )}

      {/* Main Content with Spring Animation */}
      <motion.div 
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative" 
        style={{ zIndex: 20 }}
        initial="initial"
        animate="animate"
        variants={staggerContainer}
      >
        <div className="space-y-4 sm:space-y-6 lg:space-y-8">
          {/* Availability Badge with Workshop Theme */}
          <motion.div 
            variants={heroSpring}
            transition={{ ...springConfig, delay: 0 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-carbon/50 backdrop-blur-sm border border-craft-green/30 rounded-full mb-4 sm:mb-6 group hover:bg-carbon/70 transition-colors duration-300">
              <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-craft-green rounded-full animate-pulse"></div>
              <TranslatedText 
                tag="span" 
                fallback={t('hero.availableForWork', 'Available for Craft Commissions')} 
                className="text-craft-green text-xs sm:text-sm font-medium"
              />
              <Sparkles className="h-3 w-3 sm:h-4 sm:w-4 text-craft-green animate-pulse group-hover:animate-spin transition-all duration-300" />
            </div>
            
            {/* Workshop Tools preview */}
            <div className="flex justify-center items-center gap-2 mb-4 sm:mb-6">
              <div className="flex items-center gap-1 px-2 py-1 bg-workshop-tan/10 rounded-lg border border-forge-orange/30">
                <Code2 className="h-3 w-3 text-forge-orange" />
                <span className="text-xs text-parchment">MERN</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 bg-workshop-tan/10 rounded-lg border border-ember-red/30">
                <Terminal className="h-3 w-3 text-ember-red" />
                <TranslatedText tag="span" fallback="Full-Stack Craftsman" className="text-xs text-parchment" />
              </div>
            </div>
            
            <TranslatedText 
              tag="p" 
              fallback="👋 Welcome to the workshop, I'm" 
              className="text-base sm:text-lg lg:text-xl text-forge-orange mb-3 sm:mb-4 font-medium"
            />
          </motion.div>

          {/* Name with workshop gradient effect */}
          <motion.div 
            variants={heroSpring}
            transition={{ ...springConfig, delay: 0.1 }}
          >
            <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl font-heading font-bold mb-4 sm:mb-6 leading-tight">
              <span className="bg-gradient-to-r from-parchment via-workshop-tan to-parchment bg-clip-text text-transparent">
                {name}
              </span>
            </h1>
          </motion.div>

          {/* Typing animation with workshop theme */}
          <motion.div 
            variants={heroSpring}
            transition={{ ...springConfig, delay: 0.2 }}
          >
            <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl xl:text-4xl font-light text-workshop-tan mb-6 sm:mb-8 h-8 sm:h-10 lg:h-12 xl:h-16 flex items-center justify-center">
              <span className="relative px-2">
                {displayText}
                <span className="inline-block w-0.5 h-6 sm:h-8 lg:h-10 bg-forge-orange ml-1 animate-pulse"></span>
              </span>
            </div>
          </motion.div>

          {/* Tagline with workshop language */}
          <motion.div 
            variants={heroSpring}
            transition={{ ...springConfig, delay: 0.3 }}
          >
            <TranslatedText 
              tag="p" 
              fallback="Full-Stack Craftsman • Building digital experiences with precision and care"
              className="text-sm sm:text-base md:text-lg lg:text-xl text-slate max-w-4xl mx-auto mb-8 sm:mb-12 leading-relaxed px-4"
            />
          </motion.div>

          {/* CTA Buttons with Workshop Theme - Spring Physics */}
          <motion.div 
            variants={heroSpring}
            transition={{ ...springConfig, delay: 0.4 }}
          >
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center mb-12 sm:mb-16 px-4">
              <motion.button
                onClick={scrollToProjects}
                className="group relative bg-gradient-to-r from-forge-orange to-ember-red hover:from-ember-red hover:to-forge-orange text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl text-base sm:text-lg font-semibold
                hover:shadow-2xl hover:shadow-forge-orange/25 flex items-center gap-3 overflow-hidden w-full sm:w-auto max-w-xs sm:max-w-none"
                whileHover={buttonSpring.hover}
                whileTap={buttonSpring.tap}
              >
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <TranslatedText fallback={t('hero.viewWork', 'Inspect the Craft')} />
                  <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 group-hover:translate-x-1 transition-transform duration-300" />
                </span>
              </motion.button>
              
              <motion.button
                onClick={scrollToAbout}
                className="group relative bg-carbon/50 backdrop-blur-sm border-2 border-slate hover:border-forge-orange text-parchment px-6 py-3 sm:px-8 sm:py-4 rounded-xl text-base sm:text-lg font-semibold
                hover:bg-slate/10 w-full sm:w-auto max-w-xs sm:max-w-none"
                whileHover={buttonSpring.hover}
                whileTap={buttonSpring.tap}
              >
                <TranslatedText tag="span" fallback={t('hero.aboutMe', 'Visit the Workshop')} className="relative z-10" />
                <div className="absolute inset-0 bg-gradient-to-r from-forge-orange/10 to-ember-red/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
              </motion.button>
            </div>
          </motion.div>

          {/* Social Links */}
          <motion.div 
            variants={heroSpring}
            transition={{ ...springConfig, delay: 0.5 }}
          >
            <div className="flex justify-center space-x-4 sm:space-x-6 mb-12 sm:mb-16 px-4">
              {socialLinks.github && (
                <motion.a
                  href={socialLinks.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-white/20 hover:bg-white/10"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springConfig}
                >
                  <Github className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-white transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/10 to-gray-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </motion.a>
              )}
              {socialLinks.linkedin && (
                <motion.a
                  href={socialLinks.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-blue-400/50 hover:bg-blue-500/10"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springConfig}
                >
                  <Linkedin className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-blue-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </motion.a>
              )}
              {socialLinks.email && (
                <motion.a
                  href={`mailto:${socialLinks.email}`}
                  className="group relative p-2.5 sm:p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl hover:border-red-400/50 hover:bg-red-500/10"
                  whileHover={{ scale: 1.1, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  transition={springConfig}
                >
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400 group-hover:text-red-400 transition-colors duration-300" />
                  <div className="absolute inset-0 bg-gradient-to-r from-red-500/10 to-red-300/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl"></div>
                </motion.a>
              )}
            </div>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div 
            variants={heroSpring}
            transition={{ ...springConfig, delay: 0.6 }}
          >
            <div className="flex flex-col items-center">
              <TranslatedText 
                tag="span" 
                fallback={t('hero.scrollToExplore', 'Scroll to explore')}
                className="text-gray-500 text-xs sm:text-sm mb-3 sm:mb-4"
              />
              <motion.button
                onClick={scrollToAbout}
                className="group p-1.5 sm:p-2 rounded-full border border-gray-600 hover:border-gray-400 hover:bg-white/5"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                transition={springConfig}
              >
                <ChevronDown className="h-5 w-5 sm:h-6 sm:w-6 text-gray-500 group-hover:text-gray-300 animate-bounce transition-colors duration-300" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
        /* Lightweight CSS Gradient Animation - Replaces Vanta.js (~500KB saved) */
        .hero-bg {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            135deg,
            #0A0A0A 0%,
            #1A1412 50%,
            #0A0A0A 100%
          );
          background-size: 400% 400%;
          animation: gradient-shift 15s ease infinite;
          z-index: -1;
        }

        @keyframes gradient-shift {
          0%, 100% { 
            background-position: 0% 50%; 
          }
          50% { 
            background-position: 100% 50%; 
          }
        }

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