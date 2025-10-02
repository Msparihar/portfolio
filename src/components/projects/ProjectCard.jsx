"use client";

import React from 'react';
import { Github, ExternalLink, Star, GitFork } from 'lucide-react';

const ProjectCard = ({ project }) => {
  const {
    name,
    description,
    techStack,
    github,
    live,
    stats = { stars: 0, forks: 0 }
  } = project;

  return (
    <div className="group relative rounded-lg overflow-hidden">
      {/* Background with grid */}
      <div className="absolute inset-0 bg-grid-small-white/[0.05] bg-black/90" />

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/5 to-black/20" />

      {/* Content */}
      <div className="relative p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <h3 className="text-xl font-semibold text-green-500/80">
            <span className="text-sm mr-2">$</span>
            {name}
          </h3>
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="flex items-center gap-1">
              <Star className="text-yellow-500 w-4 h-4" />
              <span className="text-sm">{stats.stars}</span>
            </div>
            <div className="flex items-center gap-1">
              <GitFork className="text-blue-500 w-4 h-4" />
              <span className="text-sm">{stats.forks}</span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-4 flex-grow">
          {description}
        </p>

        {/* Tech Stack */}
        <div className="mb-4">
          <div className="flex flex-wrap gap-2">
            {techStack.map((tech, index) => (
              <span
                key={index}
                className="px-2 py-1 text-xs rounded-md bg-green-500/10 text-green-500/80"
              >
                {tech}
              </span>
            ))}
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-4 mt-auto">
          <a
            href={github}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-green-500 transition-colors flex items-center gap-2"
          >
            <Github className="w-4 h-4" />
            <span className="text-sm">View Source</span>
          </a>
          {live && (
            <a
              href={live}
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted-foreground hover:text-green-500 transition-colors flex items-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span className="text-sm">Live Demo</span>
            </a>
          )}
        </div>

        {/* Hover effect */}
        <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </div>
  );
};

export default ProjectCard;
