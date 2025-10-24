import React from 'react';
import GithubContributionsClient from './GithubContributionsClient';
import portfolioData from '@/config/portfolio.json';

const GithubContributions = ({ githubData }) => {
  const githubUsername = portfolioData.githubUsername || 'Msparihar';

  // Handle error state (only if no fallback data) - Fixed height to prevent layout shift
  if (githubData?.error && !githubData?.fallback) {
    return (
      <div className="github-contributions-container terminal-container p-6 rounded-lg shadow-lg min-h-[480px]">
        <h2 className="text-2xl font-bold mb-6 text-center terminal-title" style={{ height: '32px' }}>
          <span className="terminal-prompt">$</span> My GitHub Contributions
        </h2>
        <div className="text-center" style={{ minHeight: '320px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
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

  // Pass data to client component for theme-aware rendering
  return (
    <GithubContributionsClient
      githubData={githubData}
      githubUsername={githubUsername}
    />
  );
};


export default GithubContributions;
