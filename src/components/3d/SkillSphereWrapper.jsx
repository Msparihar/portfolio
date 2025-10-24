"use client";

import dynamic from 'next/dynamic';

const SkillSphere = dynamic(() => import('./SkillSphere').then(mod => mod.SkillSphere), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] md:h-[700px] rounded-xl bg-black/20 border border-border/30 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading 3D Skill Sphere...</p>
      </div>
    </div>
  )
});

export default SkillSphere;


