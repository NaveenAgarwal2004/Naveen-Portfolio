// frontend/src/components/ProjectCard.jsx - Workshop-themed Project Card
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Github, Star, Target, Lightbulb, Trophy } from 'lucide-react';
import TranslatedText from './TranslatedText';
import OptimizedImage, { ImagePresets } from './ui/OptimizedImage';
import { springConfig, buttonSpring } from '../lib/animations';

const Badge = ({ children, variant = "default", className = "" }) => {
  const baseClasses = "inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium";
  const variants = {
    default: "bg-gray-700 text-gray-300",
    outline: "border border-gray-600 text-gray-400 bg-transparent",
    secondary: "bg-workshop-tan/10 text-workshop-tan border border-workshop-tan/20"
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
    <motion.article
      className="project-card bg-parchment/5 backdrop-blur-sm border border-workshop-tan/10 hover:border-forge-orange/50 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        ...springConfig,
        delay: index * 0.15
      }}
      whileHover={{
        y: -8,
        transition: { type: "spring", stiffness: 300, damping: 20 }
      }}
    >
      {/* Image Container with Blueprint Overlay */}
      <div className="relative overflow-hidden group">
        <OptimizedImage
          src={project.image}
          alt={`${project.title} - Workshop project showcasing ${project.techStack?.slice(0, 3).join(', ') || 'various technologies'}`}
          {...(featured ? { width: 600, height: 400 } : ImagePresets.card)}
          className={`w-full object-cover transition-all duration-500 group-hover:scale-110 ${
            featured ? 'h-56 sm:h-72 lg:h-80' : 'h-48 sm:h-52 md:h-56'
          }`}
        />
        
        {/* Blueprint Grid Overlay on Hover */}
        <div className="absolute inset-0 bg-gradient-to-br from-forge-orange/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute inset-0 grid-overlay" />
        </div>

        {/* Master Piece Badge (Featured) */}
        {featured && (
          <motion.div 
            className="absolute top-4 left-4"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: "spring", stiffness: 200, delay: 0.3 }}
          >
            <div className="bg-gradient-to-r from-ember-red to-forge-orange text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 shadow-lg">
              <Star className="h-4 w-4 fill-white" />
              <TranslatedText>Master Piece</TranslatedText>
            </div>
          </motion.div>
        )}

        {/* Date Badge */}
        <div className="absolute top-4 right-4">
          <Badge className="bg-carbon/80 text-parchment backdrop-blur-sm border border-workshop-tan/30 text-xs">
            {project.date}
          </Badge>
        </div>

        {/* Quick Action Buttons on Hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-carbon/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300">
          <div className="absolute bottom-4 left-4 right-4 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="flex gap-3">
              {project.githubUrl && (
                <motion.button
                  className="flex items-center gap-2 bg-parchment hover:bg-workshop-tan text-carbon px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm shadow-lg"
                  onClick={() => window.open(project.githubUrl, '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Github className="h-4 w-4" />
                  <span className="hidden sm:inline"><TranslatedText>Blueprint</TranslatedText></span>
                </motion.button>
              )}
              {project.liveUrl && (
                <motion.button
                  className="flex items-center gap-2 bg-gradient-to-r from-forge-orange to-ember-red hover:from-ember-red hover:to-clay text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 text-sm shadow-lg"
                  onClick={() => window.open(project.liveUrl, '_blank')}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ExternalLink className="h-4 w-4" />
                  <span className="hidden sm:inline"><TranslatedText>Live Work</TranslatedText></span>
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 lg:p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-3 sm:mb-4">
          <h3 className={`font-heading font-bold text-parchment group-hover:text-forge-orange transition-colors duration-300 leading-tight ${
            featured ? 'text-lg sm:text-xl lg:text-2xl' : 'text-lg sm:text-xl'
          }`}>
            {project.title}
          </h3>
          <Badge variant="outline" className="ml-2 shrink-0 text-xs border-clay/30 text-clay">
            {project.category}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-gray-400 mb-4 sm:mb-6 leading-relaxed text-sm sm:text-base line-clamp-3">
          {project.description}
        </p>

        {/* Workshop Narrative - Always Visible */}
        <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
          {/* The Challenge */}
          <motion.div 
            className="bg-ember-red/10 border border-ember-red/20 rounded-xl p-3 sm:p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Target className="h-3 w-3 sm:h-4 sm:w-4 text-ember-red shrink-0" />
              <span className="text-xs sm:text-sm font-heading font-semibold text-ember-red">
                <TranslatedText>The Challenge</TranslatedText>
              </span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              <TranslatedText>
                {project.problem || 'Identified key challenges in user experience and performance optimization that needed innovative solutions.'}
              </TranslatedText>
            </p>
          </motion.div>

          {/* The Craft */}
          <motion.div 
            className="bg-forge-orange/10 border border-forge-orange/20 rounded-xl p-3 sm:p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="h-3 w-3 sm:h-4 sm:w-4 text-forge-orange shrink-0" />
              <span className="text-xs sm:text-sm font-heading font-semibold text-forge-orange">
                <TranslatedText>The Craft</TranslatedText>
              </span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              <TranslatedText>
                {project.solution || 'Developed a comprehensive solution using modern technologies and best practices to address the identified challenges.'}
              </TranslatedText>
            </p>
          </motion.div>

          {/* The Result */}
          <motion.div 
            className="bg-craft-green/10 border border-craft-green/20 rounded-xl p-3 sm:p-4"
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <div className="flex items-center gap-2 mb-2">
              <Trophy className="h-3 w-3 sm:h-4 sm:w-4 text-craft-green shrink-0" />
              <span className="text-xs sm:text-sm font-heading font-semibold text-craft-green">
                <TranslatedText>The Result</TranslatedText>
              </span>
            </div>
            <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
              <TranslatedText>
                {project.outcome || 'Successfully delivered a high-performance application with improved user experience and measurable performance gains.'}
              </TranslatedText>
            </p>
          </motion.div>
        </div>

        {/* Materials from the Rack (Tech Stack) */}
        <div className="space-y-3 sm:space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <div className="w-6 h-6 rounded-full bg-workshop-tan/10 flex items-center justify-center">
                <span className="text-workshop-tan text-xs">🔧</span>
              </div>
              <span className="text-xs sm:text-sm text-workshop-tan font-heading font-semibold">
                <TranslatedText>Materials from the Rack</TranslatedText>
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 sm:gap-2">
              {project.techStack?.map((tech, techIndex) => (
                <motion.span
                  key={tech}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{
                    type: "spring",
                    stiffness: 200,
                    delay: techIndex * 0.05
                  }}
                  whileHover={{ 
                    scale: 1.1,
                    backgroundColor: 'rgba(232, 93, 4, 0.2)',
                    transition: { duration: 0.2 }
                  }}
                >
                  <Badge
                    variant="secondary"
                    className="text-xs cursor-default"
                  >
                    {tech}
                  </Badge>
                </motion.span>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2 sm:gap-3 pt-2">
            {project.githubUrl && (
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 border-2 border-slate text-gray-300 hover:bg-slate/20 hover:text-parchment px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-200 text-sm"
                onClick={() => window.open(project.githubUrl, '_blank')}
                whileHover={{ ...buttonSpring.hover }}
                whileTap={{ ...buttonSpring.tap }}
                transition={springConfig}
              >
                <Github className="h-4 w-4" />
                <span><TranslatedText>View Code</TranslatedText></span>
              </motion.button>
            )}
            {project.liveUrl && (
              <motion.button
                className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-forge-orange to-ember-red hover:from-ember-red hover:to-forge-orange text-white px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl font-medium transition-all duration-200 text-sm shadow-lg shadow-forge-orange/20"
                onClick={() => window.open(project.liveUrl, '_blank')}
                whileHover={{ ...buttonSpring.hover }}
                whileTap={{ ...buttonSpring.tap }}
                transition={springConfig}
              >
                <ExternalLink className="h-4 w-4" />
                <span><TranslatedText>Inspect Craft</TranslatedText></span>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
