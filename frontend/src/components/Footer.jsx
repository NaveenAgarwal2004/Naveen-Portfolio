import React, { useState, useEffect, useRef } from 'react';
import { Github, Linkedin, Mail, Twitter, Heart, ArrowUp, Sparkles, MapPin, Phone, Clock } from 'lucide-react';
import TranslatedText from './TranslatedText';

const Footer = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());
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

  // Update current time every minute
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

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
    }).catch(() => {
      // Handle dynamic import failure
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

    window.addEventListener('scroll', handleScroll, { passive: true });
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
    { label: 'Resumes', id: 'resumes' },
    { label: 'Certificates', id: 'certificates' },
    { label: 'Contact', id: 'contact' }
  ];

  const socialLinks = [
    {
      icon: Github,
      href: personalData.socialLinks.github,
      label: 'GitHub',
      color: 'hover:text-gray-300',
      bgColor: 'hover:bg-gray-500/20',
      hoverShadow: 'hover:shadow-gray-500/25'
    },
    {
      icon: Linkedin,
      href: personalData.socialLinks.linkedin,
      label: 'LinkedIn',
      color: 'hover:text-blue-400',
      bgColor: 'hover:bg-blue-500/20',
      hoverShadow: 'hover:shadow-blue-500/25'
    },
    {
      icon: Twitter,
      href: personalData.socialLinks.twitter,
      label: 'Twitter',
      color: 'hover:text-cyan-400',
      bgColor: 'hover:bg-cyan-500/20',
      hoverShadow: 'hover:shadow-cyan-500/25'
    },
    {
      icon: Mail,
      href: `mailto:${personalData.socialLinks.email}`,
      label: 'Email',
      color: 'hover:text-red-400',
      bgColor: 'hover:bg-red-500/20',
      hoverShadow: 'hover:shadow-red-500/25'
    }
  ];

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  return (
    <>
      {/* Enhanced Scroll to Top Button */}
      <button
        onClick={scrollToTop}
        className={`fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white rounded-full
          flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform z-50 group
          ${showScrollTop ? 'translate-y-0 opacity-100 scale-100' : 'translate-y-16 opacity-0 scale-75 pointer-events-none'}
          hover:scale-110 active:scale-95`}
        aria-label="Scroll to top"
      >
        <ArrowUp className="h-5 w-5 group-hover:animate-bounce" />
      </button>

      <footer ref={footerRef} className="bg-gradient-to-b from-gray-900 to-black border-t border-gray-800/50 relative overflow-hidden">
        {/* Subtle Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-4 left-1/4 w-16 h-16 bg-blue-500/3 rounded-full blur-2xl"></div>
          <div className="absolute bottom-4 right-1/4 w-16 h-16 bg-purple-500/3 rounded-full blur-2xl"></div>
          
          {/* Reduced floating particles */}
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-0.5 bg-blue-400/15 rounded-full animate-float"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 5}s`,
                animationDuration: `${3 + Math.random() * 4}s`
              }}
            />
          ))}
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Main Footer Content - Reduced padding */}
          <div className="py-8 grid lg:grid-cols-4 md:grid-cols-2 gap-6">
            {/* Brand & Description - More compact */}
            <div className={`lg:col-span-2 transform transition-all duration-1000 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <div className="mb-4">
                <button 
                  onClick={scrollToTop}
                  className="group text-2xl font-bold text-white hover:text-blue-400 transition-all duration-300 hover:scale-105 active:scale-95 flex items-center gap-2"
                >
                  <span>Naveen</span>
                  <span className="text-blue-500">.</span>
                  <Sparkles className="h-5 w-5 text-purple-400 opacity-0 group-hover:opacity-100 transition-all duration-300" />
                </button>
              </div>
              
              <p className="text-gray-400 text-sm mb-4 max-w-md leading-relaxed">
                <TranslatedText>
                  Frontend Developer passionate about creating beautiful web experiences. Always learning, always building.
                </TranslatedText>
              </p>
              
              {/* Compact Social Links */}
              <div className="flex gap-3 mb-4">
                {socialLinks.map((social, index) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={social.label}
                      href={social.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`group relative p-2.5 bg-white/5 backdrop-blur-sm border border-white/10 rounded-lg text-gray-500 ${social.color} ${social.bgColor}
                        transition-all duration-300 hover:scale-110 hover:border-white/20 transform hover:shadow-lg ${social.hoverShadow}
                        ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`}
                      style={{ transitionDelay: `${100 + index * 50}ms` }}
                      aria-label={`Follow on ${social.label}`}
                    >
                      <Icon className="h-4 w-4 group-hover:scale-110 transition-transform duration-200" />
                      
                      {/* Tooltip */}
                      <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                        {social.label}
                      </div>
                    </a>
                  );
                })}
              </div>

              {/* Compact Live Status */}
              <div className={`flex items-center gap-4 text-xs ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`} 
                   style={{ transitionDelay: '400ms' }}>
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-400">
                    <TranslatedText>Available for work</TranslatedText>
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-gray-500">
                  <Clock className="h-3 w-3" />
                  <span>{formatTime(currentTime)}</span>
                </div>
              </div>
            </div>

            {/* Compact Quick Links */}
            <div className={`transform transition-all duration-1000 delay-200 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                <TranslatedText>Quick Links</TranslatedText>
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {footerLinks.map((link, index) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="group text-gray-400 hover:text-white transition-all duration-200 text-xs text-left transform hover:translate-x-0.5"
                  >
                    <TranslatedText>{link.label}</TranslatedText>
                  </button>
                ))}
              </div>

              {/* Compact Additional Links */}
              <div className="mt-4 pt-4 border-t border-gray-800/30">
                <div className="space-y-1">
                  <button
                    onClick={() => window.open('/NaveenAgarwal__Resume.pdf', '_blank')}
                    className="text-gray-500 hover:text-blue-400 text-xs transition-colors duration-200 block"
                  >
                    <TranslatedText>Download Resume</TranslatedText>
                  </button>
                  <button
                    onClick={() => scrollToSection('projects')}
                    className="text-gray-500 hover:text-blue-400 text-xs transition-colors duration-200 block"
                  >
                    <TranslatedText>View Portfolio</TranslatedText>
                  </button>
                </div>
              </div>
            </div>

            {/* Compact Contact Info */}
            <div className={`transform transition-all duration-1000 delay-400 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
            }`}>
              <h3 className="text-white font-semibold text-base mb-4 flex items-center gap-2">
                <div className="w-0.5 h-4 bg-gradient-to-b from-green-500 to-cyan-500 rounded-full"></div>
                <TranslatedText>Contact</TranslatedText>
              </h3>
              
              <div className="space-y-3 text-xs">
                {/* Compact Email */}
                <a 
                  href={`mailto:${personalData.email}`}
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <div className="w-6 h-6 bg-red-500/20 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Mail className="h-3 w-3 text-red-400" />
                  </div>
                  <span className="truncate">{personalData.email}</span>
                </a>

                {/* Compact Phone */}
                <a 
                  href={`tel:${personalData.phone}`}
                  className="text-gray-400 hover:text-white transition-colors duration-200 flex items-center gap-2 group"
                >
                  <div className="w-6 h-6 bg-green-500/20 rounded-md flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <Phone className="h-3 w-3 text-green-400" />
                  </div>
                  <span>{personalData.phone}</span>
                </a>

                {/* Compact Location */}
                <div className="text-gray-400 flex items-center gap-2">
                  <div className="w-6 h-6 bg-blue-500/20 rounded-md flex items-center justify-center">
                    <MapPin className="h-3 w-3 text-blue-400" />
                  </div>
                  <span>{personalData.location}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Compact Bottom Footer */}
          <div className={`py-4 border-t border-gray-800/50 transform transition-all duration-1000 delay-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Mobile Layout */}
            <div className="flex flex-col space-y-3 md:hidden">
              <div className="flex flex-wrap items-center justify-center gap-1 text-gray-400 text-xs text-center">
                <span>© {currentYear} Naveen Agarwal.</span>
                <div className="flex items-center gap-1">
                  <span>
                    <TranslatedText>Made with</TranslatedText>
                  </span>
                  <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                  <span>
                    <TranslatedText>and ☕</TranslatedText>
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-center gap-3 text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>
                    <TranslatedText>All systems operational</TranslatedText>
                  </span>
                </div>
                <span>•</span>
                <span>
                  <TranslatedText>Built with React ⚛️</TranslatedText>
                </span>
              </div>
            </div>

            {/* Desktop Layout */}
            <div className="hidden md:flex md:justify-between md:items-center">
              <div className="flex items-center gap-4 text-gray-400 text-xs">
                <div className="flex items-center gap-2">
                  <span>© {currentYear} Naveen Agarwal. <TranslatedText>Made with</TranslatedText></span>
                  <Heart className="h-3 w-3 text-red-500 animate-pulse" />
                  <span><TranslatedText>and ☕</TranslatedText></span>
                </div>
                <span>•</span>
                <span><TranslatedText>Built with React ⚛️</TranslatedText></span>
              </div>
              
              <div className="flex items-center gap-4 text-xs text-gray-500">
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                  <span>
                    <TranslatedText>All systems operational</TranslatedText>
                  </span>
                </div>
                <button
                  onClick={scrollToTop}
                  className="group bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-gray-400 hover:text-white px-3 py-1.5 rounded-lg text-xs
                  transition-all duration-200 hover:scale-105 flex items-center gap-1.5"
                >
                  <ArrowUp className="h-3 w-3 group-hover:animate-bounce" />
                  <span>
                    <TranslatedText>Top</TranslatedText>
                  </span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Subtle decorative bottom border */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-cyan-500 opacity-30"></div>
      </footer>

      <style jsx="true">{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.2; 
          }
          50% { 
            transform: translateY(-10px) rotate(180deg); 
            opacity: 0.5; 
          }
        }
        .animate-float {
          animation: float ease-in-out infinite;
        }
      `}</style>
    </>
  );
};

export default Footer;