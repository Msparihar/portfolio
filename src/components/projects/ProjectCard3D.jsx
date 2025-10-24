"use client";

import React from 'react';
import { Github, ExternalLink, Star, GitFork, Eye, Calendar, Code } from 'lucide-react';
import Image from 'next/image';
import { CardContainer, CardBody, CardItem } from '@/components/aceternity/3DCard';
import { motion } from 'framer-motion';

const ProjectCard3D = ({ project, onCardClick }) => {
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
    <CardContainer containerClassName="w-full h-full">
      <CardBody className="relative group/card w-full h-auto rounded-xl p-6 border border-gray-800 bg-gray-900/50 hover:border-green-500/50 transition-all duration-300 cursor-pointer">
        {/* Background gradient effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-blue-500/5 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />

        {/* Holographic border effect */}
        <motion.div
          className="absolute inset-0 rounded-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-300"
          style={{
            background: 'linear-gradient(90deg, rgba(34, 197, 94, 0.1) 0%, rgba(59, 130, 246, 0.1) 50%, rgba(168, 85, 247, 0.1) 100%)',
            backgroundSize: '200% 100%',
          }}
          animate={{
            backgroundPosition: ['0% 50%', '200% 50%'],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "linear"
          }}
        />

        <div className="relative" onClick={() => onCardClick(project)}>
          {/* Featured Badge */}
          {featured && (
            <CardItem
              translateZ={20}
              className="absolute top-0 left-0 z-20 px-3 py-1.5 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs font-semibold rounded-full shadow-lg"
            >
              ⭐ Featured
            </CardItem>
          )}

          {/* Project Image */}
          <CardItem
            translateZ={50}
            className="w-full mb-4 relative"
          >
            <div className="relative h-48 overflow-hidden rounded-lg border border-gray-700/50">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
              <Image
                src={imageSrc}
                alt={name}
                fill
                className="object-cover transition-transform duration-500 group-hover/card:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />

              {/* Quick Actions Overlay */}
              <div className="absolute top-3 right-3 z-20 flex gap-2 opacity-0 group-hover/card:opacity-100 transition-all duration-300">
                {github && (
                  <a
                    href={github}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="p-2 bg-black/70 hover:bg-green-500/80 text-white rounded-full transition-all transform hover:scale-110"
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
                    className="p-2 bg-black/70 hover:bg-blue-500/80 text-white rounded-full transition-all transform hover:scale-110"
                    title="Live Demo"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
              </div>

              {/* Project Stats */}
              <div className="absolute bottom-3 left-3 right-3 z-20">
                <div className="flex items-center justify-between text-white text-sm backdrop-blur-sm">
                  <div className="flex items-center gap-3">
                    {stats.stars > 0 && (
                      <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                        <Star className="text-yellow-400" size={12} fill="currentColor" />
                        <span>{stats.stars}</span>
                      </div>
                    )}
                    {stats.forks > 0 && (
                      <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                        <GitFork className="text-blue-400" size={12} />
                        <span>{stats.forks}</span>
                      </div>
                    )}
                    {year && (
                      <div className="flex items-center gap-1 bg-black/50 px-2 py-1 rounded-full">
                        <Calendar size={12} />
                        <span className="text-xs">{year}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </CardItem>

          {/* Header */}
          <CardItem
            translateZ={30}
            className="mb-3"
          >
            <h3 className="text-xl font-bold text-green-400 group-hover/card:text-green-300 transition-colors flex items-center gap-2">
              <span className="text-sm text-gray-500">$</span>
              {name}
            </h3>
          </CardItem>

          {/* Description */}
          <CardItem
            as="p"
            translateZ={20}
            className="text-gray-300 text-sm mb-4 line-clamp-3 leading-relaxed"
          >
            {description}
          </CardItem>

          {/* Tech Stack */}
          <CardItem
            translateZ={30}
            className="mb-4"
          >
            <div className="flex flex-wrap gap-2">
              {techStack.slice(0, 4).map((tech, index) => (
                <span
                  key={index}
                  className="px-2.5 py-1 text-xs rounded-md bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 hover:border-green-500/50 transition-all"
                >
                  {tech}
                </span>
              ))}
              {techStack.length > 4 && (
                <span className="px-2.5 py-1 text-xs rounded-md bg-gray-800 text-gray-400 border border-gray-700">
                  +{techStack.length - 4} more
                </span>
              )}
            </div>
          </CardItem>

          {/* Action Buttons */}
          <CardItem
            translateZ={40}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              {github && (
                <a
                  href={github}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-gray-400 hover:text-green-400 transition-colors transform hover:scale-110"
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
                  className="text-gray-400 hover:text-blue-400 transition-colors transform hover:scale-110"
                  title="Live Demo"
                >
                  <ExternalLink size={18} />
                </a>
              )}
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCardClick(project);
              }}
              className="flex items-center gap-2 px-4 py-2 text-xs font-medium bg-gradient-to-r from-green-500/20 to-blue-500/20 hover:from-green-500/30 hover:to-blue-500/30 text-green-400 rounded-lg border border-green-500/30 hover:border-green-500/50 transition-all transform hover:scale-105"
            >
              <Eye size={14} />
              <span>View Details</span>
            </button>
          </CardItem>
        </div>

        {/* Glow effect on hover */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-green-500/10 via-blue-500/10 to-purple-500/10 opacity-0 group-hover/card:opacity-100 transition-opacity duration-500 blur-xl pointer-events-none" />
      </CardBody>
    </CardContainer>
  );
};

export default ProjectCard3D;

