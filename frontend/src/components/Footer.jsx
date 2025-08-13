import React, { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Mail, Twitter, Heart, ArrowUp, Sparkles } from 'lucide-react';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const footerRef = useRef(null);
  const currentYear = new Date().getFullYear();

  const [personalData, setPersonalData] = useState({
    email: "naveen@example.com",
    phone: "+1 (555) 123-4567",
    location: "San Francisco, CA",
    socialLinks: {
      github: "https://github.com/NaveenAgarwal2004",
      linkedin: "https://linkedin.com/in/naveen-agarwal",
      twitter: "https://twitter.com/naveen_dev",
      email: "naveen@example.com"
    }
  });

  useEffect(() => {
    import('../services/api').then(({ portfolioAPI }) => {
      portfolioAPI.getPersonal()
        .then(response => {
          if (response.data.success) {
            const data = response.data.data;
            setPersonalData({
              email: data.email || "naveen@example.com",
              phone: data.phone || "+1 (555) 123-4567",
              location: data.location || "San Francisco, CA",
              socialLinks: {
                github: data.socialLinks?.github || "https://github.com/NaveenAgarwal2004",
                linkedin: data.socialLinks?.linkedin || "https://linkedin.com/in/naveen-agarwal",
                twitter: data.socialLinks?.twitter || "https://twitter.com/naveen_dev",
                email: data.socialLinks?.email || "naveen@example.com"
              }
            });
          }
        })
        .catch(() => {
          // Fallback to mock data if API fails
        });
    });
  }, []);

  // Intersection Observer for footer animation
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Scroll to top button visibility
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const footerLinks = [
    { label: 'Home', id: 'hero' },
    { label: 'About', id: 'about' },
    { label: 'Skills', id: 'tech-stack' },
    { label: 'Projects', id: 'projects' },
    { label: 'Contact', id: 'contact' }
  ];

  const socialLinks = [
    {
      icon: Github,
      href: personalData.socialLinks.github,
      label: 'GitHub',
      color: 'hover:text-gray-300',
      bgColor: 'hover:bg-gray-500/20'
    },
    {
      icon: Linkedin,
      href: personalData.socialLinks.linkedin,
      label: 'LinkedIn',
      color: 'hover:text-blue-400',
      bgColor: 'hover:bg-blue-500/20'
    },
    {
      icon: Twitter,
      href: personalData.socialLinks.twitter,
      label: 'Twitter',
      color: 'hover:text-cyan-400',
      bgColor: 'hover:bg-cyan-500/20'
    },
    {
      icon: Mail,
      href: `mailto:${personalData.socialLinks.email}`,
      label: 'Email',
      color: 'hover:text-red-400',
      bgColor: 'hover:bg-red-500/20'
    }
  ];

  return (
    <>
      {/* Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full
          flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform z-50
          ${showScrollTop ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-75 pointer-events-none'}
          hover:scale-110 active:scale-95`}
      >
        <ArrowUp className="h-5 w-5" />
      </button>

      <footer ref={footerRef} className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800/50 relative overflow-hidden">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-0 left-1/4 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-0 right-1/4 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Footer Content */}
          <div className="py-12 sm:py-16 grid lg:grid-cols-4 gap-8">
            {/* Brand & Description */}
            <div className={`lg:col-span-2 transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="mb-6">
                <button 
                  onClick={scrollToTop}
                  className="group text-2xl font-bold text-white hover:text-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Naveen</span>
                  <span className="text-blue-500 animate-pulse">.</span>
                  <Sparkles className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </button>
              </div>
              <p className="text-gray-400 leading-relaxed mb-6 max-w-md text-sm sm:text-base">
                Front-End Developer passionate about creating beautiful, functional web experiences. 
                Always learning, always building, always improving.
              </p>
              <div className="flex space-x-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative p-3 bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl text-gray-500 ${social.color} ${social.bgColor}
                        transition-all duration-300 hover:scale-110 hover:border-white/20 transform
                        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                      style={{
                        transitionDelay: `${200 + index * 100}ms`
                      }}
                      aria-label={social.label}
                    >
                      <Icon className="h-5 w-5 group-hover:scale-110 transition-transform duration-200" />
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    </a>
                  );
                })}
              </div>
            </div>

            {/* Quick Links */}
            <div className={`transform transition-all duration-1000 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <h3 className="text-white font-semibold text-lg">Quick Links</h3>
              </div>
              <ul className="space-y-3">
                {footerLinks.map((link, index) => (
                  <li key={link.id}>
                    <button
                      onClick={() => scrollToSection(link.id)}
                      className={`group text-gray-400 hover:text-white transition-all duration-200 text-sm flex items-center gap-2 transform
                        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}`}
                      style={{
                        transitionDelay: `${400 + index * 100}ms`
                      }}
                    >
                      <div className="w-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 group-hover:w-4 transition-all duration-300 rounded-full"></div>
                      <span>{link.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact Info */}
            <div className={`transform transition-all duration-1000 delay-400 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-1 h-6 bg-gradient-to-b from-green-500 to-cyan-500 rounded-full"></div>
                <h3 className="text-white font-semibold text-lg">Get In Touch</h3>
              </div>
              <div className="space-y-4 text-sm">
                <div className={`group transform transition-all duration-300 ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`} style={{ transitionDelay: '600ms' }}>
                  <p className="text-gray-500 text-xs font-medium mb-1">Email</p>
                  <a 
                    href={`mailto:${personalData.email}`}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <Mail className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>{personalData.email}</span>
                  </a>
                </div>
                <div className={`group transform transition-all duration-300 ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`} style={{ transitionDelay: '700ms' }}>
                  <p className="text-gray-500 text-xs font-medium mb-1">Phone</p>
                  <a 
                    href={`tel:${personalData.phone}`}
                    className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                  >
                    <span>{personalData.phone}</span>
                  </a>
                </div>
                <div className={`transform transition-all duration-300 ${
                  isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                }`} style={{ transitionDelay: '800ms' }}>
                  <p className="text-gray-500 text-xs font-medium mb-1">Location</p>
                  <p className="text-gray-400 flex items-center gap-2">
                    <span>{personalData.location}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Footer - FIXED RESPONSIVE VERSION */}
          <div className={`py-6 border-t border-gray-800/50 transform transition-all duration-1000 delay-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Mobile Layout (stacked) */}
            <div className="flex flex-col space-y-4 md:hidden">
              {/* Copyright text - mobile */}
              <div className="flex flex-wrap items-center justify-center gap-1 text-gray-400 text-xs">
                <span>© {currentYear} Naveen Agarwal.</span>
                <div className="flex items-center gap-1">
                  <span>Made with</span>
                  <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                  <span>and lots of coffee.</span>
                </div>
              </div>
              
              {/* Status and button - mobile */}
              <div className="flex flex-col items-center space-y-3">
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                <button
                  onClick={scrollToTop}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-xs font-medium
                  transition-all duration-200 hover:scale-105 flex items-center gap-2 hover:bg-white/10"
                >
                  <ArrowUp className="h-3 w-3 group-hover:scale-110 transition-transform duration-200" />
                  <span>Back to Top</span>
                </button>
              </div>
            </div>

            {/* Desktop Layout (horizontal) */}
            <div className="hidden md:flex md:justify-between md:items-center">
              {/* Copyright text - desktop */}
              <div className="flex items-center gap-2 text-gray-400 text-sm">
                <span>© {currentYear} Naveen Agarwal. Made with</span>
                <Heart className="h-4 w-4 text-red-500 animate-pulse" />
                <span>and lots of coffee.</span>
              </div>
              
              {/* Status and button - desktop */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>All systems operational</span>
                </div>
                <button
                  onClick={scrollToTop}
                  className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-4 py-2 rounded-xl text-sm font-medium
                  transition-all duration-200 hover:scale-105 flex items-center gap-2 hover:bg-white/10"
                >
                  <ArrowUp className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>Back to Top</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-50"></div>
      </footer>
    </>
  );
};

export default Footer;