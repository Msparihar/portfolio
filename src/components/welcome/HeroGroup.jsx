'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';

function getGreeting(d) {
  const h = d.getHours();
  if (h < 5) return 'Good night, traveller';
  if (h < 12) return 'Good morning, traveller';
  if (h < 17) return 'Good afternoon, traveller';
  if (h < 21) return 'Good evening, traveller';
  return 'Good night, traveller';
}

function formatTime(d) {
  return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false });
}

function formatDate(d) {
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase();
}

export default function HeroGroup({ onEnter }) {
  const [now, setNow] = useState(() => new Date());
  const timerRef = useRef(null);
  const [avatarError, setAvatarError] = useState(false);

  useEffect(() => {
    const tick = () => {
      setNow(new Date());
      const ms = 1000 - (Date.now() % 1000);
      timerRef.current = setTimeout(tick, ms);
    };
    const ms = 1000 - (Date.now() % 1000);
    timerRef.current = setTimeout(tick, ms);
    return () => clearTimeout(timerRef.current);
  }, []);

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 0,
      userSelect: 'none',
    }}>
      {/* Avatar — /images/welcome/avatar.webp is a user-supplied photo; falls back to frosted disc if absent */}
      <div
        aria-label="Manish Singh Parihar — Full Stack & AI Engineer"
        role="img"
        style={{
          width: 74, height: 74, borderRadius: 999,
          background: 'rgba(255, 253, 247, 0.70)',
          border: '1.5px solid rgba(255, 255, 255, 0.60)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          marginBottom: 8,
          flexShrink: 0,
          overflow: 'hidden',
          position: 'relative',
        }}
      >
        {!avatarError && (
          <Image
            src="/images/welcome/avatar.webp"
            alt=""
            fill
            sizes="74px"
            style={{ objectFit: 'cover', borderRadius: 999 }}
            onError={() => setAvatarError(true)}
          />
        )}
      </div>

      {/* Greeting */}
      <p style={{
        fontFamily: 'var(--font-newsreader, Newsreader, serif)',
        fontSize: 23,
        fontStyle: 'italic',
        color: '#f9f4e8',
        textShadow: '0 0 8px rgba(0,0,0,0.35)',
        margin: '0 0 4px 0',
        lineHeight: 1.2,
      }}>
        {getGreeting(now)}
      </p>

      {/* Clock */}
      <time
        dateTime={now.toISOString()}
        aria-label={`Current time: ${formatTime(now)}`}
        style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 132,
          fontWeight: 500,
          color: '#fffdf6',
          lineHeight: 1,
          letterSpacing: -2,
          textShadow: '0 2px 24px rgba(0,0,0,0.30), 0 0 80px rgba(255,230,160,0.12)',
          margin: '2px 0 4px 0',
        }}
      >
        {formatTime(now)}
      </time>

      {/* Date */}
      <p style={{
        fontFamily: 'var(--font-geist, Geist, sans-serif)',
        fontSize: 14,
        fontWeight: 500,
        color: '#ece6d6',
        letterSpacing: 2,
        textShadow: '0 0 6px rgba(0,0,0,0.25)',
        margin: '0 0 18px 0',
      }}>
        {formatDate(now)}
      </p>

      {/* Enter chip */}
      <button
        type="button"
        onClick={onEnter}
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 14,
          borderRadius: 999,
          background: 'rgba(253, 250, 242, 0.90)',
          border: '1.5px solid rgba(255, 255, 255, 0.60)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          boxShadow: '0 8px 20px rgba(91, 110, 77, 0.25)',
          padding: '6px 6px 6px 22px',
          cursor: 'pointer',
          marginBottom: 6,
        }}
      >
        <span style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 17,
          color: '#33442f',
        }}>
          Enter the Garden
        </span>
        <span style={{
          width: 42, height: 42, borderRadius: '50%',
          background: 'linear-gradient(135deg, #5a9268, #3f6e4c)',
          boxShadow: '0 0 10px rgba(47, 93, 63, 0.40)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <span style={{
            fontFamily: 'Inter, sans-serif',
            fontSize: 19,
            fontWeight: 600,
            color: '#f7f3e8',
            lineHeight: 1,
          }}>→</span>
        </span>
      </button>

      {/* Swipe hint */}
      <p style={{
        fontFamily: 'var(--font-geist, Geist, sans-serif)',
        fontSize: 11,
        fontWeight: 500,
        color: 'rgba(241, 236, 219, 0.80)',
        letterSpacing: 1.5,
        textTransform: 'uppercase',
        margin: 0,
      }}>
        press enter or click to continue
      </p>
    </div>
  );
}
