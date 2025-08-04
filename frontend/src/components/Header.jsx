import React, { useState, useEffect } from 'react';
import { Download, Home, User, Briefcase, Mail, Code, ChevronDown } from 'lucide-react';

const AnimatedHamburgerIcon = ({ isOpen }) => (
  <div className="w-6 h-6 flex flex-col justify-center items-center">
    <div className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-out ${
      isOpen ? 'rotate-45 translate-y-1.5' : ''
    }`} />
    <div className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-out mt-1 ${
      isOpen ? 'opacity-0' : ''
    }`} />
    <div className={`w-6 h-0.5 bg-current transform transition-all duration-300 ease-out mt-1 ${
      isOpen ? '-rotate-45 -translate-y-1.5' : ''
    }`} />
  </div>
);

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [isMobileResumeOpen, setIsMobileResumeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Sample resume data
  const resumes = [
    { name: "Main Resume", url: "/Naveen Agarwal - Frontend.pdf" },
    { name: "Frontend Resume", url: "/Naveen Agarwal - Frontend.pdf" },
    { name: "Backend Resume", url: "/NaveenAgarwal_Backend.pdf" }
  ];

  const handleDownloadResume = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsOpen(false);
    }
  };

  const navItems = [
    { id: 'hero', label: 'Home', icon: Home },
    { id: 'about', label: 'About', icon: User },
    { id: 'tech-stack', label: 'Skills', icon: Code },
    { id: 'projects', label: 'Projects', icon: Briefcase },
    { id: 'contact', label: 'Contact', icon: Mail },
  ];

  if (!mounted) return null;

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-xl border-b border-gray-800/50 shadow-2xl' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-xl font-bold text-white hover:text-blue-400 transition-all duration-300 hover:scale-105 active:scale-95"
            >
              Naveen<span className="text-blue-500 animate-pulse">.</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="relative text-gray-300 hover:text-white transition-all duration-300 text-sm font-medium group"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <span className="relative z-10">{item.label}</span>
                <div className="absolute inset-0 bg-blue-500/20 rounded-lg scale-0 group-hover:scale-100 transition-transform duration-300 -z-10"></div>
                <div className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-500 group-hover:w-full transition-all duration-300"></div>
              </button>
            ))}
          </nav>

          {/* Desktop Resume Download */}
          <div className="hidden md:flex items-center">
            <div className="relative">
              <button
                onClick={() => setIsResumeOpen(!isResumeOpen)}
                className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-2.5 rounded-xl font-medium transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
                flex items-center gap-2 overflow-hidden"
              >
                <div className="absolute inset-0 bg-white/20 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Resume
                  <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${isResumeOpen ? 'rotate-180' : ''}`} />
                </span>
              </button>

              {/* Desktop Dropdown */}
              <div className={`absolute right-0 mt-2 w-64 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden
                transition-all duration-300 transform origin-top-right ${
                isResumeOpen 
                  ? 'opacity-100 scale-100 translate-y-0' 
                  : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
              }`}>
                <div className="p-2">
                  {resumes.map((resume, index) => (
                    <button
                      key={resume.name}
                      onClick={() => {
                        handleDownloadResume(resume.url, resume.name);
                        setIsResumeOpen(false);
                      }}
                      className="w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-xl transition-all duration-200 flex items-center gap-3 group"
                      style={{
                        animationDelay: `${index * 50}ms`
                      }}
                    >
                      <div className="w-2 h-2 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                      <span className="font-medium">{resume.name}</span>
                      <Download className="h-4 w-4 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2 rounded-lg hover:bg-gray-800/50 transition-all duration-300"
              aria-label="Toggle menu"
            >
              <AnimatedHamburgerIcon isOpen={isOpen} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-500 ease-out ${
            isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
          }`}
        >
          <div className="px-2 pt-4 pb-6 space-y-2 bg-gray-900/95 backdrop-blur-xl rounded-2xl mt-4 border border-gray-800/50 shadow-2xl">
            {navItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className={`flex items-center gap-3 text-gray-300 hover:text-white px-4 py-3 rounded-xl text-base font-medium w-full text-left 
                    transition-all duration-300 hover:bg-blue-500/10 hover:scale-105 transform
                    ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                  style={{
                    transitionDelay: isOpen ? `${index * 100}ms` : '0ms'
                  }}
                >
                  <Icon className="h-5 w-5 text-blue-400" />
                  <span>{item.label}</span>
                  <div className="ml-auto w-0 h-0.5 bg-blue-500 group-hover:w-8 transition-all duration-300"></div>
                </button>
              );
            })}
            
            {/* Mobile Resume Dropdown */}
            <div className="pt-4 border-t border-gray-800/50">
              <button
                onClick={() => setIsMobileResumeOpen(!isMobileResumeOpen)}
                className={`group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-3 rounded-xl font-medium 
                  transition-all duration-300 transform hover:scale-105 flex items-center justify-between overflow-hidden
                  ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                style={{
                  transitionDelay: isOpen ? `${navItems.length * 100}ms` : '0ms'
                }}
              >
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <span className="relative z-10 flex items-center gap-2">
                  <Download className="h-4 w-4" />
                  Download Resume
                </span>
                <ChevronDown className={`h-4 w-4 transition-transform duration-300 relative z-10 ${isMobileResumeOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Mobile Resume Options */}
              <div className={`mt-2 space-y-1 overflow-hidden transition-all duration-300 ${
                isMobileResumeOpen ? 'max-h-48 opacity-100' : 'max-h-0 opacity-0'
              }`}>
                {resumes.map((resume, index) => (
                  <button
                    key={resume.name}
                    onClick={() => {
                      handleDownloadResume(resume.url, resume.name);
                      setIsMobileResumeOpen(false);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left px-6 py-2.5 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg 
                      transition-all duration-200 flex items-center gap-3 group ml-4
                      ${isMobileResumeOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                    style={{
                      transitionDelay: isMobileResumeOpen ? `${index * 100}ms` : '0ms'
                    }}
                  >
                    <div className="w-1.5 h-1.5 bg-blue-400 rounded-full group-hover:scale-125 transition-transform duration-200"></div>
                    <span className="text-sm">{resume.name}</span>
                    <Download className="h-3 w-3 ml-auto opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;