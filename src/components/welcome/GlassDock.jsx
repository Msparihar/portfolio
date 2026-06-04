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

function DockTile({ tile, size, isHovered, onMouseEnter, onMouseLeave, onClick, showLabel, prefersReducedMotion }) {
  const liftY = isHovered && !prefersReducedMotion ? -5 : 0;
  const scale = prefersReducedMotion ? 1 : size / TILE_BASE;

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
          {/* Triangle tip */}
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
          width: prefersReducedMotion ? TILE_BASE : size,
          height: prefersReducedMotion ? TILE_BASE : size,
          borderRadius: 13,
          border: '1px solid rgba(255,255,255,0.30)',
          background: `linear-gradient(135deg, ${tile.gradient[0]}, ${tile.gradient[1]})`,
          boxShadow: `0 3px 6px ${tile.gradient[1]}72`,
          cursor: 'pointer',
          padding: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transform: `translateY(${liftY}px) scale(${scale})`,
          transformOrigin: 'bottom center',
          transition: prefersReducedMotion
            ? 'none'
            : 'transform 120ms cubic-bezier(0.2, 0.2, 0, 2.0), width 120ms cubic-bezier(0.2, 0.2, 0, 2.0), height 120ms cubic-bezier(0.2, 0.2, 0, 2.0)',
          flexShrink: 0,
        }}
      >
        <span style={{ fontSize: 22, lineHeight: 1 }} aria-hidden="true">{tile.glyph}</span>
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
