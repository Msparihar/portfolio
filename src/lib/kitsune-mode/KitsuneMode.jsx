'use client';

import { useEffect, useRef } from 'react';
import { KitsuneEngine } from './engine';
import { drawKitsune } from './sprite';

/**
 * KitsuneMode — mounts a fullscreen canvas and runs the kitsune DOM-walker engine.
 *
 * Rendered conditionally by Desktop.jsx via React.lazy + Suspense.
 * The canvas sits above page content (z-index 50) but below modals (z-index 100+).
 * pointer-events: none so it never intercepts clicks.
 */
export default function KitsuneMode() {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const engine = new KitsuneEngine(canvas, {
      // data-kitsune-platform is added to MenuBar, IconStrip, and Window titlebar.
      // .window-panel is also scanned as a secondary surface for window tops.
      platformSelector: '[data-kitsune-platform], .window-panel',
      viewportPadding:  { top: 60 },
      minWidth:         50,
    });

    // Inject the sprite draw function
    engine.setDrawSprite(drawKitsune);
    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'fixed',
        inset:         0,
        pointerEvents: 'none',
        zIndex:        50,  // above content (10-40), below modals/settings (100+)
      }}
      aria-hidden="true"
    />
  );
}
