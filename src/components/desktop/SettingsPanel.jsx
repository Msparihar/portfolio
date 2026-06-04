'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePrefsStore, HEADING_FONTS, BODY_FONTS, MONO_FONTS } from '@/store/prefsStore';
import { WORLDS, WORLD_STORAGE_KEY, normalizeWallpaper } from '@/config/worlds';

// ─── Tiny primitives ─────────────────────────────────────────────────────────

function SectionLabel({ children }) {
  return (
    <div
      style={{
        fontFamily: 'var(--dt-font-mono)',
        fontSize: '10px',
        letterSpacing: '0.08em',
        color: 'var(--dt-text-muted)',
        textTransform: 'uppercase',
        marginBottom: '6px',
      }}
    >
      {children}
    </div>
  );
}

function FontPicker({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {options.map((opt) => {
        const active = opt === value;
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            style={{
              padding: '4px 8px',
              borderRadius: '4px',
              border: active
                ? '1px solid var(--dt-accent)'
                : '1px solid var(--dt-accent-border)',
              background: active ? 'var(--dt-accent-soft-2)' : 'transparent',
              color: active ? 'var(--dt-accent)' : 'var(--dt-text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--dt-font-mono)',
              cursor: 'pointer',
              transition: 'background 0.12s ease, border-color 0.12s ease, color 0.12s ease',
            }}
            onMouseEnter={(e) => {
              if (active) return;
              e.currentTarget.style.borderColor = 'var(--dt-accent-border-strong)';
              e.currentTarget.style.color = 'var(--dt-text)';
            }}
            onMouseLeave={(e) => {
              if (active) return;
              e.currentTarget.style.borderColor = 'var(--dt-accent-border)';
              e.currentTarget.style.color = 'var(--dt-text-muted)';
            }}
          >
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function SliderRow({ label, value, min, max, step, onChange, format }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span
        style={{
          fontFamily: 'var(--dt-font-mono)',
          fontSize: '11px',
          color: 'var(--dt-text-muted)',
          minWidth: '60px',
        }}
      >
        {label}
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          flex: 1,
          accentColor: 'var(--dt-accent)',
          cursor: 'pointer',
        }}
      />
      <span
        style={{
          fontFamily: 'var(--dt-font-mono)',
          fontSize: '10px',
          color: 'var(--dt-accent)',
          minWidth: '32px',
          textAlign: 'right',
        }}
      >
        {format ? format(value) : value}
      </span>
    </div>
  );
}

function SegmentedPicker({ options, value, onChange }) {
  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
      {options.map((opt) => {
        const active = opt.id === value;
        return (
          <button
            key={opt.id}
            onClick={() => onChange(opt.id)}
            style={{
              padding: '4px 10px',
              borderRadius: '4px',
              border: active
                ? '1px solid var(--dt-accent)'
                : '1px solid var(--dt-accent-border)',
              background: active ? 'var(--dt-accent-soft-2)' : 'transparent',
              color: active ? 'var(--dt-accent)' : 'var(--dt-text-muted)',
              fontSize: '11px',
              fontFamily: 'var(--dt-font-mono)',
              cursor: 'pointer',
              transition: 'background 0.12s ease, border-color 0.12s ease, color 0.12s ease',
            }}
            onMouseEnter={(e) => {
              if (active) return;
              e.currentTarget.style.borderColor = 'var(--dt-accent-border-strong)';
              e.currentTarget.style.color = 'var(--dt-text)';
            }}
            onMouseLeave={(e) => {
              if (active) return;
              e.currentTarget.style.borderColor = 'var(--dt-accent-border)';
              e.currentTarget.style.color = 'var(--dt-text-muted)';
            }}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}

function Divider() {
  return (
    <div
      style={{
        height: '1px',
        background: 'linear-gradient(to right, transparent, var(--dt-accent-border-strong), transparent)',
        margin: '12px 0',
      }}
    />
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function SettingsPanel() {
  const [open, setOpen] = useState(false);
  const [currentWorldId, setCurrentWorldId] = useState(null);
  const panelRef = useRef(null);

  const headingFont = usePrefsStore((s) => s.headingFont);
  const bodyFont = usePrefsStore((s) => s.bodyFont);
  const monoFont = usePrefsStore((s) => s.monoFont);
  const iconBlur = usePrefsStore((s) => s.iconBlur);
  const iconBg = usePrefsStore((s) => s.iconBg);
  const pinnedWallpaperId = usePrefsStore((s) => s.pinnedWallpaperId);
  const animateWallpaper = usePrefsStore((s) => s.animateWallpaper);
  const atmosphereEnabled = usePrefsStore((s) => s.atmosphereEnabled);

  const setHeadingFont = usePrefsStore((s) => s.setHeadingFont);
  const setBodyFont = usePrefsStore((s) => s.setBodyFont);
  const setMonoFont = usePrefsStore((s) => s.setMonoFont);
  const setIconBlur = usePrefsStore((s) => s.setIconBlur);
  const setIconBg = usePrefsStore((s) => s.setIconBg);
  const setPinnedWallpaper = usePrefsStore((s) => s.setPinnedWallpaper);
  const setAnimateWallpaper = usePrefsStore((s) => s.setAnimateWallpaper);
  const toggleAtmosphere = usePrefsStore((s) => s.toggleAtmosphere);
  const hydrate = usePrefsStore((s) => s.hydrate);

  // Hydrate CSS vars from persisted state on first mount
  useEffect(() => {
    hydrate();
  }, [hydrate]);

  // Track the active world to build the wallpaper picker
  useEffect(() => {
    const saved = localStorage.getItem(WORLD_STORAGE_KEY);
    setCurrentWorldId(saved ?? 'elden-ring');

    const handleWorldChange = (e) => {
      setCurrentWorldId(e.detail?.worldId ?? null);
    };
    window.addEventListener('worldchange', handleWorldChange);
    return () => window.removeEventListener('worldchange', handleWorldChange);
  }, []);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleToggle = useCallback((e) => {
    e.stopPropagation();
    setOpen((v) => !v);
  }, []);

  // Build wallpaper options for the current world
  const wallpaperOptions = (() => {
    const world = WORLDS.find((w) => w.id === currentWorldId);
    if (!world) return [{ id: 'auto', label: 'Auto' }];

    const opts = [{ id: 'auto', label: 'Auto' }];
    if (world.regions) {
      Object.entries(world.regions).forEach(([regionId, region]) => {
        const src = normalizeWallpaper(region.wallpaper).src;
        if (src) opts.push({ id: src, label: region.name ?? regionId });
      });
    } else if (world.wallpaper) {
      const src = normalizeWallpaper(world.wallpaper).src;
      if (src) opts.push({ id: src, label: world.name });
    }
    return opts;
  })();

  return (
    <div
      ref={panelRef}
      style={{
        position: 'fixed',
        bottom: '52px',
        right: '16px',
        zIndex: 900,
      }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Drawer panel */}
      {open && (
        <div
          role="dialog"
          aria-label="Settings"
          style={{
            position: 'absolute',
            bottom: '44px',
            right: 0,
            width: '280px',
            background: 'var(--dt-surface)',
            backdropFilter: 'var(--dt-window-blur)',
            WebkitBackdropFilter: 'var(--dt-window-blur)',
            border: '1px solid var(--dt-accent-border-strong)',
            borderRadius: 'var(--dt-window-radius, 6px)',
            boxShadow: 'var(--dt-shadow-focused)',
            padding: '16px',
            animation: 'settingsPanelIn 150ms ease',
          }}
        >
          {/* Heading */}
          <div
            style={{
              fontFamily: 'var(--dt-font-heading)',
              fontSize: '14px',
              fontWeight: 600,
              color: 'var(--dt-text)',
              marginBottom: '14px',
              letterSpacing: '0.02em',
            }}
          >
            Desktop Settings
          </div>

          {/* Typography — Heading */}
          <SectionLabel>Heading Font</SectionLabel>
          <FontPicker options={HEADING_FONTS} value={headingFont} onChange={setHeadingFont} />

          <Divider />

          {/* Typography — Body */}
          <SectionLabel>Body Font</SectionLabel>
          <FontPicker options={BODY_FONTS} value={bodyFont} onChange={setBodyFont} />

          <Divider />

          {/* Typography — Mono */}
          <SectionLabel>Mono Font</SectionLabel>
          <FontPicker options={MONO_FONTS} value={monoFont} onChange={setMonoFont} />

          <Divider />

          {/* Icon legibility */}
          <SectionLabel>Icon Label Legibility</SectionLabel>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <SliderRow
              label="Blur"
              value={iconBlur}
              min={0}
              max={24}
              step={1}
              onChange={setIconBlur}
              format={(v) => `${v}px`}
            />
            <SliderRow
              label="BG opacity"
              value={iconBg}
              min={0}
              max={1}
              step={0.05}
              onChange={setIconBg}
              format={(v) => v.toFixed(2)}
            />
          </div>

          <Divider />

          {/* Wallpaper pin */}
          <SectionLabel>Wallpaper</SectionLabel>
          <SegmentedPicker
            options={wallpaperOptions}
            value={pinnedWallpaperId}
            onChange={setPinnedWallpaper}
          />

          <Divider />

          {/* Wallpaper animation toggle */}
          <SectionLabel>Wallpaper Animation</SectionLabel>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span
              style={{
                fontFamily: 'var(--dt-font-mono)',
                fontSize: '11px',
                color: 'var(--dt-text-muted)',
              }}
            >
              Animate wallpaper
            </span>
            <button
              role="switch"
              aria-checked={animateWallpaper}
              onClick={() => setAnimateWallpaper(!animateWallpaper)}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                background: animateWallpaper ? 'var(--dt-accent)' : 'var(--dt-accent-border-strong)',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: animateWallpaper ? '18px' : '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>

          <Divider />

          {/* Atmosphere effects toggle */}
          <SectionLabel>Atmosphere</SectionLabel>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
          >
            <span
              style={{
                fontFamily: 'var(--dt-font-mono)',
                fontSize: '11px',
                color: 'var(--dt-text-muted)',
              }}
            >
              Ghibli atmosphere effects
            </span>
            <button
              role="switch"
              aria-checked={atmosphereEnabled}
              onClick={toggleAtmosphere}
              style={{
                width: '36px',
                height: '20px',
                borderRadius: '10px',
                border: 'none',
                cursor: 'pointer',
                position: 'relative',
                background: atmosphereEnabled ? 'var(--dt-accent)' : 'var(--dt-accent-border-strong)',
                transition: 'background 0.2s ease',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: atmosphereEnabled ? '18px' : '2px',
                  width: '16px',
                  height: '16px',
                  borderRadius: '50%',
                  background: '#fff',
                  transition: 'left 0.2s ease',
                }}
              />
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        aria-label="Toggle settings panel"
        aria-expanded={open}
        onClick={handleToggle}
        style={{
          width: '36px',
          height: '36px',
          borderRadius: '50%',
          background: open ? 'var(--dt-accent-soft-2)' : 'var(--dt-surface)',
          border: open
            ? '1px solid var(--dt-accent)'
            : '1px solid var(--dt-accent-border-strong)',
          color: open ? 'var(--dt-accent)' : 'var(--dt-text-muted)',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '16px',
          fontFamily: 'var(--dt-font-mono)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
          transition: 'background 0.15s ease, border-color 0.15s ease, color 0.15s ease',
        }}
        onMouseEnter={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'var(--dt-accent-soft)';
            e.currentTarget.style.color = 'var(--dt-text)';
          }
        }}
        onMouseLeave={(e) => {
          if (!open) {
            e.currentTarget.style.background = 'var(--dt-surface)';
            e.currentTarget.style.color = 'var(--dt-text-muted)';
          }
        }}
      >
        ⚙
      </button>
    </div>
  );
}
