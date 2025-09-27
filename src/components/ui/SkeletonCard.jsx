"use client";

import React from 'react';
import { useTheme } from 'next-themes';

const SkeletonCard = ({ type = 'project' }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${
      isDark ? 'bg-gray-900' : 'bg-white'
    } border ${isDark ? 'border-gray-800' : 'border-gray-200'} shadow-sm animate-pulse`}>
      {/* Image skeleton */}
      <div className="relative h-48 overflow-hidden">
        <div className={`w-full h-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full animate-shimmer" />
        </div>
        {/* Title overlay skeleton for blog cards */}
        {type === 'blog' && (
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <div className={`h-5 w-3/4 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded mb-2`} />
            <div className={`h-3 w-1/2 ${isDark ? 'bg-gray-700' : 'bg-gray-300'} rounded`} />
          </div>
        )}
      </div>

      {/* Content skeleton */}
      <div className="p-4">
        {/* Title for project cards */}
        {type === 'project' && (
          <div className={`h-6 w-3/4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded mb-3`} />
        )}

        {/* Description lines */}
        <div className="space-y-2 mb-4">
          <div className={`h-3 w-full ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded`} />
          <div className={`h-3 w-4/5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded`} />
          <div className={`h-3 w-3/5 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded`} />
        </div>

        {/* Tags skeleton */}
        <div className="flex flex-wrap gap-2 mb-4">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className={`h-6 w-16 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded-full`}
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          ))}
        </div>

        {/* Footer skeleton */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
          <div className="flex space-x-3">
            <div className={`h-4 w-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded`} />
            <div className={`h-4 w-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded`} />
          </div>
          {type === 'project' && (
            <div className="flex items-center space-x-3">
              <div className={`h-4 w-8 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded`} />
              <div className={`h-4 w-8 ${isDark ? 'bg-gray-800' : 'bg-gray-200'} rounded`} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const SkeletonGrid = ({ count = 6, type = 'project' }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[...Array(count)].map((_, index) => (
        <SkeletonCard key={index} type={type} />
      ))}
    </div>
  );
};

export { SkeletonCard, SkeletonGrid };