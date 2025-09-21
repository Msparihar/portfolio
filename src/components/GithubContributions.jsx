"use client";

import React from 'react';
import GitHubCalendar from 'react-github-calendar';
import { useTheme } from 'next-themes';
import portfolioData from '@/config/portfolio.json';
import { getCachedContributions, setCachedContributions, fetchGitHubContributions } from '@/lib/githubCache';

const GithubContributions = () => {
  const { theme } = useTheme();
  const [contributions, setContributions] = React.useState(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasError, setHasError] = React.useState(false);

  // Load contributions with caching
  React.useEffect(() => {
    const loadContributions = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        // First, try to get cached data
        const cachedData = getCachedContributions();
        if (cachedData) {
          setContributions(cachedData);
          setIsLoading(false);
          return;
        }

        // If no cache, fetch from API
        const data = await fetchGitHubContributions(githubUsername);
        setContributions(data);
        setCachedContributions(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading contributions:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadContributions();
  }, []);

  // Terminal-themed color schemes that match your portfolio
  const terminalTheme = {
    light: [
      '#ebedf0', // No contributions - light gray
      '#9be9a8', // Low contributions - light green
      '#40c463', // Medium-low contributions - medium green
      '#30a14e', // Medium-high contributions - dark green
      '#216e39'  // High contributions - darkest green
    ],
    dark: [
      '#161b22', // No contributions - dark gray (matches terminal black)
      '#0e4429', // Low contributions - dark green
      '#006d32', // Medium-low contributions - medium dark green
      '#26a641', // Medium-high contributions - bright green
      '#39d353'  // High contributions - brightest green (matches terminal green)
    ]
  };

  const githubUsername = portfolioData.githubUsername || 'Msparihar';

  return (
    <div className="github-contributions-container terminal-container p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-6 text-center terminal-title">
        <span className="terminal-prompt">$</span> My GitHub Contributions
      </h2>

      {isLoading ? (
        <div className="text-center">
          <div className="text-green-500 font-mono mb-4">
            <span className="terminal-prompt mr-2">$</span>
            Loading GitHub contributions...
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            <span className="terminal-prompt mr-2">&gt;</span>
            Fetching data from GitHub API...
          </div>
        </div>
      ) : hasError ? (
        <div className="text-center">
          <div className="text-red-500 font-mono mb-4">
            <span className="terminal-prompt mr-2">$</span>
            Error loading contributions
          </div>
          <div className="text-sm text-muted-foreground font-mono">
            <span className="terminal-prompt mr-2">&gt;</span>
            Please try again later or check your internet connection
          </div>
        </div>
      ) : (
        <>
          {/* GitHub Calendar */}
          <div className="flex justify-center">
            <GitHubCalendar
              username={githubUsername}
              blockSize={12}
              blockMargin={3}
              theme={terminalTheme}
              fontSize={12}
              colorScheme={theme}
              showTotalCount={false}
              showWeekdayLabels={true}
              hideMonthLabels={false}
              hideColorLegend={false}
              errorMessage="Failed to load contribution data"
              style={{
                fontFamily: 'IBM Plex Mono, Fira Code, monospace',
                color: theme === 'dark' ? '#9ca3af' : '#374151'
              }}
            />
          </div>

          {/* Legend */}
          <div className="mt-6 flex items-center justify-center space-x-4 text-xs font-mono">
            <span className="text-muted-foreground">Less</span>
            <div className="flex space-x-1">
              {(theme === 'dark' ? terminalTheme.dark : terminalTheme.light).map((color, index) => (
                <div
                  key={index}
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: color }}
                ></div>
              ))}
            </div>
            <span className="text-muted-foreground">More</span>
          </div>

          {/* Footer info */}
          <div className="mt-4 text-xs text-muted-foreground font-mono text-center">
            <span className="terminal-prompt mr-2">&gt;</span>
            Last updated: {new Date().toLocaleDateString()}
          </div>
        </>
      )}
    </div>
  );
};

export default GithubContributions;
