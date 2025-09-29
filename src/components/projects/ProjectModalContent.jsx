"use client";

import React from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import {
  ExternalLink,
  Github,
  Star,
  GitFork,
  Copy,
  CheckCircle2,
  Calendar,
  Users,
  Code,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';

const ProjectModalContent = ({ project, isDark }) => {
  const [copiedUrl, setCopiedUrl] = useState('');
  const [imageAspectRatio, setImageAspectRatio] = useState(null);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [windowWidth, setWindowWidth] = useState(1024);

  // Handle window resize for responsive image sizing
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    if (typeof window !== 'undefined') {
      setWindowWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, []);

  // Animation variants for staggered content
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.3 }
    }
  };

  // Image load handler for dynamic sizing
  const handleImageLoad = (e) => {
    const { naturalWidth, naturalHeight } = e.target;
    setImageAspectRatio(naturalWidth / naturalHeight);
    setImageLoaded(true);
  };

  // Calculate dynamic height based on aspect ratio and screen size
  const getImageHeight = () => {
    if (!imageAspectRatio) return 320; // default height

    // Calculate modal width based on screen size
    let modalWidth;
    if (windowWidth < 768) {
      modalWidth = windowWidth - 32; // mobile: full width minus padding
    } else if (windowWidth < 1024) {
      modalWidth = Math.min(768, windowWidth - 64); // tablet: max 768px
    } else {
      modalWidth = 896; // desktop: max-w-4xl
    }

    const calculatedHeight = modalWidth / imageAspectRatio;

    // Responsive height bounds
    const minHeight = windowWidth < 768 ? 180 : 200;
    const maxHeight = windowWidth < 768 ? 350 : 500;

    return Math.max(minHeight, Math.min(maxHeight, calculatedHeight));
  };

  // Determine the best object fit based on aspect ratio
  const getObjectFit = () => {
    if (!imageAspectRatio) return 'object-cover';

    // Use contain for very wide images (landscape screenshots)
    // Use cover for square/portrait images
    return imageAspectRatio > 1.8 ? 'object-contain' : 'object-cover';
  };

  // Copy URL functionality
  const copyToClipboard = async (url, type) => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(type);
      setTimeout(() => setCopiedUrl(''), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  };

  // Group tech stack by categories
  const groupTechStack = (techStack) => {
    const categories = {
      'Frontend': ['React', 'Next.js', 'Vue', 'Angular', 'Tailwind CSS', 'Shadcn UI', 'HTML', 'CSS', 'JavaScript', 'TypeScript'],
      'Backend': ['FastAPI', 'Node.js', 'Express', 'Python', 'Django', 'Flask'],
      'Database': ['PostgreSQL', 'MongoDB', 'Redis', 'SQLite', 'MySQL'],
      'AI/ML': ['OpenAI GPT-4o', 'LangChain', 'PyTorch', 'TensorFlow', 'Scikit-learn', 'Hugging Face', 'Transformers', 'Whisper', 'Computer Vision', 'LangGraph', 'Google Gemini'],
      'Infrastructure': ['Docker', 'AWS', 'Google Cloud Run', 'Vercel', 'WebSocket'],
      'Tools': ['Git', 'GitHub', 'JWT Auth', 'OAuth', 'TanStack Query', 'React Query']
    };

    const grouped = {};
    const uncategorized = [];

    techStack.forEach(tech => {
      let found = false;
      for (const [category, techs] of Object.entries(categories)) {
        if (techs.some(t => tech.toLowerCase().includes(t.toLowerCase()) || t.toLowerCase().includes(tech.toLowerCase()))) {
          if (!grouped[category]) grouped[category] = [];
          grouped[category].push(tech);
          found = true;
          break;
        }
      }
      if (!found) uncategorized.push(tech);
    });

    if (uncategorized.length > 0) {
      grouped['Other'] = uncategorized;
    }

    return grouped;
  };

  const groupedTechStack = groupTechStack(project.techStack);

  // Generate additional project details based on tech stack
  const getProjectFeatures = (project) => {
    const features = [];

    if (project.techStack.includes('WebSocket') || project.name.toLowerCase().includes('real-time')) {
      features.push('Real-time Communication');
    }
    if (project.techStack.includes('Docker')) {
      features.push('Containerized Deployment');
    }
    if (project.techStack.some(tech => tech.toLowerCase().includes('ai') || tech.toLowerCase().includes('gpt') || tech.toLowerCase().includes('llm'))) {
      features.push('AI-Powered Features');
    }
    if (project.techStack.includes('Redis')) {
      features.push('High-Performance Caching');
    }
    if (project.techStack.includes('OAuth') || project.techStack.includes('JWT Auth')) {
      features.push('Secure Authentication');
    }
    if (project.techStack.includes('PostgreSQL') || project.techStack.includes('MongoDB')) {
      features.push('Robust Data Storage');
    }
    if (project.techStack.includes('Tailwind CSS') || project.techStack.includes('Shadcn UI')) {
      features.push('Modern UI Design');
    }

    return features;
  };

  const projectFeatures = getProjectFeatures(project);

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="w-full"
    >
      {/* Hero Image */}
      <motion.div
        variants={itemVariants}
        className="relative w-full overflow-hidden"
        style={{
          height: imageLoaded ? `${getImageHeight()}px` : '320px',
          transition: 'height 0.3s ease-in-out'
        }}
      >
        <Image
          src={project.image || '/images/project-placeholder.png'}
          alt={project.name}
          fill
          className={`transition-all duration-300 ${getObjectFit()}`}
          priority
          unoptimized={project.image?.endsWith('.gif')}
          onLoad={handleImageLoad}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 text-white">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">{project.name}</h1>
          <div className="flex items-center gap-4 text-sm">
            {project.stats && (
              <>
                <div className="flex items-center gap-1">
                  <Star size={16} className="text-yellow-400" />
                  <span>{project.stats.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <GitFork size={16} className="text-blue-400" />
                  <span>{project.stats.forks}</span>
                </div>
              </>
            )}
            <div className="flex items-center gap-1">
              <Code size={16} />
              <span>{project.techStack.length} Technologies</span>
            </div>
          </div>
        </div>
        {/* Live Demo Button Overlay */}
        {project.live && (
          <a
            href={project.live}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute bottom-6 right-6 z-30 inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
            onClick={(e) => e.stopPropagation()}
          >
            <ExternalLink size={18} />
            <span className="hidden sm:inline">Live Demo</span>
          </a>
        )}
      </motion.div>

      {/* Content */}
      <div className="p-6 md:p-8">
        {/* Description */}
        <motion.div variants={itemVariants} className="mb-8">
          <h2 className={`text-xl font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            About this project
          </h2>
          <p className={`text-base leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
            {project.description}
          </p>
        </motion.div>

        {/* Features */}
        {projectFeatures.length > 0 && (
          <motion.div variants={itemVariants} className="mb-8">
            <h3 className={`text-lg font-semibold mb-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              Key Features
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {projectFeatures.map((feature, index) => (
                <div key={index} className="flex items-center gap-2">
                  <Zap size={16} className="text-green-500 flex-shrink-0" />
                  <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                    {feature}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Tech Stack */}
        <motion.div variants={itemVariants} className="mb-8">
          <h3 className={`text-lg font-semibold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
            Technology Stack
          </h3>
          <div className="space-y-4">
            {Object.entries(groupedTechStack).map(([category, techs]) => (
              <div key={category}>
                <h4 className={`text-sm font-medium mb-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  {category}
                </h4>
                <div className="flex flex-wrap gap-2">
                  {techs.map((tech, index) => (
                    <span
                      key={index}
                      className={`px-3 py-1 text-xs rounded-full ${
                        isDark
                          ? 'bg-gray-800 text-gray-300 border border-gray-700'
                          : 'bg-gray-100 text-gray-700 border border-gray-200'
                      }`}
                    >
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Action Buttons */}
        <motion.div variants={itemVariants} className="flex flex-wrap gap-4">
          {project.github && (
            <div className="flex items-center gap-2">
              <a
                href={project.github}
                target="_blank"
                rel="noopener noreferrer"
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                  isDark
                    ? 'bg-gray-800 hover:bg-gray-700 text-white border border-gray-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-900 border border-gray-300'
                }`}
              >
                <Github size={18} />
                View Source
              </a>
              <button
                onClick={() => copyToClipboard(project.github, 'github')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Copy GitHub URL"
              >
                {copiedUrl === 'github' ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          )}

          {project.live && (
            <div className="flex items-center gap-2">
              <a
                href={project.live}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white bg-green-600 hover:bg-green-700 transition-colors"
              >
                <ExternalLink size={18} />
                Live Demo
              </a>
              <button
                onClick={() => copyToClipboard(project.live, 'live')}
                className={`p-2 rounded-lg transition-colors ${
                  isDark
                    ? 'hover:bg-gray-800 text-gray-400'
                    : 'hover:bg-gray-100 text-gray-500'
                }`}
                title="Copy Live URL"
              >
                {copiedUrl === 'live' ? (
                  <CheckCircle2 size={16} className="text-green-500" />
                ) : (
                  <Copy size={16} />
                )}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectModalContent;