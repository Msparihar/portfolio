"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Smart aggressive preloading strategy - prefetch after idle for instant navigation
export const usePreloadPages = () => {
  const router = useRouter();

  useEffect(() => {
    const preloadPage = (href) => {
      // Preload the page bundle
      router.prefetch(href);
    };

    // Main routes to prefetch (most commonly navigated pages)
    const mainRoutes = ['/projects', '/blog', '/contact'];

    // Prefetch main routes when browser is idle (won't block initial render)
    const prefetchMainRoutes = () => {
      mainRoutes.forEach(route => {
        preloadPage(route);
      });
    };

    // Use requestIdleCallback to defer prefetching until browser is idle
    // This ensures initial page load is not impacted
    const idleHandle = typeof requestIdleCallback !== 'undefined'
      ? requestIdleCallback(prefetchMainRoutes, { timeout: 3000 })
      : setTimeout(prefetchMainRoutes, 2000);

    // Add hover and focus listeners as backup for early interactions
    // (before idle prefetch completes)
    const links = document.querySelectorAll('a[href^="/"]');

    const handleInteraction = (event) => {
      const href = event.currentTarget.getAttribute('href');
      if (href && href !== '/' && !href.startsWith('#')) {
        preloadPage(href);
      }
    };

    links.forEach(link => {
      const href = link.getAttribute('href');
      if (href && href !== '/' && !href.startsWith('#')) {
        link.addEventListener('mouseenter', handleInteraction, { once: true });
        link.addEventListener('focus', handleInteraction, { once: true });
      }
    });

    return () => {
      // Cleanup idle callback
      if (typeof requestIdleCallback !== 'undefined') {
        cancelIdleCallback(idleHandle);
      } else {
        clearTimeout(idleHandle);
      }

      // Cleanup event listeners
      links.forEach(link => {
        link.removeEventListener('mouseenter', handleInteraction);
        link.removeEventListener('focus', handleInteraction);
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
