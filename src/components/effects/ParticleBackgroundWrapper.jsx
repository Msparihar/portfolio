"use client";
import dynamic from 'next/dynamic';

const ParticleBackground = dynamic(() => import("@/components/effects/ParticleBackground"), {
  ssr: false,
  loading: () => null
});

export default ParticleBackground;
