'use client';

import { APP_DEFAULTS, useWindowStore } from '@/store/windowStore';

export default function TaskbarIcon({ windowData, isFocused, onClick }) {
  const { id, appId, isMinimized } = windowData;
  const icon = APP_DEFAULTS[appId]?.icon ?? '🪟';

  return (
    <button
      onClick={onClick}
      title={APP_DEFAULTS[appId]?.title ?? appId}
      style={{
        position: 'relative',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '20px',
        background: isFocused ? 'var(--dt-accent-border)' : 'transparent',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        opacity: isMinimized ? 0.5 : 1,
        transition: 'all 0.15s ease',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = 'var(--dt-accent-border)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = isFocused ? 'var(--dt-accent-border)' : 'transparent';
      }}
    >
      <span>{icon}</span>

      {/* Active indicator dot */}
      {isFocused && (
        <span
          style={{
            position: 'absolute',
            bottom: '2px',
            left: '50%',
            transform: 'translateX(-50%)',
            width: '4px',
            height: '4px',
            borderRadius: '50%',
            background: 'var(--dt-accent)',
          }}
        />
      )}
    </button>
  );
}
