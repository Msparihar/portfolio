'use client';

import { useWindowStore } from '@/store/windowStore';
import GlassDock from '@/components/welcome/GlassDock';
import { GHIBLI_WELCOME } from '@/config/welcomeContent';

const MASCOT_CLEARANCE = 140;

export default function GhibliDock({ worldId }) {
  const openWindow = useWindowStore((s) => s.openWindow);

  if (worldId !== 'ghibli') return null;

  const handleTileClick = (tile) => {
    if (!tile.appId) return;
    if (tile.appId === 'resume') {
      window.open('/resume.pdf', '_blank', 'noopener,noreferrer');
      return;
    }
    openWindow(tile.appId);
  };

  return (
    <div
      data-kitsune-dock
      style={{
        position: 'fixed',
        bottom: 20,
        left: 0,
        right: 0,
        display: 'flex',
        justifyContent: 'center',
        pointerEvents: 'none',
        zIndex: 200,
      }}
    >
      <div style={{ pointerEvents: 'auto', maxWidth: `calc(100% - ${MASCOT_CLEARANCE}px)` }}>
        <GlassDock
          tiles={GHIBLI_WELCOME.dockTiles}
          onTileClick={handleTileClick}
        />
      </div>
    </div>
  );
}
