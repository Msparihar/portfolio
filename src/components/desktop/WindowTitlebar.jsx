'use client';

import { useState, useEffect } from 'react';
import { WORLDS, WORLD_STORAGE_KEY } from '@/config/worlds';

function useWorldTitleFormat() {
  const [titleFormat, setTitleFormat] = useState(null);
  useEffect(() => {
    const getFormat = () => {
      const worldId = typeof window !== 'undefined' ? localStorage.getItem(WORLD_STORAGE_KEY) : null;
      if (!worldId) return null;
      const world = WORLDS.find(w => w.id === worldId);
      return world?.titleFormat || null;
    };
    setTitleFormat(() => getFormat());
    const handler = (e) => {
      const id = e.detail?.worldId;
      const world = id ? WORLDS.find(w => w.id === id) : null;
      setTitleFormat(() => world?.titleFormat || null);
    };
    window.addEventListener('worldchange', handler);
    return () => window.removeEventListener('worldchange', handler);
  }, []);
  return titleFormat;
}

export default function WindowTitlebar({ title, onClose, onMinimize, onMaximize, isMaximized }) {
  const [hovered, setHovered] = useState(false);
  const titleFormat = useWorldTitleFormat();
  const displayTitle = titleFormat ? titleFormat(title) : title;

  return (
    <div
      className="window-drag-handle"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '40px',
        zIndex: 5,
        display: 'flex',
        alignItems: 'center',
        padding: '0 14px',
        userSelect: 'none',
        borderRadius: 'var(--dt-window-radius, 12px) var(--dt-window-radius, 12px) 0 0',
      }}
    >
      {/* Traffic lights */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Red — close */}
        <button
          className="window-titlebar traffic-close"
          onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            border: '0.5px solid var(--dt-accent-border-dim, rgba(0,0,0,0.15))',
            boxShadow: hovered
              ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 6px var(--dt-traffic-close-glow, rgba(255,95,87,0.5))'
              : 'inset 0 1px 1px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'var(--dt-traffic-icon, rgba(0,0,0,0.6))',
            fontWeight: 700,
            lineHeight: 1,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          title="Close"
        >
          {hovered ? '×' : ''}
        </button>

        {/* Yellow — minimize */}
        <button
          className="window-titlebar traffic-minimize"
          onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            border: '0.5px solid var(--dt-accent-border-dim, rgba(0,0,0,0.15))',
            boxShadow: hovered
              ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 6px var(--dt-traffic-minimize-glow, rgba(254,188,46,0.5))'
              : 'inset 0 1px 1px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'var(--dt-traffic-icon, rgba(0,0,0,0.6))',
            fontWeight: 700,
            lineHeight: 1,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          title="Minimize"
        >
          {hovered ? '−' : ''}
        </button>

        {/* Green — maximize / restore */}
        <button
          className="window-titlebar traffic-maximize"
          onClick={(e) => { e.stopPropagation(); onMaximize?.(); }}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            border: '0.5px solid var(--dt-accent-border-dim, rgba(0,0,0,0.15))',
            boxShadow: hovered
              ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 6px var(--dt-traffic-maximize-glow, rgba(40,200,64,0.5))'
              : 'inset 0 1px 1px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'var(--dt-traffic-icon, rgba(0,0,0,0.6))',
            fontWeight: 700,
            lineHeight: 1,
            flexShrink: 0,
            transition: 'all 0.15s ease',
          }}
          title={isMaximized ? 'Restore' : 'Maximize'}
        >
          {hovered ? (isMaximized ? '⊡' : '+') : ''}
        </button>
      </div>

      {/* Title text */}
      <span
        data-world-heading=""
        style={{
          flex: 1,
          textAlign: 'center',
          fontFamily: 'var(--dt-font-heading, monospace)',
          fontSize: '12px',
          letterSpacing: '0.5px',
          color: 'var(--dt-text-muted)',
          pointerEvents: 'none',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
        }}
      >
        {displayTitle}
      </span>
    </div>
  );
}
