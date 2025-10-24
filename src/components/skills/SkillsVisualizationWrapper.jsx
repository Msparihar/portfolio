"use client";
import dynamic from 'next/dynamic';

const SkillsVisualization = dynamic(() => import("@/components/skills/SkillsVisualization"), {
  ssr: false,
  loading: () => <div className="py-8 text-center text-muted-foreground">Loading skills...</div>
});

export default SkillsVisualization;
