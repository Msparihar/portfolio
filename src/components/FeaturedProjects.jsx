"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Github, ExternalLink, ArrowRight } from 'lucide-react';
import portfolioData from '@/config/portfolio.json';

const FeaturedProjectCard = ({ project }) => {
  const { name, description, techStack, github, live, image } = project;

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
    <div className="group relative rounded-xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-green-500/50 transition-all duration-300">
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
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
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors"
              title="Live Demo"
            >
              <ExternalLink size={16} />
            </a>
          )}
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
        <p className="text-gray-300 text-sm mb-4 line-clamp-2 leading-relaxed">
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
                +{techStack.length - 4}
              </span>
            )}
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center gap-3">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
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
              className="text-gray-400 hover:text-green-400 transition-colors"
              title="Live Demo"
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>
      </div>

      {/* Hover Effect */}
      <div className="absolute inset-0 bg-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </div>
  );
};

export default function FeaturedProjects() {
  const featuredProjects = portfolioData.projects.filter(
    (project) => project.featured && !project._disabled
  );

  if (featuredProjects.length === 0) return null;

  return (
    <section className="mt-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-green-500 font-mono">$</span>
          <h2 className="text-xl font-semibold text-foreground">Featured Projects</h2>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors group"
        >
          <span>View all projects</span>
          <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProjects.map((project, index) => (
          <FeaturedProjectCard key={index} project={project} />
        ))}
      </div>
    </section>
  );
}
