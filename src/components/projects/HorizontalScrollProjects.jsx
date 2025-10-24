"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import ProjectCard3D from "./ProjectCard3D";
import portfolioData from "@/config/portfolio.json";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const HorizontalScrollProjects = ({ onCardClick }) => {
  const containerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current || !scrollRef.current) return;

    const sections = scrollRef.current.querySelectorAll(".project-card");

    // Calculate total width
    const totalWidth = Array.from(sections).reduce(
      (acc, section) => acc + section.offsetWidth + 32, // 32 is gap
      0
    );

    const animation = gsap.to(sections, {
      x: () => -(totalWidth - window.innerWidth),
      ease: "none",
      scrollTrigger: {
        trigger: containerRef.current,
        pin: true,
        scrub: 1,
        end: () => `+=${totalWidth}`,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      animation.scrollTrigger?.kill();
      animation.kill();
    };
  }, []);

  const projects = portfolioData.projects.slice(0, 6); // Featured projects

  return (
    <div className="relative overflow-hidden py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="flex items-center gap-2 mb-6">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <h2 className="text-3xl font-bold text-foreground">Featured Projects</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <p className="text-center text-muted-foreground">
          Scroll horizontally to explore my work
        </p>
      </div>

      <div ref={containerRef} className="h-screen flex items-center overflow-hidden">
        <div ref={scrollRef} className="flex gap-8 px-8">
          {projects.map((project, index) => (
            <div
              key={index}
              className="project-card flex-shrink-0 w-[400px] md:w-[500px]"
            >
              <ProjectCard3D project={project} onCardClick={onCardClick} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default HorizontalScrollProjects;

