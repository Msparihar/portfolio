'use client';

import { createContext, useContext, useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';

// Global wind state — direction + strength. Updated via useFrame.
// Consumers subscribe via useWind() which returns a ref they can read in their own useFrame.
const WindContext = createContext(null);

export function WindProvider({ children }) {
  // wind.current = { dirX, dirZ, strength, time }
  const wind = useRef({ dirX: 1, dirZ: 0.4, strength: 0, time: 0 });

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    // Strength varies slowly with sin + occasional gusts
    const base = 0.4 + Math.sin(t * 0.18) * 0.25;
    const gust = Math.pow(Math.max(0, Math.sin(t * 0.07) - 0.6), 2) * 2.5;
    wind.current.strength = base + gust;
    // Direction rotates very slowly
    const dirAngle = Math.sin(t * 0.05) * 0.6;
    wind.current.dirX = Math.cos(dirAngle);
    wind.current.dirZ = Math.sin(dirAngle) * 0.5 + 0.4;
    wind.current.time = t;
  });

  return <WindContext.Provider value={wind}>{children}</WindContext.Provider>;
}

export function useWind() {
  return useContext(WindContext);
}
