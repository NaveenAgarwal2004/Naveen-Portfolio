import React, { useState, useEffect, useRef } from 'react';
import { 
  FileCode, 
  Palette, 
  Zap, 
  Component, 
  Server, 
  Database, 
  Layers, 
  Wind, 
  GitBranch, 
  Github,
  Layout,
  Sparkles,
  Code,
  Settings,
  Smartphone,
  Monitor,
  Globe,
  Shield,
  Cpu,
  HardDrive
} from 'lucide-react';
import TranslatedText from './TranslatedText';

const iconMap = {
  FileCode, 
  Palette, 
  Zap, 
  Component, 
  Server, 
  Database, 
  Layers, 
  Wind, 
  GitBranch, 
  Github,
  Layout,
  Sparkles,
  Code,
  Settings,
  Smartphone,
  Monitor,
  Globe,
  Shield,
  Cpu,
  HardDrive
};

const TechStack = ({ techStackData }) => {
  const [techStack, setTechStack] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isVisible, setIsVisible] = useState(true); // FIXED: Start as true to show items initially
  const [categoriesVisible, setCategoriesVisible] = useState(true); // FIXED: Start as true
  const techStackRef = useRef(null);
  const categoriesRef = useRef(null);

  // Debug logs
  useEffect(() => {
    console.log('🔍 TechStack useEffect triggered with techStackData:', techStackData);
    console.log('🔍 techStackData type:', typeof techStackData);
    console.log('🔍 techStackData is array:', Array.isArray(techStackData));
  }, [techStackData]);

  // FIXED: Better data handling with proper validation
  useEffect(() => {
    if (techStackData) {
      console.log('✅ Using provided techStackData:', techStackData);
      console.log('✅ techStackData length:', techStackData.length);
      // FIXED: Ensure techStackData is always an array
      const validTechStack = Array.isArray(techStackData) ? techStackData : [];
      setTechStack(validTechStack);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    import('../services/api').then(({ portfolioAPI }) => {
      portfolioAPI.getTechStack()
        .then(response => {
          console.log('Tech stack response:', response);
          
          if (response.data && response.data.success && response.data.data) {
            const techData = response.data.data;
            const validTechStack = Array.isArray(techData) ? techData : [];
            setTechStack(validTechStack);
            
            if (validTechStack.length === 0) {
              setError('No technologies found');
            }
          } else {
            console.warn('Invalid tech stack response format:', response);
            setTechStack([]);
            setError('Failed to load technologies');
          }
        })
        .catch(error => {
          console.error('Tech stack fetch error:', error);
          setTechStack([]);
          setError('Unable to load technologies. Please try again later.');
        })
        .finally(() => setLoading(false));
    }).catch(error => {
      console.error('API import error:', error);
      setTechStack([]);
      setError('Failed to initialize tech stack');
      setLoading(false);
    });
  }, [techStackData]);

  // FIXED: More lenient Intersection Observer with fallback
  useEffect(() => {
    // Fallback: Set visible after a short delay regardless of intersection
    const fallbackTimer = setTimeout(() => {
      setIsVisible(true);
    }, 500);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          clearTimeout(fallbackTimer);
        }
      },
      { 
        threshold: 0.05, // FIXED: Lower threshold for easier triggering
        rootMargin: '50px' // FIXED: Add margin to trigger earlier
      }
    );

    if (techStackRef.current) {
      observer.observe(techStackRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  useEffect(() => {
    // Fallback: Set categories visible after a short delay
    const fallbackTimer = setTimeout(() => {
      setCategoriesVisible(true);
    }, 800);

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setCategoriesVisible(true);
          clearTimeout(fallbackTimer);
        }
      },
      { 
        threshold: 0.05, // FIXED: Lower threshold
        rootMargin: '50px' // FIXED: Add margin
      }
    );

    if (categoriesRef.current) {
      observer.observe(categoriesRef.current);
    }

    return () => {
      observer.disconnect();
      clearTimeout(fallbackTimer);
    };
  }, []);

  // Debug log current state
  console.log('🎨 TechStack component rendering with techStack:', techStack);
  console.log('🎨 techStack length:', techStack.length);
  console.log('🎨 isVisible:', isVisible);

  if (loading) {
    return (
      <section id="tech-stack" className="py-16 sm:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-3 text-white">
            <div className="animate-spin rounded-full h-6 w-6 border-2 border-forge-orange/30 border-t-forge-orange"></div>
            <span>
              <TranslatedText>Loading technologies...</TranslatedText>
            </span>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="tech-stack" className="py-16 sm:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <p className="text-red-400 text-lg">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 border border-red-500/40 rounded-lg text-red-300 transition-colors"
            >
              <TranslatedText>Try Again</TranslatedText>
            </button>
          </div>
        </div>
      </section>
    );
  }

  if (!Array.isArray(techStack)) {
    console.error('TechStack is not an array:', techStack);
    return (
      <section id="tech-stack" className="py-16 sm:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-8">
            <p className="text-yellow-400 text-lg">
              <TranslatedText>Invalid tech stack data format</TranslatedText>
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (techStack.length === 0) {
    return (
      <section id="tech-stack" className="py-16 sm:py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-gray-500/10 border border-gray-500/20 rounded-2xl p-8">
            <p className="text-gray-400 text-lg">
              <TranslatedText>No technologies to display</TranslatedText>
            </p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="tech-stack" ref={techStackRef} className="py-16 sm:py-20 bg-gray-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 -left-20 w-40 h-40 bg-green-500/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/3 -right-20 w-40 h-40 bg-forge-orange/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-60 h-60 bg-purple-500/3 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-forge-orange/20 rounded-full animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-forge-orange/10 backdrop-blur-sm border border-forge-orange/20 rounded-full mb-6">
            <Sparkles className="h-4 w-4 text-forge-orange animate-pulse" />
            <span className="text-forge-orange text-sm font-medium">
              <TranslatedText>Technologies & Tools</TranslatedText>
            </span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            <TranslatedText>My Tools</TranslatedText>
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-craft-green to-forge-orange mx-auto mb-6 sm:mb-8 rounded-full"></div>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            <TranslatedText>Technologies and tools I use to build amazing web experiences</TranslatedText>
          </p>
        </div>

        {/* Tech Stack Grid - FIXED: Always visible */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 mb-16 opacity-100 translate-y-0">
          {techStack.map((tech, index) => {
            console.log('🔧 Rendering tech item:', tech, 'at index:', index);
            
            if (!tech || typeof tech !== 'object') {
              console.warn('Invalid tech item:', tech);
              return null;
            }

            const Icon = tech.icon ? iconMap[tech.icon] : null;
            const techName = tech.name || 'Unknown';
            const techId = tech.id || tech._id || `tech-${index}`;
            
            return (
              <div
                key={techId}
                className="group bg-white/5 backdrop-blur-sm border border-white/10 hover:border-forge-orange/50 rounded-2xl p-4 sm:p-6 text-center
                  transition-all duration-500 hover:scale-110 hover:bg-white/10 cursor-pointer transform opacity-100 translate-y-0"
                style={{
                  animationDelay: `${index * 100}ms`
                }}
              >
                <div className="mb-4 flex justify-center">
                  <div className="relative">
                    <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gray-700/50 group-hover:bg-forge-orange/10 flex items-center justify-center 
                      transition-all duration-300 group-hover:scale-110 group-hover:rotate-6">
                      {Icon ? (
                        <Icon 
                          className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-forge-orange transition-colors duration-300" 
                          style={{ color: tech.color || undefined }}
                        />
                      ) : (
                        <div 
                          className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400 group-hover:text-forge-orange transition-colors duration-300 flex items-center justify-center font-bold text-lg"
                          style={{ color: tech.color || undefined }}
                        >
                          {techName.charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {/* Glow effect */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-forge-orange/20 to-ember-red/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl"></div>
                  </div>
                </div>
                <h3 className="text-white font-semibold text-sm sm:text-base group-hover:text-forge-orange transition-colors duration-300 leading-tight">
                  {techName}
                </h3>
                {/* Hover indicator */}
                <div className="w-0 h-0.5 bg-gradient-to-r from-forge-orange to-ember-red mx-auto mt-2 group-hover:w-full transition-all duration-300 rounded-full"></div>
              </div>
            );
          }).filter(Boolean)}
        </div>

        {/* Skills Categories - FIXED: Always visible */}
        <div ref={categoriesRef} className="grid md:grid-cols-3 gap-6 sm:gap-8 opacity-100 translate-y-0">
          {[
            {
              icon: Component,
              title: "Frontend Development",
              description: "Creating responsive, interactive user interfaces with modern frameworks and best practices.",
              color: "blue",
              delay: 0
            },
            {
              icon: Server,
              title: "Backend Development", 
              description: "Building robust server-side applications and APIs with Node.js and modern databases.",
              color: "green",
              delay: 200
            },
            {
              icon: Zap,
              title: "AI Integration",
              description: "Integrating AI and machine learning capabilities into web applications for smarter user experiences.",
              color: "purple",
              delay: 400
            }
          ].map((category, index) => {
            const Icon = category.icon;
            const colorClasses = {
              blue: "from-forge-orange/10 to-clay/10 border-forge-orange/20 group-hover:border-forge-orange/40",
              green: "from-green-500/10 to-emerald-500/10 border-green-500/20 group-hover:border-green-500/40", 
              purple: "from-purple-500/10 to-pink-500/10 border-purple-500/20 group-hover:border-purple-500/40"
            };
            const iconColors = {
              blue: "text-forge-orange",
              green: "text-green-400",
              purple: "text-purple-400"
            };

            return (
              <div
                key={category.title}
                className={`group bg-gradient-to-br ${colorClasses[category.color]} backdrop-blur-sm border rounded-2xl p-6 sm:p-8 text-center
                  transition-all duration-500 hover:scale-105 hover:bg-white/5 cursor-pointer transform opacity-100 translate-y-0`}
              >
                <div className="mb-6 flex justify-center">
                  <div className="relative">
                    <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-6 transition-all duration-300">
                      <Icon className={`h-8 w-8 ${iconColors[category.color]} group-hover:scale-110 transition-transform duration-300`} />
                    </div>
                    <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${category.color === 'blue' ? 'from-forge-orange/20 to-clay/20' : category.color === 'green' ? 'from-craft-green/20 to-emerald-500/20' : 'from-ember-red/20 to-clay/20'} opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 blur-xl`}></div>
                  </div>
                </div>
                <h3 className="text-xl font-semibold text-white mb-4 group-hover:text-parchment transition-colors duration-300">
                  <TranslatedText>{category.title}</TranslatedText>
                </h3>
                <p className="text-gray-400 leading-relaxed group-hover:text-gray-300 transition-colors duration-300">
                  <TranslatedText>{category.description}</TranslatedText>
                </p>
                <div className="w-0 h-0.5 bg-gradient-to-r from-forge-orange to-ember-red mx-auto mt-4 group-hover:w-full transition-all duration-500 rounded-full"></div>
              </div>
            );
          })}
        </div>
      </div>

      <style jsx>{`
        @keyframes float {
          0%, 100% { 
            transform: translateY(0px) rotate(0deg); 
            opacity: 0.2; 
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

export default TechStack;