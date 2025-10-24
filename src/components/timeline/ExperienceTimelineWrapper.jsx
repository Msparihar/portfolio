"use client";
import dynamic from 'next/dynamic';

const ExperienceTimeline = dynamic(() => import("@/components/timeline/ExperienceTimeline"), {
  ssr: false,
  loading: () => <div className="py-8 text-center text-muted-foreground">Loading timeline...</div>
});

export default ExperienceTimeline;
