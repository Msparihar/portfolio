'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

// Dynamically import Scene so Three.js never lands in the main bundle
const Scene = dynamic(() => import('./Scene'), { ssr: false });

export default function LabPage() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#87CEEB' }}>
      {/* Header bar */}
      <header
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          zIndex: 10,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          padding: '10px 16px',
          background: 'rgba(0, 0, 0, 0.35)',
          backdropFilter: 'blur(6px)',
          borderRadius: '0 0 10px 0',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span>🧪 3D Lab — Ghibli proof-of-concept</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
        <Link
          href="/"
          style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px' }}
        >
          ← Back to desktop
        </Link>
      </header>

      {/* Full-viewport canvas */}
      <Scene />
    </div>
  );
}
