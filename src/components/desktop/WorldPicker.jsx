'use client';

import { useState, useEffect, useRef } from 'react';
import { WORLDS, WORLD_STORAGE_KEY, applyWorld } from '@/config/worlds';
import { THEME_STORAGE_KEY, applyTheme, DEFAULT_THEME_ID } from '@/config/themes';
import { useSeasonStore } from '@/store/seasonStore';

export default function WorldPicker() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeWorld, setActiveWorld] = useState(
    () => (typeof window !== 'undefined' ? localStorage.getItem(WORLD_STORAGE_KEY) : null) ?? null
  );
  const popoverRef = useRef(null);
  const buttonRef = useRef(null);

  const currentRegion = useSeasonStore((s) => s.currentRegion);
  const isPinned = useSeasonStore((s) => s.isPinned);
  const setRegion = useSeasonStore((s) => s.setRegion);
  const togglePin = useSeasonStore((s) => s.togglePin);

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
    window.dispatchEvent(new CustomEvent('worldchange', { detail: { worldId } }));
  };

  const handleRegionSelect = (regionId) => {
    setRegion(regionId);
    // If not already pinned, pin to this region
    if (!isPinned) togglePin();
    else if (currentRegion === regionId) {
      // Clicking the currently pinned region unpins (resumes cycling)
      togglePin();
      return;
    }
    const canvas = document.querySelector('.desktop-canvas');
    if (canvas) applyWorld(canvas, 'got', regionId);
  };

  const handleUnpin = () => {
    togglePin();
  };

  const currentWorldConfig = activeWorld ? WORLDS.find((w) => w.id === activeWorld) : null;

  return (
    <div style={{ position: 'relative' }}>
      {/* Trigger button */}
      <button
        ref={buttonRef}
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change world"
        title="Change world"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isOpen ? 'var(--dt-accent-soft)' : 'transparent',
          border: '1px solid var(--dt-accent-border)',
          borderRadius: '999px',
          cursor: 'pointer',
          padding: '3px 10px 3px 6px',
          fontSize: '11px',
          fontFamily: 'var(--dt-font-mono)',
          color: 'var(--dt-accent-70)',
          transition: 'background 0.15s ease, border-color 0.15s ease',
          whiteSpace: 'nowrap',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'var(--dt-accent-soft)';
          e.currentTarget.style.borderColor = 'var(--dt-accent-border-strong)';
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.background = 'transparent';
            e.currentTarget.style.borderColor = 'var(--dt-accent-border)';
          }
        }}
      >
        <span style={{
          width: '8px',
          height: '8px',
          borderRadius: '50%',
          background: currentWorldConfig?.swatch ?? 'var(--dt-text-muted)',
          flexShrink: 0,
          boxShadow: `0 0 4px ${currentWorldConfig?.swatch ?? 'transparent'}66`,
        }} />
        <span>{currentWorldConfig?.name ?? 'Theme'}</span>
        <span style={{ fontSize: '8px', opacity: 0.6 }}>▾</span>
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
            borderRadius: 'var(--dt-window-radius, 8px)',
            padding: '10px 12px',
            minWidth: '220px',
            boxShadow: 'var(--dt-shadow-focused)',
            zIndex: 300,
          }}
        >
          <div style={{ color: 'var(--dt-text-muted)', fontSize: '10px', letterSpacing: '0.08em', marginBottom: '8px', textTransform: 'uppercase' }}>
            Switch World
          </div>

          {/* World options */}
          {WORLDS.map((world) => (
            <div key={world.id}>
              <button
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
                  borderRadius: 'var(--dt-radius-sm, 4px)',
                  cursor: 'pointer',
                  fontFamily: 'var(--dt-font-mono)',
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
                  border: activeWorld === world.id ? '2px solid var(--dt-text)' : '1.5px solid var(--dt-accent-20)',
                  flexShrink: 0,
                }} />
                <span>{world.name}</span>
                {world.description && (
                  <span style={{ color: 'var(--dt-text-muted)', fontSize: '10px', marginLeft: 'auto' }}>
                    {world.description}
                  </span>
                )}
              </button>

              {/* Region sub-options — only shown when this world is active and has regions */}
              {activeWorld === world.id && world.regions && (
                <div style={{ marginLeft: '22px', marginTop: '4px', marginBottom: '2px' }}>
                  {/* Cycling indicator / unpin button */}
                  {isPinned ? (
                    <button
                      onClick={handleUnpin}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                        background: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontFamily: 'var(--dt-font-mono)',
                        fontSize: '10px',
                        color: 'var(--dt-accent)',
                        padding: '2px 4px',
                        marginBottom: '4px',
                        borderRadius: '3px',
                      }}
                      title="Unpin — resume seasonal cycling"
                    >
                      <span>📌</span>
                      <span>Pinned — click to resume cycling</span>
                    </button>
                  ) : (
                    <div style={{
                      fontFamily: 'var(--dt-font-mono)',
                      fontSize: '10px',
                      color: 'var(--dt-text-muted)',
                      padding: '2px 4px',
                      marginBottom: '4px',
                    }}>
                      Cycling regions every 5m
                    </div>
                  )}

                  {/* Region buttons */}
                  {Object.entries(world.regions).map(([regionId, region]) => {
                    const isActive = currentRegion === regionId;
                    const isPinnedToThis = isPinned && isActive;
                    return (
                      <button
                        key={regionId}
                        onClick={() => handleRegionSelect(regionId)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px',
                          width: '100%',
                          padding: '4px 6px',
                          background: isActive ? 'var(--dt-accent-soft)' : 'transparent',
                          border: 'none',
                          borderRadius: '3px',
                          cursor: 'pointer',
                          fontFamily: 'var(--dt-font-mono)',
                          fontSize: '11px',
                          color: isActive ? 'var(--dt-accent)' : 'var(--dt-text-muted)',
                          transition: 'background 0.1s ease',
                          textAlign: 'left',
                          marginTop: '1px',
                        }}
                        onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.background = 'var(--dt-accent-soft)'; }}
                        onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.background = 'transparent'; }}
                        title={isPinnedToThis ? 'Click to unpin and resume cycling' : `Pin to ${region.name}`}
                      >
                        <span style={{
                          width: '8px',
                          height: '8px',
                          borderRadius: '50%',
                          background: region.swatch,
                          border: isActive ? '1.5px solid var(--dt-text)' : '1px solid var(--dt-accent-20)',
                          flexShrink: 0,
                        }} />
                        <span>{region.name}</span>
                        <span style={{ color: 'var(--dt-text-muted)', fontSize: '9px', marginLeft: 'auto', opacity: 0.7 }}>
                          {region.house}
                        </span>
                        {isPinnedToThis && (
                          <span style={{ fontSize: '9px', marginLeft: '2px' }}>📌</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
