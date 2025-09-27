"use client";

import { useEffect } from 'react';
import portfolioConfig from '@/config/portfolio.json';

const ImagePreloader = () => {
  useEffect(() => {
    // Preload critical project images (first 9 projects)
    const criticalProjectImages = portfolioConfig.projects
      .slice(0, 9)
      .map(project => project.image)
      .filter(Boolean);

    // Preload critical blog images (first 6 blog posts)
    const criticalBlogImages = portfolioConfig.blogs
      .slice(0, 6)
      .map(blog => blog.image)
      .filter(Boolean);

    // Combine all critical images
    const allCriticalImages = [...criticalProjectImages, ...criticalBlogImages];

    // Create preload links dynamically
    allCriticalImages.forEach(imageSrc => {
      if (imageSrc && !imageSrc.startsWith('data:')) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageSrc;
        link.fetchPriority = 'high';
        document.head.appendChild(link);
      }
    });

    // Cleanup function to remove preload links on unmount
    return () => {
      const preloadLinks = document.querySelectorAll('link[rel="preload"][as="image"]');
      preloadLinks.forEach(link => {
        if (allCriticalImages.some(src => link.href.includes(src))) {
          document.head.removeChild(link);
        }
      });
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ImagePreloader;