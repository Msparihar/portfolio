"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, X, ChevronDown, Tag, Calendar, Clock } from 'lucide-react';

const AdvancedSearch = ({ 
  searchQuery, 
  onSearchChange, 
  filters, 
  onFilterChange, 
  suggestions = [],
  placeholder = "Search...",
  type = "projects" // "projects" or "blogs"
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchRef = useRef(null);
  const filterRef = useRef(null);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (filterRef.current && !filterRef.current.contains(event.target)) {
        setIsFilterOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter suggestions based on search query
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.toLowerCase().includes(searchQuery.toLowerCase())
  ).slice(0, 5);

  const handleSuggestionClick = (suggestion) => {
    onSearchChange(suggestion);
    setShowSuggestions(false);
  };

  const clearSearch = () => {
    onSearchChange('');
    setShowSuggestions(false);
  };

  const clearFilters = () => {
    onFilterChange({
      category: 'all',
      technology: 'all',
      year: 'all',
      ...(type === 'blogs' && { readTime: 'all' })
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== 'all');

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative" ref={searchRef}>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            type="text"
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => {
              onSearchChange(e.target.value);
              setShowSuggestions(true);
            }}
            onFocus={() => setShowSuggestions(true)}
            className="w-full pl-10 pr-10 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Search Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 mt-1 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10">
            {filteredSuggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="w-full px-4 py-2 text-left text-gray-300 hover:bg-gray-800 hover:text-white transition-colors first:rounded-t-lg last:rounded-b-lg"
              >
                <Search className="inline w-3 h-3 mr-2 text-gray-500" />
                {suggestion}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        {/* Filter Dropdown */}
        <div className="relative" ref={filterRef}>
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className={`inline-flex items-center px-4 py-2 bg-gray-900/50 border rounded-lg text-sm transition-colors ${
              hasActiveFilters 
                ? 'border-green-500 text-green-400' 
                : 'border-gray-700 text-gray-300 hover:border-gray-600'
            }`}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <span className="ml-2 px-1.5 py-0.5 bg-green-500 text-white text-xs rounded-full">
                {Object.values(filters).filter(v => v !== 'all').length}
              </span>
            )}
            <ChevronDown className={`w-4 h-4 ml-2 transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
          </button>

          {isFilterOpen && (
            <div className="absolute top-full left-0 mt-1 w-64 bg-gray-900 border border-gray-700 rounded-lg shadow-lg z-10 p-4">
              <div className="space-y-4">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Tag className="inline w-3 h-3 mr-1" />
                    Category
                  </label>
                  <select
                    value={filters.category}
                    onChange={(e) => onFilterChange({ ...filters, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="all">All Categories</option>
                    {type === 'projects' && (
                      <>
                        <option value="web">Web Development</option>
                        <option value="ai">AI/ML</option>
                        <option value="mobile">Mobile</option>
                        <option value="desktop">Desktop</option>
                      </>
                    )}
                    {type === 'blogs' && (
                      <>
                        <option value="tutorial">Tutorial</option>
                        <option value="guide">Guide</option>
                        <option value="review">Review</option>
                        <option value="news">News</option>
                      </>
                    )}
                  </select>
                </div>

                {/* Technology Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Technology
                  </label>
                  <select
                    value={filters.technology}
                    onChange={(e) => onFilterChange({ ...filters, technology: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="all">All Technologies</option>
                    <option value="react">React</option>
                    <option value="nextjs">Next.js</option>
                    <option value="python">Python</option>
                    <option value="fastapi">FastAPI</option>
                    <option value="ai">AI/ML</option>
                    <option value="typescript">TypeScript</option>
                  </select>
                </div>

                {/* Year Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    <Calendar className="inline w-3 h-3 mr-1" />
                    Year
                  </label>
                  <select
                    value={filters.year}
                    onChange={(e) => onFilterChange({ ...filters, year: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <option value="all">All Years</option>
                    <option value="2024">2024</option>
                    <option value="2023">2023</option>
                    <option value="2022">2022</option>
                    <option value="2021">2021</option>
                  </select>
                </div>

                {/* Read Time Filter (for blogs) */}
                {type === 'blogs' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      <Clock className="inline w-3 h-3 mr-1" />
                      Read Time
                    </label>
                    <select
                      value={filters.readTime}
                      onChange={(e) => onFilterChange({ ...filters, readTime: e.target.value })}
                      className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500/50"
                    >
                      <option value="all">Any Length</option>
                      <option value="short">Short (< 5 min)</option>
                      <option value="medium">Medium (5-10 min)</option>
                      <option value="long">Long (> 10 min)</option>
                    </select>
                  </div>
                )}

                {/* Clear Filters */}
                {hasActiveFilters && (
                  <button
                    onClick={clearFilters}
                    className="w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-sm rounded transition-colors"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Tags */}
        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2">
            {Object.entries(filters).map(([key, value]) => {
              if (value === 'all') return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center px-2 py-1 bg-green-500/20 text-green-400 text-xs rounded-full border border-green-500/30"
                >
                  {key}: {value}
                  <button
                    onClick={() => onFilterChange({ ...filters, [key]: 'all' })}
                    className="ml-1 hover:text-green-300"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdvancedSearch;