import React, { useState, useEffect, useRef } from 'react';
import { Download, MapPin, Mail, Phone, ChevronDown, User, Code, Coffee, Award } from 'lucide-react';
import TranslatedText from './TranslatedText';
import { useLanguage } from '../contexts/LanguageContext';

const About = ({ personalData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [skillsVisible, setSkillsVisible] = useState(false);
  const [animatedSkills, setAnimatedSkills] = useState({});
  const [aboutData, setAboutData] = useState(null);
  const [loading, setLoading] = useState(false);
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);

  // Merge personalData with API data, prioritizing personalData
  const displayData = personalData || aboutData || {};

  // Fetch about data from API if no personalData provided
  useEffect(() => {
    if (!personalData) {
      fetchAboutData();
    }
  }, [personalData]);

  // Listen for personal data updates
  useEffect(() => {
    const handlePersonalDataUpdate = () => {
      console.log('Personal data updated, refreshing...');
      fetchAboutData();
    };

    window.addEventListener('personalDataUpdated', handlePersonalDataUpdate);
    
    return () => {
      window.removeEventListener('personalDataUpdated', handlePersonalDataUpdate);
    };
  }, []);

  const fetchAboutData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/portfolio/personal');
      const result = await response.json();
      if (result.success) {
        setAboutData(result.data);
      } else {
        throw new Error('Failed to fetch personal data');
      }
    } catch (error) {
      console.error('Error fetching about data:', error);
      // Fallback data
      setAboutData({
        title: "About Me",
        tagline: "Get to know more about my journey, skills, and passion for creating amazing web experiences",
        experience: "3+ Years",
        projects: "25+",
        technologies: "15+",
        name: "Naveen Agarwal",
        email: "naveen@example.com",
        phone: "+1 (555) 123-4567",
        location: "San Francisco, CA",
        profileImageUrl: "/Naveen.jpg",
        bio: "I'm a passionate frontend developer with expertise in creating modern, responsive web applications using cutting-edge technologies like React, Tailwind CSS, and the MERN stack.",
        resumeUrl: "/NaveenAgarwal__Resume.pdf",
        frontendResumeUrl: "/Naveen Agarwal - Frontend.pdf",
        backendResumeUrl: "/NaveenAgarwal_Backend.pdf"
      });
    } finally {
      setLoading(false);
    }
  };

  const resumes = displayData ? [
    {
      name: "Main Resume",
      url: displayData.resumeUrl || "/NaveenAgarwal__Resume.pdf",
      format: "pdf"
    },
    {
      name: "Frontend Resume", 
      url: displayData.frontendResumeUrl || "/Naveen Agarwal - Frontend.pdf",
      format: "pdf"
    },
    {
      name: "Backend Resume",
      url: displayData.backendResumeUrl || "/NaveenAgarwal_Backend.pdf",
      format: "pdf"
    }
  ] : [];

  const skills = displayData.skills || [
    { name: "React.js", level: 90 },
    { name: "JavaScript", level: 85 },
    { name: "HTML/CSS", level: 95 },
    { name: "Node.js", level: 80 },
    { name: "MongoDB", level: 75 },
    { name: "Python", level: 70 }
  ];

  // Intersection Observer for scroll animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (aboutRef.current) {
      observer.observe(aboutRef.current);
    }

    return () => observer.disconnect();
  }, []);

  // Skills animation observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setSkillsVisible(true);
          // Animate skills with staggered delays
          skills.forEach((skill, index) => {
            setTimeout(() => {
              setAnimatedSkills(prev => ({
                ...prev,
                [skill.name]: skill.level
              }));
            }, index * 200);
          });
        }
      },
      { threshold: 0.5 }
    );

    if (skillsRef.current) {
      observer.observe(skillsRef.current);
    }

    return () => observer.disconnect();
  }, [skills]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.resume-dropdown-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isOpen]);

  const handleDownloadResume = (resume) => {
    if (resume.format === 'view') {
      window.open(resume.url, '_blank');
    } else {
      const link = document.createElement('a');
      link.href = resume.url;
      link.download = `${resume.name.toLowerCase().replace(/\s+/g, '-')}.${resume.format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    setIsOpen(false);
  };

  const Progress = ({ value, animated = false }) => (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-forge-orange to-ember-red rounded-full transition-all duration-1000 ease-out"
        style={{ 
          width: animated ? `${value || 0}%` : '0%',
          transform: animated ? 'translateX(0)' : 'translateX(-100%)'
        }}
      />
    </div>
  );

  // Loading state
  if (loading) {
    return (
      <section id="about" className="py-16 sm:py-20 bg-gray-800 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-700 rounded w-48 mx-auto mb-4"></div>
              <div className="h-4 bg-gray-700 rounded w-96 mx-auto"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="about" ref={aboutRef} className="py-16 sm:py-20 bg-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-10 sm:-left-20 w-32 h-32 sm:w-40 sm:h-40 bg-forge-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-10 sm:-right-20 w-32 h-32 sm:w-40 sm:h-40 bg-ember-red/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            <TranslatedText>{displayData.title || "About Me"}</TranslatedText>
          </h2>
          <div className="w-20 sm:w-24 h-1 bg-gradient-to-r from-forge-orange to-ember-red mx-auto mb-6 sm:mb-8 rounded-full"></div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            <TranslatedText>
              {displayData.description || "Get to know more about my journey, skills, and passion for creating amazing web experiences"}
            </TranslatedText>
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Left Side - Image and Info */}
          <div className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Profile Image */}
            <div className="relative group mx-auto lg:mx-0">
              <div className="w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-forge-orange to-ember-red p-1 shadow-2xl">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800">
                  <img 
                    src={displayData.profileImageUrl || displayData.image || "/Naveen.jpg"}
                    alt={displayData.name || "Naveen Agarwal"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/Naveen.jpg";
                    }}
                  />
                </div>
              </div>
              {/* Floating elements around image */}
              <div className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 w-6 h-6 sm:w-8 sm:h-8 bg-forge-orange/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-2 -left-2 sm:-bottom-4 sm:-left-4 w-4 h-4 sm:w-6 sm:h-6 bg-ember-red/20 rounded-full animate-pulse delay-1000"></div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <h3 className="text-lg sm:text-xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <TranslatedText>Contact Information</TranslatedText>
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="group flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-forge-orange/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <Mail className="h-4 w-4 sm:h-5 sm:w-5 text-forge-orange" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base truncate">
                    {displayData.email || "naveen@example.com"}
                  </span>
                </div>
                <div className="group flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <Phone className="h-4 w-4 sm:h-5 sm:w-5 text-green-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base">
                    {displayData.phone || "+1 (555) 123-4567"}
                  </span>
                </div>
                <div className="group flex items-center gap-3 sm:gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-clay/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform shrink-0">
                    <MapPin className="h-4 w-4 sm:h-5 sm:w-5 text-clay" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors text-sm sm:text-base">
                    {displayData.location || "San Francisco, CA"}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Resume Download - Fixed for mobile */}
              <div className="relative mt-4 sm:mt-6 resume-dropdown-container z-[100]">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="group w-full bg-gradient-to-r from-forge-orange to-ember-red hover:from-ember-red hover:to-forge-orange text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl font-medium
                  transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-forge-orange/25 flex items-center justify-between overflow-hidden text-sm sm:text-base"
                >
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <Download className="h-4 w-4 sm:h-5 sm:w-5" />
                    <TranslatedText>Download Resume</TranslatedText>
                  </span>
                  <ChevronDown className={`h-4 w-4 sm:h-5 sm:w-5 transition-transform duration-300 relative z-10 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Enhanced Dropdown - Fixed positioning for mobile */}
                <div className={`relative left-0 right-0 mt-2 bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden
                  transition-all duration-300 transform origin-top z-[100] ${
                  isOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="p-2 max-h-64 sm:max-h-48 overflow-y-auto">
                    {resumes.map((resume, index) => (
                      <button
                        key={resume.name}
                        onClick={() => handleDownloadResume(resume)}
                        className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 text-gray-300 hover:text-white hover:bg-forge-orange/10 rounded-xl 
                          transition-all duration-200 flex items-center gap-2 sm:gap-3 group transform text-sm sm:text-base
                          ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                        style={{
                          transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
                        }}
                      >
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-forge-orange rounded-full group-hover:scale-125 transition-transform duration-200 shrink-0"></div>
                        <span className="font-medium flex-1 truncate">
                          <TranslatedText>{resume.name}</TranslatedText>
                        </span>
                        <Download className="h-3 w-3 sm:h-4 sm:w-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200 shrink-0" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Right Side - Bio and Skills */}
          <div className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Bio with Stats */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <User className="h-5 w-5 sm:h-6 sm:w-6 text-forge-orange" />
                <TranslatedText>My Story</TranslatedText>
              </h3>
              <div className="space-y-4 sm:space-y-6 text-gray-300 leading-relaxed">
                <p className="text-sm sm:text-base lg:text-lg">
                  <TranslatedText>
                    {displayData.bio || "I'm a passionate frontend developer with expertise in creating modern, responsive web applications using cutting-edge technologies like React, Tailwind CSS, and the MERN stack. With a strong foundation in both frontend and backend development, I specialize in building seamless user experiences that are both visually appealing and highly functional."}
                  </TranslatedText>
                </p>
                
                {/* Stats Grid */}
                {(displayData.experience || displayData.projects || displayData.technologies) && (
                  <div className="grid grid-cols-3 gap-4 py-4 border-t border-white/10">
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-forge-orange">
                        {displayData.experience || "3+"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        <TranslatedText>Years Experience</TranslatedText>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-ember-red">
                        {displayData.projects || "25+"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        <TranslatedText>Projects</TranslatedText>
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xl sm:text-2xl font-bold text-craft-green">
                        {displayData.technologies || "15+"}
                      </div>
                      <div className="text-xs sm:text-sm text-gray-400">
                        <TranslatedText>Technologies</TranslatedText>
                      </div>
                    </div>
                  </div>
                )}
                
                <p className="text-gray-400 text-sm sm:text-base">
                  <TranslatedText>
                    When I'm not coding, I enjoy exploring new technologies, contributing to open-source projects, and staying updated with the latest trends in web development and artificial intelligence.
                  </TranslatedText>
                </p>
              </div>
            </div>

            {/* Skills Highlights Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <Code className="h-5 w-5 sm:h-6 sm:w-6 text-forge-orange mr-2" />
                  <h4 className="font-semibold text-white text-sm sm:text-base">
                    <TranslatedText>Frontend</TranslatedText>
                  </h4>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  <TranslatedText>React, Next.js, TypeScript, Tailwind CSS</TranslatedText>
                </p>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300">
                <div className="flex items-center mb-3">
                  <Coffee className="h-5 w-5 sm:h-6 sm:w-6 text-green-400 mr-2" />
                  <h4 className="font-semibold text-white text-sm sm:text-base">
                    <TranslatedText>Backend</TranslatedText>
                  </h4>
                </div>
                <p className="text-gray-400 text-xs sm:text-sm">
                  <TranslatedText>Node.js, Express, MongoDB</TranslatedText>
                </p>
              </div>
            </div>
            
            {/* Skills Progress Bars */}
            <div ref={skillsRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 sm:p-6 lg:p-8 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-xl sm:text-2xl font-semibold text-white mb-4 sm:mb-6 flex items-center gap-2">
                <Award className="h-5 w-5 sm:h-6 sm:w-6 text-green-400" />
                <TranslatedText>Technical Skills</TranslatedText>
              </h3>
              <div className="grid gap-4 sm:gap-6">
                {skills.map((skill, index) => (
                  <div 
                    key={skill.name || index} 
                    className={`space-y-2 sm:space-y-3 transform transition-all duration-500 ${
                      skillsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium text-sm sm:text-base">{skill.name}</span>
                      <span className="text-forge-orange text-xs sm:text-sm font-semibold bg-forge-orange/10 px-2 py-1 rounded-lg">
                        {animatedSkills[skill.name] || 0}%
                      </span>
                    </div>
                    <Progress 
                      value={animatedSkills[skill.name] || 0}
                      animated={skillsVisible}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;