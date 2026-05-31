'use client';

import { useEffect, useReducer, useRef, useState } from 'react';
import Image from 'next/image';
import { useReducedMotion } from 'framer-motion';
import MascotSpeech, { pickLine } from './MascotSpeech';
import { WORLD_STORAGE_KEY } from '@/config/worlds';

const BLINK_MS = 160;
const WAVE_MS = 1200;
const BLINK_MIN = 4000;
const BLINK_MAX = 7000;
const WAVE_MIN = 30000;
const WAVE_MAX = 60000;
const BUBBLE_MIN = 45000;
const BUBBLE_MAX = 90000;
const BUBBLE_SHOW_MS = 4000;

const rand = (min, max) => min + Math.random() * (max - min);

function reducer(state, action) {
  switch (action.type) {
    case 'BLINK':
      return state.pose === 'idle' ? { pose: 'blink' } : state;
    case 'WAVE':
      return state.pose === 'idle' ? { pose: 'wave' } : state;
    case 'IDLE':
      return { pose: 'idle' };
    default:
      return state;
  }
}

function readWorldId() {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(WORLD_STORAGE_KEY) || null;
}

export default function Mascot({ poses, alt, size = 112 }) {
  const [state, dispatch] = useReducer(reducer, { pose: 'idle' });
  const timersRef = useRef([]);
  const prefersReducedRef = useRef(false);
  const lastInteractRef = useRef(0);

  const [bubbleText, setBubbleText] = useState(null);
  const [hovered, setHovered] = useState(false);

  const reduced = useReducedMotion();

  // Random blink / wave loop + speech bubble loop
  useEffect(() => {
    const mq = typeof window !== 'undefined' && window.matchMedia
      ? window.matchMedia('(prefers-reduced-motion: reduce)')
      : null;
    prefersReducedRef.current = !!mq?.matches;

    const onChange = (e) => { prefersReducedRef.current = e.matches; };
    mq?.addEventListener?.('change', onChange);

    const clearAll = () => {
      timersRef.current.forEach(clearTimeout);
      timersRef.current = [];
    };

    const scheduleBlink = () => {
      if (prefersReducedRef.current) return;
      const t = setTimeout(() => {
        dispatch({ type: 'BLINK' });
        const t2 = setTimeout(() => {
          dispatch({ type: 'IDLE' });
          scheduleBlink();
        }, BLINK_MS);
        timersRef.current.push(t2);
      }, rand(BLINK_MIN, BLINK_MAX));
      timersRef.current.push(t);
    };

    const scheduleWave = () => {
      if (prefersReducedRef.current) return;
      const t = setTimeout(() => {
        dispatch({ type: 'WAVE' });
        const t2 = setTimeout(() => {
          dispatch({ type: 'IDLE' });
          scheduleWave();
        }, WAVE_MS);
        timersRef.current.push(t2);
      }, rand(WAVE_MIN, WAVE_MAX));
      timersRef.current.push(t);
    };

    const showBubble = (wId) => {
      const line = pickLine(wId ?? readWorldId());
      setBubbleText(line);
      const t = setTimeout(() => setBubbleText(null), BUBBLE_SHOW_MS);
      timersRef.current.push(t);
    };

    const scheduleBubble = () => {
      if (prefersReducedRef.current) return;
      const t = setTimeout(() => {
        showBubble(null);
        scheduleBubble();
      }, rand(BUBBLE_MIN, BUBBLE_MAX));
      timersRef.current.push(t);
    };

    scheduleBlink();
    scheduleWave();
    scheduleBubble();

    const onExternalTrigger = () => {
      dispatch({ type: 'WAVE' });
      const t = setTimeout(() => dispatch({ type: 'IDLE' }), WAVE_MS);
      timersRef.current.push(t);
      showBubble(null);
    };
    window.addEventListener('mascot-clicked', onExternalTrigger);

    return () => {
      clearAll();
      window.removeEventListener('mascot-clicked', onExternalTrigger);
      mq?.removeEventListener?.('change', onChange);
    };
  }, []);

  if (!poses || !poses.idle) return null;

  const handleInteract = () => {
    const now = Date.now();
    if (now - lastInteractRef.current < 1200) return;
    lastInteractRef.current = now;
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mascot-clicked'));
    }
  };

  if (import.meta.env.DEV && state.pose !== 'idle' && !poses[state.pose]) {
    console.warn(`[Mascot] missing sprite for pose "${state.pose}", falling back to idle`);
  }

  return (
    <div
      style={{
        position: 'fixed',
        right: 'calc(var(--dt-iconstrip-width, 64px) + 16px)',
        bottom: 16,
        width: size,
        height: size,
        zIndex: 50,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <MascotSpeech text={bubbleText} size={size} />

      {hovered && !bubbleText && alt && (
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            bottom: size + 8,
            right: 0,
            background: 'var(--dt-bubble-bg, rgba(15,15,15,0.82))',
            color: 'var(--dt-bubble-fg, #f0ece4)',
            border: '1px solid var(--dt-bubble-border, rgba(255,255,255,0.10))',
            borderRadius: 6,
            padding: '4px 9px',
            fontSize: 11,
            fontFamily: 'var(--dt-font-body, sans-serif)',
            letterSpacing: '0.03em',
            whiteSpace: 'nowrap',
            pointerEvents: 'none',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
            opacity: reduced ? 1 : undefined,
          }}
        >
          {alt}
        </div>
      )}

      <button
        type="button"
        aria-label={alt || 'Friendly mascot — click to wave'}
        onMouseEnter={handleInteract}
        onClick={handleInteract}
        className="mascot-bob"
        style={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: 'transparent',
          border: 'none',
          padding: 0,
          cursor: 'pointer',
          animation: 'mascot-bob 3.6s ease-in-out infinite',
          filter: 'var(--dt-mascot-shadow, drop-shadow(0 6px 12px rgba(0,0,0,0.35)))',
        }}
      >
        {['idle', 'blink', 'wave'].map((pose) => {
          const src = poses[pose];
          if (!src) return null;
          const isActive = state.pose === pose;
          return (
            <Image
              key={pose}
              src={src}
              alt=""
              width={size}
              height={size}
              priority={pose === 'idle'}
              draggable={false}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                opacity: isActive ? 1 : 0,
                transition: 'opacity 140ms ease',
                pointerEvents: 'none',
              }}
            />
          );
        })}
      </button>
    </div>
  );
}
