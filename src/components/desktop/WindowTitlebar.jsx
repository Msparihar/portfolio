'use client';

import { useState } from 'react';

export default function WindowTitlebar({ title, onClose, onMinimize, onMaximize, isMaximized }) {
  const [hovered, setHovered] = useState(false);

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
        borderRadius: '12px 12px 0 0',
      }}
    >
      {/* Traffic lights */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* Red — close */}
        <button
          onClick={(e) => { e.stopPropagation(); onClose?.(); }}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ff8a80, #ff5f57 60%, #e5453c)',
            border: '0.5px solid rgba(0,0,0,0.15)',
            boxShadow: hovered
              ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 6px rgba(255,95,87,0.5)'
              : 'inset 0 1px 1px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'rgba(0,0,0,0.6)',
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
          onClick={(e) => { e.stopPropagation(); onMinimize?.(); }}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #ffd76e, #febc2e 60%, #e5a820)',
            border: '0.5px solid rgba(0,0,0,0.15)',
            boxShadow: hovered
              ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 6px rgba(254,188,46,0.5)'
              : 'inset 0 1px 1px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'rgba(0,0,0,0.6)',
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
          onClick={(e) => { e.stopPropagation(); onMaximize?.(); }}
          style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            background: 'radial-gradient(circle at 35% 35%, #5aed73, #28c840 60%, #1eb535)',
            border: '0.5px solid rgba(0,0,0,0.15)',
            boxShadow: hovered
              ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 0 6px rgba(40,200,64,0.5)'
              : 'inset 0 1px 1px rgba(255,255,255,0.2)',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '8px',
            color: 'rgba(0,0,0,0.6)',
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
    </div>
  );
}
