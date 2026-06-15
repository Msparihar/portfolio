'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';

const Editor = dynamic(() => import('./Editor'), { ssr: false });

export default function AnimatePage() {
  return (
    <div style={{ width: '100%', height: '100vh', position: 'relative', overflow: 'hidden', background: '#1a1a2e' }}>
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
          background: 'rgba(0, 0, 0, 0.45)',
          backdropFilter: 'blur(6px)',
          borderRadius: '0 0 10px 0',
          color: '#fff',
          fontSize: '14px',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <span>Animate</span>
        <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
        <Link
          href="/"
          style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '13px' }}
        >
          Back to desktop
        </Link>
      </header>

      <div
        style={{
          position: 'absolute',
          bottom: '10px',
          right: '12px',
          zIndex: 10,
          padding: '4px 8px',
          color: 'rgba(255,255,255,0.45)',
          fontSize: '10px',
          fontFamily: 'system-ui, sans-serif',
          textShadow: '0 1px 2px rgba(0,0,0,0.6)',
        }}
      >
        Avatar + motion:{' '}
        <a
          href="https://github.com/pixiv/three-vrm"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'rgba(255,255,255,0.65)' }}
        >
          @pixiv/three-vrm
        </a>{' '}
        MIT samples
      </div>

      <Editor />
    </div>
  );
}
