"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Aggressive preloading strategy
export const usePreloadPages = () => {
  const router = useRouter();

  useEffect(() => {
    const preloadPage = (href) => {
      // Preload the page bundle
      router.prefetch(href);
    };

    // Immediately preload all main pages on homepage load
    const mainPages = ['/projects', '/blog', '/contact'];
    mainPages.forEach(page => {
      preloadPage(page);
    });

    // Add hover listeners to navigation links for instant loading
    const links = document.querySelectorAll('a[href^="/"]');

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '/' && !href.startsWith('#')) {
        link.addEventListener('mouseenter', () => preloadPage(href), { once: true });
      }
    });

    return () => {
      links.forEach(link => {
        const href = link.getAttribute('href');
        if (href && href !== '/' && !href.startsWith('#')) {
          link.removeEventListener('mouseenter', () => preloadPage(href));
        }
      });
    };
  }, [router]);
};

// Enhanced Link component with preloading
export const PreloadLink = ({ href, children, className, ...props }) => {
  const router = useRouter();

  const handleMouseEnter = () => {
    if (href && href !== '/' && !href.startsWith('#')) {
      router.prefetch(href);
    }
  };

  return (
    <a
      href={href}
      className={className}
      onMouseEnter={handleMouseEnter}
      {...props}
    >
      {children}
    </a>
  );
};
