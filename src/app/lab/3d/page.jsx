'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const Scene = dynamic(() => import('./Scene'), { ssr: false });

export default function LabPage() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#E89466' }}>
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
        <span>3D Lab — Ghibli Island</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
        <Link
          href="/"
          style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px' }}
        >
          Back to desktop
        </Link>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
        <Link
          href="/lab/3d/parts"
          style={{ color: 'rgba(255,255,255,0.6)', textDecoration: 'none', fontSize: '12px' }}
        >
          Parts catalog
        </Link>
      </header>
      <div
        style={{
          position: 'absolute',
          bottom: '14px',
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 10,
          padding: '6px 14px',
          background: 'rgba(0, 0, 0, 0.32)',
          backdropFilter: 'blur(6px)',
          borderRadius: '8px',
          color: 'rgba(255,255,255,0.85)',
          fontSize: '12px',
          fontFamily: 'system-ui, sans-serif',
          letterSpacing: '0.02em',
        }}
      >
        Drag to orbit · scroll to zoom · keys: T top · F front · S side · B below · R reset
      </div>
      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '12px',
          zIndex: 10,
          padding: '4px 8px',
          color: 'rgba(255,255,255,0.55)',
          fontSize: '10px',
          fontFamily: 'system-ui, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.4)',
        }}
      >
        Assets: torii & stone lantern by dook; airships & koi by Google — CC BY via{' '}
        <a
          href="https://poly.pizza"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Poly Pizza
        </a>
        ; nature kit by{' '}
        <a
          href="https://kenney.nl"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.75)' }}
        >
          Kenney
        </a>{' '}
        (CC0)
      </div>
      <Scene />
    </div>
  );
}
