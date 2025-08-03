import React, { useState, useEffect } from 'react';
import { Download, Home, User, Briefcase, Mail, Code } from 'lucide-react';
import AnimatedHamburgerIcon from './ui/AnimatedHamburgerIcon';
import { Button } from './ui/button';
import { portfolioAPI } from '../services/api';

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isResumeOpen, setIsResumeOpen] = useState(false);
  const [personalData, setPersonalData] = useState(null);

  useEffect(() => {
    const fetchPersonalData = async () => {
      try {
        const response = await portfolioAPI.getPersonal();
        if (response.data.success) {
          setPersonalData(response.data.data);
        }
      } catch (error) {
        console.error('Error fetching personal data:', error);
      }
    };

    fetchPersonalData();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const resumes = personalData ? [
    {
      name: "Main Resume",
      url: personalData.resumeUrl || "/Naveen Agarwal - Frontend.pdf"
    },
    {
      name: "Frontend Resume",
      url: personalData.frontendResumeUrl || "/Naveen Agarwal - Frontend.pdf"
    },
    {
      name: "Backend Resume",
      url: personalData.backendResumeUrl || "/NaveenAgarwal_Backend.pdf"
    }
  ] : [];

  const handleDownloadResume = (url, name) => {
    // Download resume from public folder
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

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-800' 
        : 'bg-transparent'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <button 
              onClick={() => scrollToSection('hero')}
              className="text-xl font-bold text-white hover:text-blue-400 transition-colors duration-200"
            >
              Naveen<span className="text-blue-500">.</span>
            </button>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-gray-300 hover:text-white transition-colors duration-200 text-sm font-medium"
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Resume Download Button */}
          <div className="hidden md:flex items-center">
          <div className="relative inline-block text-left">
            <button
              type="button"
              onClick={() => setIsResumeOpen(!isResumeOpen)}
              className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              id="menu-button"
              aria-expanded={isResumeOpen}
              aria-haspopup="true"
            >
              Download Resume
              <Download className="h-4 w-4 ml-2" />
            </button>

            {isResumeOpen && (
              <div
                className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                role="menu"
                aria-orientation="vertical"
                aria-labelledby="menu-button"
                tabIndex="-1"
              >
                <div className="py-1" role="none">
                  {resumes.map((resume) => (
                    <button
                      key={resume.name}
                      onClick={() => {
                        handleDownloadResume(resume.url, resume.name);
                        setIsResumeOpen(false);
                      }}
                      className="text-gray-300 block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                      role="menuitem"
                      tabIndex="-1"
                    >
                      {resume.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-300 hover:text-white p-2"
              aria-label="Toggle menu"
              aria-expanded={isOpen}
            >
              <AnimatedHamburgerIcon isOpen={isOpen} />
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
            isOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
          }`}
          aria-hidden={!isOpen}
        >
          <div className="px-2 pt-2 pb-20 space-y-1 bg-gray-800/95 backdrop-blur-md rounded-lg mt-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="flex items-center gap-3 text-gray-300 hover:text-white px-3 py-2 rounded-md text-base font-medium w-full text-left transition-colors duration-200"
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </button>
              );
            })}
            <div className="pt-2 border-t border-gray-700">
              <div className="relative inline-block text-left w-full">
                <button
                  type="button"
                  onClick={() => setIsResumeOpen(!isResumeOpen)}
                  className="inline-flex justify-center w-full rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-blue-600 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  id="mobile-menu-button"
                  aria-expanded={isResumeOpen}
                  aria-haspopup="true"
                >
                  Download Resume
                  <Download className="h-4 w-4 ml-2" />
                </button>

                  {isResumeOpen && (
                    <div
                      className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-gray-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50"
                      role="menu"
                      aria-orientation="vertical"
                      aria-labelledby="mobile-menu-button"
                      tabIndex="-1"
                    >
                      <div className="py-1" role="none">
                        {resumes.map((resume) => (
                          <button
                            key={resume.name}
                            onClick={() => {
                              handleDownloadResume(resume.url, resume.name);
                              setIsResumeOpen(false);
                            }}
                            className="text-gray-300 block w-full text-left px-4 py-2 text-sm hover:bg-gray-700"
                            role="menuitem"
                            tabIndex="-1"
                          >
                            {resume.name}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
      </div>
    </header>
  );
};

export default Header;
