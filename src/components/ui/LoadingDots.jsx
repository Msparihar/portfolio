"use client";

import React from 'react';

const LoadingDots = ({ size = 'default', color = 'green' }) => {
  const dotSizeClasses = {
    small: 'w-1 h-1',
    default: 'w-1.5 h-1.5',
    large: 'w-2 h-2'
  };

  const colorStyles = {
    green: { background: 'color-mix(in srgb, var(--dt-accent) 80%, transparent)' },
    white: { background: 'rgba(255,255,255,0.8)' },
    amber: { background: 'rgba(245,158,11,0.8)' },
    blue: { background: 'rgba(59,130,246,0.8)' }
  };

  const dotStyle = colorStyles[color] || colorStyles.green;

  return (
    <div className="flex items-center space-x-2 mt-1">
      <div className={`${dotSizeClasses[size]} rounded-full animate-[bounce_1s_infinite_0ms]`} style={dotStyle} />
      <div className={`${dotSizeClasses[size]} rounded-full animate-[bounce_1s_infinite_200ms]`} style={dotStyle} />
      <div className={`${dotSizeClasses[size]} rounded-full animate-[bounce_1s_infinite_400ms]`} style={dotStyle} />
    </div>
  );
};

const LoadingDotsCommand = ({ text = "loading" }) => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground terminal-line">
      <span style={{ color: 'color-mix(in srgb, var(--dt-accent) 80%, transparent)' }}>$</span>
      <div className="flex items-center">
        <span>{text}</span>
        <LoadingDots />
      </div>
    </div>
  );
};

// Terminal style blocks/pixels loading animation
const TerminalLoader = ({ size = 'default', color = 'green' }) => {
  const sizeClasses = {
    small: 'w-[80px] h-5',
    default: 'w-[120px] h-6',
    large: 'w-[160px] h-8'
  };

  const terminalColorStyles = {
    green: { color: 'var(--dt-accent)' },
    white: { color: 'white' },
    amber: { color: '#f59e0b' }
  };

  const terminalStyle = terminalColorStyles[color] || terminalColorStyles.green;

  return (
    <div className="font-mono flex items-center" style={terminalStyle}>
      <div className={`flex items-center space-x-1 ${sizeClasses[size]}`}>
        <span className="inline-block w-2 h-2 animate-[terminal-blink_0.5s_step-end_infinite]">█</span>
        <span className="inline-block w-2 h-2 animate-[terminal-blink_0.5s_step-end_infinite_150ms]">█</span>
        <span className="inline-block w-2 h-2 animate-[terminal-blink_0.5s_step-end_infinite_300ms]">█</span>
        <span className="inline-block w-2 h-2 animate-[terminal-blink_0.5s_step-end_infinite_450ms]">█</span>
      </div>
    </div>
  );
};

export { LoadingDots, LoadingDotsCommand, TerminalLoader };
export default LoadingDots;
