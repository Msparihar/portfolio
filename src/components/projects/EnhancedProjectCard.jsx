"use client";

import React from 'react';
import { Github, ExternalLink, Star, GitFork, Eye, Calendar, Code, Zap } from 'lucide-react';
import Image from 'next/image';

const EnhancedProjectCard = ({ project, onCardClick }) => {
  const {
    name,
    description,
    techStack,
    github,
    live,
    image,
    stats = { stars: 0, forks: 0 },
    featured = false,
    year
  } = project;

  // Get placeholder image if none provided
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

  return (
    <div 
      className="group relative rounded-xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-green-500/50 transition-all duration-300 cursor-pointer"
      onClick={() => onCardClick(project)}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full">
          Featured
        </div>
      )}

      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10"></div>
        <Image
          src={imageSrc}
          alt={name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        />
        
        {/* Quick Actions Overlay */}
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              title="View Source"
            >
              <Github size={16} />
            </a>
          )}
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              title="Live Demo"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Project Stats */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center justify-between text-white">
            <div className="flex items-center gap-3 text-sm">
              {stats.stars > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="text-yellow-400" size={12} />
                  <span>{stats.stars}</span>
                </div>
              )}
              {stats.forks > 0 && (
                <div className="flex items-center gap-1">
                  <GitFork className="text-blue-400" size={12} />
                  <span>{stats.forks}</span>
                </div>
              )}
              {year && (
                <div className="flex items-center gap-1">
                  <Calendar size={12} />
                  <span>{year}</span>
                </div>
              )}
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(project);
              }}
              className="flex items-center gap-1 text-sm bg-green-500/20 hover:bg-green-500/30 px-2 py-1 rounded-full transition-colors"
            >
              <Eye size={12} />
              <span>View</span>
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        {/* Header */}
        <div className="mb-3">
          <h3 className="text-lg font-semibold text-green-400 mb-1 group-hover:text-green-300 transition-colors">
            <span className="text-sm text-gray-500 mr-2">$</span>
            {name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/20"
              >
                {tech}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="px-2 py-1 text-xs rounded-md bg-gray-800 text-gray-400">
                +{techStack.length - 4} more
              </span>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {github && (
              <a
                href={github}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-green-400 transition-colors"
                title="View Source"
              >
                <Github size={18} />
              </a>
            )}
            {live && (
              <a
                href={live}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="text-gray-400 hover:text-green-400 transition-colors"
                title="Live Demo"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>
          
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Code size={12} />
            <span>{techStack.length} technologies</span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default EnhancedProjectCard;