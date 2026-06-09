'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import { useEffect, useRef } from 'react';

const GLASS = {
  background: 'rgba(253, 250, 242, 0.96)',
  border: '1.5px solid rgba(255, 255, 255, 0.70)',
  backdropFilter: 'blur(20px)',
  WebkitBackdropFilter: 'blur(20px)',
  boxShadow: '0 24px 64px rgba(75, 94, 61, 0.28)',
  borderRadius: 22,
};

function Label({ children }) {
  return (
    <span style={{
      display: 'block',
      fontFamily: 'var(--font-geist, Geist, sans-serif)',
      fontSize: 10,
      fontWeight: 600,
      letterSpacing: 2,
      color: '#6f7e63',
      textTransform: 'uppercase',
      marginBottom: 14,
    }}>
      {children}
    </span>
  );
}

function CloseButton({ onClose }) {
  return (
    <button
      type="button"
      aria-label="Close"
      onClick={onClose}
      style={{
        position: 'absolute',
        top: 16,
        right: 16,
        width: 28,
        height: 28,
        borderRadius: '50%',
        background: 'rgba(51, 68, 47, 0.12)',
        border: 'none',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: '#52634a',
        fontSize: 14,
        lineHeight: 1,
        padding: 0,
        flexShrink: 0,
      }}
    >
      ✕
    </button>
  );
}

function WeatherExpanded({ data, layoutId, onClose, prefersReducedMotion }) {
  return (
    <motion.div
      layoutId={layoutId}
      style={{ ...GLASS, width: 340, padding: 24, position: 'relative' }}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? false : { opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <CloseButton onClose={onClose} />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
        <span style={{ fontSize: 28 }}>{data.icon}</span>
        <span style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 20,
          color: '#33442f',
        }}>{data.condition}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 20 }}>
        <span style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 56,
          fontWeight: 500,
          color: '#33442f',
          lineHeight: 1,
        }}>{data.temp}</span>
        <span style={{
          fontFamily: 'var(--font-geist, Geist, sans-serif)',
          fontSize: 12,
          color: '#52634a',
        }}>{data.sub}</span>
      </div>

      {data.forecast && (
        <>
          <Label>OVER THE MEADOW</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 18 }}>
            {data.forecast.map((entry) => (
              <div key={entry.time} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 10px',
                borderRadius: 10,
                background: 'rgba(74, 124, 89, 0.08)',
              }}>
                <span style={{
                  fontFamily: 'var(--font-geist, Geist, sans-serif)',
                  fontSize: 11,
                  color: '#6f7e63',
                  textTransform: 'lowercase',
                  width: 36,
                }}>{entry.time}</span>
                <span style={{
                  fontFamily: 'var(--font-newsreader, Newsreader, serif)',
                  fontSize: 16,
                  color: '#33442f',
                  fontWeight: 500,
                  width: 36,
                  textAlign: 'center',
                }}>{entry.temp}</span>
                <span style={{
                  fontFamily: 'var(--font-geist, Geist, sans-serif)',
                  fontSize: 11,
                  color: '#52634a',
                  fontStyle: 'italic',
                }}>{entry.note}</span>
              </div>
            ))}
          </div>
        </>
      )}

      {data.skyNote && (
        <p style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 13,
          fontStyle: 'italic',
          color: '#6f7e63',
          margin: 0,
        }}>{data.skyNote}</p>
      )}
    </motion.div>
  );
}

function NowPlayingExpanded({ data, layoutId, onClose, prefersReducedMotion }) {
  return (
    <motion.div
      layoutId={layoutId}
      style={{ ...GLASS, width: 360, padding: 24, position: 'relative' }}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? false : { opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <CloseButton onClose={onClose} />
      <Label>{data.label}</Label>

      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 16 }}>
        <div style={{
          width: 72, height: 72, borderRadius: 16, flexShrink: 0,
          background: 'linear-gradient(135deg, #7fb08a, #4a7c59)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ fontFamily: 'Inter, sans-serif', fontSize: 28, color: '#f7f3e8' }}>♪</span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontFamily: 'var(--font-newsreader, Newsreader, serif)',
            fontSize: 20,
            color: '#33442f',
            marginBottom: 4,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{data.song}</div>
          <div style={{
            fontFamily: 'var(--font-geist, Geist, sans-serif)',
            fontSize: 12,
            color: '#6f7e63',
            marginBottom: 14,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}>{data.artist}</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <span style={{ fontSize: 18, cursor: 'default', color: '#52634a' }}>⏮</span>
            <span style={{ fontSize: 22, cursor: 'default', color: '#33442f' }}>⏸</span>
            <span style={{ fontSize: 18, cursor: 'default', color: '#52634a' }}>⏭</span>
          </div>
        </div>
      </div>

      <div style={{
        height: 5, borderRadius: 999,
        background: 'rgba(51, 68, 47, 0.15)',
        marginBottom: 6, overflow: 'hidden',
      }}>
        <div style={{
          height: '100%',
          width: `${data.progress}%`,
          background: '#4a7c59',
          borderRadius: 999,
        }} />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <span style={{ fontFamily: 'var(--font-geist, Geist, sans-serif)', fontSize: 10, color: '#6f7e63' }}>{data.elapsed}</span>
        <span style={{ fontFamily: 'var(--font-geist, Geist, sans-serif)', fontSize: 10, color: '#6f7e63' }}>{data.duration}</span>
      </div>

      {data.playlist && (
        <>
          <Label>FROM THE GROVE'S PLAYLIST</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {data.playlist.map((track) => (
              <div key={track} style={{
                fontFamily: 'var(--font-newsreader, Newsreader, serif)',
                fontSize: 13,
                color: '#52634a',
                padding: '5px 0',
                borderBottom: '1px solid rgba(51, 68, 47, 0.08)',
              }}>{track}</div>
            ))}
          </div>
        </>
      )}
    </motion.div>
  );
}

