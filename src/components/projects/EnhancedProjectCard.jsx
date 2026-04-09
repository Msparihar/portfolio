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
      className="group relative rounded-xl overflow-hidden transition-all duration-300 cursor-pointer"
      style={{
        background: 'var(--dt-surface)',
        border: '1px solid var(--dt-accent-border)',
      }}
      onClick={() => onCardClick(project)}
    >
      {/* Featured Badge */}
      {featured && (
        <div className="absolute top-3 left-3 z-10 px-2 py-1 text-xs font-medium rounded-full" style={{ background: 'var(--dt-accent)', color: 'var(--dt-bg)' }}>
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
              className="p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
              style={{ color: 'var(--dt-text)' }}
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
              className="p-2 bg-black/60 hover:bg-black/80 rounded-full transition-colors"
              style={{ color: 'var(--dt-text)' }}
              title="Live Demo"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Project Stats */}
        <div className="absolute bottom-3 left-3 right-3 z-10">
          <div className="flex items-center justify-between" style={{ color: 'var(--dt-text)' }}>
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
              className="flex items-center gap-1 text-sm px-2 py-1 rounded-full transition-colors"
              style={{ background: 'var(--dt-accent-soft-2)', color: 'var(--dt-text)' }}
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
          <h3 className="text-lg font-semibold mb-1 transition-colors" style={{ color: 'var(--dt-accent)' }}>
            <span className="text-sm mr-2" style={{ color: 'var(--dt-text-muted)' }}>$</span>
            {name}
          </h3>
        </div>

        {/* Description */}
        <p className="text-sm mb-4 line-clamp-3 leading-relaxed" style={{ color: 'var(--dt-text-muted)' }}>
          {description}
        </p>

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-1.5">
            {techStack.slice(0, 4).map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-md"
                style={{
                  background: 'var(--dt-accent-soft)',
                  color: 'var(--dt-accent)',
                  border: '1px solid var(--dt-accent-20)',
                }}
              >
                {tech}
              </span>
            ))}
            {techStack.length > 4 && (
              <span className="px-2 py-1 text-xs rounded-md" style={{ background: 'var(--dt-surface)', color: 'var(--dt-text-muted)' }}>
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
                className="transition-colors"
                style={{ color: 'var(--dt-text-muted)' }}
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
                className="transition-colors"
                style={{ color: 'var(--dt-text-muted)' }}
                title="Live Demo"
              >
                <ExternalLink size={16} />
              </a>
            )}
          </div>

          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--dt-text-muted)' }}>
            <Code size={12} />
            <span>{techStack.length} technologies</span>
          </div>
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" style={{ background: 'var(--dt-accent-soft)' }} />
    </div>
  );
};

export default EnhancedProjectCard;
