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
    <div className="github-contributions-container terminal-container p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center terminal-title">
        <span className="terminal-prompt">$</span> My GitHub Contributions
      </h2>

      {/* Custom GitHub Calendar Grid */}
      <div className="flex justify-center">
        <GithubCalendarGrid
          contributions={contributions}
          theme={theme}
          className="font-mono"
        />
      </div>

    </div>
  );
};

export default GithubContributionsClient;