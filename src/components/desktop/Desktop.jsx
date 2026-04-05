'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useWindowStore } from '@/store/windowStore';
import DesktopIconGrid from './DesktopIconGrid';
import WindowManager from './WindowManager';
import Taskbar from './Taskbar';
import ContextMenu from './ContextMenu';
import { THEME_STORAGE_KEY, DEFAULT_THEME_ID, applyTheme } from '@/config/themes';

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

  const [isMobile, setIsMobile] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(null);
  const [contextMenu, setContextMenu] = useState(null);
  const [trashToast, setTrashToast] = useState(false);
  const trashTimerRef = useRef(null);

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
    const saved = localStorage.getItem(THEME_STORAGE_KEY) ?? DEFAULT_THEME_ID;
    const canvas = document.querySelector('.desktop-canvas');
    if (canvas) applyTheme(canvas, saved);
  }, []);

  const showTrashToast = useCallback(() => {
    setTrashToast(true);
    clearTimeout(trashTimerRef.current);
    trashTimerRef.current = setTimeout(() => setTrashToast(false), 2500);
  }, []);

  const handleOpenApp = useCallback(
    (appId) => {
      if (appId === 'resume') {
        window.open('/resume.pdf', '_blank');
        return;
      }
      if (appId === 'trash') {
        showTrashToast();
        return;
      }
      openWindow(appId);
    },
    [openWindow, showTrashToast]
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
        className="desktop-bg-layer absolute inset-0"
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
      <div className="absolute inset-0 p-4" style={{ zIndex: 10, paddingBottom: '60px' }}>
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

      {/* Context menu */}
      {contextMenu && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          onClose={() => setContextMenu(null)}
        />
      )}

      {/* Trash toast */}
      {trashToast && (
        <div
          className="fixed bottom-16 left-1/2 -translate-x-1/2 font-mono text-xs px-4 py-2 rounded-md pointer-events-none"
          style={{
            background: 'var(--dt-context-bg)',
            border: '1px solid var(--dt-accent-border)',
            color: 'var(--dt-text)',
            zIndex: 9999,
          }}
        >
          Trash is empty 🗑️
        </div>
      )}
    </div>
  );
}
