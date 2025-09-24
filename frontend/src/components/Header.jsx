import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Home, User, Briefcase, Mail, Code, ChevronDown, X, Menu, Award, FileText, Clock } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useDebounce } from '../hooks/useDebounce';
import { useLanguage } from '../contexts/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import TranslatedText from './TranslatedText';
import ThemeToggle from './ui/ThemeToggle';
import LanguageSelector from './ui/LanguageSelector';


// Configuration object for easier maintenance
const headerConfig = {
  animations: {
    duration: 300,
    staggerDelay: 100,
    scrollThreshold: 50
  },
  breakpoints: {
    mobile: 768,
    tablet: 1024
  },
  zIndex: {
    header: 50,
    dropdown: 200,
    mobileMenu: 40
  }
};

// Performance: Throttle function for scroll events
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

const AnimatedHamburgerIcon = ({ isOpen, className = "" }) => (
  <div className={`w-7 h-7 flex flex-col justify-center items-center cursor-pointer ${className}`}>
    <div 
      className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out ${
        isOpen ? 'rotate-45 translate-y-1.5' : 'translate-y-0'
      }`} 
    />
    <div 
      className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out mt-1.5 ${
        isOpen ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
      }`} 
    />
    <div 
      className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-in-out mt-1.5 ${
        isOpen ? '-rotate-45 -translate-y-1.5' : 'translate-y-0'
      }`} 
    />
  </div>
);

const ResumeDropdown = ({ 
  isOpen, 
  setIsOpen, 
  onDownload, 
  position = 'right',
  className = "",
  resumes = []
}) => {
  const { tSync } = useLanguage();
  
  return (
    <div 
      className={`absolute ${position}-0 mt-3 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform origin-top-${position} z-[200] ${
        isOpen 
          ? 'opacity-100 scale-100 translate-y-0' 
          : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
      } ${className}`}
      role="menu"
    >
      <div className="p-3">
        {resumes.map((option, index) => (
          <button
            key={option.name}
            onClick={() => onDownload(option)}
            className={`w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all duration-200 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
              isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
            }`}
            style={{
              transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
            }}
            role="menuitem"
            tabIndex={isOpen ? 0 : -1}
          >
            <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200 shrink-0" />
            <TranslatedText tag="span" fallback={option.name} className="font-medium flex-1 text-sm" />
            <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
          </button>
        ))}
      </div>
    </div>
  );
};

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isMobileResumeOpen, setIsMobileResumeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  const [isDownloading, setIsDownloading] = useState(false);
  const [visibleSections, setVisibleSections] = useState(new Set());
  
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const resumeDropdownRef = useRef(null);
  
  const isMobile = useMediaQuery(`(max-width: ${headerConfig.breakpoints.mobile}px)`);
  const isTablet = useMediaQuery(`(max-width: ${headerConfig.breakpoints.tablet}px)`);
  const debouncedScrolled = useDebounce(isScrolled, 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Close mobile menu when switching to desktop
  useEffect(() => {
    if (!isMobile && isOpen) {
      setIsOpen(false);
      setIsMobileResumeOpen(false);
    }
  }, [isMobile, isOpen]);

  // Enhanced scroll detection with throttling
  useEffect(() => {
    const handleScroll = throttle(() => {
      setIsScrolled(window.scrollY > headerConfig.animations.scrollThreshold);
      
      // Update active section based on scroll position
      const sections = ['hero', 'about', 'tech-stack', 'projects', 'timeline', 'resumes', 'certificates', 'contact'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection && currentSection !== activeSection) {
        setActiveSection(currentSection);
      }
    }, 16); // ~60fps

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

  // Intersection Observer for better section detection
  useEffect(() => {
    const navItems = [
      { id: 'hero' }, { id: 'about' }, { id: 'tech-stack' }, 
      { id: 'projects' }, { id: 'timeline' }, { id: 'resumes' }, { id: 'certificates' }, { id: 'contact' }
    ];

    const observers = navItems.map(item => {
      const observer = new IntersectionObserver(
        ([entry]) => {
          setVisibleSections(prev => {
            const newSet = new Set(prev);
            if (entry.isIntersecting) {
              newSet.add(item.id);
            } else {
              newSet.delete(item.id);
            }
            return newSet;
          });
        },
        { threshold: 0.3, rootMargin: '-100px 0px -50% 0px' }
      );
      
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
      
      return observer;
    });
    
    return () => observers.forEach(observer => observer.disconnect());
  }, []);

  // Update active section based on intersection observer
  useEffect(() => {
    if (visibleSections.size > 0) {
      // Get the first visible section as active
      const sectionsOrder = ['hero', 'about', 'tech-stack', 'projects', 'resumes', 'certificates', 'contact'];
      const visibleInOrder = sectionsOrder.find(section => visibleSections.has(section));
      if (visibleInOrder && visibleInOrder !== activeSection) {
        setActiveSection(visibleInOrder);
      }
    }
  }, [visibleSections, activeSection]);

  // Enhanced click outside detection
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close mobile menu
      if (mobileMenuRef.current && !mobileMenuRef.current.contains(event.target) && isOpen) {
        setIsOpen(false);
      }
      
      // Close resume dropdown
      if (resumeDropdownRef.current && !resumeDropdownRef.current.contains(event.target)) {
        setIsResumeOpen(false);
        setIsMobileResumeOpen(false);
      }
    };

    if (isOpen || isResumeOpen || isMobileResumeOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isOpen, isResumeOpen, isMobileResumeOpen]);

  // Enhanced keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsResumeOpen(false);
        setIsMobileResumeOpen(false);
      }
      
      // Enhanced keyboard navigation for resume dropdown
      if (event.key === 'Enter' || event.key === ' ') {
        const activeElement = document.activeElement;
        if (activeElement?.id === 'resume-button') {
          event.preventDefault();
          setIsResumeOpen(!isResumeOpen);
        }
      }
      
      if (event.key === 'Tab' && isOpen) {
        // Trap focus within mobile menu
        const focusableElements = mobileMenuRef.current?.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        
        if (focusableElements?.length) {
          const firstElement = focusableElements[0];
          const lastElement = focusableElements[focusableElements.length - 1];
          
          if (event.shiftKey && document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          } else if (!event.shiftKey && document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isResumeOpen]);

  // Better scroll prevention for mobile menu
  useEffect(() => {
    if (isOpen && isMobile) {
      // Store original scroll position
      const scrollY = window.scrollY;
      document.body.style.position = 'fixed';
      document.body.style.top = `-${scrollY}px`;
      document.body.style.width = '100%';
      document.body.style.overflow = 'hidden';
      
      return () => {
        // Restore scroll position
        const scrollY = document.body.style.top;
        document.body.style.position = '';
        document.body.style.top = '';
        document.body.style.width = '';
        document.body.style.overflow = '';
        window.scrollTo(0, parseInt(scrollY || '0') * -1);
      };
    }
  }, [isOpen, isMobile]);

  // Enhanced resume download with error handling
  const handleResumeDownload = useCallback(async (option) => {
    setIsDownloading(true);
    
    try {
      if (option.format === 'view') {
        window.open(option.url, '_blank', 'noopener,noreferrer');
      } else {
        // Check if file exists first
        try {
          const response = await fetch(option.url, { method: 'HEAD' });
          if (response.ok) {
            const link = document.createElement('a');
            link.href = option.url;
            link.download = `naveen-agarwal-${option.name.toLowerCase().replace(/\s+/g, '-')}.${option.format}`;
            link.style.display = 'none';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            
            // Analytics tracking
            if (window.gtag) {
              window.gtag('event', 'resume_download', {
                'resume_type': option.name,
                'event_category': 'engagement'
              });
            }
          } else {
            throw new Error('File not found');
          }
        } catch (fetchError) {
          console.warn('Direct download failed, opening in new tab:', fetchError);
          window.open(option.url, '_blank', 'noopener,noreferrer');
        }
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(option.url, '_blank', 'noopener,noreferrer');
    } finally {
      setIsDownloading(false);
      setIsResumeOpen(false);
      setIsMobileResumeOpen(false);
      setIsOpen(false);
    }
  }, []);

  // Enhanced scroll to section with analytics
  const scrollToSection = useCallback((sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = headerRef.current?.offsetHeight || 64;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerHeight - 20;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      
      setIsOpen(false);
      
      // Update active section immediately for better UX
      setActiveSection(sectionId);
      
      // Analytics tracking
      if (window.gtag) {
        window.gtag('event', 'navigation_click', {
          'section': sectionId,
          'event_category': 'navigation'
        });
      }
    }
  }, []);

  const { tSync } = useLanguage();
  const navigationTexts = [
    'Home', 'About', 'Skills', 'Projects', 'Resumes', 'Certificates', 'Contact',
    'Go to top of page', 'Open menu', 'Close menu', 'Resume', 'Downloading...',
    'Download Resume', 'Main Resume', 'Frontend Resume', 'Backend Resume'
  ];
  const { t, isTranslating } = useTranslation(navigationTexts);

  const resumes = [
    { name: tSync('resume.main', "Main Resume"), url: "/NaveenAgarwal__Resume.pdf", format: "pdf" },
    { name: tSync('resume.frontend', "Frontend Resume"), url: "/Naveen Agarwal - Frontend.pdf", format: "pdf" },
    { name: tSync('resume.backend', "Backend Resume"), url: "/NaveenAgarwal_Backend.pdf", format: "pdf" }
  ];

  const navItems = [
    { id: 'hero', label: tSync('navigation.home', 'Home'), icon: Home },
    { id: 'about', label: tSync('navigation.about', 'About'), icon: User },
    { id: 'tech-stack', label: tSync('navigation.skills', 'Skills'), icon: Code },
    { id: 'projects', label: tSync('navigation.projects', 'Projects'), icon: Briefcase },
    // { id: 'timeline', label: tSync('navigation.timeline', 'Timeline'), icon: Clock },
    { id: 'resumes', label: 'Resumes', icon: FileText },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'contact', label: tSync('navigation.contact', 'Contact'), icon: Mail }
  ];

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="text-xl font-bold text-white">
              Naveen<span className="text-blue-500">.</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="w-12 h-4 bg-gray-700/50 rounded animate-pulse"></div>
              ))}
            </div>
            <div className="w-20 h-8 bg-gray-700/50 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header 
      ref={headerRef}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        debouncedScrolled 
          ? 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl' 
          : 'bg-transparent'
      }`}
      role="banner"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between ${
          isMobile ? 'h-16' : 'h-20'
        }`}>
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => scrollToSection('hero')}
              className={`font-bold text-white hover:text-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg px-3 py-2 ${
                isMobile ? 'text-lg' : 'text-xl'
              }`}
              aria-label={tSync('nav.goToTop', 'Go to top of page')}
            >
              Naveen<span className="text-blue-500 animate-pulse">.</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className={`hidden md:flex items-center ${
            isTablet ? 'space-x-4' : 'space-x-8'
          }`} role="navigation">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative font-medium transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg px-3 py-2 ${
                  activeSection === item.id 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-white'
                } ${
                  isTablet ? 'text-sm' : 'text-sm'
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
                aria-current={activeSection === item.id ? 'page' : undefined}
              >
                <span className="relative z-10">{item.label}</span>
                <div className={`absolute inset-0 bg-blue-500/20 rounded-lg transition-transform duration-300 -z-10 ${
                  activeSection === item.id ? 'scale-100' : 'scale-0 group-hover:scale-100'
                }`} />
                <div className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-300 ${
                  activeSection === item.id ? 'w-full' : 'w-0 group-hover:w-full'
                }`} />
              </button>
            ))}
          </nav>

          {/* Desktop Controls */}
          <div className={`hidden md:flex items-center ${
            isTablet ? 'gap-2' : 'gap-4'
          }`}>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LanguageSelector />
            </div>
            
            <div className="relative" ref={resumeDropdownRef}>
              <button
                id="resume-button"
                onClick={() => setIsResumeOpen(!isResumeOpen)}
                className={`group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-xl ${
                  isTablet ? 'px-4 py-2 text-sm' : 'px-6 py-2.5 text-sm'
                } ${
                  isDownloading ? 'opacity-75 cursor-not-allowed' : ''
                }`}
                disabled={isDownloading}
                aria-expanded={isResumeOpen}
                aria-haspopup="menu"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <span className="relative z-10 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  <span className={isTablet ? 'hidden lg:inline' : ''}>
                    {isDownloading ? 'Downloading...' : 'Resume'}
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${
                    isResumeOpen ? 'rotate-180' : ''
                  }`} />
                </span>
              </button>

              <ResumeDropdown
                isOpen={isResumeOpen}
                setIsOpen={setIsResumeOpen}
                onDownload={handleResumeDownload}
                resumes={resumes}
              />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50 focus:ring-offset-2 focus:ring-offset-gray-900"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={isOpen}
              aria-controls="mobile-menu"
            >
              <AnimatedHamburgerIcon isOpen={isOpen} />
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        <div 
          id="mobile-menu"
          ref={mobileMenuRef}
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
          }`}
          role="menu"
          aria-hidden={!isOpen}
        >
          <div className="px-3 pt-6 pb-8 space-y-3 bg-gray-900/95 backdrop-blur-xl rounded-2xl mt-4 mx-2 border border-gray-800/50 shadow-2xl max-h-[70vh] overflow-y-auto">
            {/* Navigation Items */}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-medium w-full text-left transition-all duration-300 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                    activeSection === item.id
                      ? 'text-white bg-blue-500/20 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-blue-500/10'
                  } ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                  style={{ 
                    transitionDelay: isOpen ? `${index * 80}ms` : '0ms' 
                  }}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                >
                  <Icon className={`h-5 w-5 ${
                    activeSection === item.id ? 'text-blue-400' : 'text-blue-400'
                  }`} />
                  <span className="flex-1">{item.label}</span>
                  {activeSection === item.id && (
                    <div className="w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Mobile Controls Section */}
            <div className="pt-4 border-t border-gray-800/50 space-y-4">
              {/* Theme and Language Controls */}
              <div className="flex items-center justify-center gap-6 py-2">
                <ThemeToggle />
                <LanguageSelector />
              </div>

              {/* Mobile Resume Section */}
              <div className="relative">
                {/* Resume dropdown - shown above button when open */}
                <div className={`${isMobileResumeOpen ? 'mb-3' : ''} bg-gray-800/80 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-xl overflow-hidden transition-all duration-300 ${
                  isMobileResumeOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                  <div className="p-2">
                    {resumes.map((option, index) => (
                      <button
                        key={option.name}
                        onClick={() => handleResumeDownload(option)}
                        className={`w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-lg transition-all duration-200 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                          isMobileResumeOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        }`}
                        style={{ 
                          transitionDelay: isMobileResumeOpen ? `${index * 80}ms` : '0ms' 
                        }}
                        tabIndex={isMobileResumeOpen ? 0 : -1}
                      >
                        <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200" />
                        <span className="text-sm flex-1">{option.name}</span>
                        <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setIsMobileResumeOpen(!isMobileResumeOpen)}
                  className={`group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-5 py-4 rounded-xl font-medium 
                    transition-all duration-300 transform hover:scale-105 flex items-center justify-between overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400/50
                    ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                  style={{
                    transitionDelay: isOpen ? `${(navItems.length + 1) * 80}ms` : '0ms'
                  }}
                  aria-expanded={isMobileResumeOpen}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="relative z-10 flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    <span className="text-base">Download Resume</span>
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 relative z-10 ${
                    isMobileResumeOpen ? 'rotate-180' : ''
                  }`} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* ARIA live region for screen readers */}
        <div aria-live="polite" className="sr-only">
          {activeSection && `Currently viewing ${activeSection.replace('-', ' ')} section`}
        </div>
      </div>
    </header>
  );
};

export default Header;