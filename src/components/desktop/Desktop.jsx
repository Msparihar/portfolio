'use client';

import { useEffect, useState, useCallback } from 'react';
import { useWindowStore } from '@/store/windowStore';
import DesktopIconGrid from './DesktopIconGrid';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import ContextMenu from './ContextMenu';
import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, applyTheme } from '@/config/themes';
import { WORLD_STORAGE_KEY, applyWorld } from '@/config/worlds';
import Sidebar from './Sidebar';
import { useSidebarStore } from '@/store/sidebarStore';
import { useUiStore } from '@/store/uiStore';

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

  const [isMobile, setIsMobile] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);

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

  // Apply saved theme on mount
  useEffect(() => {
    const canvas = document.querySelector('.desktop-canvas');
    if (!canvas) return;

    const savedWorld = localStorage.getItem(WORLD_STORAGE_KEY);
    if (savedWorld) {
      applyWorld(canvas, savedWorld);
    } else {
      const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
      applyTheme(canvas, saved);
    }
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

  return (
    <div
      className="desktop-canvas dark"
      style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: 'var(--dt-bg)' }}
      onClick={handleDesktopClick}
      onContextMenu={handleContextMenu}
    >
      {/* Gradient wallpaper layer */}
      <div
        className="desktop-bg-layer desktop-wallpaper-layer absolute inset-0"
        style={{
          backgroundImage: 'var(--dt-wallpaper-gradient)',
          backgroundSize: 'var(--dt-wallpaper-gradient-size)',
          zIndex: 0,
        }}
      />

      {/* Scanline overlay */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage:
            `repeating-linear-gradient(0deg, var(--dt-scanline-color), var(--dt-scanline-color) 1px, transparent 1px, transparent 3px)`,
          zIndex: 1,
        }}
      />

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