function IntentionExpanded({ data, layoutId, onClose, prefersReducedMotion }) {
  return (
    <motion.div
      layoutId={layoutId}
      style={{ ...GLASS, width: 320, padding: 24, position: 'relative' }}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? false : { opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <CloseButton onClose={onClose} />
      <Label>{data.label}</Label>

      <p style={{
        fontFamily: 'var(--font-newsreader, Newsreader, serif)',
        fontSize: 24,
        fontStyle: 'italic',
        color: '#33442f',
        lineHeight: 1.35,
        margin: '0 0 14px 0',
      }}>{data.quote}</p>

      {data.reflection && (
        <p style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 13,
          fontStyle: 'italic',
          color: '#6f7e63',
          margin: '0 0 20px 0',
          lineHeight: 1.55,
        }}>{data.reflection}</p>
      )}

      {data.tasks && (
        <>
          <Label>TODAY</Label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {data.tasks.map((task) => (
              <div key={task.text} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{
                  width: 18, height: 18, borderRadius: '50%', flexShrink: 0,
                  background: task.done ? '#4a7c59' : 'transparent',
                  border: task.done ? 'none' : '1.5px solid rgba(51, 68, 47, 0.30)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {task.done && <span style={{ color: '#fff', fontSize: 10, lineHeight: 1 }}>✓</span>}
                </div>
                <span style={{
                  fontFamily: 'var(--font-geist, Geist, sans-serif)',
                  fontSize: 13,
                  color: task.done ? '#6f7e63' : '#33442f',
                  textDecoration: task.done ? 'line-through' : 'none',
                }}>{task.text}</span>
              </div>
            ))}
          </div>
        </>
      )}

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        borderRadius: 999,
        background: 'rgba(74, 124, 89, 0.15)',
        padding: '5px 12px',
      }}>
        <span style={{ fontSize: 12 }}>🌱</span>
        <span style={{
          fontFamily: 'var(--font-geist, Geist, sans-serif)',
          fontSize: 12,
          fontWeight: 500,
          color: '#3f6e4c',
        }}>in progress</span>
      </div>
    </motion.div>
  );
}

function MemoryExpanded({ data, layoutId, onClose, prefersReducedMotion }) {
  return (
    <motion.div
      layoutId={layoutId}
      style={{ ...GLASS, width: 320, padding: 18, position: 'relative' }}
      initial={prefersReducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={prefersReducedMotion ? false : { opacity: 0 }}
      transition={{ duration: 0.22, ease: 'easeOut' }}
    >
      <CloseButton onClose={onClose} />
      <Label>{data.label}</Label>
      <div style={{
        width: '100%',
        height: 180,
        borderRadius: 14,
        overflow: 'hidden',
        marginBottom: 14,
        position: 'relative',
      }}>
        <Image
          src={data.imageSrc}
          alt={data.caption}
          fill
          sizes="320px"
          style={{ objectFit: 'cover' }}
        />
      </div>
      <p style={{
        fontFamily: 'var(--font-newsreader, Newsreader, serif)',
        fontSize: 15,
        fontStyle: 'italic',
        color: '#33442f',
        margin: '0 0 10px 0',
        fontWeight: 500,
      }}>{data.caption}</p>
      {data.story && (
        <p style={{
          fontFamily: 'var(--font-newsreader, Newsreader, serif)',
          fontSize: 13,
          fontStyle: 'italic',
          color: '#6f7e63',
          margin: 0,
          lineHeight: 1.6,
        }}>{data.story}</p>
      )}
    </motion.div>
  );
}

export default function ExpandedCard({ variant, data, layoutId, onClose, prefersReducedMotion }) {
  const dialogRef = useRef(null);
  const previousFocusRef = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  useEffect(() => {
    previousFocusRef.current = document.activeElement;
    const frame = requestAnimationFrame(() => {
      const closeBtn = dialogRef.current?.querySelector('button');
      (closeBtn ?? dialogRef.current)?.focus();
    });
    return () => {
      cancelAnimationFrame(frame);
      previousFocusRef.current?.focus();
    };
  }, []);

  const sharedProps = { data, layoutId, onClose, prefersReducedMotion };

  return (
    <motion.div
      ref={dialogRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      onClick={onClose}
      style={{
        position: 'absolute',
        inset: 0,
        background: 'rgba(10, 20, 8, 0.45)',
        backdropFilter: prefersReducedMotion ? 'none' : 'blur(4px)',
        WebkitBackdropFilter: prefersReducedMotion ? 'none' : 'blur(4px)',
        zIndex: 15,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      aria-modal="true"
      role="dialog"
      aria-label={`${variant} details`}
    >
      <div onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.stopPropagation()}>
        {variant === 'weather'    && <WeatherExpanded    {...sharedProps} />}
        {variant === 'nowPlaying' && <NowPlayingExpanded {...sharedProps} />}
        {variant === 'intention'  && <IntentionExpanded  {...sharedProps} />}
        {variant === 'memory'     && <MemoryExpanded     {...sharedProps} />}
      </div>
    </motion.div>
  );
}
