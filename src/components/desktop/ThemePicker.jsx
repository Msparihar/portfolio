'use client';

import { useState, useEffect, useRef } from 'react';
import { THEMES, THEME_STORAGE_KEY, DEFAULT_THEME_ID, applyTheme } from '@/config/themes';

export default function ThemePicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTheme, setActiveTheme] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem(THEME_STORAGE_KEY) : null) ?? DEFAULT_THEME_ID
  );
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target) &&
          buttonRef.current && !buttonRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    const handleEsc = (e) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('mousedown', handleClick);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [isOpen]);

  const handleSelect = (themeId) => {
    setActiveTheme(themeId);
    localStorage.setItem(THEME_STORAGE_KEY, themeId);
    const canvas = document.querySelector('.desktop-canvas');
    if (canvas) applyTheme(canvas, themeId);
    setIsOpen(false);
  };

  const currentTheme = THEMES.find(t => t.id === activeTheme) || THEMES[0];

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        title="Change theme"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '2px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <span style={{
          display: 'block',
          width: '12px',
          height: '12px',
          borderRadius: '50%',
          background: currentTheme.swatch,
          border: '1.5px solid rgba(255,255,255,0.2)',
          transition: 'transform 0.15s ease',
          transform: isOpen ? 'scale(1.2)' : 'scale(1)',
        }} />
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="listbox"
          aria-label="Theme selection"
          style={{
            position: 'absolute',
            bottom: '32px',
            right: '-4px',
            background: 'var(--dt-context-bg)',
            border: '1px solid var(--dt-accent-border)',
            borderRadius: '8px',
            padding: '8px 10px',
            display: 'flex',
            gap: '6px',
            flexWrap: 'wrap',
            maxWidth: '200px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            zIndex: 300,
          }}
        >
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              role="option"
              aria-selected={activeTheme === theme.id}
              aria-label={theme.name}
              title={theme.name}
              onClick={() => handleSelect(theme.id)}
              style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                background: theme.swatch,
                border: activeTheme === theme.id
                  ? '2px solid #fff'
                  : '1.5px solid rgba(255,255,255,0.15)',
                cursor: 'pointer',
                padding: 0,
                transition: 'transform 0.1s ease, border-color 0.1s ease',
                transform: activeTheme === theme.id ? 'scale(1.15)' : 'scale(1)',
              }}
              onMouseEnter={(e) => { if (activeTheme !== theme.id) e.currentTarget.style.transform = 'scale(1.1)'; }}
              onMouseLeave={(e) => { if (activeTheme !== theme.id) e.currentTarget.style.transform = 'scale(1)'; }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
