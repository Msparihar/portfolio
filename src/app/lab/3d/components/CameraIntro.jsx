'use client';

import { useEffect, useRef, useState } from 'react';
import { useThree, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// Cinematic intro: camera flies in from low far-away angle, sweeps around,
// settles into the default position. Skips on any user interaction.
const DURATION = 6.5; // seconds

// Catmull-Rom path of (position, lookAt) pairs the camera passes through
const PATH = [
  { pos: [22, 1.5, 0], target: [0, 0.5, 0] },
  { pos: [16, 4, 14], target: [0, 1.0, 0] },
  { pos: [4, 9, 12], target: [0, 0.6, 0] },
  { pos: [-6, 6, 11], target: [0, 0.4, 0] },
  { pos: [-2, 5, 13], target: [0, 0.5, 0] },
  { pos: [8, 4.5, 8], target: [0, 0.5, 0] }, // end at default
];

function smoothstep(t) {
  return t * t * (3 - 2 * t);
}

function lerp3(a, b, t) {
  return [
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  ];
}

export function CameraIntro() {
  const { camera, controls, gl } = useThree();
  const startRef = useRef(null);
  const [active, setActive] = useState(true);

  // Disable autoRotate during intro, restore after
  useEffect(() => {
    if (!controls) return;
    if (active) {
      controls.autoRotate = false;
      controls.enabled = false;
    } else {
      controls.autoRotate = true;
      controls.enabled = true;
    }
  }, [active, controls]);

  // Skip on any pointer interaction with the canvas
  useEffect(() => {
    if (!gl?.domElement) return;
    const skip = () => setActive(false);
    gl.domElement.addEventListener('pointerdown', skip, { once: true });
    gl.domElement.addEventListener('wheel', skip, { once: true });
    window.addEventListener('keydown', skip, { once: true });
    return () => {
      gl.domElement.removeEventListener('pointerdown', skip);
      gl.domElement.removeEventListener('wheel', skip);
      window.removeEventListener('keydown', skip);
    };
  }, [gl]);

  useFrame((state) => {
    if (!active) return;
    if (startRef.current === null) startRef.current = state.clock.elapsedTime;
    const elapsed = state.clock.elapsedTime - startRef.current;
    const tRaw = Math.min(elapsed / DURATION, 1);
    const t = smoothstep(tRaw);

    // Map t (0..1) onto path segments
    const segCount = PATH.length - 1;
    const segT = t * segCount;
    const segIdx = Math.min(Math.floor(segT), segCount - 1);
    const localT = segT - segIdx;

    const a = PATH[segIdx];
    const b = PATH[segIdx + 1];
    const pos = lerp3(a.pos, b.pos, localT);
    const tgt = lerp3(a.target, b.target, localT);

    camera.position.set(pos[0], pos[1], pos[2]);
    camera.lookAt(tgt[0], tgt[1], tgt[2]);

    if (tRaw >= 1) {
      setActive(false);
      if (controls?.target) controls.target.set(tgt[0], tgt[1], tgt[2]);
    }
  });

  return null;
}
