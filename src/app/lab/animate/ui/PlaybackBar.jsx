'use client';

import { Play, Pause } from 'lucide-react';
import { useAnimateStore } from '../store';

export function PlaybackBar() {
  const isPlaying = useAnimateStore((s) => s.isPlaying);
  const setPlaying = useAnimateStore((s) => s.setPlaying);

  return (
    <div
      style={{
        position: 'absolute',
        bottom: '24px',
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        padding: '8px 20px',
        background: 'rgba(0, 0, 0, 0.38)',
        backdropFilter: 'blur(8px)',
        borderRadius: '999px',
        border: '1px solid rgba(255,255,255,0.12)',
      }}
    >
      <button
        type="button"
        aria-label={isPlaying ? 'Pause' : 'Play'}
        aria-pressed={isPlaying}
        onClick={() => setPlaying(!isPlaying)}
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: '#fff',
          display: 'flex',
          alignItems: 'center',
          padding: '6px',
          borderRadius: '50%',
          minWidth: '44px',
          minHeight: '44px',
          justifyContent: 'center',
        }}
      >
        {isPlaying ? <Pause size={20} /> : <Play size={20} />}
      </button>
    </div>
  );
}
