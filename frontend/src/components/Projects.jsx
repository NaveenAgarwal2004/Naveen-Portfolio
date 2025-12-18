import React, { useState, useEffect, useRef } from 'react';
import { Filter, ChevronRight, Github, ExternalLink } from 'lucide-react';
import { ScrollAnimationWrapper } from './ui/AnimationWrapper';
import TranslatedText from './TranslatedText';
import ProjectCard from './ProjectCard';

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

  // ProjectCard component moved to separate file: /app/frontend/src/components/ProjectCard.jsx

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
      {/* Background Elements - Workshop Theme */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-32 h-32 sm:w-40 sm:h-40 bg-forge-orange/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-32 h-32 sm:w-40 sm:h-40 bg-ember-red/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header - Workshop Theme */}
        <div className={`text-center mb-12 sm:mb-16 lg:mb-20 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-heading font-bold text-parchment mb-4 sm:mb-6">
            <TranslatedText>The Workshop</TranslatedText>
          </h2>
          <div className="w-16 sm:w-24 h-1 bg-gradient-to-r from-forge-orange to-ember-red mx-auto mb-6 sm:mb-8 rounded-full shadow-lg shadow-forge-orange/30"></div>
          <p className="text-base sm:text-lg lg:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
            <TranslatedText>Browse through my finished pieces - each crafted with precision and care</TranslatedText>
          </p>
        </div>

        {/* Filter Tabs - Workshop Theme */}
        <div className={`flex justify-center mb-8 sm:mb-12 lg:mb-16 px-4 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="bg-carbon/40 backdrop-blur-sm border border-workshop-tan/20 rounded-xl sm:rounded-2xl p-1 flex gap-1 overflow-x-auto scrollbar-hide max-w-full">
            {filters.map((filter, index) => (
              <button
                key={filter.id}
                onClick={() => setActiveFilter(filter.id)}
                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 rounded-lg sm:rounded-xl transition-all duration-300 font-heading font-semibold text-sm sm:text-base whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === filter.id
                    ? 'bg-gradient-to-r from-forge-orange to-ember-red text-white shadow-lg shadow-forge-orange/30 transform scale-105'
                    : 'text-gray-400 hover:text-parchment hover:bg-workshop-tan/10'
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
            {/* Featured Projects - Master Pieces */}
            {featuredProjects.length > 0 && (
              <div className={`transform transition-all duration-1000 delay-400 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="flex items-center gap-3 mb-6 sm:mb-8 px-2">
                  <div className="w-2 h-2 bg-forge-orange rounded-full animate-pulse"></div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-parchment">
                    <TranslatedText>Master Pieces</TranslatedText>
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-forge-orange/50 to-transparent"></div>
                </div>
                <div className={`grid grid-cols-1 gap-4 sm:gap-6 lg:gap-8 ${
                  featuredProjects.length === 1 
                    ? 'lg:grid-cols-1 max-w-3xl mx-auto' 
                    : 'lg:grid-cols-2'
                }`}>
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

            {/* Regular Projects - Finished Works */}
            {displayedProjects.length > 0 && (
              <div className={`transform transition-all duration-1000 delay-600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="flex items-center gap-3 mb-6 sm:mb-8 px-2">
                  <div className="w-2 h-2 bg-craft-green rounded-full animate-pulse"></div>
                  <h3 className="text-xl sm:text-2xl font-heading font-bold text-parchment">
                    <TranslatedText>
                      {featuredProjects.length > 0 ? 'Finished Works' : 'All Works'}
                    </TranslatedText>
                  </h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-craft-green/50 to-transparent"></div>
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

            {/* Load More Button - Workshop Theme */}
            {hasMoreProjects && (
              <div className={`flex justify-center mt-8 sm:mt-12 transform transition-all duration-1000 delay-700 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <button
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="group bg-carbon/40 hover:bg-workshop-tan/10 border-2 border-workshop-tan/20 hover:border-forge-orange/50 text-parchment px-8 py-4 rounded-2xl font-heading font-semibold
                  transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-forge-orange/25 flex items-center gap-3 overflow-hidden relative
                  disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none disabled:hover:bg-carbon/40"
                >
                  {loadingMore ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-forge-orange/30 border-t-forge-orange"></div>
                      <span><TranslatedText>Loading...</TranslatedText></span>
                    </>
                  ) : (
                    <>
                      <span><TranslatedText>View More Crafts</TranslatedText></span>
                      <span className="text-sm text-forge-orange bg-workshop-tan/10 px-2 py-1 rounded-full">
                        +{Math.min(PROJECTS_PER_LOAD, totalProjects - displayedCount)}
                      </span>
                      <ChevronRight className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-forge-orange/10 to-ember-red/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
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

        {/* View More Projects CTA - Workshop Theme */}
        {filteredProjects.length > 0 && (
          <div className={`text-center mt-12 sm:mt-16 transform transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-forge-orange/10 to-ember-red/10 border border-forge-orange/20 rounded-2xl p-6 sm:p-8 max-w-2xl mx-auto backdrop-blur-sm">
              <h3 className="text-parchment text-lg sm:text-xl font-heading font-bold mb-3 sm:mb-4">
                <TranslatedText>Visit the Full Workshop</TranslatedText>
              </h3>
              <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base">
                <TranslatedText>Explore the complete blueprint collection on GitHub - more crafts, contributions, and open-source work.</TranslatedText>
              </p>
              <button
                className="group relative bg-gradient-to-r from-forge-orange to-ember-red hover:from-ember-red hover:to-forge-orange text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl font-heading font-semibold
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-forge-orange/30 flex items-center gap-3 mx-auto overflow-hidden text-sm sm:text-base"
                onClick={() => window.open('https://github.com/NaveenAgarwal2004', '_blank')}
              >
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <Github className="h-4 w-4 sm:h-5 sm:w-5 relative z-10" />
                <span className="relative z-10"><TranslatedText>Browse All Blueprints</TranslatedText></span>
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