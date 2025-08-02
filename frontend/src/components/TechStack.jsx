import React, { useState, useEffect } from 'react';
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
  Github 
} from 'lucide-react';
import { Card, CardContent } from './ui/card';
import { portfolioAPI } from '../services/api';

// Icon mapping
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
  Github
};

const TechStack = ({ techStackData }) => {
  const [techStack, setTechStack] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // If techStackData is provided as prop, use it directly
    if (techStackData) {
      setTechStack(techStackData);
      setLoading(false);
      return;
    }

    // Otherwise fetch data from backend
    const fetchTechStack = async () => {
      try {
        const response = await portfolioAPI.getTechStack();
        setTechStack(response.data.data);
      } catch (err) {
        setError('Failed to load tech stack.');
        console.error('Error fetching tech stack:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTechStack();
  }, [techStackData]);

  if (loading) {
    return (
      <section id="tech-stack" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          Loading tech stack...
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section id="tech-stack" className="py-20 bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-red-500">
          {error}
        </div>
      </section>
    );
  }

  return (
    <section id="tech-stack" className="py-20 bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Tech Stack
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-8"></div>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Technologies and tools I use to build amazing web experiences
          </p>
        </div>

        {/* Tech Stack Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {techStack.map((tech) => {
            const Icon = iconMap[tech.icon];
            
            return (
              <Card 
                key={tech._id || tech.id || tech.name}
                className="bg-gray-800/50 border-gray-700 hover:border-blue-500/50 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10 group cursor-pointer"
              >
                <CardContent className="p-6 text-center">
                  <div className="mb-4 flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center group-hover:bg-blue-500/10 transition-colors duration-300">
                      <Icon 
                        className="h-8 w-8 text-gray-400 group-hover:text-blue-400 transition-colors duration-300" 
                        style={{ color: tech.color }}
                      />
                    </div>
                  </div>
                  <h3 className="text-white font-semibold text-sm group-hover:text-blue-400 transition-colors duration-300">
                    {tech.name}
                  </h3>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Skills Categories */}
        <div className="mt-16 grid md:grid-cols-3 gap-8">
          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Component className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Frontend Development</h3>
              <p className="text-gray-400 leading-relaxed">
                Creating responsive, interactive user interfaces with modern frameworks and best practices.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Server className="h-6 w-6 text-green-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">Backend Development</h3>
              <p className="text-gray-400 leading-relaxed">
                Building robust server-side applications and APIs with Node.js and modern databases.
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gray-800/30 border-gray-700">
            <CardContent className="p-8 text-center">
              <div className="w-12 h-12 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Zap className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">AI Integration</h3>
              <p className="text-gray-400 leading-relaxed">
                Integrating AI and machine learning capabilities into web applications for smarter user experiences.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
};

export default TechStack;
