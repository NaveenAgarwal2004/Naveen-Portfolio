import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Download, Home, User, Briefcase, Mail, Code, ChevronDown, X, Menu, Award, FileText } from 'lucide-react';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { useDebounce } from '../hooks/useDebounce';

const AnimatedHamburgerIcon = ({ isOpen, className = "" }) => (
  <div className={`w-6 h-6 flex flex-col justify-center items-center ${className}`}>
    <div 
      className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-out ${
        isOpen ? 'rotate-45 translate-y-1.5' : ''
      }`} 
    />
    <div 
      className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-out mt-1 ${
        isOpen ? 'opacity-0' : ''
      }`} 
    />
    <div 
      className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-out mt-1 ${
        isOpen ? '-rotate-45 -translate-y-1.5' : ''
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
}) => (
  <div 
    className={`absolute ${position}-0 mt-2 w-60 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 transform origin-top-${position} z-[200] ${
      isOpen 
        ? 'opacity-100 scale-100 translate-y-0' 
        : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
    } ${className}`}
    role="menu"
    aria-orientation="vertical"
    aria-labelledby="resume-button"
  >
    <div className="p-2">
      {resumes.map((option, index) => (
        <button
          key={option.name}
          onClick={() => onDownload(option)}
          className={`w-full text-left px-3 py-2.5 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all duration-200 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
            isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
          }`}
          style={{
            transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
          }}
          role="menuitem"
          tabIndex={isOpen ? 0 : -1}
        >
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200 shrink-0" />
          <span className="font-medium flex-1 text-sm">{option.name}</span>
          <Download className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
        </button>
      ))}
    </div>
  </div>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isMobileResumeOpen, setIsMobileResumeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [activeSection, setActiveSection] = useState('hero');
  
  const headerRef = useRef(null);
  const mobileMenuRef = useRef(null);
  const resumeDropdownRef = useRef(null);
  
  const isMobile = useMediaQuery('(max-width: 768px)');
  const debouncedScrolled = useDebounce(isScrolled, 100);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced scroll detection with throttling
  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          setIsScrolled(window.scrollY > 50);
          
          // Update active section based on scroll position
          const sections = ['hero', 'about', 'tech-stack', 'projects', 'resumes', 'certificates', 'contact'];
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
          
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeSection]);

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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsResumeOpen(false);
        setIsMobileResumeOpen(false);
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
  }, [isOpen]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, isMobile]);

  const resumes = [
    { name: "Main Resume", url: "/NaveenAgarwal__Resume.pdf", format: "pdf" },
    { name: "Frontend Resume", url: "/Naveen Agarwal - Frontend.pdf", format: "pdf" },
    { name: "Backend Resume", url: "/NaveenAgarwal_Backend.pdf", format: "pdf" }
  ];

  const handleResumeDownload = useCallback((option) => {
    try {
      if (option.format === 'view') {
        window.open(option.url, '_blank', 'noopener,noreferrer');
      } else {
        const link = document.createElement('a');
        link.href = option.url;
        link.download = `naveen-agarwal-${option.name.toLowerCase().replace(/\s+/g, '-')}.${option.format}`;
        link.style.display = 'none';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download failed:', error);
      // Fallback: open in new tab
      window.open(option.url, '_blank', 'noopener,noreferrer');
    }
    
    setIsResumeOpen(false);
    setIsMobileResumeOpen(false);
    setIsOpen(false);
  }, []);

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
    }
  }, []);

  const navItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'tech-stack', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'resumes', label: 'Resumes', icon: FileText },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'contact', label: 'Contact', icon: Mail }
  ];

  if (!mounted) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="text-xl font-bold text-white">
              Naveen<span className="text-blue-500">.</span>
            </div>
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
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-xl font-bold text-white hover:text-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg px-2 py-1"
              aria-label="Go to top of page"
            >
              Naveen<span className="text-blue-500 animate-pulse">.</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8" role="navigation">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className={`relative text-sm font-medium transition-all duration-300 group focus:outline-none focus:ring-2 focus:ring-blue-400/50 rounded-lg px-3 py-2 ${
                  activeSection === item.id 
                    ? 'text-blue-400' 
                    : 'text-gray-300 hover:text-white'
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

          {/* Desktop Resume Button */}
          <div className="hidden md:flex items-center">
            <div className="relative" ref={resumeDropdownRef}>
              <button
                id="resume-button"
                onClick={() => setIsResumeOpen(!isResumeOpen)}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-2 overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400/50"
                aria-expanded={isResumeOpen}
                aria-haspopup="menu"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                <span className="relative z-10 flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resume
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

          {/* Mobile Menu Button - Responsive design */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50"
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
            isOpen ? 'max-h-[600px] opacity-100' : 'max-h-0 opacity-0'
          }`}
          role="menu"
          aria-hidden={!isOpen}
        >
          <div className="px-2 pt-4 pb-6 space-y-2 bg-gray-900/95 backdrop-blur-xl rounded-2xl mt-4 border border-gray-800/50 shadow-2xl">
            {/* Navigation Items */}
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-base font-medium w-full text-left transition-all duration-300 hover:scale-105 transform focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                    activeSection === item.id
                      ? 'text-white bg-blue-500/20 border border-blue-500/30'
                      : 'text-gray-300 hover:text-white hover:bg-blue-500/10'
                  } ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                  style={{ 
                    transitionDelay: isOpen ? `${index * 100}ms` : '0ms' 
                  }}
                  role="menuitem"
                  tabIndex={isOpen ? 0 : -1}
                >
                  <Icon className={`h-5 w-5 ${
                    activeSection === item.id ? 'text-blue-400' : 'text-blue-400'
                  }`} />
                  <span>{item.label}</span>
                  {activeSection === item.id && (
                    <div className="ml-auto w-2 h-2 bg-blue-400 rounded-full" />
                  )}
                </button>
              );
            })}

            {/* Mobile Resume Section */}
            <div className="pt-4 border-t border-gray-800/50">
              <div className="relative z-10">
                <button
                  onClick={() => setIsMobileResumeOpen(!isMobileResumeOpen)}
                  className={`group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-3 rounded-xl font-medium 
                    transition-all duration-300 transform hover:scale-105 flex items-center justify-between overflow-hidden focus:outline-none focus:ring-2 focus:ring-blue-400/50
                    ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                  style={{
                    transitionDelay: isOpen ? `${navItems.length * 100}ms` : '0ms'
                  }}
                  aria-expanded={isMobileResumeOpen}
                  tabIndex={isOpen ? 0 : -1}
                >
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" />
                  <span className="relative z-10 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Download Resume
                  </span>
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 relative z-10 ${
                    isMobileResumeOpen ? 'rotate-180' : ''
                  }`} />
                </button>

                <div className={`mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-800/50 rounded-2xl shadow-2xl overflow-hidden transition-all duration-300 ${
                  isMobileResumeOpen ? 'max-h-64 opacity-100' : 'max-h-0 opacity-0 pointer-events-none'
                }`}>
                  <div className="py-2">
                    {resumes.map((option, index) => (
                      <button
                        key={option.name}
                        onClick={() => handleResumeDownload(option)}
                        className={`w-full text-left px-4 py-2.5 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-lg transition-all duration-200 flex items-center gap-3 group focus:outline-none focus:ring-2 focus:ring-blue-400/50 ${
                          isMobileResumeOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'
                        }`}
                        style={{ 
                          transitionDelay: isMobileResumeOpen ? `${index * 100}ms` : '0ms' 
                        }}
                        tabIndex={isMobileResumeOpen ? 0 : -1}
                      >
                        <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200" />
                        <span className="text-sm flex-1">{option.name}</span>
                        <Download className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
