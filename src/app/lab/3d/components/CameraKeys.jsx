'use client';

import { useEffect } from 'react';
import { useThree } from '@react-three/fiber';

const VIEWS = {
  t: { pos: [0, 18, 0.01], label: 'top' },
  f: { pos: [0, 4.5, 11], label: 'front' },
  s: { pos: [11, 4.5, 0], label: 'side' },
  b: { pos: [0, -10, 8], label: 'below' },
  r: { pos: [8, 4.5, 8], label: 'reset' },
};

export function CameraKeys() {
  const { camera, controls } = useThree();

  useEffect(() => {
    const handler = (e) => {
      // ignore if typing in an input
      if (e.target && (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA')) return;
      const key = e.key.toLowerCase();
      const view = VIEWS[key];
      if (view) {
        camera.position.set(view.pos[0], view.pos[1], view.pos[2]);
        if (controls && controls.target) {
          controls.target.set(0, 0.5, 0);
          controls.update();
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [camera, controls]);

  return null;
}
