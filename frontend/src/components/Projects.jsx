import React, { useState, useEffect, useRef } from 'react';
import { ExternalLink, Github, Filter, Star, Calendar, Code } from 'lucide-react';

const Projects = () => {
  const [activeFilter, setActiveFilter] = useState('All');
  const [hoveredProject, setHoveredProject] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const projectsRef = useRef(null);

  useEffect(() => {
    setLoading(true);
    import('../services/api').then(({ adminAPI }) => {
      adminAPI.getProjects()
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

  const filters = ['All', 'AI', 'Web'];

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

  const featuredProjects = filteredProjects.filter(project => project.featured);
  const regularProjects = filteredProjects.filter(project => !project.featured);

  const Badge = ({ children, variant = "default", className = "" }) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
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

  const ProjectCard = ({ project, featured = false, index = 0 }) => (
    <div
      className={`group cursor-pointer transition-all duration-500 hover:scale-105 bg-white/5 backdrop-blur-sm border border-white/10 hover:border-blue-500/50 rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl hover:shadow-blue-500/10 ${
        featured ? 'lg:col-span-2' : ''
      } ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}
      style={{
        transitionDelay: `${index * 150}ms`
      }}
      onMouseEnter={() => setHoveredProject(project.id)}
      onMouseLeave={() => setHoveredProject(null)}
    >
      <div className="relative overflow-hidden">
        <img
          src={project.image}
          alt={project.title}
          className={`w-full object-cover transition-all duration-500 group-hover:scale-110 ${
            featured ? 'h-64 sm:h-80' : 'h-48 sm:h-56'
          }`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 bg-white/90 hover:bg-white text-black px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                onClick={() => window.open(project.githubUrl, '_blank')}
              >
                <Github className="h-4 w-4" />
                Code
              </button>
              <button
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 hover:scale-105"
                onClick={() => window.open(project.liveUrl, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
                Demo
              </button>
            </div>
          </div>
        </div>
        {featured && (
          <div className="absolute top-4 left-4">
            <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white flex items-center gap-1">
              <Star className="h-3 w-3" />
              Featured
            </Badge>
          </div>
        )}
        <div className="absolute top-4 right-4">
          <Badge className="bg-black/50 text-white backdrop-blur-sm border border-white/20">
            {project.date}
          </Badge>
        </div>
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-white group-hover:text-blue-400 transition-colors duration-300 leading-tight">
            {project.title}
          </h3>
          <Badge variant="outline" className="ml-2 shrink-0">
            {project.category}
          </Badge>
        </div>

        <p className="text-gray-400 mb-6 leading-relaxed text-sm sm:text-base">
          {project.description}
        </p>

        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Code className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-500 font-medium">Tech Stack</span>
            </div>
            <div className="flex flex-wrap gap-2">
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

          <div className="flex gap-3 pt-2">
            <button
              className="flex-1 flex items-center justify-center gap-2 border border-gray-600 text-gray-300 hover:bg-gray-700 hover:text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              onClick={() => window.open(project.githubUrl, '_blank')}
            >
              <Github className="h-4 w-4" />
              <span className="text-sm">GitHub</span>
            </button>
            <button
              className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-4 py-2.5 rounded-xl font-medium transition-all duration-200 hover:scale-105"
              onClick={() => window.open(project.liveUrl, '_blank')}
            >
              <ExternalLink className="h-4 w-4" />
              <span className="text-sm">Live Demo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <section id="projects" className="py-16 sm:py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="inline-flex items-center gap-3 text-white">
              <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-400/30 border-t-blue-400"></div>
              <span>Loading amazing projects...</span>
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="projects" className="py-16 sm:py-20 bg-gray-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-8">
            <p className="text-red-400 text-lg">{error}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="projects" ref={projectsRef} className="py-16 sm:py-20 bg-gray-800 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -right-20 w-40 h-40 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -left-20 w-40 h-40 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className={`text-center mb-12 sm:mb-16 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4">
            My Projects
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 mx-auto mb-6 sm:mb-8 rounded-full"></div>
          <p className="text-lg sm:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
            Explore my latest work and side projects that showcase my skills and passion for development
          </p>
        </div>

        {/* Filter Tabs */}
        <div className={`flex justify-center mb-8 sm:mb-12 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
        }`}>
          <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-1 flex gap-1 overflow-x-auto">
            {filters.map((filter, index) => (
              <button
                key={filter}
                onClick={() => setActiveFilter(filter)}
                className={`px-4 sm:px-6 py-2.5 rounded-xl transition-all duration-300 font-medium text-sm sm:text-base whitespace-nowrap flex items-center gap-2 ${
                  activeFilter === filter
                    ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg transform scale-105'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
                style={{
                  transitionDelay: `${index * 100}ms`
                }}
              >
                <Filter className="h-4 w-4" />
                {filter}
                {filter !== 'All' && (
                  <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full">
                    {filteredProjects.filter(p => p.category === filter).length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        {filteredProjects.length > 0 ? (
          <div className="space-y-12">
            {/* Featured Projects */}
            {featuredProjects.length > 0 && (
              <div className={`transform transition-all duration-1000 delay-400 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                  <h3 className="text-2xl font-semibold text-white">Featured Projects</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-yellow-500/50 to-transparent"></div>
                </div>
                <div className="grid lg:grid-cols-6 gap-6 sm:gap-8">
                  {featuredProjects.map((project, index) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      featured={true} 
                      index={index}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Regular Projects */}
            {regularProjects.length > 0 && (
              <div className={`transform transition-all duration-1000 delay-600 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
              }`}>
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <h3 className="text-2xl font-semibold text-white">Other Projects</h3>
                  <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                  {regularProjects.map((project, index) => (
                    <ProjectCard 
                      key={project.id} 
                      project={project} 
                      index={index + featuredProjects.length}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className={`text-center py-16 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-12 max-w-md mx-auto">
              <div className="w-16 h-16 bg-gray-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Filter className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-400 text-lg mb-2">No projects found</p>
              <p className="text-gray-500 text-sm">Try selecting a different filter</p>
            </div>
          </div>
        )}

        {/* View More Projects CTA */}
        {filteredProjects.length > 0 && (
          <div className={`text-center mt-16 transform transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'
          }`}>
            <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl p-8 max-w-2xl mx-auto">
              <h3 className="text-white text-xl font-semibold mb-4">Want to see more?</h3>
              <p className="text-gray-400 mb-6 leading-relaxed">
                Check out my GitHub profile for more projects, contributions, and open-source work.
              </p>
              <button
                className="group bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white px-8 py-4 rounded-xl font-medium
                transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25 flex items-center gap-3 mx-auto overflow-hidden"
                onClick={() => window.open('https://github.com/NaveenAgarwal2004', '_blank')}
              >
                <div className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                <Github className="h-5 w-5 relative z-10" />
                <span className="relative z-10">View All on GitHub</span>
                <ExternalLink className="h-4 w-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;