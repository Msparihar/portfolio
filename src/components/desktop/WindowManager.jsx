'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import { useWindowStore, APP_DEFAULTS } from '@/store/windowStore';
import Window from './Window';
import { getCurrentWorldId, getWorldAppTitle, createWorldChangeListener } from '@/config/worldContent';

// Terminal requires its own context provider — lazy load both together
const TerminalApp = dynamic(
  () =>
    import('@/components/TerminalContext').then((m) => {
      const { Terminal, TerminalProvider } = m;
      const Wrapped = () => (
        <TerminalProvider>
          <Terminal />
        </TerminalProvider>
      );
      Wrapped.displayName = 'TerminalApp';
      return { default: Wrapped };
    }),
  { ssr: false }
);

// Lazy load all app components
const FileManager = dynamic(() => import('@/components/apps/FileManager'), { ssr: false });
const LogViewer = dynamic(() => import('@/components/apps/LogViewer'), { ssr: false });
const Mail = dynamic(() => import('@/components/apps/Mail'), { ssr: false });
const About = dynamic(() => import('@/components/apps/About'), { ssr: false });
const Browser = dynamic(() => import('@/components/apps/Browser'), { ssr: false });
const Trash = dynamic(() => import('@/components/apps/Trash'), { ssr: false });
const Gallery = dynamic(() => import('@/components/apps/Gallery'), { ssr: false });

function getAppContent(appId) {
  switch (appId) {
    case 'terminal':
      return <TerminalApp />;
    case 'filemanager':
      return <FileManager />;
    case 'logviewer':
      return <LogViewer />;
    case 'mail':
      return <Mail />;
    case 'about':
      return <About />;
    case 'browser':
      return <Browser />;
    case 'trash':
      return <Trash />;
    case 'gallery':
      return <Gallery />;
    default:
      return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontFamily: 'var(--dt-font-mono)', color: 'var(--dt-text-muted)' }}>
          Unknown app: {appId}
        </div>
      );
  }
}

export default function WindowManager() {
  const windows = useWindowStore((s) => s.windows);
  const closeWindow = useWindowStore((s) => s.closeWindow);

  const [worldId, setWorldId] = useState(() => getCurrentWorldId());

  useEffect(() => {
    return createWorldChangeListener((id) => setWorldId(id));
  }, []);

  // Use ref so the keydown handler always sees latest windows without re-registering
  const windowsRef = useRef(windows);
  useEffect(() => { windowsRef.current = windows; }, [windows]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      const wins = windowsRef.current;
      if (e.key === 'Escape' && wins.length > 0) {
        const visibleWindows = wins.filter((w) => !w.isMinimized);
        if (visibleWindows.length === 0) return;
        const focused = visibleWindows.reduce((a, b) => (a.zIndex > b.zIndex ? a : b));
        closeWindow(focused.id);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [closeWindow]);

  return windows.map((win) => {
    const resolvedTitle = getWorldAppTitle(worldId, win.appId, win.title);
    const resolvedWindowData = resolvedTitle !== win.title
      ? { ...win, title: resolvedTitle }
      : win;
    return (
      <Window key={win.id} windowData={resolvedWindowData}>
        {getAppContent(win.appId)}
      </Window>
    );
  });
}
