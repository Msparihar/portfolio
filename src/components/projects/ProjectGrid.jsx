"use client";

import React, { useState, useEffect } from 'react';
import ProjectCard from './ProjectCard';
import LoadingDots from '../ui/LoadingDots';

const ProjectGrid = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        // Temporary mock data until GitHub integration is complete
        const mockProjects = [
          {
            name: "Portfolio Website",
            description: "A modern portfolio website built with Next.js, featuring a terminal-style interface and interactive project showcase.",
            techStack: ["Next.js", "React", "TailwindCSS", "Framer Motion"],
            github: "https://github.com/username/portfolio",
            live: "https://portfolio.example.com",
            stats: {
              stars: 25,
              forks: 8
            }
          },
          {
            name: "Project Manager",
            description: "Full-stack project management application with real-time updates and team collaboration features.",
            techStack: ["React", "Node.js", "MongoDB", "Socket.io"],
            github: "https://github.com/username/project-manager",
            live: "https://project-manager.example.com",
            stats: {
              stars: 15,
              forks: 3
            }
          },
          {
            name: "E-commerce Platform",
            description: "Modern e-commerce platform with cart management, payment processing, and order tracking.",
            techStack: ["Next.js", "Stripe", "PostgreSQL", "Prisma"],
            github: "https://github.com/username/e-commerce",
            stats: {
              stars: 12,
              forks: 4
            }
          }
        ];

        // Simulate loading time
        await new Promise(resolve => setTimeout(resolve, 1500));
        setProjects(mockProjects);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchProjects();
  }, []);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[200px] text-red-500/80">
        <p>Error loading projects: {error}</p>
      </div>
    );
  }

  if (projects.length === 0 && !loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[200px] text-muted-foreground">
        <p className="mb-4">No projects found.</p>
        <div className="flex items-center gap-2">
          <span className="text-green-500/80">$</span>
          <span>Check back later for updates</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {loading ? (
        [...Array(6)].map((_, index) => (
          <div
            key={index}
            className="h-64 rounded-lg bg-black/90 animate-pulse"
          >
            <div className="absolute inset-0 bg-grid-small-white/[0.05]" />
            <div className="p-6 relative">
              <div className="h-6 w-32 bg-green-500/10 rounded mb-4" />
              <div className="space-y-2">
                <div className="h-4 w-full bg-green-500/10 rounded" />
                <div className="h-4 w-3/4 bg-green-500/10 rounded" />
                <div className="h-4 w-1/2 bg-green-500/10 rounded" />
              </div>
            </div>
          </div>
        ))
      ) : (
        projects.map((project, index) => (
          <ProjectCard key={index} project={project} />
        ))
      )}
    </div>
  );
};

export default ProjectGrid;
