'use client';

import { Rnd } from 'react-rnd';
import { useWindowStore } from '@/store/windowStore';
import WindowTitlebar from './WindowTitlebar';

const TASKBAR_HEIGHT = 48;

export default function Window({ windowData, children }) {
  const closeWindow = useWindowStore((s) => s.closeWindow);
  const minimizeWindow = useWindowStore((s) => s.minimizeWindow);
  const maximizeWindow = useWindowStore((s) => s.maximizeWindow);
  const focusWindow = useWindowStore((s) => s.focusWindow);
  const setPosition = useWindowStore((s) => s.setPosition);
  const setSize = useWindowStore((s) => s.setSize);
  const nextZIndex = useWindowStore((s) => s.nextZIndex);

  const { id, title, isMinimized, isMaximized, position, size, zIndex } = windowData;

  const isFocused = zIndex >= nextZIndex - 1;

  if (isMinimized) return null;

  const viewportWidth = typeof window !== 'undefined' ? window.innerWidth : 1280;
  const viewportHeight = typeof window !== 'undefined' ? window.innerHeight : 800;

  const maximizedStyle = {
    position: { x: 0, y: 0 },
    size: { width: viewportWidth, height: viewportHeight - TASKBAR_HEIGHT },
  };

  // Clamp position so titlebar is always reachable
  const clampedPosition = {
    x: Math.max(-((size?.width || 320) - 100), Math.min(position.x, viewportWidth - 100)),
    y: Math.max(0, Math.min(position.y, viewportHeight - TASKBAR_HEIGHT - 40)),
  };

  const rndPosition = isMaximized ? maximizedStyle.position : clampedPosition;
  const rndSize = isMaximized ? maximizedStyle.size : size;

  const windowStyle = {
    position: 'relative',
    background: 'var(--dt-surface)',
    border: 'var(--dt-window-border, 1px solid var(--dt-accent-border-strong))',
    borderRadius: 'var(--dt-window-radius, 12px)',
    boxShadow: isFocused
      ? 'var(--dt-shadow-focused)'
      : 'var(--dt-shadow-unfocused)',
    backdropFilter: 'var(--dt-window-blur)',
    WebkitBackdropFilter: 'var(--dt-window-blur)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    transition: 'box-shadow 0.2s ease',
  };

  return (
    <Rnd
      position={rndPosition}
      size={rndSize}
      style={{ zIndex, ...windowStyle }}
      dragHandleClassName="window-drag-handle"
      disableDragging={isMaximized}
      enableResizing={!isMaximized}
      bounds="parent"
      role="dialog"
      aria-label={title}
      onDragStop={(_e, d) => {
        const clampedX = Math.max(-((size?.width || 320) - 100), Math.min(d.x, viewportWidth - 100));
        const clampedY = Math.max(0, Math.min(d.y, viewportHeight - TASKBAR_HEIGHT - 40));
        setPosition(id, { x: clampedX, y: clampedY });
      }}
      onResizeStop={(_e, _dir, _ref, _delta, pos) => {
        setSize(id, {
          width: _ref.offsetWidth,
          height: _ref.offsetHeight,
        });
        setPosition(id, pos);
      }}
      onMouseDown={() => focusWindow(id)}
      minWidth={320}
      minHeight={200}
    >
      {/* Full-height inner wrapper — Rnd doesn't pass height to children */}
      <div className="window-panel" style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', overflow: 'hidden', borderRadius: 'var(--dt-window-radius, 12px)' }}>
        <WindowTitlebar
          title={title}
          isMaximized={isMaximized}
          onClose={() => closeWindow(id)}
          onMinimize={() => minimizeWindow(id)}
          onMaximize={() => maximizeWindow(id)}
        />

        {/* Content area */}
        <div
          className="dark"
          style={{
            flex: 1,
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            paddingTop: '40px',
            minHeight: 0,
            background: 'transparent',
            color: 'var(--dt-text)',
          }}
        >
          {children}
        </div>
      </div>
    </Rnd>
  );
}
