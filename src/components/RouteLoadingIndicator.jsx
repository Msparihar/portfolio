"use client";

import { useEffect, useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';

const RouteLoadingIndicator = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [loadingText, setLoadingText] = useState('');

  useEffect(() => {
    // When route changes complete, hide the loader
    setIsLoading(false);
  }, [pathname, searchParams]);

  useEffect(() => {
    // Intercept link clicks to show loading state
    const handleClick = (e) => {
      const link = e.target.closest('a');
      if (!link) return;

      const href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || href.startsWith('mailto:')) return;

      // Don't show loader for same page
      if (href === pathname) return;

      // Extract page name for loading text
      const pageName = href.split('/').filter(Boolean).pop() || 'home';
      setLoadingText(`Loading ${pageName}...`);
      setIsLoading(true);
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [pathname]);

  if (!isLoading) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/95 backdrop-blur-sm">
      <div className="terminal-container bg-card border border-border rounded-lg p-6 shadow-2xl max-w-md w-full mx-4">
        {/* Terminal header */}
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-border">
          <div className="w-3 h-3 rounded-full bg-red-500/80" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
          <div className="w-3 h-3 rounded-full bg-green-500/80" />
          <span className="ml-2 text-xs text-muted-foreground font-mono">terminal</span>
        </div>

        {/* Loading content */}
        <div className="font-mono space-y-2">
          <div className="flex items-center text-green-500">
            <span className="mr-2">$</span>
            <span className="text-foreground">{loadingText}</span>
          </div>

          {/* Animated loading bar */}
          <div className="flex items-center gap-1 ml-4 text-green-500/80">
            <span className="inline-block animate-[terminal-blink_0.5s_step-end_infinite]">█</span>
            <span className="inline-block animate-[terminal-blink_0.5s_step-end_infinite_150ms]">█</span>
            <span className="inline-block animate-[terminal-blink_0.5s_step-end_infinite_300ms]">█</span>
            <span className="inline-block animate-[terminal-blink_0.5s_step-end_infinite_450ms]">█</span>
            <span className="text-muted-foreground text-sm ml-2">please wait</span>
          </div>

          {/* Blinking cursor */}
          <div className="flex items-center text-green-500 mt-3">
            <span className="mr-2">$</span>
            <span className="inline-block w-2 h-4 bg-green-500 animate-[cursor-blink_1s_step-end_infinite]" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default RouteLoadingIndicator;
