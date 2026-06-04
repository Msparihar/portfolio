'use client';

import { useWindowStore } from '@/store/windowStore';
import GlassDock from '@/components/welcome/GlassDock';
import { GHIBLI_WELCOME } from '@/config/welcomeContent';

const ICON_STRIP_WIDTH = 64;
const MASCOT_CLEARANCE = 140;

export default function GhibliDock({ worldId }) {
  const openWindow = useWindowStore((s) => s.openWindow);

  if (worldId !== 'ghibli') return null;

  const handleTileClick = (tile) => {
    if (tile.appId) openWindow(tile.appId);
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 16,
        left: 0,
        right: ICON_STRIP_WIDTH,
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
