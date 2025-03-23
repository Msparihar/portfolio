"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import ProjectGrid from "@/components/projects/ProjectGrid";
import { useTheme } from "next-themes";
import { X, Search, Filter, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/theme-toggle";
import portfolioConfig from "@/config/portfolio.json";
import { extractUniqueTags } from "@/lib/utils";

const ProjectsPage = () => {
  const router = useRouter();
  const { theme } = useTheme();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");

  const filterOptions = [
    { id: "all", label: "All Projects" },
    ...extractUniqueTags(
      portfolioConfig.projects.map((project) => ({ tags: project.techStack }))
    ).map((tech) => ({
      id: tech.toLowerCase(),
      label: tech,
    })),
  ];

  // Handle search clear
  const handleClearSearch = () => {
    setSearchQuery("");
  };

  const isDark = theme === "dark";

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Grid background for the entire page */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      <div className="max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        {/* Header with back button and theme toggle */}
        <div className="mb-6 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-green-500 hover:text-green-600 transition-colors flex items-center gap-2 bg-green-500/10 px-3 py-1.5 rounded-lg"
            aria-label="Go back to home"
          >
            <ArrowLeft size={16} />
            <span className="text-sm font-medium">Back to Terminal</span>
          </button>

          <div className="flex items-center space-x-4">
            <span
              className={`${
                isDark ? "text-gray-300" : "text-gray-600"
              } text-sm font-medium`}
            >
              <span className="terminal-prompt text-green-500 mr-1">$</span>
              ls -la /projects
            </span>
            <ThemeToggle />
          </div>
        </div>

        {/* Page Title */}
        <div className={`mb-8 ${isDark ? "text-white" : "text-gray-900"}`}>
          <h1 className="text-3xl font-bold mb-2 flex items-center gap-2">
            <span className="text-green-500">Projects</span>
            <span className="text-xs bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-normal">
              Portfolio
            </span>
          </h1>
          <p
            className={`${
              isDark ? "text-gray-400" : "text-gray-600"
            } max-w-2xl`}
          >
            A collection of projects I&apos;ve built using various technologies.
            Each project showcases different skills and challenges I&apos;ve
            overcome.
          </p>
        </div>

        {/* Search and Filter Section */}
        <div
          className={`mb-8 ${
            isDark
              ? "bg-gray-900/50 border border-gray-800"
              : "bg-white border border-gray-200"
          } p-4 rounded-xl shadow-sm backdrop-blur-sm`}
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search Bar */}
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search
                  size={18}
                  className={`${isDark ? "text-gray-500" : "text-gray-400"}`}
                />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                className={`block w-full pl-10 pr-10 py-2 rounded-lg text-sm focus:ring-2 focus:ring-green-500 focus:outline-none
                ${
                  isDark
                    ? "bg-gray-800/50 border-gray-700 text-gray-300 placeholder-gray-500"
                    : "bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400"
                }`}
              />
              {searchQuery && (
                <button
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <div
                className={`${
                  isDark ? "text-gray-400" : "text-gray-500"
                } flex items-center mr-1`}
              >
                <Filter size={16} className="mr-1" />
                <span className="text-xs font-medium">Filter:</span>
              </div>
              {filterOptions.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors
                    ${
                      activeFilter === filter.id
                        ? "bg-green-500 text-white"
                        : isDark
                        ? "bg-gray-800 text-gray-300 hover:bg-gray-700"
                        : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                    }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area with Grid Background */}
        <div
          className={`relative rounded-xl overflow-hidden ${
            isDark ? "bg-gray-900/30" : "bg-white/70"
          } backdrop-blur-sm border ${
            isDark ? "border-gray-800" : "border-gray-200"
          }`}
        >
          {isDark && (
            <>
              {/* Grid background (dark mode only) */}
              <div className="absolute inset-0 bg-grid-small-white/[0.05]" />

              {/* Radial gradient for fading effect */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />

              {/* Scanline effect */}
              <div
                className="absolute inset-0 bg-scanline pointer-events-none opacity-5"
                style={{
                  backgroundImage: `repeating-linear-gradient(
                    0deg,
                    rgba(0, 150, 0, 0.03),
                    rgba(0, 150, 0, 0.03) 1px,
                    transparent 1px,
                    transparent 2px
                  )`,
                  backgroundSize: "100% 4px",
                  animation: "scanline 10s linear infinite",
                }}
              />
            </>
          )}

          {/* Content */}
          <div className="relative z-10 p-6">
            {/* Projects grid */}
            <ProjectGrid
              searchQuery={searchQuery}
              activeFilter={activeFilter}
            />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProjectsPage;
