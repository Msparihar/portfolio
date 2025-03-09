"use client";

import React, { useState, useEffect } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { ExternalLink, Github, Star, GitFork } from 'lucide-react';
import portfolioData from '@/config/portfolio.json';
// Placeholder images for projects that don't have their own
const placeholderImages = [
  '/images/projects/placeholder-1.jpg',
  '/images/projects/placeholder-2.jpg',
  '/images/projects/placeholder-3.jpg',
  '/images/projects/placeholder-4.jpg',
];

const ProjectCard = ({ project, isDark }) => {
  // Get a placeholder image based on project name hash
  const getPlaceholderImage = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholderImages[hash % placeholderImages.length];
  };

  // Image source - either from project or placeholder
  const imageSrc = project.image || getPlaceholderImage(project.name);

  return (
    <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
      isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
    } border ${isDark ? 'border-gray-800' : 'border-gray-200'} shadow-sm hover:shadow-md`}>
      {/* Project Image with Overlay */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-10"></div>
        <Image
          src={imageSrc}
          alt={project.name}
          width={600}
          height={400}
          className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-4 z-20">
          <h3 className="text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors">
            {project.name}
          </h3>
        </div>
      </div>

      {/* Project Body */}
      <div className="p-4">
        <p className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-4 line-clamp-3`}>
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-2 mb-4">
          {project.techStack.map((tech, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-1 rounded-full ${
                isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tech}
            </span>
          ))}
        </div>

        {/* Project Links & Stats */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex space-x-3">
            {project.github && (
              <a
                href={`https://${project.github}`}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label="GitHub"
              >
                <Github size={16} />
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label="Live site"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          {project.stats && (
            <div className="flex items-center space-x-3">
              <div className="flex items-center text-xs text-gray-500">
                <Star size={14} className="mr-1" />
                <span>{project.stats.stars}</span>
              </div>
              <div className="flex items-center text-xs text-gray-500">
                <GitFork size={14} className="mr-1" />
                <span>{project.stats.forks}</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const ProjectGrid = ({ searchQuery = '', activeFilter = 'all' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [projects] = useState(portfolioData.projects);
  const [filteredProjects, setFilteredProjects] = useState(portfolioData.projects);

  // Filter projects based on search and filter criteria
  useEffect(() => {
    let filtered = [...projects];

    // Apply search filter if query exists
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(project => {
        const nameMatch = project.name.toLowerCase().includes(query);
        const descMatch = project.description.toLowerCase().includes(query);
        const techMatch = project.techStack.some(tech =>
          tech.toLowerCase().includes(query)
        );
        return nameMatch || descMatch || techMatch;
      });
    }

    // Apply technology filter if not 'all'
    if (activeFilter !== 'all') {
      filtered = filtered.filter(project => {
        const techStack = project.techStack.map(tech => tech.toLowerCase());
        return techStack.some(tech => tech.includes(activeFilter.toLowerCase()));
      });
    }

    setFilteredProjects(filtered);
  }, [projects, searchQuery, activeFilter]);

  if (filteredProjects.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        {searchQuery || activeFilter !== 'all' ? (
          <>
            <div className="text-center mb-4">
              <h3 className="text-xl font-semibold mb-2">No matching projects found</h3>
              <p>Try adjusting your search or filter criteria</p>
            </div>
            <div className="flex gap-2 mt-2">
              {activeFilter !== 'all' && (
                <button
                  onClick={() => setActiveFilter('all')}
                  className="px-3 py-1 bg-green-500 text-white text-sm rounded-md hover:bg-green-600 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          </>
        ) : (
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">No projects added yet</h3>
            <p>Check back later for updates on my latest work</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      {/* Results summary if filtering is active */}
      {(searchQuery || activeFilter !== 'all') && (
        <div className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' && ` with ${activeFilter}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <ProjectCard key={index} project={project} isDark={isDark} />
        ))}
      </div>
    </>
  );
};

export default ProjectGrid;
