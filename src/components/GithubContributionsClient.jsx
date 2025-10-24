"use client";

import React from 'react';
import { useTheme } from 'next-themes';
import GithubCalendarGrid from './GithubCalendarGrid';

const GithubContributionsClient = ({ githubData, githubUsername }) => {
  const { theme } = useTheme();

  // Extract cache status for display
  const cacheStatus = {
    cached: githubData.cached,
    stale: githubData.stale,
    timestamp: githubData.cachedAt || githubData.fetchedAt
  };

  // Extract contributions data from the GitHub API response
  const contributions = githubData?.data?.contributions || [];

  return (
    <div className="github-contributions-container terminal-container p-3 sm:p-6 rounded-lg shadow-lg min-h-[400px] sm:min-h-[480px]">
      <h2 className="text-lg sm:text-2xl font-bold mb-4 sm:mb-6 text-center terminal-title">
        <span className="terminal-prompt">$</span> My GitHub Contributions
      </h2>

      {/* Custom GitHub Calendar Grid - Responsive height for mobile */}
      <div className="flex justify-center w-full" style={{ minHeight: '280px' }}>
        <GithubCalendarGrid
          contributions={contributions}
          theme={theme}
          className="font-mono w-full"
        />
      </div>

    </div>
  );
};

export default GithubContributionsClient;