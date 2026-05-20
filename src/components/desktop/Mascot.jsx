'use client';

import { useEffect, useReducer, useRef } from 'react';
import Image from 'next/image';

/**
 * Animated sprite-based kitsune mascot rendered bottom-right of the desktop.
 * Three poses: idle | blink | wave. Crossfades between sprites on state change.
 * - Random blink every 4-7s (~150ms)
 * - Random wave every 30-60s (~1.2s) or on hover/click
 * - Click dispatches a 'mascot-clicked' window event for easter egg wiring
 * - prefers-reduced-motion: stays in idle pose, no random triggers
 */

const BLINK_MS = 160;
const WAVE_MS = 1200;
const BLINK_MIN = 4000;
const BLINK_MAX = 7000;
const WAVE_MIN = 30000;
const WAVE_MAX = 60000;

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

export default function Mascot({ poses, alt, size = 112 }) {
  // poses = { idle, blink, wave } — all required for animation; fall back to idle if any missing
  const [state, dispatch] = useReducer(reducer, { pose: 'idle' });
  const timersRef = useRef([]);
  const prefersReducedRef = useRef(false);

  // Random blink / wave loop
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

    scheduleBlink();
    scheduleWave();

    // External trigger: anyone (terminal `sudo summon`, moon-3-click egg, etc.)
    // can fire `mascot-clicked` on window to make the mascot wave.
    const onExternalTrigger = () => {
      dispatch({ type: 'WAVE' });
      const t = setTimeout(() => dispatch({ type: 'IDLE' }), WAVE_MS);
      timersRef.current.push(t);
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
    // Route through the window event so the wave/idle scheduling lives in one
    // place (the listener installed above). Other features can trigger the
    // same animation by firing `mascot-clicked`.
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('mascot-clicked'));
    }
  };

  const currentSrc = poses[state.pose] || poses.idle;

  return (
    <button
      type="button"
      aria-label={alt || 'Friendly mascot — click to wave'}
      onMouseEnter={handleInteract}
      onClick={handleInteract}
      className="mascot-bob"
      style={{
        position: 'fixed',
        right: 'calc(var(--dt-iconstrip-width, 64px) + 16px)',
        bottom: 16,
        width: size,
        height: size,
        background: 'transparent',
        border: 'none',
        padding: 0,
        cursor: 'pointer',
        zIndex: 50,
        animation: 'mascot-bob 3.6s ease-in-out infinite',
        filter: 'var(--dt-mascot-shadow, drop-shadow(0 6px 12px rgba(0,0,0,0.35)))',
      }}
    >
      {/* Layered sprites with crossfade — only currentSrc is opaque */}
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
  );
}
