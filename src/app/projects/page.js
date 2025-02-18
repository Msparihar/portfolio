"use client";

import React from "react";
import { useRouter } from "next/navigation";
import ProjectGrid from "@/components/projects/ProjectGrid";

const ProjectsPage = () => {
  const router = useRouter();

  return (
    <main className="min-h-screen p-4 md:p-8 bg-gradient-to-b from-background to-background/80">
      <div className="max-w-7xl mx-auto">
        {/* Header with back button */}
        <div className="mb-8 flex items-center justify-between">
          <button
            onClick={() => router.push("/")}
            className="text-green-500/80 hover:text-green-500 transition-colors flex items-center gap-2"
          >
            <span className="text-sm">$</span>
            <span className="text-muted-foreground">cd ..</span>
          </button>
        </div>

        {/* Grid background with fade */}
        <div className="relative rounded-lg overflow-hidden">
          {/* Grid background */}
          <div className="absolute inset-0 bg-grid-small-white/[0.1] bg-black/95" />

          {/* Radial gradient for fading effect */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/5 to-transparent" />

          {/* Scanline effect */}
          <div
            className="absolute inset-0 bg-scanline pointer-events-none"
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

          {/* Content */}
          <div className="relative z-10 p-6">
            <h1 className="text-4xl font-bold mb-8 text-green-500/80">
              <span className="text-sm mr-2">$</span>
              ls /projects
            </h1>

            {/* Projects grid */}
            <ProjectGrid />
          </div>
        </div>
      </div>
    </main>
  );
};

export default ProjectsPage;
