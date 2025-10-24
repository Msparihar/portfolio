"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useTheme } from 'next-themes';
import dynamic from 'next/dynamic';
import portfolioData from '@/config/portfolio.json';
import { SkeletonGrid } from '../ui/SkeletonCard';

// Lazy load modal and card components
const ProjectModal = dynamic(() => import('./ProjectModal'), { ssr: false });
const ProjectModalContent = dynamic(() => import('./ProjectModalContent'), { ssr: false });
const EnhancedProjectCard = dynamic(() => import('./EnhancedProjectCard'), { ssr: false });
const ProjectCard3D = dynamic(() => import('./ProjectCard3D'), { ssr: false });

const ProjectGrid = ({ searchQuery = '', activeFilter = 'all' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Load projects data
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

  // Memoized filtered projects to prevent unnecessary recalculations
  const filteredProjects = useMemo(() => {
    if (projects.length === 0) return [];

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

    return filtered;
  }, [projects, searchQuery, activeFilter]);

  // Modal handlers
  const handleProjectExpand = (project) => {
    setSelectedProject(project);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedProject(null);
  };

  if (loading) {
    return <SkeletonGrid count={9} type="project" />;
  }

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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredProjects.map((project, index) => (
          <ProjectCard3D
            key={index}
            project={project}
            onCardClick={handleProjectExpand}
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
