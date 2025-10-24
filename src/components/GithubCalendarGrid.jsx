import React, { useMemo, useEffect, useRef } from 'react';

const GithubCalendarGrid = ({ contributions, theme = 'dark', className = '' }) => {
  const scrollContainerRef = useRef(null);

  // Scroll to the right (most recent contributions) on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
    }
  }, [contributions]);
  // Terminal-themed color schemes that match your portfolio
  const colorSchemes = {
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

  const colors = colorSchemes[theme] || colorSchemes.dark;

  // Group contributions by week
  const groupByWeeks = (contributions) => {
    // Get today's date and 365 days ago
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(today.getDate() - 365);

    // Filter contributions to only include the last 365 days (excluding future dates)
    const filteredContributions = contributions.filter(contrib => {
      const contribDate = new Date(contrib.date);
      return contribDate >= oneYearAgo && contribDate <= today;
    });

    // Sort by date to ensure chronological order
    filteredContributions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Create a complete date range for the last 365 days
    const dateRange = [];
    for (let d = new Date(oneYearAgo); d <= today; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split('T')[0];
      const existingContrib = filteredContributions.find(c => c.date === dateStr);
      dateRange.push(existingContrib || { date: dateStr, count: 0, level: 0 });
    }

    // Group by weeks, starting each week on Sunday
    const weeks = [];
    let currentWeek = [];

    dateRange.forEach((contrib, index) => {
      const date = new Date(contrib.date);
      const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday

      // Start a new week on Sunday
      if (dayOfWeek === 0 && currentWeek.length > 0) {
        weeks.push([...currentWeek]);
        currentWeek = [];
      }

      currentWeek.push(contrib);

      // If it's the last item, push the remaining week
      if (index === dateRange.length - 1) {
        weeks.push(currentWeek);
      }
    });

    return weeks;
  };

  // Memoize date calculations to avoid recomputing on every render
  const { today, oneYearAgo } = useMemo(() => {
    const today = new Date();
    const oneYearAgo = new Date();
    oneYearAgo.setDate(today.getDate() - 365);
    return { today, oneYearAgo };
  }, []); // Only compute once since it's based on current date

  // Memoize total contributions calculation
  const totalContributions = useMemo(() => {
    return contributions
      .filter(contrib => {
        const contribDate = new Date(contrib.date);
        return contribDate >= oneYearAgo && contribDate <= today;
      })
      .reduce((sum, contrib) => sum + contrib.count, 0);
  }, [contributions, oneYearAgo, today]);

  // Memoize weeks grouping - only recompute when contributions change
  const weeks = useMemo(() => groupByWeeks(contributions), [contributions]);

  // Month labels (simplified - show every 3 months)
  const getMonthLabels = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                   'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return months.filter((_, index) => index % 3 === 0);
  };

  const monthLabels = getMonthLabels();

  return (
    <div className={`github-calendar ${className}`}>
      {/* Calendar Grid - Scrollable on mobile */}
      <div ref={scrollContainerRef} className="flex flex-col items-start sm:items-center overflow-x-auto pb-2">
        {/* Month labels */}
        <div className="flex mb-2 text-[10px] sm:text-sm text-muted-foreground font-mono min-w-max">
          {monthLabels.map((month, index) => (
            <div key={month} className="w-8 sm:w-12 text-center" style={{ marginLeft: index > 0 ? '24px' : '0' }}>
              {month}
            </div>
          ))}
        </div>

        {/* Day labels and calendar grid */}
        <div className="flex min-w-max">
          {/* Day labels */}
          <div className="flex flex-col text-[9px] sm:text-xs text-muted-foreground font-mono mr-1 sm:mr-2">
            <div className="h-2 sm:h-3"></div> {/* Spacer for month labels */}
            <div className="h-2 sm:h-3">Mon</div>
            <div className="h-2 sm:h-3"></div>
            <div className="h-2 sm:h-3">Wed</div>
            <div className="h-2 sm:h-3"></div>
            <div className="h-2 sm:h-3">Fri</div>
            <div className="h-2 sm:h-3"></div>
          </div>

          {/* Calendar grid */}
          <div className="flex gap-[2px] sm:gap-1">
            {weeks.map((week, weekIndex) => (
              <div key={weekIndex} className="flex flex-col gap-[2px] sm:gap-1">
                {/* Create 7 slots, but only fill with actual dates */}
                {[0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
                  const contrib = week.find(c => new Date(c.date).getDay() === dayOfWeek);

                  if (!contrib) {
                    // Empty slot for days that don't exist in this week
                    return (
                      <div
                        key={`${weekIndex}-${dayOfWeek}`}
                        className="w-2 h-2 sm:w-3 sm:h-3"
                      />
                    );
                  }

                  const level = contrib.level || 0;
                  const count = contrib.count || 0;
                  const date = contrib.date;

                  return (
                    <div
                      key={`${weekIndex}-${dayOfWeek}`}
                      className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm border border-border/20"
                      style={{
                        backgroundColor: colors[level] || colors[0]
                      }}
                      title={`${count} contributions on ${date}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 sm:mt-4 flex items-center justify-center space-x-2 sm:space-x-4 text-[10px] sm:text-xs font-mono">
          <span className="text-muted-foreground">Less</span>
          <div className="flex space-x-0.5 sm:space-x-1">
            {colors.map((color, index) => (
              <div
                key={index}
                className="w-2 h-2 sm:w-3 sm:h-3 rounded-sm border border-border/20"
                style={{ backgroundColor: color }}
                title={`Level ${index}`}
              />
            ))}
          </div>
          <span className="text-muted-foreground">More</span>
        </div>
      </div>

      {/* Statistics - Outside scrollable container to stay centered */}
      <div className="mt-3 sm:mt-4 text-center text-xs sm:text-sm text-muted-foreground font-mono px-2">
        <span className="terminal-prompt mr-2">&gt;</span>
        <span className="break-words">
          <span className="text-green-500 font-bold">{totalContributions}</span>
          <span> contributions in the last year</span>
        </span>
      </div>
    </div>
  );
};

export default GithubCalendarGrid;