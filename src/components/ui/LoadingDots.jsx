"use client";

import React from 'react';

const LoadingDots = ({ size = 'default', color = 'green' }) => {
  const dotSizeClasses = {
    small: 'w-1 h-1',
    default: 'w-1.5 h-1.5',
    large: 'w-2 h-2'
  };

  const colorClasses = {
    green: 'bg-green-500/80',
    white: 'bg-white/80',
    amber: 'bg-amber-500/80',
    blue: 'bg-blue-500/80'
  };

  return (
    <div className="flex items-center space-x-2 mt-1">
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-[bounce_1s_infinite_0ms]`} />
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-[bounce_1s_infinite_200ms]`} />
      <div className={`${dotSizeClasses[size]} ${colorClasses[color]} rounded-full animate-[bounce_1s_infinite_400ms]`} />
    </div>
  );
};

const LoadingDotsCommand = ({ text = "loading" }) => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground terminal-line">
      <span className="text-green-500/80">$</span>
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

  const colorClasses = {
    green: 'text-green-500',
    white: 'text-white',
    amber: 'text-amber-500'
  };

  return (
    <div className={`font-mono flex items-center ${colorClasses[color]}`}>
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
