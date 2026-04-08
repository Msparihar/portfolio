'use client';

import { useState, useEffect, useRef } from 'react';
import { WORLDS, WORLD_STORAGE_KEY, applyWorld } from '@/config/worlds';
import { THEME_STORAGE_KEY, applyTheme, DEFAULT_THEME_ID } from '@/config/themes';

export default function WorldPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem(WORLD_STORAGE_KEY) : null) ?? null
  );
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  // Close on outside click or Escape
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

  const applyWorldWithTransition = (worldId) => {
    const canvas = document.querySelector('.desktop-canvas');
    if (!canvas) return;

    canvas.style.transition = 'opacity 200ms ease';
    canvas.style.opacity = '0';

    setTimeout(() => {
      if (worldId) {
        applyWorld(canvas, worldId);
        localStorage.setItem(WORLD_STORAGE_KEY, worldId);
        localStorage.removeItem(THEME_STORAGE_KEY);
      } else {
        // Clear world, revert to saved theme
        applyWorld(canvas, null);
        localStorage.removeItem(WORLD_STORAGE_KEY);
        const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) || DEFAULT_THEME_ID;
        applyTheme(canvas, savedTheme);
      }
      canvas.style.opacity = '1';
    }, 200);
  };

  const handleSelect = (worldId) => {
    setActiveWorld(worldId);
    applyWorldWithTransition(worldId);
    setIsOpen(false);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change world"
        title="Change world"
        style={{
          background: 'transparent',
          border: 'none',
          cursor: 'pointer',
          padding: '2px 4px',
          fontSize: '13px',
          fontFamily: 'monospace',
          color: activeWorld ? 'var(--dt-accent)' : 'var(--dt-text-muted)',
          transition: 'color 0.15s ease',
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = 'var(--dt-accent)'}
        onMouseLeave={(e) => e.currentTarget.style.color = activeWorld ? 'var(--dt-accent)' : 'var(--dt-text-muted)'}
      >
        ✦
      </button>

      {/* Popover */}
      {isOpen && (
        <div
          ref={popoverRef}
          role="listbox"
          aria-label="World selection"
          style={{
            position: 'absolute',
            bottom: '32px',
            right: '-4px',
            background: 'var(--dt-context-bg)',
            border: '1px solid var(--dt-accent-border-strong)',
            borderRadius: '8px',
            padding: '10px 12px',
            minWidth: '200px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.05)',
            zIndex: 300,
          }}
        >
          <div style={{ color: 'var(--dt-text-muted)', fontSize: '10px', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
            Worlds
          </div>

          {/* None option */}
          <button
            role="option"
            aria-selected={activeWorld === null}
            onClick={() => handleSelect(null)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              width: '100%',
              padding: '6px 8px',
              background: activeWorld === null ? 'var(--dt-accent-soft)' : 'transparent',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer',
              fontFamily: 'monospace',
              fontSize: '12px',
              color: activeWorld === null ? 'var(--dt-accent)' : 'var(--dt-text)',
              transition: 'background 0.1s ease',
              textAlign: 'left',
            }}
            onMouseEnter={(e) => { if (activeWorld !== null) e.currentTarget.style.background = 'var(--dt-accent-soft)'; }}
            onMouseLeave={(e) => { if (activeWorld !== null) e.currentTarget.style.background = 'transparent'; }}
          >
            <span style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              background: 'var(--dt-text-muted)',
              border: activeWorld === null ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.15)',
              flexShrink: 0,
            }} />
            <span>None (use theme)</span>
          </button>

          {/* World options */}
          {WORLDS.map((world) => (
            <button
              key={world.id}
              role="option"
              aria-selected={activeWorld === world.id}
              onClick={() => handleSelect(world.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                width: '100%',
                padding: '6px 8px',
                background: activeWorld === world.id ? 'var(--dt-accent-soft)' : 'transparent',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontFamily: 'monospace',
                fontSize: '12px',
                color: activeWorld === world.id ? 'var(--dt-accent)' : 'var(--dt-text)',
                transition: 'background 0.1s ease',
                textAlign: 'left',
                marginTop: '2px',
              }}
              onMouseEnter={(e) => { if (activeWorld !== world.id) e.currentTarget.style.background = 'var(--dt-accent-soft)'; }}
              onMouseLeave={(e) => { if (activeWorld !== world.id) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{
                width: '14px',
                height: '14px',
                borderRadius: '50%',
                background: world.swatch,
                border: activeWorld === world.id ? '2px solid #fff' : '1.5px solid rgba(255,255,255,0.15)',
                flexShrink: 0,
              }} />
              <span>{world.name}</span>
              {world.description && (
                <span style={{ color: 'var(--dt-text-muted)', fontSize: '10px', marginLeft: 'auto' }}>
                  {world.description}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
