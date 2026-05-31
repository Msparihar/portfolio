'use client';

import { useState, useMemo, useRef, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { PARTS, CATEGORIES } from './registry';

// Lazy-mount canvases only when the tile enters the viewport so we stay
// well under the browser's ~16 simultaneous WebGL context cap.
const PartCanvas = dynamic(() => import('./PartCanvas').then((m) => m.PartCanvas), { ssr: false });

export default function PartsCatalogPage() {
  const [filter, setFilter] = useState('All');
  const [openSlug, setOpenSlug] = useState(null);

  const visible = useMemo(
    () => (filter === 'All' ? PARTS : PARTS.filter((p) => p.category === filter)),
    [filter],
  );
  const openPart = openSlug ? PARTS.find((p) => p.slug === openSlug) : null;

  return (
    <div
      style={{
        width: '100%',
        minHeight: '100vh',
        background: '#1a1a1f',
        color: '#f0e9df',
        fontFamily: 'system-ui, sans-serif',
        padding: '24px 32px 64px',
      }}
    >
      <header style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '20px', fontWeight: 600, letterSpacing: '0.02em' }}>
          3D Lab — Parts Catalog
        </h1>
        <span style={{ color: '#666', fontSize: '13px' }}>·</span>
        <Link href="/lab/3d" style={{ color: '#9bb8c8', textDecoration: 'none', fontSize: '13px' }}>
          Combined scene
        </Link>
        <span style={{ color: '#666', fontSize: '13px' }}>·</span>
        <Link href="/" style={{ color: '#888', textDecoration: 'none', fontSize: '13px' }}>
          Desktop
        </Link>
        <span style={{ marginLeft: 'auto', color: '#777', fontSize: '12px' }}>
          {visible.length} components · click to expand
        </span>
      </header>

      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '24px' }}>
        {['All', ...CATEGORIES].map((cat) => {
          const active = cat === filter;
          return (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontFamily: 'inherit',
                borderRadius: '14px',
                border: '1px solid ' + (active ? '#c89567' : '#3a3a42'),
                background: active ? '#c89567' : 'transparent',
                color: active ? '#1a1a1f' : '#bbb',
                cursor: 'pointer',
                fontWeight: active ? 600 : 400,
                transition: 'all 0.15s',
              }}
            >
              {cat}
            </button>
          );
        })}
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: '14px',
        }}
      >
        {visible.map((part) => (
          <PartCard key={part.slug} part={part} onOpen={() => setOpenSlug(part.slug)} />
        ))}
      </div>

      {openPart && (
        <div
          onClick={() => setOpenSlug(null)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.82)',
            backdropFilter: 'blur(6px)',
            zIndex: 50,
            display: 'flex',
            flexDirection: 'column',
            padding: '40px 56px 56px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
            <div style={{ fontSize: '16px', fontWeight: 600 }}>{openPart.label}</div>
            <span style={{ color: '#777', fontSize: '13px' }}>· {openPart.category}</span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setOpenSlug(null);
              }}
              style={{
                marginLeft: 'auto',
                padding: '6px 14px',
                background: 'transparent',
                border: '1px solid #555',
                color: '#ddd',
                borderRadius: '6px',
                cursor: 'pointer',
                fontSize: '13px',
                fontFamily: 'inherit',
              }}
            >
              Close ✕
            </button>
          </div>
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ flex: 1, borderRadius: '12px', overflow: 'hidden', background: '#E8C8B0' }}
          >
            <PartCanvas part={openPart} controls dpr={[1, 2]} shadows />
          </div>
          <div style={{ marginTop: '10px', fontSize: '11px', color: '#666' }}>
            Drag to orbit · scroll to zoom · click outside or Close to return
          </div>
        </div>
      )}
    </div>
  );
}

function PartCard({ part, onOpen }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    const io = new IntersectionObserver(
      ([entry]) => setVisible(entry.isIntersecting),
      { rootMargin: '0px', threshold: 0.1 },
    );
    io.observe(ref.current);
    return () => io.disconnect();
  }, []);

  return (
    <button
      ref={ref}
      onClick={onOpen}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: '#23232a',
        border: '1px solid ' + (hovered ? '#c89567' : '#2e2e36'),
        borderRadius: '10px',
        padding: 0,
        cursor: 'pointer',
        color: 'inherit',
        fontFamily: 'inherit',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        transition: 'border-color 0.15s, transform 0.15s',
        transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
      }}
    >
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          background: '#E8C8B0',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {visible ? (
          <PartCanvas part={part} controls={false} autoRotate dpr={[0.6, 1]} />
        ) : (
          <span style={{ color: '#8b7560', fontSize: '10px', opacity: 0.6 }}>loading…</span>
        )}
      </div>
      <div style={{ padding: '10px 12px', textAlign: 'left' }}>
        <div style={{ fontSize: '13px', fontWeight: 500, color: '#f0e9df' }}>{part.label}</div>
        <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{part.category}</div>
      </div>
    </button>
  );
}
