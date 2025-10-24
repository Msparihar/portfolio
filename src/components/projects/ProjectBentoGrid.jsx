"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import portfolioData from '@/config/portfolio.json';
import { BentoGrid, BentoGridItem } from '@/components/aceternity/BentoGrid';
import { CardSpotlight } from '@/components/aceternity/CardSpotlight';
import { Github, ExternalLink, Star, GitFork, Calendar, Code2 } from 'lucide-react';
import Image from 'next/image';
import { motion } from 'framer-motion';

// Lazy load modal
const ProjectModal = dynamic(() => import('./ProjectModal'), { ssr: false });
const ProjectModalContent = dynamic(() => import('./ProjectModalContent'), { ssr: false });

const ProjectBentoCard = ({ project, onCardClick, featured = false }) => {
  const {
    name,
    description,
    techStack,
    github,
    live,
    image,
    stats = { stars: 0, forks: 0 },
    year
  } = project;

  const getPlaceholderImage = () => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="400" height="250" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="400" height="250" fill="#111827"/>
        <rect x="150" y="100" width="100" height="50" fill="#374151"/>
        <text x="200" y="200" text-anchor="middle" fill="#6b7280" font-size="14" font-family="monospace">Project</text>
      </svg>
    `)}`;
  };

  const imageSrc = image || getPlaceholderImage();

  const header = (
    <div className="relative w-full h-full min-h-[140px] overflow-hidden rounded-lg">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
      <Image
        src={imageSrc}
        alt={name}
        fill
        className="object-cover transition-transform duration-500 group-hover/bento:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
      />

      {/* Quick Actions */}
      <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover/bento:opacity-100 transition-opacity">
        {github && (
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-black/70 hover:bg-green-500/80 text-white rounded-full transition-all"
          >
            <Github size={14} />
          </a>
        )}
        {live && (
          <a
            href={live}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="p-2 bg-black/70 hover:bg-blue-500/80 text-white rounded-full transition-all"
          >
            <ExternalLink size={14} />
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="absolute bottom-3 left-3 z-20 flex gap-3 text-white text-xs">
        {stats.stars > 0 && (
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
            <Star size={10} fill="currentColor" className="text-yellow-400" />
            <span>{stats.stars}</span>
          </div>
        )}
        {stats.forks > 0 && (
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
            <GitFork size={10} className="text-blue-400" />
            <span>{stats.forks}</span>
          </div>
        )}
        {year && (
          <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
            <Calendar size={10} />
            <span>{year}</span>
          </div>
        )}
      </div>
    </div>
  );

  const icon = (
    <div className="flex flex-wrap gap-1.5 mb-2">
      {techStack.slice(0, featured ? 6 : 4).map((tech, index) => (
        <span
          key={index}
          className="px-2 py-0.5 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20"
        >
          {tech}
        </span>
      ))}
      {techStack.length > (featured ? 6 : 4) && (
        <span className="px-2 py-0.5 text-xs rounded-md bg-gray-800 text-gray-400">
          +{techStack.length - (featured ? 6 : 4)}
        </span>
      )}
    </div>
  );

  return (
    <CardSpotlight onClick={() => onCardClick(project)}>
      <BentoGridItem
        title={name}
        description={description}
        header={header}
        icon={icon}
        span={featured ? 2 : 1}
        className="cursor-pointer"
      />
    </CardSpotlight>
  );
};

const ProjectBentoGrid = ({ searchQuery = '', activeFilter = 'all' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const loadProjects = async () => {
      try {
        setProjects(portfolioData.projects);
        setLoading(false);
      } catch (err) {
        console.error('Error loading projects:', err);
        setLoading(false);
      }
    };

    loadProjects();
  }, []);

  const filteredProjects = useMemo(() => {
    if (projects.length === 0) return [];

    let filtered = [...projects];

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

    if (activeFilter !== 'all') {
      filtered = filtered.filter(project => {
        const techStack = project.techStack.map(tech => tech.toLowerCase());
        return techStack.some(tech => tech.includes(activeFilter.toLowerCase()));
      });
    }

    return filtered;
  }, [projects, searchQuery, activeFilter]);

  const handleProjectExpand = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500"></div>
      </div>
    );
  }

  if (filteredProjects.length === 0) {
    return (
      <div className={`flex flex-col items-center justify-center py-16 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
        <div className="text-center mb-4">
          <h3 className="text-xl font-semibold mb-2">No matching projects found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {(searchQuery || activeFilter !== 'all') && (
        <div className={`mb-6 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {activeFilter !== 'all' && ` with ${activeFilter}`}
          {searchQuery && ` matching "${searchQuery}"`}
        </div>
      )}

      <BentoGrid className="mb-8">
        {filteredProjects.map((project, index) => (
          <ProjectBentoCard
            key={index}
            project={project}
            onCardClick={handleProjectExpand}
            featured={project.featured || index === 0}
          />
        ))}
      </BentoGrid>

      <ProjectModal isOpen={isModalOpen} onClose={handleModalClose}>
        {selectedProject && (
          <ProjectModalContent project={selectedProject} isDark={isDark} />
        )}
      </ProjectModal>
    </>
  );
};

export default ProjectBentoGrid;

