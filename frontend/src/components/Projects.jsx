import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, Filter, Star, Calendar, Code, Target, Lightbulb, Trophy, ChevronRight } from 'lucide-react';
import OptimizedImage, { ImagePresets } from './ui/OptimizedImage';
import { ScrollAnimationWrapper, HoverAnimationWrapper } from './ui/AnimationWrapper';
import TranslatedText from './TranslatedText';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [displayedCount, setDisplayedCount] = useState(6); // Show 6 projects initially
  const [loadingMore, setLoadingMore] = useState(false);
  const projectsRef = useRef(null);
  
  const PROJECTS_PER_LOAD = 4; // Load 4 more projects each time

  useEffect(() => {
    setLoading(true);
    import('../services/api').then(({ portfolioAPI }) => {
      portfolioAPI.getProjects()
        .then(response => {
          if (response.data.success) {
            setProjects(response.data.data);
          } else {
            setError('Failed to load projects');
          }
        })
        .catch(() => setError('Failed to load projects'))
        .finally(() => setLoading(false));
    });
  }, []);

  // Define filter labels with translation support
  const filters = [
    { id: 'All', label: 'All' },
    { id: 'AI', label: 'AI' },
    { id: 'Web', label: 'Web' }
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

    if (projectsRef.current) {
      observer.observe(projectsRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const filteredProjects = Array.isArray(projects)
    ? (activeFilter === 'All'
      ? projects
      : projects.filter(project => project.category === activeFilter))
    : [];

  // Ensure only a few projects are marked as featured (max 2)
  const featuredProjects = filteredProjects
    .filter(project => project.featured)
    .slice(0, 2); // Limit to maximum 2 featured projects
    
  const regularProjects = filteredProjects.filter(project => !project.featured);
  
  // Calculate displayed projects based on pagination
  const totalProjects = regularProjects.length;
  const displayedProjects = regularProjects.slice(0, displayedCount);
  const hasMoreProjects = displayedCount < totalProjects;
  
  // Load more functionality
  const handleLoadMore = async () => {
    setLoadingMore(true);
    // Simulate loading delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500));
    setDisplayedCount(prev => Math.min(prev + PROJECTS_PER_LOAD, totalProjects));
    setLoadingMore(false);
  };
  
  // Reset displayed count when filter changes
  useEffect(() => {
    setDisplayedCount(6);
  }, [activeFilter]);

  const Badge = ({ children, variant = "default", className = "" }) => {
    const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
    const variants = {
      default: "bg-gray-700 text-gray-300",
      outline: "border border-gray-600 text-gray-400 bg-transparent",
      secondary: "bg-gray-700 text-gray-300"
    };
    
    return (
      <span className={`${baseClasses} ${variants[variant]} ${className}`}>
        {children}
      </span>
    );
  };

  const ProjectCard = ({ project, featured = false, index = 0 }) => {
    const [showCaseStudy, setShowCaseStudy] = useState(false);

    return (
      <HoverAnimationWrapper hoverEffect="lift">
        <div
          className={`group cursor-pointer bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-700 ${
            featured ? 'lg:col-span-2' : ''
          } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
          style={{
            transitionDelay: `${index * 150}ms`
          }}
          onMouseEnter={() => setHoveredProject(project.id)}
          onMouseLeave={() => setHoveredProject(null)}
        >
          {/* Image Section */}
          <div className="relative overflow-hidden">
            <OptimizedImage
              src={project.image}
              alt={`${project.title} - ${project.category} project showcasing ${project.techStack.slice(0, 3).join(', ')} technologies`}
              {...(featured ? { width: 600, height: 400 } : ImagePresets.card)}
              className={`w-full object-cover transition-all duration-500 group-hover:scale-110 ${
                featured ? 'h-56 sm:h-72 lg:h-80' : 'h-48 sm:h-52 md:h-56'
              }`}
            />
            
            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
              <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                <div className="flex gap-2 sm:gap-3">
                  <button
                    className="flex items-center gap-2 bg-white/90 hover:bg-white text-black px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm"
                    onClick={() => window.open(project.githubUrl, '_blank')}
                  >
                    <Github className="h-4 w-4" />
                    <span className="hidden sm:inline"><TranslatedText>Code</TranslatedText></span>
                  </button>
                  <button
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 sm:px-4 py-2 rounded-lg sm:rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm"
                    onClick={() => window.open(project.liveUrl, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                    <span className="hidden sm:inline"><TranslatedText>Demo</TranslatedText></span>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Badges */}
            {featured && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4">
                <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1 text-xs">
                  <Star className="h-3 w-3" />
                  <TranslatedText>Featured</TranslatedText>
                </Badge>
              </div>
            )}
            <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
              <Badge className="bg-black/50 text-white backdrop-blur-sm border border-white/20 text-xs">
                {project.date}
              </Badge>
            </div>
          </div>

          {/* Content Section */}
          <div className="p-4 sm:p-5 lg:p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-3 sm:mb-4">
              <h3 className={`font-semibold text-white group-hover:text-blue-400 transition-colors duration-300 leading-tight ${
                featured ? 'text-lg sm:text-xl lg:text-2xl' : 'text-lg sm:text-xl'
              }`}>
                {project.title}
              </h3>
              <Badge variant="outline" className="ml-2 shrink-0 text-xs">
                {project.category}
              </Badge>
            </div>

            {/* Description */}
            <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base line-clamp-3">
              {project.description}
            </p>

            {/* Case Study Toggle */}
            <div className="mb-4">
              <button
                onClick={() => setShowCaseStudy(!showCaseStudy)}
                className="flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors duration-200 text-xs sm:text-sm font-medium"
              >
                <TranslatedText>{showCaseStudy ? 'Hide Details' : 'View Case Study'}</TranslatedText>
                <ChevronRight className={`h-3 w-3 sm:h-4 sm:w-4 transition-transform duration-200 ${showCaseStudy ? 'rotate-90' : ''}`} />
              </button>
            </div>

            {/* Case Study Details */}
            {showCaseStudy && (
              <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6 border-t border-gray-700/50 pt-3 sm:pt-4">
                {/* Problem Statement */}
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4 text-red-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-red-300">
                      <TranslatedText>Problem</TranslatedText>
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    <TranslatedText>
                      {project.problem || 'Identified key challenges in user experience and performance optimization that needed innovative solutions.'}
                    </TranslatedText>
                  </p>
                </div>

                {/* Solution */}
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-blue-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-blue-300">
                      <TranslatedText>Solution</TranslatedText>
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    <TranslatedText>
                      {project.solution || 'Developed a comprehensive solution using modern technologies and best practices to address the identified challenges.'}
                    </TranslatedText>
                  </p>
                </div>

                {/* Outcome */}
                <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 sm:p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-green-400 shrink-0" />
                    <span className="text-xs sm:text-sm font-semibold text-green-300">
                      <TranslatedText>Results</TranslatedText>
                    </span>
                  </div>
                  <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
                    <TranslatedText>
                      {project.outcome || 'Successfully delivered a high-performance application with improved user experience and measurable performance gains.'}
                    </TranslatedText>
                  </p>
                </div>
              </div>
            )}

            {/* Tech Stack */}
            <div className="space-y-3 sm:space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <Code className="h-3 w-3 sm:h-4 sm:w-4 text-gray-400 shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-500 font-medium">
                    <TranslatedText>Tech Stack</TranslatedText>
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5 sm:gap-2">
                  {project.techStack.map((tech, techIndex) => (
                    <Badge
                      key={tech}
                      variant="secondary"
                      className="text-xs hover:bg-blue-500/20 hover:text-blue-300 transition-all duration-200 cursor-default"
                      style={{
                        animationDelay: `${techIndex * 100}ms`
                      }}
                    >
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 sm:gap-3 pt-2">
                <button
                  className="flex-1 flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm"
                  onClick={() => window.open(project.githubUrl, '_blank')}
                >
                  <Github className="h-4 w-4" />
                  <span><TranslatedText>GitHub</TranslatedText></span>
                </button>
                <button
                  className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-lg sm:rounded-xl font-medium transition-all duration-200 hover:scale-105 text-sm"
                  onClick={() => window.open(project.liveUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span><TranslatedText>Demo</TranslatedText></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </HoverAnimationWrapper>
    );
  };

  if (loading) {
    return (
      <section id="projects" className="py-16 sm:py-20 lg:py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400/30 border-t-blue-400"></div>
              <span className="text-sm sm:text-base">
                <TranslatedText>Loading amazing projects...</TranslatedText>
              </span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-16 sm:py-20 lg:py-24 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 sm:p-8">
            <p className="text-red-400 text-base sm:text-lg">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" ref={projectsRef} className="py-16 sm:py-20 lg:py-24 bg-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-32 h-32 sm:w-40 sm:h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-32 h-32 sm:w-40 sm:h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 sm:mb-16 lg:mb-20 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6">
            <TranslatedText>My Projects</TranslatedText>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 sm:mb-8 rounded-full"></div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            <TranslatedText>Explore my latest work and side projects that showcase my skills and passion for development</TranslatedText>
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={`flex justify-center mb-8 sm:mb-12 lg:mb-16 px-4 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl sm:rounded-2xl p-1 flex gap-1 overflow-x-auto scrollbar-hide max-w-full">
            {filters.map((filter, index) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 font-medium text-sm sm:text-base whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <Filter className="h-3 w-3 sm:h-4 sm:w-4" />
                <span><TranslatedText>{filter.label}</TranslatedText></span>
                {filter.id !== 'All' && (
                  <span className="text-xs bg-white/20 px-1.5 sm:px-2 py-0.5 rounded-full min-w-[1.25rem] text-center">
                    {filteredProjects.filter(p => p.category === filter.id).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {(featuredProjects.length > 0 || displayedProjects.length > 0) ? (
          <div className="space-y-12 sm:space-y-16">
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className={`transform transition-all duration-1000 delay-400 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="flex items-center gap-3 mb-6 sm:mb-8 px-2">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white">
                    <TranslatedText>Featured Projects</TranslatedText>
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                  {featuredProjects.map((project, index) => (
                    <ProjectCard 
                      key={project._id || project.id || `featured-${index}`} 
                      project={project} 
                      featured={true} 
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Projects */}
            {displayedProjects.length > 0 && (
              <div className={`transform transition-all duration-1000 delay-600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="flex items-center gap-3 mb-6 sm:mb-8 px-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-white">
                    <TranslatedText>
                      {featuredProjects.length > 0 ? 'Other Projects' : 'Projects'}
                    </TranslatedText>
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent"></div>
                  <span className="text-sm text-gray-400 bg-gray-800/50 px-3 py-1 rounded-full">
                    {displayedCount} <TranslatedText>of</TranslatedText> {totalProjects}
                  </span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
                  {displayedProjects.map((project, index) => (
                    <ProjectCard 
                      key={project._id || project.id || `regular-${index}`} 
                      project={project} 
                      index={index + featuredProjects.length}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Load More Button */}
            {hasMoreProjects && (
              <div className={`flex justify-center mt-8 sm:mt-12 transform transition-all duration-1000 delay-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group bg-white/5 hover:bg-white/10 border border-white/20 hover:border-blue-500/50 text-white px-8 py-4 rounded-2xl font-medium
                  transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-3 overflow-hidden
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-white/5"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-400/30 border-t-blue-400"></div>
                      <span><TranslatedText>Loading...</TranslatedText></span>
                    </>
                  ) : (
                    <>
                      <span><TranslatedText>Load More Projects</TranslatedText></span>
                      <span className="text-sm text-gray-400 bg-gray-700/50 px-2 py-1 rounded-full">
                        +{Math.min(PROJECTS_PER_LOAD, totalProjects - displayedCount)}
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className={`text-center py-16 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8 sm:p-12 max-w-md mx-auto">
              <div className="w-12 h-12 sm:w-16 sm:h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-base sm:text-lg mb-2">
                <TranslatedText>No projects found</TranslatedText>
              </p>
              <p className="text-gray-500 text-sm">
                <TranslatedText>Try selecting a different filter</TranslatedText>
              </p>
            </div>
          </div>
        )}

        {/* View More Projects CTA */}
        {filteredProjects.length > 0 && (
          <div className={`text-center mt-12 sm:mt-16 transform transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto">
              <h3 className="text-white text-lg sm:text-xl font-semibold mb-3 sm:mb-4">
                <TranslatedText>Want to see more?</TranslatedText>
              </h3>
              <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                <TranslatedText>Check out my GitHub profile for more projects, contributions, and open-source work.</TranslatedText>
              </p>
              <button
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-medium
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-3 mx-auto overflow-hidden text-sm sm:text-base"
                onClick={() => window.open('https://github.com/NaveenAgarwal2004', '_blank')}
              >
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <Github className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                <span className="relative z-10"><TranslatedText>View All on GitHub</TranslatedText></span>
                <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Custom scrollbar styles */}
      <style jsx="true">{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-3 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 3;
        }
      `}</style>
    </section>
  );
};

export default Projects;