'use client';

import { useState, useEffect } from 'react';
import { useWindowStore } from '@/store/windowStore';
import TaskbarIcon from './TaskbarIcon';
import ThemePicker from './ThemePicker';
import { useUiStore } from '@/store/uiStore';

function useClock() {
  const [time, setTime] = useState('');

  useEffect(() => {
    const format = () => {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12 || 12;
      return `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
    };

    setTime(format());
    const id = setInterval(() => setTime(format()), 1000);
    return () => clearInterval(id);
  }, []);

  return time;
}

export default function Taskbar() {
  const windows = useWindowStore((s) => s.windows);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const restoreWindow = useWindowStore((s) => s.restoreWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const clock = useClock();
  const toggleWebsiteMode = useUiStore((s) => s.toggleWebsiteMode);

  const nextZIndex = useWindowStore((s) => s.nextZIndex);
  const focusedId = windows.find((w) => w.zIndex >= nextZIndex - 1 && !w.isMinimized)?.id ?? null;

  const handleIconClick = (win) => {
    if (win.isMinimized) {
      restoreWindow(win.id);
    } else if (win.id === focusedId) {
      minimizeWindow(win.id);
    } else {
      focusWindow(win.id);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '48px',
        zIndex: 100,
        background: 'var(--dt-taskbar-bg)',
        backdropFilter: 'var(--dt-window-blur)',
        WebkitBackdropFilter: 'var(--dt-window-blur)',
        borderTop: '1px solid var(--dt-accent-border)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
      }}
    >
      {/* Left — branding */}
      <span
        style={{
          fontFamily: 'monospace',
          fontSize: '14px',
          color: 'var(--dt-accent-70)',
          userSelect: 'none',
          whiteSpace: 'nowrap',
          textShadow: '0 0 8px var(--dt-accent-30)',
        }}
      >
        {'>_ manish@portfolio'}
      </span>

      {/* Center — open window icons */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          gap: '4px',
        }}
      >
        {windows.map((win) => (
          <TaskbarIcon
            key={win.id}
            windowData={win}
            isFocused={win.id === focusedId && !win.isMinimized}
            onClick={() => handleIconClick(win)}
          />
        ))}
      </div>

      {/* Right — system tray */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'monospace',
          fontSize: '12px',
          color: 'var(--dt-text-muted)',
          whiteSpace: 'nowrap',
          userSelect: 'none',
        }}
      >
        <button
          onClick={toggleWebsiteMode}
          title="Switch to Website Mode"
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--dt-text-muted)',
            cursor: 'pointer',
            fontSize: '13px',
            fontFamily: 'monospace',
            padding: '2px 4px',
            transition: 'color 0.15s ease',
          }}
          onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dt-accent)'}
          onMouseLeave={(e) => e.currentTarget.style.color = 'var(--dt-text-muted)'}
        >
          ⊞
        </button>
        <ThemePicker />
        <span style={{ color: 'var(--dt-accent-70)', fontSize: '11px', letterSpacing: '1px' }} title="WiFi connected">
          ●●● wifi
        </span>
        <span style={{ color: 'var(--dt-accent-dim)', fontSize: '11px' }} title="Battery 87%">
          [▮▮▮▮▯] 87%
        </span>
        <span style={{ color: 'var(--dt-accent-dim)', fontSize: '13px' }}>{clock}</span>
      </div>
    </div>
  );
}
