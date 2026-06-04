'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import portfolioData from '@/config/portfolio.json';
import { getCurrentWorldId, createWorldChangeListener, getGhibliPoemFooter } from '@/config/worldContent';
import PoemFooter from '@/components/welcome/PoemFooter';

const ACCENT = 'var(--dt-accent)';
const BORDER = 'var(--dt-accent-border)';
const TEXT = 'var(--dt-text)';
const MUTED = 'var(--dt-text-muted)';
const GLOW = 'var(--dt-accent-glow-soft)';

const SEASONS = ['All', 'Spring', 'Summer', 'Autumn', 'Winter', 'Spirits'];

function isVideo(src) {
  return src?.endsWith('.webm') || src?.endsWith('.mp4');
}

function assignSeason(index) {
  const cycle = ['Spring', 'Summer', 'Autumn', 'Winter', 'Spirits'];
  return cycle[index % cycle.length];
}

function MediaThumb({ src, alt }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        muted
        loop
        autoPlay
        playsInline
        style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 768px) 100vw, 33vw"
      style={{ objectFit: 'cover' }}
      loading="lazy"
    />
  );
}

function MediaFull({ src, alt }) {
  if (isVideo(src)) {
    return (
      <video
        src={src}
        controls
        autoPlay
        loop
        style={{ maxWidth: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: 'var(--dt-radius-sm, 4px)' }}
      />
    );
  }
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="80vw"
      style={{ objectFit: 'contain', borderRadius: 'var(--dt-radius-sm, 4px)' }}
      loading="eager"
    />
  );
}

function GhibliFilterChip({ label, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        borderRadius: '999px',
        padding: '7px 15px',
        fontFamily: 'var(--font-geist), sans-serif',
        fontSize: '13px',
        fontWeight: active ? 600 : 500,
        cursor: 'pointer',
        border: active ? 'none' : '1px solid rgba(255,255,255,0.70)',
        background: active
          ? 'linear-gradient(135deg, #5a9268, #3f6e4c)'
          : 'rgba(255,255,255,0.50)',
        color: active ? '#ffffff' : '#52634a',
        transition: 'opacity 0.15s ease',
      }}
    >
      {label}
    </button>
  );
}

function GhibliCard({ project, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        borderRadius: '16px',
        overflow: 'hidden',
        background: 'rgba(255,255,255,0.50)',
        border: `1px solid rgba(255,255,255,${hovered ? '0.75' : '0.50'})`,
        cursor: 'pointer',
        transition: 'border-color 0.15s ease, box-shadow 0.15s ease',
        boxShadow: hovered ? '0 4px 20px rgba(58,74,46,0.18)' : 'none',
        breakInside: 'avoid',
        marginBottom: '16px',
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
        <MediaThumb src={project.image} alt={project.name} />
      </div>
      <div style={{ padding: '10px 12px 12px' }}>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-newsreader), Georgia, serif',
            fontStyle: 'italic',
            fontSize: '14px',
            color: 'var(--sg-text-primary)',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {project.name}
        </p>
      </div>
    </div>
  );
}

function GhibliGallery({ items, worldId }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const poemText = getGhibliPoemFooter(worldId, 'gallery');

  const taggedItems = items.map((item, i) => ({ ...item, _season: assignSeason(i) }));
  const filtered = activeFilter === 'All' ? taggedItems : taggedItems.filter((it) => it._season === activeFilter);

  const col0 = filtered.filter((_, i) => i % 3 === 0);
  const col1 = filtered.filter((_, i) => i % 3 === 1);
  const col2 = filtered.filter((_, i) => i % 3 === 2);

  return (
    <div
      style={{
        height: '100%',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column',
        padding: '24px',
        gap: '18px',
        background: 'transparent',
        boxSizing: 'border-box',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <p
            style={{
              margin: 0,
              fontFamily: 'var(--font-geist), sans-serif',
              fontSize: '10px',
              fontWeight: 600,
              color: 'var(--sg-label-color)',
              letterSpacing: '2px',
              textTransform: 'uppercase',
            }}
          >
            THE ATELIER · COLLECTION
          </p>
          <p
            style={{
              margin: '2px 0 0',
              fontFamily: 'var(--font-newsreader), Georgia, serif',
              fontSize: '27px',
              fontStyle: 'italic',
              color: 'var(--sg-text-primary)',
              lineHeight: 1,
            }}
          >
            Seasons
          </p>
        </div>
        <p
          style={{
            margin: 0,
            fontFamily: 'var(--font-geist), sans-serif',
            fontSize: '12px',
            color: 'var(--sg-text-label)',
          }}
        >
          {items.length} works gathered through the year
        </p>
      </div>

      {/* Season filter chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
        {SEASONS.map((s) => (
          <GhibliFilterChip
            key={s}
            label={s}
            active={activeFilter === s}
            onClick={() => setActiveFilter(s)}
          />
        ))}
      </div>

      {/* 3-column masonry */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px', flex: 1 }}>
        {[col0, col1, col2].map((col, ci) => (
          <div key={ci}>
            {col.map((project, i) => (
              <GhibliCard key={`${project.name}-${i}`} project={project} onClick={() => {}} />
            ))}
          </div>
        ))}
      </div>

      {poemText && <PoemFooter text={poemText} />}
    </div>
  );
}

export default function Gallery() {
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [hoveredIndex, setHoveredIndex] = useState(null);
  const [worldId, setWorldId] = useState(null);

  useEffect(() => {
    setWorldId(getCurrentWorldId());
    return createWorldChangeListener((id) => setWorldId(id));
  }, []);

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

  if (worldId === 'ghibli') {
    return <GhibliGallery items={items} worldId={worldId} />;
  }

  return (
    <div style={{ height: '100%', overflowY: 'auto', fontFamily: 'var(--dt-font-mono, monospace)', color: TEXT, padding: '16px' }}>
      <div style={{ color: MUTED, fontSize: '11px', letterSpacing: '0.08em', marginBottom: '14px', textTransform: 'uppercase' }}>
        Gallery — Work Samples ({items.length})
      </div>

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
              position: 'relative',
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
              />
            </div>
            <div style={{ color: MUTED, fontSize: '11px', fontFamily: 'var(--dt-font-mono, monospace)', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {project.name}
            </div>
          </div>
        ))}
      </div>

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
          <button
            type="button"
            aria-label="Close lightbox"
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

          <button
            type="button"
            aria-label="Previous image"
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

          <button
            type="button"
            aria-label="Next image"
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

          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'relative', width: '80vw', maxWidth: '900px', height: '60vh' }}
          >
            <MediaFull
              src={items[lightboxIndex].image}
              alt={items[lightboxIndex].name}
            />
          </div>

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
