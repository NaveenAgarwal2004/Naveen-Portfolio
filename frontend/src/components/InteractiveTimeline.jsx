import React, { useState, useEffect, useRef } from 'react';
import { 
  GraduationCap, 
  Briefcase, 
  Code, 
  Award, 
  Calendar,
  MapPin,
  ExternalLink,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { ScrollAnimationWrapper } from './ui/AnimationWrapper';

const InteractiveTimeline = () => {
  const [expandedItem, setExpandedItem] = useState(null);
  const [visibleItems, setVisibleItems] = useState(new Set());
  const timelineRef = useRef();

  const timelineData = [
    {
      id: 1,
      type: 'education',
      icon: GraduationCap,
      title: 'BCA - Bachelor of Computer Applications',
      organization: 'Rajasthan University',
      location: 'Rajasthan, India',
      date: '2021 - 2024',
      status: 'Graduated with Distinction',
      description: 'Specialized in Web Development & AI with focus on modern programming languages and frameworks.',
      highlights: [
        'Graduated with distinction in Web Development & AI',
        'Specialized in MERN Stack development',
        'Completed final year project on AI-powered web applications',
        'Active participant in coding competitions and hackathons'
      ],
      skills: ['JavaScript', 'React.js', 'Node.js', 'MongoDB', 'Python', 'AI/ML'],
      color: 'blue'
    },
    {
      id: 2,
      type: 'work',
      icon: Briefcase,
      title: 'Front-End Developer Intern',
      organization: 'Vanshiv Technologies',
      location: 'Remote',
      date: 'July 2024 - September 2024',
      status: 'Completed Successfully',
      description: 'Built interactive React components and optimized website performance for multiple client projects.',
      highlights: [
        'Developed responsive React components for 5+ client projects',
        'Optimized website performance resulting in 40% faster load times',
        'Collaborated with design team to implement pixel-perfect UI',
        'Reduced bundle size by 30% through code optimization'
      ],
      skills: ['React.js', 'JavaScript', 'CSS3', 'Responsive Design', 'Performance Optimization'],
      metrics: {
        'Performance Improvement': '40%',
        'Projects Completed': '5+',
        'Bundle Size Reduction': '30%'
      },
      color: 'green'
    },
    {
      id: 3,
      type: 'project',
      icon: Code,
      title: 'Personal Portfolio Website',
      organization: 'Personal Project',
      location: 'Self-Developed',
      date: 'July 2025',
      status: 'Launched on Vercel',
      description: 'Modern portfolio website with admin panel, SEO optimization, and advanced features.',
      highlights: [
        'Built with React.js and Node.js using MERN stack',
        'Implemented admin panel for dynamic content management',
        'Achieved 95+ Lighthouse performance scores',
        'Features dark/light theme and multi-language support'
      ],
      skills: ['React.js', 'Node.js', 'MongoDB', 'Express.js', 'Vite', 'Tailwind CSS'],
      links: [
        { label: 'Live Demo', url: 'https://your-portfolio.vercel.app' },
        { label: 'GitHub', url: 'https://github.com/yourusername/portfolio' }
      ],
      color: 'purple'
    },
    {
      id: 4,
      type: 'project',
      icon: Code,
      title: 'ToDo Application',
      organization: 'Personal Project',
      location: 'Self-Developed',
      date: 'June 2025',
      status: 'Completed',
      description: 'Feature-rich task management application with real-time updates and user authentication.',
      highlights: [
        'Real-time task synchronization across devices',
        'User authentication and data persistence',
        'Drag-and-drop task organization',
        'Mobile-responsive design'
      ],
      skills: ['React.js', 'Firebase', 'CSS3', 'JavaScript'],
      color: 'orange'
    },
    {
      id: 5,
      type: 'project',
      icon: Code,
      title: 'Contact Management System',
      organization: 'Personal Project',
      location: 'Self-Developed',
      date: 'May 2025',
      status: 'Completed',
      description: 'Comprehensive contact management system with search, filtering, and export capabilities.',
      highlights: [
        'Advanced search and filtering functionality',
        'Data export in multiple formats (CSV, JSON)',
        'Responsive design for all devices',
        'Local storage with backup options'
      ],
      skills: ['JavaScript', 'Local Storage', 'CSS3', 'HTML5'],
      color: 'teal'
    },
    {
      id: 6,
      type: 'certification',
      icon: Award,
      title: 'MERN Stack Developer Certification',
      organization: 'Online Learning Platform',
      location: 'Online',
      date: '2025',
      status: 'Certified',
      description: 'Comprehensive certification focusing on React.js, Node.js, and MongoDB development.',
      highlights: [
        'Mastered full-stack development with MERN stack',
        'Built multiple real-world applications',
        'Learned advanced React patterns and Node.js best practices',
        'Database design and optimization with MongoDB'
      ],
      skills: ['MongoDB', 'Express.js', 'React.js', 'Node.js', 'REST APIs'],
      color: 'indigo'
    },
    {
      id: 7,
      type: 'certification',
      icon: Award,
      title: 'TCS iON Career Edge - Young Professional',
      organization: 'TCS iON',
      location: 'Online',
      date: '2024',
      status: 'Certified',
      description: 'Professional development program focusing on industry-ready skills and soft skills.',
      highlights: [
        'Enhanced communication and presentation skills',
        'Learned industry best practices and methodologies',
        'Professional development and career planning',
        'Team collaboration and leadership skills'
      ],
      skills: ['Communication', 'Leadership', 'Project Management', 'Professional Skills'],
      color: 'pink'
    }
  ];

  const getColorClasses = (color) => {
    const colorMap = {
      blue: {
        icon: 'text-blue-400 bg-blue-500/10',
        border: 'border-blue-500/30',
        accent: 'text-blue-400',
        bg: 'bg-blue-500/5'
      },
      green: {
        icon: 'text-green-400 bg-green-500/10',
        border: 'border-green-500/30',
        accent: 'text-green-400',
        bg: 'bg-green-500/5'
      },
      purple: {
        icon: 'text-purple-400 bg-purple-500/10',
        border: 'border-purple-500/30',
        accent: 'text-purple-400',
        bg: 'bg-purple-500/5'
      },
      orange: {
        icon: 'text-orange-400 bg-orange-500/10',
        border: 'border-orange-500/30',
        accent: 'text-orange-400',
        bg: 'bg-orange-500/5'
      },
      teal: {
        icon: 'text-teal-400 bg-teal-500/10',
        border: 'border-teal-500/30',
        accent: 'text-teal-400',
        bg: 'bg-teal-500/5'
      },
      indigo: {
        icon: 'text-indigo-400 bg-indigo-500/10',
        border: 'border-indigo-500/30',
        accent: 'text-indigo-400',
        bg: 'bg-indigo-500/5'
      },
      pink: {
        icon: 'text-pink-400 bg-pink-500/10',
        border: 'border-pink-500/30',
        accent: 'text-pink-400',
        bg: 'bg-pink-500/5'
      }
    };
    return colorMap[color] || colorMap.blue;
  };

  const TimelineItem = ({ item, index }) => {
    const colors = getColorClasses(item.color);
    const isExpanded = expandedItem === item.id;
    const isVisible = visibleItems.has(item.id);

    return (
      <ScrollAnimationWrapper 
        animation="slideLeft" 
        delay={index * 100}
        className="relative flex items-start group"
      >
        {/* Timeline Line */}
        <div className="flex flex-col items-center mr-6">
          {/* Icon */}
          <div className={`
            flex items-center justify-center w-12 h-12 rounded-full border-2 
            ${colors.icon} ${colors.border} backdrop-blur-sm z-10
            transition-all duration-300 group-hover:scale-110
          `}>
            <item.icon className="w-5 h-5" />
          </div>
          
          {/* Connecting Line */}
          {index < timelineData.length - 1 && (
            <div className="w-0.5 h-16 bg-gradient-to-b from-gray-600 to-transparent mt-2" />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 pb-8">
          <div 
            className={`
              theme-card rounded-xl p-6 cursor-pointer border-l-4 
              ${colors.border} ${colors.bg}
              transform transition-all duration-300 hover:scale-[1.02] hover:shadow-xl
            `}
            onClick={() => setExpandedItem(isExpanded ? null : item.id)}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1">
                <h3 className="text-lg font-semibold theme-text-primary mb-1">
                  {item.title}
                </h3>
                <div className="flex items-center gap-2 text-sm theme-text-secondary mb-2">
                  <span className="font-medium">{item.organization}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {item.location}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 theme-text-tertiary" />
                  <span className="text-sm theme-text-tertiary">{item.date}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${colors.bg} ${colors.accent} border ${colors.border}`}>
                    {item.status}
                  </span>
                </div>
              </div>
              
              <button className="ml-4 p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                {isExpanded ? (
                  <ChevronUp className="w-5 h-5 theme-text-secondary" />
                ) : (
                  <ChevronDown className="w-5 h-5 theme-text-secondary" />
                )}
              </button>
            </div>

            {/* Description */}
            <p className="theme-text-secondary mb-4">{item.description}</p>

            {/* Skills */}
            <div className="flex flex-wrap gap-2 mb-4">
              {item.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 text-xs rounded-md bg-gray-700 text-gray-300 border border-gray-600"
                >
                  {skill}
                </span>
              ))}
            </div>

            {/* Expanded Content */}
            {isExpanded && (
              <div className="border-t border-gray-700 pt-4 mt-4 space-y-4">
                {/* Highlights */}
                <div>
                  <h4 className="font-medium theme-text-primary mb-2">Key Highlights</h4>
                  <ul className="space-y-1">
                    {item.highlights.map((highlight, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm theme-text-secondary">
                        <span className={`w-1.5 h-1.5 rounded-full ${colors.icon} mt-2 flex-shrink-0`} />
                        {highlight}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Metrics */}
                {item.metrics && (
                  <div>
                    <h4 className="font-medium theme-text-primary mb-2">Impact Metrics</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(item.metrics).map(([key, value]) => (
                        <div key={key} className={`p-3 rounded-lg ${colors.bg} border ${colors.border}`}>
                          <div className={`text-lg font-bold ${colors.accent}`}>{value}</div>
                          <div className="text-xs theme-text-tertiary">{key}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Links */}
                {item.links && (
                  <div>
                    <h4 className="font-medium theme-text-primary mb-2">Links</h4>
                    <div className="flex gap-2">
                      {item.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={`
                            inline-flex items-center gap-1 px-3 py-1 text-sm rounded-lg
                            ${colors.bg} ${colors.accent} border ${colors.border}
                            hover:bg-opacity-20 transition-colors
                          `}
                        >
                          {link.label}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </ScrollAnimationWrapper>
    );
  };

  return (
    <section id="timeline" className="py-20 theme-bg-primary">
      <div className="container mx-auto px-6">
        <ScrollAnimationWrapper animation="slideUp" className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold theme-text-primary mb-4">
            My Journey
          </h2>
          <p className="text-xl theme-text-secondary max-w-3xl mx-auto">
            Follow my professional and educational milestones, from graduation to building 
            innovative projects and gaining industry experience.
          </p>
        </ScrollAnimationWrapper>

        <div ref={timelineRef} className="max-w-4xl mx-auto">
          {timelineData.map((item, index) => (
            <TimelineItem key={item.id} item={item} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
};

export default InteractiveTimeline;