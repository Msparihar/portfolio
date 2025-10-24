import React from "react";
import Link from "next/link";
import { ArrowLeft, Code2, Sparkles } from "lucide-react";
import portfolioData from '@/config/portfolio.json';
import SkillSphere from '@/components/3d/SkillSphereWrapper';
import { ScrollReveal } from '@/components/effects/ScrollReveal';
import TechStackMarquee from '@/components/skills/TechStackMarquee';

// Metadata for SEO
export const metadata = {
  title: 'Skills & Expertise',
  description: `Explore ${portfolioData.name}'s technical skills and expertise in AI, Machine Learning, and Full Stack Development.`,
  openGraph: {
    title: `Skills & Expertise | ${portfolioData.name}`,
    description: `Explore ${portfolioData.name}'s technical skills and expertise in AI, Machine Learning, and Full Stack Development.`,
    url: 'https://manishsingh.tech/skills',
    type: 'website'
  }
};

const SkillsPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-background/80 relative overflow-hidden">
      {/* Grid background */}
      <div className="absolute inset-0 dark:bg-dot-white/[0.2] bg-dot-black/[0.2] -z-10" />

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-gradient-radial from-background via-background/80 to-transparent -z-10" />

      {/* Animated gradient orbs */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-green-500/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8 border-[0.5px] border-border/30 rounded-lg terminal-nav relative overflow-hidden backdrop-blur-sm">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="flex items-center text-sm text-green-500/90 hover:text-green-400 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  <span className="terminal-prompt">$</span>
                  <span className="ml-1">cd ..</span>
                </Link>
                <div className="text-2xl font-bold text-foreground">
                  <span className="terminal-prompt">$</span>
                  <span className="ml-2">cat skills.json</span>
                </div>
              </div>
            </div>
            <p className="text-muted-foreground">
              Interactive 3D visualization of my technical expertise. Click skills to filter, drag to rotate, scroll to zoom.
            </p>
          </div>
        </div>

        {/* 3D Skill Sphere */}
        <ScrollReveal className="mb-12">
          <div className="flex items-center gap-2 mb-6">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
            <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
              <Code2 className="w-6 h-6 text-green-500" />
              Interactive Skill Sphere
            </h2>
            <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          </div>

          <SkillSphere
            skills={portfolioData.skills}
            onSkillSelect={(skills, category) => {
              console.log('Selected skills:', skills, 'Category:', category);
            }}
          />
        </ScrollReveal>

        {/* Tech Stack Marquee */}
        <ScrollReveal>
          <TechStackMarquee />
        </ScrollReveal>

        {/* Skills Breakdown */}
        <ScrollReveal className="mt-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Languages */}
            <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
                <h3 className="text-lg font-bold text-foreground">Languages</h3>
              </div>
              <div className="space-y-2">
                {portfolioData.skills.languages.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="terminal-prompt text-green-500">›</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Frameworks */}
            <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                <h3 className="text-lg font-bold text-foreground">Frameworks</h3>
              </div>
              <div className="space-y-2">
                {portfolioData.skills.frameworks.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="terminal-prompt text-blue-500">›</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tools */}
            <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                <h3 className="text-lg font-bold text-foreground">Tools</h3>
              </div>
              <div className="space-y-2">
                {portfolioData.skills.tools.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="terminal-prompt text-purple-500">›</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI/ML */}
            <div className="p-6 rounded-xl border border-border/30 bg-background/50 backdrop-blur-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                <h3 className="text-lg font-bold text-foreground">AI/ML</h3>
              </div>
              <div className="space-y-2">
                {portfolioData.skills.aiml.map((skill, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span className="terminal-prompt text-orange-500">›</span>
                    <span>{skill}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </ScrollReveal>

        {/* Call to Action */}
        <ScrollReveal className="mt-12 p-8 rounded-xl border border-green-500/30 bg-gradient-to-r from-green-500/10 to-blue-500/10 backdrop-blur-sm text-center">
          <Sparkles className="w-12 h-12 text-green-500 mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-foreground mb-2">
            Interested in working together?
          </h3>
          <p className="text-muted-foreground mb-6">
            Let's build something amazing with these technologies
          </p>
          <Link
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold hover:shadow-lg hover:shadow-green-500/50 transition-all"
          >
            Get in Touch
          </Link>
        </ScrollReveal>
      </div>
    </div>
  );
};

export default SkillsPage;
