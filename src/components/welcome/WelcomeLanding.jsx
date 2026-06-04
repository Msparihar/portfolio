'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import Image from 'next/image';
import DuskBackdrop from './DuskBackdrop';
import HeroGroup from './HeroGroup';
import WelcomeWidget from './WelcomeWidget';
import GlassDock from './GlassDock';
import { GHIBLI_WELCOME } from '@/config/welcomeContent';

const GlslCanvas = dynamic(() => import('@/components/effects/GlslCanvas'), { ssr: false });

const ENTERED_KEY = 'sg_entered_ghibli';
const DESIGN_W = 1440;
const DESIGN_H = 900;

export default function WelcomeLanding({ onEnter }) {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [scale, setScale] = useState(1);
  const enterFiredRef = useRef(false);
  const leaveTimerRef = useRef(null);

  useEffect(() => {
    setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    const id = requestAnimationFrame(() => setVisible(true));
    return () => cancelAnimationFrame(id);
  }, []);

  useEffect(() => {
    const compute = () =>
      setScale(Math.min(window.innerWidth / DESIGN_W, window.innerHeight / DESIGN_H));
    compute();
    window.addEventListener('resize', compute);
    return () => window.removeEventListener('resize', compute);
  }, []);

  useEffect(() => () => clearTimeout(leaveTimerRef.current), []);

  const handleEnter = useCallback(() => {
    if (enterFiredRef.current) return;
    enterFiredRef.current = true;
    try { localStorage.setItem(ENTERED_KEY, '1'); } catch { /* storage unavailable */ }
    window.dispatchEvent(new CustomEvent('enter-garden'));
    if (prefersReducedMotion) {
      onEnter?.();
      return;
    }
    setLeaving(true);
    leaveTimerRef.current = setTimeout(() => onEnter?.(), 500);
  }, [onEnter, prefersReducedMotion]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Enter' || e.key === ' ') handleEnter();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [handleEnter]);

  const content = GHIBLI_WELCOME;

  const handleTileClick = (tile) => {
    if (!tile.appId) return;
    handleEnter();
    const appId = tile.appId;
    setTimeout(() => {
      window.dispatchEvent(new CustomEvent('open-app', { detail: { appId } }));
    }, 550);
  };

  return (
    <div
      aria-label="Spirit Garden welcome screen"
      style={{
        position: 'fixed',
        inset: 0,
        overflow: 'hidden',
        background: '#121c15',
        opacity: leaving ? 0 : visible ? 1 : 0,
        transition: prefersReducedMotion
          ? 'none'
          : leaving
            ? 'opacity 500ms ease-in'
            : 'opacity 600ms ease-out',
        zIndex: 200,
      }}
    >
      {/* Atmospheric shaders span the real viewport, not the scaled stage */}
      {prefersReducedMotion ? (
        <div style={{
          position: 'fixed',
          inset: 0,
          background: 'radial-gradient(ellipse at 30% 80%, rgba(255,178,74,0.08) 0%, transparent 60%)',
          pointerEvents: 'none',
          zIndex: 15,
        }} aria-hidden="true" />
      ) : (
        <GlslCanvas showPollen showSoot zIndex={15} />
      )}

      {/* 1440×900 stage — uniformly scaled to fit any desktop viewport */}
      <div
        style={{
          position: 'absolute',
          width: DESIGN_W,
          height: DESIGN_H,
          top: '50%',
          left: '50%',
          transform: `translate(-50%, -50%) scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Layer 1-3: Backdrop (wallpaper + dusk grade + horizon bloom) */}
        <DuskBackdrop />

        {/* Layer 4: Mascot contact shadow */}
        <div style={{
          position: 'absolute',
          left: 1126,
          top: 784,
          width: 164,
          height: 24,
          borderRadius: '50%',
          background: 'rgba(10, 20, 8, 0.36)',
          filter: 'blur(14px)',
          zIndex: 4,
          pointerEvents: 'none',
        }} aria-hidden="true" />

        {/* Layer 6: Hero group — centered */}
        <div style={{
          position: 'absolute',
          top: 118,
          left: '50%',
          transform: 'translateX(-50%)',
          zIndex: 6,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}>
          <HeroGroup onEnter={handleEnter} />
        </div>

        {/* Layer 7: Weather widget */}
        <div style={{ position: 'absolute', left: 72, top: 96, zIndex: 7 }}>
          <WelcomeWidget variant="weather" data={content.widgets.weather} />
        </div>

        {/* Layer 8: Now-playing widget */}
        <div style={{ position: 'absolute', left: 72, top: 560, zIndex: 8 }}>
          <WelcomeWidget variant="nowPlaying" data={content.widgets.nowPlaying} />
        </div>

        {/* Layer 9: Intention widget */}
        <div style={{ position: 'absolute', left: 1156, top: 128, zIndex: 9 }}>
          <WelcomeWidget variant="intention" data={content.widgets.intention} />
        </div>

        {/* Layer 10: Poem footer */}
        <div style={{
          position: 'absolute',
          bottom: 22,
          left: 0,
          right: 0,
          textAlign: 'center',
          zIndex: 10,
          pointerEvents: 'none',
        }}>
          <p style={{
            fontFamily: 'var(--font-newsreader, Newsreader, serif)',
            fontSize: 14,
            fontStyle: 'italic',
            color: 'rgba(243, 233, 212, 0.76)',
            margin: 0,
          }}>{content.poemFooter}</p>
        </div>

        {/* Layer 11: Mascot kitsune */}
        <div style={{
          position: 'absolute',
          left: 1086,
          top: 560,
          width: 240,
          height: 240,
          zIndex: 11,
          pointerEvents: 'none',
        }} aria-hidden="true">
          <Image
            src="/images/mascot/ghibli/idle-sg.webp"
            alt=""
            fill
            sizes="240px"
            style={{ objectFit: 'contain', objectPosition: 'bottom' }}
          />
        </div>

        {/* Layer 12: Memory widget */}
        <div style={{ position: 'absolute', left: 1156, top: 300, zIndex: 12 }}>
          <WelcomeWidget variant="memory" data={content.widgets.memory} />
        </div>

        {/* Decorative dandelions */}
        <div aria-hidden="true" style={{ position: 'absolute', left: 432, top: 298, zIndex: 13, width: 16, height: 16, transform: 'rotate(16deg)', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(253,250,242,0.85)', filter: 'blur(3px)' }} />
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', left: 902, top: 238, zIndex: 13, width: 13, height: 13, transform: 'rotate(-12deg)', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(253,250,242,0.85)', filter: 'blur(3px)' }} />
        </div>
        <div aria-hidden="true" style={{ position: 'absolute', left: 348, top: 452, zIndex: 13, width: 11, height: 11, transform: 'rotate(24deg)', pointerEvents: 'none' }}>
          <div style={{ width: '100%', height: '100%', borderRadius: '50%', background: 'rgba(253,250,242,0.85)', filter: 'blur(3px)' }} />
        </div>

        {/* Layer 14: Dock */}
        <div style={{
          position: 'absolute',
          left: '50%',
          top: 786,
          transform: 'translateX(-50%)',
          zIndex: 14,
        }}>
          <GlassDock
            tiles={content.dockTiles}
            onTileClick={handleTileClick}
          />
        </div>
      </div>

      {/* SEO: sr-only heading always in DOM */}
      <h1 className="sr-only">Manish Singh Parihar — Full Stack &amp; AI Engineer</h1>
    </div>
  );
}
