"use client";

import React, { useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { isVideoSrc } from '@/lib/utils';
import ProjectVideo from './ProjectVideo';
import dynamic from 'next/dynamic';
import { useTheme } from 'next-themes';
import { Github, ExternalLink, ArrowRight, Expand } from 'lucide-react';
import portfolioData from '@/config/portfolio.json';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

gsap.registerPlugin(ScrollTrigger);

const PLACEHOLDER_IMAGE = `data:image/svg+xml;base64,${btoa(`
  <svg width="400" height="250" viewBox="0 0 400 250" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="400" height="250" fill="#111827"/>
    <rect x="150" y="100" width="100" height="50" fill="#374151"/>
    <text x="200" y="200" text-anchor="middle" fill="#6b7280" font-size="14" font-family="monospace">Project</text>
  </svg>
`)}`;

const ProjectModal = dynamic(() => import('./projects/ProjectModal'), { ssr: false });
const ProjectModalContent = dynamic(() => import('./projects/ProjectModalContent'), { ssr: false });

const FeaturedProjectCard = ({ project, onExpand, isHero = false }) => {
  const { name, description, techStack, github, live, image } = project;
  const imageSrc = image || PLACEHOLDER_IMAGE;

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onExpand(project);
    }
  };

  // Truncate description to ~120 chars for hero card
  const shortDesc = description.length > 120
    ? description.slice(0, 120).replace(/\s+\S*$/, '') + '...'
    : description;

  if (isHero) {
    return (
      <div
        data-anim-card
        role="button"
        tabIndex={0}
        className="group relative rounded-xl overflow-hidden col-span-full cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900 border border-green-500/30 hover:border-green-500/60 transition-all duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(0,20,10,0.95) 0%, rgba(10,10,10,0.95) 100%)',
          boxShadow: '0 0 40px rgba(0, 255, 100, 0.08), 0 4px 30px rgba(0, 0, 0, 0.4)',
        }}
        onClick={() => onExpand(project)}
        onKeyDown={handleKeyDown}
        aria-label={`View details for ${name}`}
      >
        {/* Terminal-style top bar */}
        <div className="flex items-center gap-2 px-5 py-3 border-b border-green-500/20">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-3 text-xs font-mono text-terminal-cyan">~/projects/{name.toLowerCase().replace(/\s+/g, '-')}</span>
        </div>

        <div className="grid md:grid-cols-[3fr_2fr] gap-0">
          {/* Hero Image — 60% */}
          <div className="relative h-64 md:h-[340px] overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-transparent to-black/80 z-10 hidden md:block" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10 md:hidden" />
            {isVideoSrc(imageSrc) ? (
              <ProjectVideo
                src={imageSrc}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
              />
            ) : (
              <Image
                src={imageSrc}
                alt={name}
                fill
                className="object-cover transition-transform duration-700 motion-safe:group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 100vw, 60vw"
                priority
                unoptimized={imageSrc.endsWith('.gif')}
              />
            )}
          </div>

          {/* Hero Content — 40%, top-aligned */}
          <div className="p-6 md:p-7 flex flex-col justify-start">
            {/* Terminal-style label */}
            <div className="mb-3 font-mono text-sm">
              <span className="text-green-500">{'>'}</span>
              <span className="text-terminal-cyan ml-2">featured</span>
            </div>

            {/* Title — properly scaled $ */}
            <h3 className="text-xl md:text-2xl font-bold text-foreground mb-3 group-hover:text-green-400 transition-colors font-mono">
              <span className="text-green-500 mr-1">$</span>
              {name}
            </h3>

            {/* Short description */}
            <p className="text-muted-foreground text-sm mb-5 leading-relaxed font-mono">
              {shortDesc}
            </p>

            {/* Tech Stack — cyan-bordered, slightly larger */}
            <div className="mb-5">
              <div className="flex flex-wrap gap-2">
                {techStack.slice(0, 6).map((tech, index) => (
                  <span key={index}
                    className="px-2.5 py-1 text-xs font-mono rounded bg-terminal-cyan/5 text-terminal-cyan border border-terminal-cyan/20"
                    style={{ color: 'hsl(var(--terminal-cyan))' }}>
                    {tech}
                  </span>
                ))}
                {techStack.length > 6 && (
                  <span className="px-2.5 py-1 text-xs font-mono rounded bg-gray-800 text-gray-400">
                    +{techStack.length - 6}
                  </span>
                )}
              </div>
            </div>

            {/* CTA Buttons — prominent */}
            <div className="flex items-center gap-3 mt-auto">
              {github && (
                <a href={github} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg border border-green-500/40 text-green-400 hover:bg-green-500/10 hover:border-green-500/60 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  aria-label={`View source code for ${name}`}>
                  <Github size={16} />
                  <span>Source</span>
                </a>
              )}
              {live && (
                <a href={live} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-mono rounded-lg text-white hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
                  style={{
                    background: 'linear-gradient(135deg, hsl(var(--terminal-cyan)) 0%, hsl(187 100% 35%) 100%)',
                  }}
                  aria-label={`View live demo of ${name}`}>
                  <ExternalLink size={16} />
                  <span>Live Demo</span>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Scanline overlay for terminal feel */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{
            backgroundImage: 'repeating-linear-gradient(0deg, rgba(0,255,100,0.1), rgba(0,255,100,0.1) 1px, transparent 1px, transparent 3px)',
            backgroundSize: '100% 3px',
          }}
        />
      </div>
    );
  }

  return (
    <div
      data-anim-card
      role="button"
      tabIndex={0}
      className="group relative rounded-xl overflow-hidden bg-gray-900/50 border border-gray-800 hover:border-green-500/50 transition-colors transition-shadow duration-300 cursor-pointer touch-manipulation focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 focus-visible:ring-offset-2 focus-visible:ring-offset-gray-900"
      onClick={() => onExpand(project)}
      onKeyDown={handleKeyDown}
      aria-label={`View details for ${name}`}
    >
      {/* Project Image */}
      <div className="relative h-48 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/60 z-10" />
        {isVideoSrc(imageSrc) ? (
          <ProjectVideo
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
          />
        ) : (
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-cover transition-transform duration-500 motion-safe:group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={imageSrc.endsWith('.gif')}
          />
        )}

        {/* Quick Actions Overlay */}
        <div className="absolute top-3 right-3 z-10 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label={`View source code for ${name}`}
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
              className="p-2 bg-black/60 hover:bg-black/80 text-white rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500"
              aria-label={`View live demo of ${name}`}
            >
              <ExternalLink size={16} />
            </a>
          )}
        </div>

        {/* Expand indicator */}
        <div className="absolute bottom-3 right-3 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
          <Expand size={18} className="text-white" />
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
              onClick={(e) => e.stopPropagation()}
              className="text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
              aria-label={`View source code for ${name}`}
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
              className="text-gray-400 hover:text-green-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
              aria-label={`View live demo of ${name}`}
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const sectionRef = useRef(null);

  const featuredProjects = portfolioData.projects.filter(
    (project) => project.featured && !project._disabled
  );

  useGSAP(() => {
    const mm = gsap.matchMedia();
    mm.add("(prefers-reduced-motion: no-preference)", () => {
      gsap.utils.toArray("[data-anim-card]").forEach((card, i) => {
        gsap.fromTo(card,
          { y: 50, autoAlpha: 0, scale: 0.95 },
          {
            y: 0,
            autoAlpha: 1,
            scale: 1,
            duration: 0.7,
            delay: i * 0.1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    });
  }, { scope: sectionRef });

  const handleProjectExpand = useCallback((project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalOpen(false);
    setSelectedProject(null);
  }, []);

  if (featuredProjects.length === 0) return null;

  return (
    <section ref={sectionRef} className="mt-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="text-green-500 font-mono">$</span>
          <h2 className="text-xl font-semibold text-foreground text-wrap-balance">Featured Projects</h2>
        </div>
        <Link
          href="/projects"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-green-500 transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-500 rounded"
        >
          <span>View all projects</span>
          <ArrowRight size={16} className="motion-safe:group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>

      {/* Hero Project */}
      {featuredProjects.length > 0 && (
        <div className="mb-8">
          <FeaturedProjectCard project={featuredProjects[0]} isHero onExpand={handleProjectExpand} />
        </div>
      )}

      {/* Regular Projects Grid — 3 columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {featuredProjects.slice(1).map((project, index) => (
          <FeaturedProjectCard key={index + 1} project={project} onExpand={handleProjectExpand} />
        ))}
      </div>

      {/* Project Modal */}
      <ProjectModal isOpen={isModalOpen} onClose={handleModalClose}>
        {selectedProject && (
          <ProjectModalContent project={selectedProject} isDark={isDark} />
        )}
      </ProjectModal>
    </section>
  );
}
