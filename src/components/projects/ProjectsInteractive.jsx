"use client";

import React, { useState } from "react";
import { X, Search, Filter, Grid3x3, LayoutGrid, ArrowRightLeft } from "lucide-react";
import dynamic from "next/dynamic";
import ProjectGrid from "@/components/projects/ProjectGrid";
import portfolioConfig from "@/config/portfolio.json";
import { extractUniqueTags } from "@/lib/utils";

// Lazy load alternative layouts
const ProjectBentoGrid = dynamic(() => import("@/components/projects/ProjectBentoGrid"), { ssr: false });
const HorizontalScrollProjects = dynamic(() => import("@/components/projects/HorizontalScrollProjects"), { ssr: false });

const ProjectsInteractive = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [layoutMode, setLayoutMode] = useState("grid"); // 'grid', 'bento', 'horizontal'

  const filterOptions = [
    { id: "all", label: "All Projects" },
    ...extractUniqueTags(
      portfolioConfig.projects.map((project) => ({ tags: project.techStack || [] }))
    ).map((tech) => ({
      id: tech.toLowerCase(),
      label: tech,
    })),
  ];

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  // Filter projects based on search and active filter
  const filteredProjects = portfolioConfig.projects.filter((project) => {
    // Safely handle undefined/null values
    const title = project.title || project.name || '';
    const description = project.description || '';
    const techStack = project.techStack || [];

    const matchesSearch =
      title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      techStack.some(tech =>
        tech && tech.toLowerCase().includes(searchQuery.toLowerCase())
      );

    const matchesFilter =
      activeFilter === "all" ||
      techStack.some(tech =>
        tech && tech.toLowerCase() === activeFilter.toLowerCase()
      );

    return matchesSearch && matchesFilter;
  });

  return (
    <div>
      {/* Search, Filter, and Layout Controls */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <input
            type="text"
            placeholder="Search projects..."
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

        {/* Layout Mode Toggle */}
        <div className="flex gap-2 bg-background/50 border border-border/30 rounded-md p-1">
          <button
            onClick={() => setLayoutMode("grid")}
            className={`p-2 rounded transition-colors ${
              layoutMode === "grid"
                ? "bg-green-500/20 text-green-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Grid Layout"
          >
            <Grid3x3 className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode("bento")}
            className={`p-2 rounded transition-colors ${
              layoutMode === "bento"
                ? "bg-green-500/20 text-green-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Bento Layout"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
          <button
            onClick={() => setLayoutMode("horizontal")}
            className={`p-2 rounded transition-colors ${
              layoutMode === "horizontal"
                ? "bg-green-500/20 text-green-500"
                : "text-muted-foreground hover:text-foreground"
            }`}
            title="Horizontal Scroll"
          >
            <ArrowRightLeft className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Results Count */}
      <div className="text-sm text-muted-foreground mb-4">
        <span className="terminal-prompt">$</span>
        <span className="ml-2">
          Found {filteredProjects.length} project{filteredProjects.length !== 1 ? 's' : ''}
          {searchQuery && ` matching "${searchQuery}"`}
          {activeFilter !== "all" && ` in ${activeFilter}`}
        </span>
      </div>

      {/* Projects Display - Switch based on layout mode */}
      {layoutMode === "grid" && (
        <ProjectGrid
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      )}

      {layoutMode === "bento" && (
        <ProjectBentoGrid
          searchQuery={searchQuery}
          activeFilter={activeFilter}
        />
      )}

      {layoutMode === "horizontal" && (
        <div className="-mx-4 sm:-mx-6 lg:-mx-8">
          <HorizontalScrollProjects onCardClick={() => {}} />
        </div>
      )}
    </div>
  );
};

export default ProjectsInteractive;
