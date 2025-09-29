import React from 'react';
import GithubContributionsClient from './GithubContributionsClient';
import portfolioData from '@/config/portfolio.json';

const GithubContributions = ({ githubData }) => {
  const githubUsername = portfolioData.githubUsername || 'Msparihar';

  // Handle error state (only if no fallback data)
  if (githubData?.error && !githubData?.fallback) {
    return (
      <div className="github-contributions-container terminal-container p-6 rounded-lg shadow-lg">
        <h2 className="text-2xl font-bold mb-6 text-center terminal-title">
          <span className="terminal-prompt">$</span> My GitHub Contributions
        </h2>
        <div className="text-center">
          <div className="text-red-500 font-mono mb-4">
            <span className="terminal-prompt mr-2">$</span>
            Error loading contributions
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            <span className="terminal-prompt mr-2">&gt;</span>
            {githubData.message || 'Please try again later or check your internet connection'}
          </div>
        </div>
      </div>
    );
  }

  // Show indicator if using fallback or stale data
  const showDataStatus = githubData?.fallback || githubData?.stale;
  const statusMessage = githubData?.fallback
    ? 'Showing cached snapshot'
    : githubData?.stale
    ? 'Showing recent data'
    : null;

  // Pass data to client component for theme-aware rendering
  return (
    <div>
      {showDataStatus && (
        <div className="mb-2 text-xs text-muted-foreground font-mono text-center opacity-70">
          <span className="terminal-prompt mr-2">ℹ</span>
          {statusMessage}
        </div>
      )}
      <GithubContributionsClient
        githubData={githubData}
        githubUsername={githubUsername}
      />
    </div>
  );
};


export default GithubContributions;
