import React from 'react';
import GithubContributionsClient from './GithubContributionsClient';
import portfolioData from '@/config/portfolio.json';

const GithubContributions = ({ githubData }) => {
  const githubUsername = portfolioData.githubUsername || 'Msparihar';

  // Handle error state
  if (githubData?.error) {
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

  // Pass data to client component for theme-aware rendering
  return (
    <GithubContributionsClient
      githubData={githubData}
      githubUsername={githubUsername}
    />
  );
};


export default GithubContributions;
