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
      style={{ width: '80px' }}
      onClick={handleClick}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
    >
      {/* Icon container */}
      <div
        className="flex items-center justify-center transition-colors duration-100"
        style={{
          width: '48px',
          height: '48px',
          fontSize: '24px',
          borderRadius: 'var(--dt-radius-sm, 8px)',
          backgroundColor: isSelected
            ? 'var(--dt-accent-soft-2)'
            : 'var(--dt-accent-soft)',
          border: isSelected
            ? '1px solid var(--dt-accent-glow)'
            : '1px solid var(--dt-accent-border-dim)',
          boxShadow: isSelected
            ? '0 0 12px var(--dt-accent-border), inset 0 0 8px var(--dt-accent-border-dim)'
            : 'none',
        }}
        onMouseEnter={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'var(--dt-accent-soft)';
            e.currentTarget.style.opacity = '1';
          } else {
            e.currentTarget.style.opacity = '0.9';
          }
        }}
        onMouseLeave={(e) => {
          if (!isSelected) {
            e.currentTarget.style.backgroundColor = 'transparent';
          }
          e.currentTarget.style.opacity = '1';
        }}
      >
        {icon}
      </div>

      {/* Label */}
      <span
        className="text-center w-full truncate leading-tight"
        style={{
          fontFamily: 'var(--dt-font-mono, monospace)',
          fontSize: '9px',
          color: 'var(--dt-text)',
          textShadow: '0 1px 3px rgba(0,0,0,0.8)',
        }}
      >
        {label}
      </span>
    </div>
  );
}
