import React, { useState, useEffect, useRef } from 'react';
import { Download, MapPin, Mail, Phone, ChevronDown } from 'lucide-react';

const About = ({ personalData }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [skillsVisible, setSkillsVisible] = useState(false);
  const [animatedSkills, setAnimatedSkills] = useState({});
  const aboutRef = useRef(null);
  const skillsRef = useRef(null);

  const displayData = personalData || {};

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

  const handleDownloadResume = (url, name) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = name;
    link.click();
  };

  const Progress = ({ value, animated = false }) => (
    <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
      <div 
        className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all duration-1000 ease-out"
        style={{ 
          width: animated ? `${value || 0}%` : '0%',
          transform: animated ? 'translateX(0)' : 'translateX(-100%)'
        }}
      />
    </div>
  );

  return (
    <section id="about" ref={aboutRef} className="py-16 sm:py-20 bg-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            About Me
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 sm:mb-8 rounded-full"></div>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Get to know more about my journey, skills, and passion for creating amazing web experiences
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-12 items-start">
          {/* Left Side - Image and Info */}
          <div className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Profile Image */}
            <div className="relative group mx-auto lg:mx-0">
              <div className="w-64 h-64 sm:w-80 sm:h-80 mx-auto rounded-2xl overflow-hidden bg-gradient-to-br from-blue-500 to-purple-600 p-1 shadow-2xl">
                <div className="w-full h-full rounded-2xl overflow-hidden bg-gray-800">
                  <img 
                    src={displayData.profileImageUrl || "/Naveen.jpg"}
                    alt={displayData.name || "Naveen Agarwal"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.target.src = "/Naveen.jpg";
                    }}
                  />
                </div>
              </div>
              {/* Floating elements around image */}
              <div className="absolute -top-4 -right-4 w-8 h-8 bg-blue-500/20 rounded-full animate-pulse"></div>
              <div className="absolute -bottom-4 -left-4 w-6 h-6 bg-purple-500/20 rounded-full animate-pulse delay-1000"></div>
            </div>

            {/* Contact Info Card */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 hover:bg-white/10 transition-all duration-300 shadow-xl">
              <h3 className="text-xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                Contact Information
              </h3>
              <div className="space-y-4">
                <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Mail className="h-5 w-5 text-blue-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {displayData.email || "naveen@example.com"}
                  </span>
                </div>
                <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200">
                  <div className="w-10 h-10 bg-green-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Phone className="h-5 w-5 text-green-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {displayData.phone || "+1 (555) 123-4567"}
                  </span>
                </div>
                <div className="group flex items-center gap-4 p-3 rounded-xl hover:bg-white/5 transition-all duration-200">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                    <MapPin className="h-5 w-5 text-purple-400" />
                  </div>
                  <span className="text-gray-300 group-hover:text-white transition-colors">
                    {displayData.location || "San Francisco, CA"}
                  </span>
                </div>
              </div>
              
              {/* Enhanced Resume Download */}
              <div className="relative mt-6">
                <button
                  onClick={() => setIsOpen(!isOpen)}
                  className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 py-3 rounded-xl font-medium
                  transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center justify-between overflow-hidden"
                >
                  <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                  <span className="relative z-10 flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Download Resume
                  </span>
                  <ChevronDown className={`h-5 w-5 transition-transform duration-300 relative z-10 ${isOpen ? 'rotate-180' : ''}`} />
                </button>

                {/* Enhanced Dropdown */}
                <div className={`absolute top-full mt-2 w-full bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-2xl overflow-hidden z-50
                  transition-all duration-300 transform origin-top ${
                  isOpen 
                    ? 'opacity-100 scale-100 translate-y-0' 
                    : 'opacity-0 scale-95 -translate-y-2 pointer-events-none'
                }`}>
                  <div className="p-2">
                    {resumes.map((resume, index) => (
                      <button
                        key={resume.name}
                        onClick={() => {
                          handleDownloadResume(resume.url, resume.name);
                          setIsOpen(false);
                        }}
                        className={`w-full text-left px-4 py-3 text-gray-300 hover:text-white hover:bg-blue-500/10 rounded-xl 
                          transition-all duration-200 flex items-center gap-3 group transform
                          ${isOpen ? 'translate-x-0 opacity-100' : '-translate-x-4 opacity-0'}`}
                        style={{
                          transitionDelay: isOpen ? `${index * 50}ms` : '0ms'
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
          </div>
          
          {/* Right Side - Bio and Skills */}
          <div className={`space-y-6 sm:space-y-8 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            {/* Bio */}
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-purple-500 rounded-full"></div>
                My Story
              </h3>
              <div className="space-y-4 text-gray-300 leading-relaxed">
                <p className="text-base sm:text-lg">
                  {displayData.bio || "I'm a passionate frontend developer with expertise in creating modern, responsive web applications using cutting-edge technologies like React, Tailwind CSS, and the MERN stack. With a strong foundation in both frontend and backend development, I specialize in building seamless user experiences that are both visually appealing and highly functional."}
                </p>
                <p className="text-gray-400">
                  When I'm not coding, I enjoy exploring new technologies, contributing to open-source projects, and staying updated with the latest trends in web development and artificial intelligence.
                </p>
              </div>
            </div>
            
            {/* Skills Progress Bars */}
            <div ref={skillsRef} className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 hover:bg-white/10 transition-all duration-300">
              <h3 className="text-2xl font-semibold text-white mb-6 flex items-center gap-2">
                <div className="w-1 h-8 bg-gradient-to-b from-green-500 to-cyan-500 rounded-full"></div>
                Technical Skills
              </h3>
              <div className="grid gap-6">
                {skills.map((skill, index) => (
                  <div 
                    key={skill.name || index} 
                    className={`space-y-3 transform transition-all duration-500 ${
                      skillsVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'
                    }`}
                    style={{
                      transitionDelay: `${index * 100}ms`
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300 font-medium text-sm sm:text-base">{skill.name}</span>
                      <span className="text-blue-400 text-sm font-semibold bg-blue-500/10 px-2 py-1 rounded-lg">
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