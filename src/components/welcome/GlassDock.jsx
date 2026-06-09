'use client';

import { useRef, useState, useEffect, useCallback } from 'react';

const TILE_BASE = 50;
const TILE_MAX = 80;
const MAGNIFY_RADIUS = 2;

function getMagnifiedSize(hoveredIndex, tileIndex) {
  if (hoveredIndex === null) return TILE_BASE;
  const dist = Math.abs(hoveredIndex - tileIndex);
  if (dist === 0) return TILE_MAX;
  if (dist <= MAGNIFY_RADIUS) {
    const falloff = 1 - dist / (MAGNIFY_RADIUS + 1);
    return TILE_BASE + (TILE_MAX - TILE_BASE) * falloff * 0.5;
  }
  return TILE_BASE;
}

const APP_ICONS = {
  filemanager: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M3 7a2 2 0 0 1 2-2h4.586a1 1 0 0 1 .707.293L11.707 6.7A1 1 0 0 0 12.414 7H19a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7Z" fill="#fff"/>
    </svg>
  ),
  terminal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 17l5-5-5-5" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 19h8" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
    </svg>
  ),
  mail: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="20" height="14" rx="2" fill="#fff"/>
      <path d="M2 7l10 7 10-7" stroke="rgba(0,0,0,0.18)" strokeWidth="1.5" strokeLinejoin="round"/>
    </svg>
  ),
  journal: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="2" width="14" height="20" rx="2" fill="#fff"/>
      <rect x="3" y="2" width="2" height="20" rx="1" fill="rgba(0,0,0,0.15)"/>
      <line x1="8" y1="8" x2="15" y2="8" stroke="rgba(0,0,0,0.18)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="8" y1="12" x2="15" y2="12" stroke="rgba(0,0,0,0.18)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="8" y1="16" x2="12" y2="16" stroke="rgba(0,0,0,0.18)" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
  gallery: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <ellipse cx="17" cy="8" rx="3" ry="3" fill="#fff"/>
      <path d="M2 20l5-6 4 4 3-3 5 5H2Z" fill="#fff"/>
      <rect x="2" y="4" width="20" height="16" rx="2.5" stroke="#fff" strokeWidth="1.8" fill="none"/>
    </svg>
  ),
  whisperwell: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h3l2 3 2-3h9a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2Z" fill="#fff"/>
      <circle cx="8" cy="10" r="1.3" fill="rgba(0,0,0,0.18)"/>
      <circle cx="12" cy="10" r="1.3" fill="rgba(0,0,0,0.18)"/>
      <circle cx="16" cy="10" r="1.3" fill="rgba(0,0,0,0.18)"/>
    </svg>
  ),
  about: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="#fff"/>
      <path d="M4 20c0-4.418 3.582-8 8-8s8 3.582 8 8" fill="#fff"/>
    </svg>
  ),
  resume: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 2a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6H6Z" fill="#fff"/>
      <path d="M14 2v5a1 1 0 0 0 1 1h5" fill="rgba(0,0,0,0.12)"/>
      <line x1="8" y1="13" x2="16" y2="13" stroke="rgba(0,0,0,0.18)" strokeWidth="1.3" strokeLinecap="round"/>
      <line x1="8" y1="16.5" x2="13" y2="16.5" stroke="rgba(0,0,0,0.18)" strokeWidth="1.3" strokeLinecap="round"/>
    </svg>
  ),
};

function TileIcon({ appId }) {
  return APP_ICONS[appId] ?? (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="3" fill="#fff"/>
    </svg>
  );
}

function DockTile({ tile, size, isHovered, onMouseEnter, onMouseLeave, onClick, showLabel, prefersReducedMotion }) {
  const liftY = isHovered && !prefersReducedMotion ? -5 : 0;
  const scale = prefersReducedMotion ? 1 : size / TILE_BASE;
  const shadow = tile.shadowTint
    ? `0 6px 14px ${tile.shadowTint}88, 0 2px 4px rgba(0,0,0,0.20)`
    : `0 3px 6px ${tile.gradient[1]}72`;

  return (
    <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      {showLabel && (
        <div style={{
          position: 'absolute',
          bottom: size + 10,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(15, 28, 20, 0.95)',
          boxShadow: '0 4px 12px rgba(0,0,0,0.35)',
          borderRadius: 10,
          padding: '5px 13px',
          whiteSpace: 'nowrap',
          pointerEvents: 'none',
          zIndex: 10,
        }}>
          <span style={{
            fontFamily: 'var(--font-geist, Geist, sans-serif)',
            fontSize: 12,
            fontWeight: 500,
            color: '#ffffff',
          }}>{tile.label}</span>
          <div style={{
            position: 'absolute',
            bottom: -7,
            left: '50%',
            transform: 'translateX(-50%)',
            width: 0,
            height: 0,
            borderLeft: '6px solid transparent',
            borderRight: '6px solid transparent',
            borderTop: '7px solid rgba(15, 28, 20, 0.95)',
          }} />
        </div>
      )}
      <button
        type="button"
        aria-label={tile.label}
        onClick={() => onClick(tile)}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          width: TILE_BASE,
          height: TILE_BASE,
          borderRadius: 13,
          border: '1px solid rgba(255,255,255,0.30)',
          background: `linear-gradient(135deg, ${tile.gradient[0]}, ${tile.gradient[1]})`,
          boxShadow: shadow,
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${liftY}px) scale(${scale})`,
          transformOrigin: 'bottom center',
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 120ms cubic-bezier(0.2, 0.2, 0, 2.0)',
          flexShrink: 0,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {tile.gloss && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              borderRadius: 13,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0) 50%)',
              pointerEvents: 'none',
            }}
          />
        )}
        <TileIcon appId={tile.appId} />
      </button>
    </div>
  );
}

export default function GlassDock({ tiles, onTileClick, style }) {
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [labelIndex, setLabelIndex] = useState(null);
  const labelTimerRef = useRef(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    setMounted(true);
  }, []);

  const handleMouseEnter = useCallback((index) => {
    setHoveredIndex(index);
    clearTimeout(labelTimerRef.current);
    labelTimerRef.current = setTimeout(() => setLabelIndex(index), 150);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredIndex(null);
    setLabelIndex(null);
    clearTimeout(labelTimerRef.current);
  }, []);

  useEffect(() => () => clearTimeout(labelTimerRef.current), []);

  return (
    <div
      role="toolbar"
      aria-label="Application dock"
      style={{
        display: 'inline-flex',
        alignItems: 'flex-end',
        gap: 12,
        borderRadius: 24,
        background: 'rgba(255,255,255,0.12)',
        backgroundImage: 'linear-gradient(120deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.08) 45%, rgba(255,255,255,0.00) 100%)',
        border: '1px solid rgba(255,255,255,0.70)',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        boxShadow: '0 14px 30px rgba(0,0,0,0.22)',
        padding: '10px 14px',
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0)' : 'translateY(24px)',
        transition: prefersReducedMotion
          ? 'opacity 400ms ease'
          : 'opacity 400ms ease, transform 400ms ease',
        ...style,
      }}
    >
      {tiles.map((tile, i) => (
        <DockTile
          key={tile.id}
          tile={tile}
          size={getMagnifiedSize(hoveredIndex, i)}
          isHovered={hoveredIndex === i}
          onMouseEnter={() => handleMouseEnter(i)}
          onMouseLeave={handleMouseLeave}
          onClick={onTileClick}
          showLabel={labelIndex === i}
          prefersReducedMotion={prefersReducedMotion}
        />
      ))}
    </div>
  );
}
