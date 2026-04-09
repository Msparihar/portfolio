'use client';

import { useCallback } from 'react';

export default function DesktopIcon({ icon, label, appId, isSelected, onSelect, onOpen }) {
  const handleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onSelect(appId);
    },
    [appId, onSelect]
  );

  const handleDoubleClick = useCallback(
    (e) => {
      e.stopPropagation();
      onOpen(appId);
    },
    [appId, onOpen]
  );

  const handleKeyDown = useCallback(
    (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onOpen(appId);
      }
    },
    [appId, onOpen]
  );

  return (
    <div
      role="button"
      tabIndex={0}
      aria-label={label}
      className="flex flex-col items-center gap-1 cursor-pointer select-none outline-none rounded-lg"
      style={{ width: '88px' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Icon container */}
      <div
        className="flex items-center justify-center transition-transform duration-100"
        style={{
          width: '56px',
          height: '56px',
          fontSize: '36px',
          filter: isSelected
            ? 'drop-shadow(0 0 8px var(--dt-accent-glow))'
            : 'none',
          transform: 'scale(1)',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)';
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className="text-center w-full truncate leading-tight"
        style={{
          fontFamily: 'var(--dt-font-mono, monospace)',
          fontSize: '11px',
          color: 'var(--dt-text)',
          textShadow: 'var(--dt-icon-text-shadow, 0 1px 3px rgba(0,0,0,0.8))',
        }}
      >
        {label}
      </span>
    </div>
  );
}
