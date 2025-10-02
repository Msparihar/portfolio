"use client";

import React, { useState } from "react";
import BlogGrid from "@/components/blog/BlogGrid";
import BlogModal from "@/components/blog/BlogModal";
import { X, Search, Filter } from "lucide-react";
import portfolioConfig from "@/config/portfolio.json";
import { extractUniqueTags } from "@/lib/utils";

const BlogInteractive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedBlog, setSelectedBlog] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const filterOptions = [
    { id: "all", label: "All Posts" },
    ...extractUniqueTags(portfolioConfig.blogs.map(blog => ({ tags: blog.tags || [] }))).map(tag => ({
      id: tag.toLowerCase(),
      label: tag
    }))
  ];

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Handle blog card click
  const handleBlogClick = (blog) => {
    setSelectedBlog(blog);
    setIsModalOpen(true);
  };

  // Handle modal close
  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedBlog(null);
  };

  // Filter blogs based on search and active filter
  const filteredBlogs = portfolioConfig.blogs.filter((blog) => {
    // Safely handle undefined/null values
    const title = blog.title || '';
    const excerpt = blog.excerpt || '';
    const tags = blog.tags || [];

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tags.some(tag =>
        tag && tag.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      activeFilter === "all" ||
      tags.some(tag =>
        tag && tag.toLowerCase() === activeFilter.toLowerCase()
      );

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Search and Filter Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search blog posts..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-background/50 border border-border/30 rounded-md text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Filter Dropdown */}
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <select
            value={activeFilter}
            onChange={(e) => setActiveFilter(e.target.value)}
            className="pl-10 pr-8 py-2 bg-background/50 border border-border/30 rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-green-500/50 focus:border-green-500/50 transition-colors appearance-none cursor-pointer"
          >
            {filterOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground mb-4">
        <span className="terminal-prompt">$</span>
        <span className="ml-2">
          Found {filteredBlogs.length} post{filteredBlogs.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
          {activeFilter !== "all" && ` in ${activeFilter}`}
        </span>
      </div>

      {/* Blog Grid */}
      <BlogGrid
        searchQuery={searchQuery}
        activeFilter={activeFilter}
        onCardClick={handleBlogClick}
      />

      {/* Blog Modal */}
      <BlogModal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        blog={selectedBlog}
      />
    </div>
  );
};

export default BlogInteractive;
