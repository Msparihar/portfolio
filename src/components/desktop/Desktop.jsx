'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWindowStore } from '@/store/windowStore';
import WindowManager from './WindowManager';
import MenuBar from './MenuBar';
import IconStrip from './IconStrip';
import ContextMenu from './ContextMenu';
import { WORLD_STORAGE_KEY, WORLDS, applyWorld, normalizeWallpaper } from '@/config/worlds';
import WorldSwitcherPopup from './WorldSwitcherPopup';
import ParticleCanvas from './ParticleCanvas';
import TintOverlay from './TintOverlay';
import Mascot from './Mascot';
import { useUiStore } from '@/store/uiStore';
import { useSeasonStore } from '@/store/seasonStore';
import { usePrefsStore } from '@/store/prefsStore';
import { TooltipProvider } from '@/components/ui/Tooltip';

const SWITCHER_DISMISSED_KEY = 'dt-world-switcher-dismissed';

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
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);
  const startCycle = useSeasonStore((s) => s.startCycle);
  const stopCycle = useSeasonStore((s) => s.stopCycle);
  const currentRegion = useSeasonStore((s) => s.currentRegion);
  const pinnedWallpaperId  = usePrefsStore((s) => s.pinnedWallpaperId);
  const animateWallpaper   = usePrefsStore((s) => s.animateWallpaper);
  const mascotVisible      = usePrefsStore((s) => s.mascotVisible);

  const [isMobile, setIsMobile] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [currentWorldId, setCurrentWorldId] = useState(null);
  const [showWorldSwitcher, setShowWorldSwitcher] = useState(false);
  const [eggToast, setEggToast] = useState(null);

  // Konami code listener — sets kitsuneModeEnabled. If the v0.8-kitsune branch
  // doesn't define the activation effect yet, the flag still flips and the toast
  // makes the unlock observable.
  useEffect(() => {
    const SEQUENCE = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
    let buffer = [];
    const handler = (e) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      buffer = [...buffer, key].slice(-SEQUENCE.length);
      if (buffer.length === SEQUENCE.length && SEQUENCE.every((k, i) => k === buffer[i])) {
        buffer = [];
        usePrefsStore.setState({ kitsuneModeEnabled: true });
        setEggToast('Kitsune Mode unlocked');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // 90s idle → fleeting toast. Resets on any input event.
  useEffect(() => {
    let timerId;
    const reset = () => {
      clearTimeout(timerId);
      timerId = setTimeout(() => setEggToast('The desktop dreams…'), 90 * 1000);
    };
    reset();
    const evs = ['mousemove', 'mousedown', 'keydown', 'wheel', 'touchstart'];
    evs.forEach((e) => window.addEventListener(e, reset, { passive: true }));
    return () => {
      clearTimeout(timerId);
      evs.forEach((e) => window.removeEventListener(e, reset));
    };
  }, []);

  // Auto-clear the toast after 3.2s.
  useEffect(() => {
    if (!eggToast) return;
    const id = setTimeout(() => setEggToast(null), 3200);
    return () => clearTimeout(id);
  }, [eggToast]);

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
    const worldToApply = savedWorld || 'elden-ring';
    applyWorld(canvas, worldToApply);
    setCurrentWorldId(worldToApply);

    // Persist the default so subsequent visits remember it
    if (!savedWorld) {
      localStorage.setItem(WORLD_STORAGE_KEY, worldToApply);
    }

    // Start seasonal cycle if the saved world is GoT
    if (worldToApply === 'got') {
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

  // World switcher popup — appears after 5 minutes
  useEffect(() => {
    if (localStorage.getItem(SWITCHER_DISMISSED_KEY) === 'true') return;

    let timerId = setTimeout(() => {
      setShowWorldSwitcher(true);
    }, 5 * 60 * 1000);

    // Reset timer when world changes
    const handleWorldChange = () => {
      setShowWorldSwitcher(false);
      clearTimeout(timerId);
      timerId = setTimeout(() => {
        setShowWorldSwitcher(true);
      }, 5 * 60 * 1000);
    };

    window.addEventListener('worldchange', handleWorldChange);
    return () => {
      clearTimeout(timerId);
      window.removeEventListener('worldchange', handleWorldChange);
    };
  }, []);

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

  const handleWorldSwitcherClose = useCallback(() => {
    setShowWorldSwitcher(false);
  }, []);

  const handleWorldSwitcherDontShow = useCallback(() => {
    setShowWorldSwitcher(false);
    localStorage.setItem(SWITCHER_DISMISSED_KEY, 'true');
  }, []);

  const handleDesktopClick = useCallback(() => {
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

  // Derive active wallpaper entry (may be string or object); normalizeWallpaper handles both.
  // For worlds with regions (GoT), use the active region's wallpaper; prefsStore pin overrides src.
  const rawWallpaperEntry = currentWorldConfig?.regions && currentRegion
    ? (currentWorldConfig.regions[currentRegion]?.wallpaper ?? currentWorldConfig.wallpaper)
    : currentWorldConfig?.wallpaper;

  const normalizedWallpaper = normalizeWallpaper(rawWallpaperEntry);

  // When a wallpaper is pinned by src path, keep that src but inherit particle config from the
  // matched region/world entry for the current world context.
  const activeWallpaperSrc = pinnedWallpaperId !== 'auto'
    ? pinnedWallpaperId
    : normalizedWallpaper.src;

  const activeParticleConfig = normalizedWallpaper.particles;

  // Resolve mascot: region override (GoT) wins; falls back to world-level mascot.
  const activeMascot = (currentWorldConfig?.regions && currentRegion
    ? (currentWorldConfig.regions[currentRegion]?.mascot ?? currentWorldConfig.mascot)
    : currentWorldConfig?.mascot) || null;

  return (
    <TooltipProvider>
    <div
      className="desktop-canvas dark"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--dt-bg)' }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Wallpaper Ken Burns layers — two divs crossfade via CSS phase offset */}
      {activeWallpaperSrc && (
        <>
          <div
            className={`wallpaper-layer wallpaper-layer-a${animateWallpaper ? '' : ' kb-paused'}`}
            style={{ backgroundImage: `url(${activeWallpaperSrc})`, zIndex: 0 }}
          />
          <div
            className={`wallpaper-layer wallpaper-layer-b${animateWallpaper ? '' : ' kb-paused'}`}
            style={{ backgroundImage: `url(${activeWallpaperSrc})`, zIndex: 0 }}
          />
        </>
      )}

      {/* Particle canvas overlay — single rAF loop, gated by animateWallpaper */}
      <ParticleCanvas config={activeParticleConfig} enabled={animateWallpaper} />

      {/* World tint overlay — subtle mood layer above wallpaper, below windows */}
      <TintOverlay />

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

      {/* Window Manager */}
      <WindowManager />

      {/* Top horizontal MenuBar (PostHog-style) */}
      <MenuBar />

      {/* Slim right-side icon strip */}
      <IconStrip />

      {/* Themed kitsune mascot — bottom-right, idle bob, decorative */}
      {activeMascot && mascotVisible && <Mascot src={activeMascot.src} alt={activeMascot.alt} />}

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* World Switcher Popup */}
      <WorldSwitcherPopup
        isOpen={showWorldSwitcher}
        onClose={handleWorldSwitcherClose}
        onDontShowAgain={handleWorldSwitcherDontShow}
      />

      {/* SettingsPanel removed 2026-05-20 */}

      {/* Easter-egg toasts (Konami unlock, 90s idle) */}
      {eggToast && (
        <div
          role="status"
          style={{
            position: 'fixed',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'var(--dt-context-bg)',
            border: '1px solid var(--dt-accent-border)',
            borderRadius: 'var(--dt-window-radius, 8px)',
            boxShadow: 'var(--dt-shadow-focused)',
            backdropFilter: 'var(--dt-window-blur)',
            WebkitBackdropFilter: 'var(--dt-window-blur)',
            padding: '8px 16px',
            fontFamily: 'var(--dt-font-mono)',
            fontSize: 12,
            color: 'var(--dt-text)',
            zIndex: 400,
          }}
        >
          {eggToast}
        </div>
      )}

    </div>
    </TooltipProvider>
  );
}
