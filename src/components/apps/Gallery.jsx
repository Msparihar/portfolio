'use client';

import { useState, useEffect, useCallback } from 'react';
import portfolioData from '@/config/portfolio.json';

const ACCENT = 'var(--dt-accent)';
const BORDER = 'var(--dt-accent-border)';
const TEXT = 'var(--dt-text)';
const MUTED = 'var(--dt-text-muted)';
const GLOW = 'var(--dt-accent-glow-soft)';

function isVideo(src) {
  return src?.endsWith('.webm') || src?.endsWith('.mp4');
}

function MediaThumb({ src, alt, style }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        muted
        loop
        autoPlay
        playsInline
        style={style}
      />
    );
  }
  return <img src={src} alt={alt} style={style} />;
}

function MediaFull({ src, alt, style }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        controls
        autoPlay
        loop
        style={style}
      />
    );
  }
  return <img src={src} alt={alt} style={style} />;
}

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const items = portfolioData.projects?.filter((p) => p.image) ?? [];

  const openLightbox = (i) => setLightboxIndex(i);
  const closeLightbox = () => setLightboxIndex(null);

  const goNext = useCallback(() => {
    if (lightboxIndex === null || items.length === 0) return;
    setLightboxIndex((prev) => (prev + 1) % items.length);
  }, [lightboxIndex, items.length]);

  const goPrev = useCallback(() => {
    if (lightboxIndex === null || items.length === 0) return;
    setLightboxIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [lightboxIndex, items.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const handleKey = (e) => {
      if (e.key === 'ArrowRight') goNext();
      else if (e.key === 'ArrowLeft') goPrev();
      else if (e.key === 'Escape') closeLightbox();
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [lightboxIndex, goNext, goPrev]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', fontFamily: 'var(--dt-font-mono, monospace)', color: TEXT, padding: '16px' }}>
      {/* Header */}
      <div style={{ color: MUTED, fontSize: '11px', letterSpacing: '0.08em', marginBottom: '14px', textTransform: 'uppercase' }}>
        Gallery — Work Samples ({items.length})
      </div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '12px',
      }}>
        {items.map((project, i) => (
          <div
            key={i}
            onClick={() => openLightbox(i)}
            onMouseEnter={() => setHoveredIndex(i)}
            onMouseLeave={() => setHoveredIndex(null)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{
              aspectRatio: '16/9',
              borderRadius: 'var(--dt-radius-sm, 4px)',
              overflow: 'hidden',
              border: hoveredIndex === i ? `1px solid ${ACCENT}` : `1px solid ${BORDER}`,
              boxShadow: hoveredIndex === i ? `0 0 12px ${GLOW}` : 'none',
              transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
            }}>
              <MediaThumb
                src={project.image}
                alt={project.name}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div style={{ color: MUTED, fontSize: '11px', fontFamily: 'var(--dt-font-mono, monospace)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.name}
            </div>
          </div>
        ))}
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && items[lightboxIndex] && (
        <div
          onClick={closeLightbox}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--dt-overlay-bg, rgba(0,0,0,0.85))',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Close button */}
          <button
            onClick={closeLightbox}
            style={{
              position: 'absolute',
              top: '12px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--dt-text)',
              fontSize: '24px',
              cursor: 'pointer',
              zIndex: 51,
            }}
          >
            ✕
          </button>

          {/* Nav: prev */}
          <button
            onClick={(e) => { e.stopPropagation(); goPrev(); }}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--dt-accent-soft)',
              border: 'none',
              color: 'var(--dt-text)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: 'var(--dt-radius-sm, 4px)',
              zIndex: 51,
            }}
          >
            ←
          </button>

          {/* Nav: next */}
          <button
            onClick={(e) => { e.stopPropagation(); goNext(); }}
            style={{
              position: 'absolute',
              right: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'var(--dt-accent-soft)',
              border: 'none',
              color: 'var(--dt-text)',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '8px 12px',
              borderRadius: 'var(--dt-radius-sm, 4px)',
              zIndex: 51,
            }}
          >
            →
          </button>

          {/* Main image */}
          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '80%', maxHeight: '70%' }}>
            <MediaFull
              src={items[lightboxIndex].image}
              alt={items[lightboxIndex].name}
              style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 'var(--dt-radius-sm, 4px)' }}
            />
          </div>

          {/* Caption */}
          <div onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center', marginTop: '16px', maxWidth: '60%' }}>
            <div style={{ color: 'var(--dt-text)', fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '14px', fontWeight: 'bold' }}>
              {items[lightboxIndex].name}
            </div>
            <div style={{ color: 'var(--dt-text-muted)', fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '12px', marginTop: '6px' }}>
              {items[lightboxIndex].description}
            </div>
            <div style={{ color: 'var(--dt-accent-30)', fontFamily: 'var(--dt-font-mono, monospace)', fontSize: '11px', marginTop: '8px' }}>
              {lightboxIndex + 1} / {items.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
