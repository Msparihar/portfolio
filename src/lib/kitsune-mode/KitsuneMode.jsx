'use client';

import { useEffect, useRef } from 'react';
import { KitsuneEngine } from './engine';
import { drawKitsune } from './sprite';
import { usePrefsStore } from '@/store/prefsStore';

/**
 * Mounts a fullscreen canvas and runs the kitsune DOM-walker engine.
 * Rendered conditionally by Desktop.jsx via React.lazy + Suspense.
 */
export default function KitsuneMode({ config = {} }) {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resolvedConfig = {
      selector:        config.selector        ?? '[data-kitsune-platform], .window-panel',
      viewportPadding: config.viewportPadding ?? { top: 60 },
      minWidth:        config.minWidth        ?? 50,
      onQuit:          config.onQuit          ?? (() => usePrefsStore.setState({ kitsuneModeEnabled: false })),
    };

    const engine = new KitsuneEngine(canvas, resolvedConfig);
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
