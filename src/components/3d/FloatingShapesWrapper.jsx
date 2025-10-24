"use client";

import dynamic from 'next/dynamic';

const FloatingShapes = dynamic(() => import('./FloatingShapes').then(mod => mod.FloatingShapes), {
  ssr: false,
  loading: () => null
});

export default FloatingShapes;

