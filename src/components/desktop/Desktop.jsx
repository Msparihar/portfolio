'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWindowStore } from '@/store/windowStore';
import DesktopIconGrid from './DesktopIconGrid';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import ContextMenu from './ContextMenu';
import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, applyTheme } from '@/config/themes';
import { WORLD_STORAGE_KEY, WORLDS, applyWorld } from '@/config/worlds';
import Sidebar from './Sidebar';
import { useSidebarStore } from '@/store/sidebarStore';
import { useUiStore } from '@/store/uiStore';
import { useSeasonStore } from '@/store/seasonStore';

function MobileFallback() {
  return (
    <div
      className="fixed inset-0 flex flex-col items-center justify-center gap-6 font-mono"
      style={{ background: 'var(--dt-bg)', color: 'var(--dt-text)' }}
    >
      <p className="text-lg text-center px-6" style={{ color: 'var(--dt-accent-70)' }}>
        Desktop experience requires a larger screen.
      </p>
      <nav className="flex flex-col items-center gap-3 text-sm">
        <a href="/projects" className="underline hover:text-white transition-colors">/projects</a>
        <a href="/blog" className="underline hover:text-white transition-colors">/blog</a>
        <a href="/contact" className="underline hover:text-white transition-colors">/contact</a>
      </nav>
    </div>
  );
}

