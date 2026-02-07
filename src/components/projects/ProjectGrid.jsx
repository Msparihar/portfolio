"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { ExternalLink, Github, Star, GitFork, Expand } from 'lucide-react';
import portfolioData from '@/config/portfolio.json';

// Lazy load modal components since they're only used on interaction
const ProjectModal = dynamic(() => import('./ProjectModal'), { ssr: false });
const ProjectModalContent = dynamic(() => import('./ProjectModalContent'), { ssr: false });
// Optimized base64 placeholder images to avoid 404s and loading delays
const placeholderImages = [
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTExODI3Ii8+CjxwYXRoIGQ9Ik0zMDAgMjAwTDM1MCAyNTBIMjUwTDMwMCAyMDBaIiBmaWxsPSIjMzc0MTUxIi8+Cjx0ZXh0IHg9IjMwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNjM3Mzg0IiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIj5Qcm9qZWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMGYxNDE5Ii8+CjxjaXJjbGUgY3g9IjMwMCIgY3k9IjIwMCIgcj0iNTAiIGZpbGw9IiMyMjQ0MzEiLz4KPHR5cGVUIHg9IjMwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNDJhMzY2IiBmb250LXNpemU9IjE2IiBmb250LWZhbWlseT0ibW9ub3NwYWNlIj5Qcm9qZWN0IEltYWdlPC90ZXh0Pgo8L3N2Zz4K',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMDkwYTEzIi8+CjxyZWN0IHg9IjI1MCIgeT0iMTUwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzI3NGE1NCIvPgo8dGV4dCB4PSIzMDAiIHk9IjMwMCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZmlsbD0iIzJkZGQ2OSIgZm9udC1zaXplPSIxNiIgZm9udC1mYW1pbHk9Im1vbm9zcGFjZSI+UHJvamVjdCBJbWFnZTwvdGV4dD4KPC9zdmc+Cg==',
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTEyNTMzIi8+Cjxwb2x5Z29uIHBvaW50cz0iMzAwLDE1MCAzNTAsMjUwIDI1MCwyNTAiIGZpbGw9IiMzMzU0NjQiLz4KPHR5cGVUIHg9IjMwMCIgeT0iMzAwIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmaWxsPSIjNzAz%29YzQiIGZvbnQtc2l6ZT0iMTYiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiPlByb2plY3QgSW1hZ2U8L3RleHQ+Cjwvc3ZnPgo='
];

const ProjectCard = ({ project, isDark, isPriority = false, onExpand }) => {
  // Get a placeholder image based on project name hash
  const getPlaceholderImage = (name) => {
    const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return placeholderImages[hash % placeholderImages.length];
  };

  // Image source - either from project or placeholder
  const imageSrc = project.image || getPlaceholderImage(project.name);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onExpand(project);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      className={`project-card group relative overflow-hidden rounded-xl transition-colors transition-shadow duration-300 cursor-pointer touch-manipulation ${
        isDark ? 'bg-gray-900 hover:bg-gray-800' : 'bg-white hover:bg-gray-50'
      } border ${isDark ? 'border-gray-800' : 'border-gray-200'} shadow-sm hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 ${isDark ? 'focus-visible:ring-offset-gray-900' : 'focus-visible:ring-offset-white'}`}
      onClick={() => onExpand(project)}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${project.name}`}
    >
      {/* Project Image with Overlay */}
      <div className="relative h-40 sm:h-48 overflow-hidden image-container">
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-black/70 z-10"></div>
        <Image
          src={imageSrc}
          alt={project.name}
          width={600}
          height={400}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          priority={isPriority}
          loading={isPriority ? undefined : 'lazy'}
          placeholder="blur"
          blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAwIiBoZWlnaHQ9IjQwMCIgdmlld0JveD0iMCAwIDYwMCA0MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI2MDAiIGhlaWdodD0iNDAwIiBmaWxsPSIjMTExODI3IiBvcGFjaXR5PSIwLjMiLz4KPC9zdmc+Cg=="
          unoptimized={imageSrc.endsWith('.gif')}
          className="object-cover w-full h-full transition-transform duration-700 motion-safe:group-hover:scale-105"
        />
        <div className="absolute bottom-0 left-0 right-0 p-3 sm:p-4 z-20">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-bold text-white mb-1 group-hover:text-green-400 transition-colors truncate pr-2">
              {project.name}
            </h3>
            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
              <Expand size={18} className="text-white sm:w-5 sm:h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Project Body */}
      <div className="p-3 sm:p-4">
        <p className={`text-xs sm:text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'} mb-3 sm:mb-4 line-clamp-2 sm:line-clamp-3`}>
          {project.description}
        </p>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
          {project.techStack.slice(0, 5).map((tech, i) => (
            <span
              key={i}
              className={`text-xs px-2 py-0.5 sm:py-1 rounded-full ${
                isDark
                  ? 'bg-gray-800 text-gray-300'
                  : 'bg-gray-100 text-gray-700'
              }`}
            >
              {tech}
            </span>
          ))}
          {project.techStack.length > 5 && (
            <span className={`text-xs px-2 py-0.5 sm:py-1 rounded-full ${
              isDark ? 'bg-gray-800 text-gray-400' : 'bg-gray-100 text-gray-600'
            }`}>
              +{project.techStack.length - 5}
            </span>
          )}
        </div>

        {/* Project Links & Stats */}
        <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex space-x-3">
            {project.github && (
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label={`View source code for ${project.name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <Github size={16} />
              </a>
            )}
            {project.live && (
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center transition-colors rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'
                }`}
                aria-label={`View live demo of ${project.name}`}
                onClick={(e) => e.stopPropagation()}
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

const activeProjects = portfolioData.projects.filter(p => !p._disabled);

const ProjectGrid = ({ searchQuery = '', activeFilter = 'all' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Combined single-pass filter for search and technology
  const filteredProjects = useMemo(() => {
    const query = searchQuery ? searchQuery.toLowerCase() : '';
    const filter = activeFilter !== 'all' ? activeFilter.toLowerCase() : '';

    if (!query && !filter) return activeProjects;

    return activeProjects.filter(project => {
      if (query) {
        const nameMatch = project.name.toLowerCase().includes(query);
        const descMatch = project.description.toLowerCase().includes(query);
        const techMatch = project.techStack.some(tech =>
          tech.toLowerCase().includes(query)
        );
        if (!nameMatch && !descMatch && !techMatch) return false;
      }

      if (filter) {
        if (!project.techStack.some(tech => tech.toLowerCase().includes(filter))) return false;
      }

      return true;
    });
  }, [searchQuery, activeFilter]);

  const handleProjectExpand = useCallback((project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProject(null);
  }, []);

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
          <ProjectCard
            key={index}
            project={project}
            isDark={isDark}
            isPriority={index < 3} // Priority load first 3 images
            onExpand={handleProjectExpand}
          />
        ))}
      </div>

      {/* Project Modal */}
      <ProjectModal isOpen={isModalOpen} onClose={handleModalClose}>
        {selectedProject && (
          <ProjectModalContent project={selectedProject} isDark={isDark} />
        )}
      </ProjectModal>
    </>
  );
};

export default ProjectGrid;
