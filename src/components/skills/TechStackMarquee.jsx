"use client";

import { InfiniteMovingCards } from '@/components/aceternity/InfiniteMovingCards';
import portfolioData from '@/config/portfolio.json';

const TechStackMarquee = () => {
  // Extract unique technologies from projects and skills
  const technologies = [
    ...new Set([
      ...portfolioData.skills.languages,
      ...portfolioData.skills.frameworks,
      ...portfolioData.skills.tools,
      ...portfolioData.skills.aiml
    ])
  ];

  // Create items for infinite moving cards
  const techItems = technologies.slice(0, 15).map((tech) => ({
    name: tech,
    quote: tech,
    title: "Technology"
  }));

  return (
    <div className="py-12">
      <div className="flex items-center gap-2 mb-6">
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        <h2 className="text-2xl font-bold text-foreground">Technology Stack</h2>
        <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
      </div>

      <InfiniteMovingCards
        items={techItems}
        direction="left"
        speed="slow"
        pauseOnHover={true}
      />
    </div>
  );
};

export default TechStackMarquee;