export default function Desktop({ githubData, initialApp }) {
  const openWindow = useWindowStore((s) => s.openWindow);
  const sidebarOpen = useSidebarStore((s) => s.sidebarOpen);
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);
  const startCycle = useSeasonStore((s) => s.startCycle);
  const stopCycle = useSeasonStore((s) => s.stopCycle);
  const currentRegion = useSeasonStore((s) => s.currentRegion);

  const [isMobile, setIsMobile] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [currentWorldId, setCurrentWorldId] = useState(null);

  // Mobile detection on mount + resize
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Open initialApp on mount, or terminal by default
  useEffect(() => {
    if (initialApp) {
      openWindow(initialApp);
    } else {
      openWindow('terminal');
    }
  }, [initialApp, openWindow]);

  // Apply saved theme/world on mount and keep currentWorldId in sync
  useEffect(() => {
    const canvas = document.querySelector('.desktop-canvas');
    if (!canvas) return;

    // Migrate old world id
    const savedRaw = localStorage.getItem(WORLD_STORAGE_KEY);
    if (savedRaw === '"dark-fantasy"' || savedRaw === 'dark-fantasy') {
      localStorage.setItem(WORLD_STORAGE_KEY, savedRaw.replace('dark-fantasy', 'elden-ring'));
    }

    const savedWorld = localStorage.getItem(WORLD_STORAGE_KEY);
    if (savedWorld) {
      applyWorld(canvas, savedWorld);
      setCurrentWorldId(savedWorld);
    } else {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
      applyTheme(canvas, saved);
      setCurrentWorldId(null);
    }

    // Start seasonal cycle if the saved world is GoT
    if (savedWorld === 'got') {
      const gotWorld = WORLDS.find((w) => w.id === 'got');
      if (gotWorld) startCycle(gotWorld);
    }

    // Listen for world changes dispatched by WorldPicker
    const handleWorldChange = (e) => {
      const newWorldId = e.detail?.worldId ?? null;
      setCurrentWorldId(newWorldId);
      if (newWorldId === 'got') {
        const gotWorld = WORLDS.find((w) => w.id === 'got');
        if (gotWorld) startCycle(gotWorld);
      } else {
        stopCycle();
      }
    };
    window.addEventListener('worldchange', handleWorldChange);
    return () => {
      window.removeEventListener('worldchange', handleWorldChange);
      stopCycle();
    };
  }, [startCycle, stopCycle]);

  // When the seasonal region changes (GoT world), re-apply world vars + update wallpaper
  useEffect(() => {
    if (!currentRegion || currentWorldId !== 'got') return;
    const canvas = document.querySelector('.desktop-canvas');
    if (!canvas) return;
    applyWorld(canvas, 'got', currentRegion);
  }, [currentRegion, currentWorldId]);

  // Ctrl+Shift+W toggles Website Mode (skip if typing in input)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'W') {
        const tag = e.target.tagName;
        if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
        e.preventDefault();
        toggleWebsiteMode();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleWebsiteMode]);

  const handleOpenApp = useCallback(
    (appId) => {
      if (appId === 'resume') {
        window.open('/resume.pdf', '_blank');
        return;
      }
      openWindow(appId);
    },
    [openWindow]
  );

  const handleDesktopClick = useCallback(() => {
    setSelectedIcon(null);
    setContextMenu(null);
  }, []);

  const handleContextMenu = useCallback((e) => {
    // Only show if the click target is the desktop background itself
    if (
      e.target === e.currentTarget ||
      e.target.classList.contains('desktop-canvas') ||
      e.target.classList.contains('desktop-bg-layer')
    ) {
      e.preventDefault();
      setContextMenu({ x: e.clientX, y: e.clientY });
    }
  }, []);

  if (isMobile) {
    return <MobileFallback />;
  }

  const currentWorldConfig = currentWorldId ? WORLDS.find((w) => w.id === currentWorldId) : null;
  // For worlds with regions (GoT), use the active region's wallpaper
  const activeWallpaper = currentWorldConfig?.regions && currentRegion
    ? (currentWorldConfig.regions[currentRegion]?.wallpaper ?? currentWorldConfig.wallpaper)
    : currentWorldConfig?.wallpaper;

  return (
    <div
      className="desktop-canvas dark"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--dt-bg)' }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Wallpaper image layer — rendered below gradient tint */}
      {activeWallpaper && (
        <img
          src={activeWallpaper}
          alt=""
          className="absolute inset-0 w-full h-full object-cover pointer-events-none"
          style={{ zIndex: 0 }}
        />
      )}

      {/* Gradient wallpaper layer — tints the image (or standalone gradient) */}
      <div
        className="desktop-bg-layer desktop-wallpaper-layer absolute inset-0"
        style={{
          backgroundImage: 'var(--dt-wallpaper-gradient)',
          backgroundSize: 'var(--dt-wallpaper-gradient-size)',
          zIndex: 1,
        }}
      />

      {/* Fog vignette overlay — atmospheric edges per world */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'var(--dt-overlay-vignette, none)',
          zIndex: 2,
        }}
      />

      {/* Grain texture overlay — subtle noise per world */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          opacity: 'var(--dt-overlay-grain, 0)',
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E")`,
          backgroundSize: '200px 200px',
          zIndex: 3,
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            `repeating-linear-gradient(0deg, var(--dt-scanline-color), var(--dt-scanline-color) 1px, transparent 1px, transparent 3px)`,
          zIndex: 4,
        }}
      />

      {/* Desktop watermark — world-specific large faded text */}
      {currentWorldConfig?.desktopWatermark && (
        <div
          className="absolute pointer-events-none select-none"
          style={{
            bottom: '80px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'var(--dt-font-heading)',
            fontSize: '120px',
            fontWeight: 700,
            letterSpacing: '20px',
            color: 'var(--dt-accent-03)',
            zIndex: 5,
            whiteSpace: 'nowrap',
          }}
        >
          {currentWorldConfig.desktopWatermark}
        </div>
      )}

      {/* Desktop icons */}
      <div className="absolute inset-0 p-4" style={{ zIndex: 10, paddingBottom: '60px', paddingRight: sidebarOpen ? '216px' : '56px' }}>
        <DesktopIconGrid
          onOpenApp={handleOpenApp}
          selectedIcon={selectedIcon}
          onSelectIcon={setSelectedIcon}
        />
      </div>

      {/* Window Manager */}
      <WindowManager />

      {/* Taskbar */}
      <Taskbar />

      {/* Right sidebar */}
      <Sidebar />

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}


    </div>
  );
}
