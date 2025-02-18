"use client";

import React from 'react';

const LoadingDots = () => {
  return (
    <div className="flex items-center space-x-2 mt-1">
      <div className="w-1.5 h-1.5 bg-green-500/80 rounded-full animate-[bounce_1s_infinite_0ms]" />
      <div className="w-1.5 h-1.5 bg-green-500/80 rounded-full animate-[bounce_1s_infinite_200ms]" />
      <div className="w-1.5 h-1.5 bg-green-500/80 rounded-full animate-[bounce_1s_infinite_400ms]" />
    </div>
  );
};

const LoadingDotsCommand = () => {
  return (
    <div className="flex items-center gap-2 text-muted-foreground">
      <span className="text-green-500/80">$</span>
      <span>loading</span>
      <LoadingDots />
    </div>
  );
};

export { LoadingDots, LoadingDotsCommand };
export default LoadingDots;
