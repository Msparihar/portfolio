"use client";

import { useEffect } from 'react';
import portfolioConfig from '@/config/portfolio.json';

const ImagePreloader = () => {
  useEffect(() => {
    // Defer image preloading until after initial paint to avoid blocking render
    const preloadImages = () => {
      // Reduce to only first 3 project images (truly critical, above-the-fold)
      const criticalProjectImages = portfolioConfig.projects
        .slice(0, 3)
        .map(project => project.image)
        .filter(Boolean);

      // Preload only 2 blog images
      const criticalBlogImages = portfolioConfig.blogs
        .slice(0, 2)
        .map(blog => blog.image)
        .filter(Boolean);

      // Combine all critical images (reduced from 15 to 5)
      const allCriticalImages = [...criticalProjectImages, ...criticalBlogImages];

      // Create preload links with lower priority
      allCriticalImages.forEach(imageSrc => {
        if (imageSrc && !imageSrc.startsWith('data:')) {
          const link = document.createElement('link');
          link.rel = 'prefetch'; // Changed from 'preload' to 'prefetch' for lower priority
          link.as = 'image';
          link.href = imageSrc;
          document.head.appendChild(link);
        }
      });
    };

    // Use requestIdleCallback to defer until browser is idle
    const idleCallback = requestIdleCallback
      ? requestIdleCallback(preloadImages, { timeout: 2000 })
      : setTimeout(preloadImages, 1000);

    // Cleanup function
    return () => {
      if (requestIdleCallback) {
        cancelIdleCallback(idleCallback);
      } else {
        clearTimeout(idleCallback);
      }
    };
  }, []);

  return null; // This component doesn't render anything
};

export default ImagePreloader;