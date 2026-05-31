'use client';

import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';

const WORLD_LINES = {
  'elden-ring': [
    'The grace fades… but not yet.',
    'Seek strength. It is all that endures.',
    'Tarnished, you persist.',
    'Death is not the end here.',
    'The Erdtree watches.',
  ],
  ghibli: [
    'The forest remembers you.',
    'Breathe. The world is kind today.',
    'Even soot sprites rest sometimes.',
    'Follow the wind a little.',
    'Something warm is waiting.',
  ],
  got: [
    'All men must click, eventually.',
    'Winter is always loading.',
    'Power is such a curious thing.',
    'You know nothing — yet.',
    'The realm endures. Mostly.',
  ],
};

const FALLBACK_LINES = [
  'Hello there.',
  'Still here.',
  '…',
  'Curiosity suits you.',
];

export function pickLine(worldId) {
  const pool = WORLD_LINES[worldId] ?? FALLBACK_LINES;
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function MascotSpeech({ text, size }) {
  const reduced = useReducedMotion();

  const initial = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.7, y: 8 };
  const animate = reduced ? { opacity: 1 } : { opacity: 1, scale: 1, y: 0 };
  const exit    = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.8, y: 4 };

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          key={text}
          initial={initial}
          animate={animate}
          exit={exit}
          transition={{ duration: reduced ? 0 : 0.18, ease: 'easeOut' }}
          style={{
            position: 'absolute',
            bottom: size + 12,
            right: 0,
            maxWidth: 220,
            minWidth: 120,
            background: 'var(--dt-bubble-bg, rgba(15,15,15,0.88))',
            color: 'var(--dt-bubble-fg, #f0ece4)',
            border: '1px solid var(--dt-bubble-border, rgba(255,255,255,0.12))',
            borderRadius: 10,
            padding: '7px 11px',
            fontSize: 12,
            lineHeight: 1.45,
            fontFamily: 'var(--dt-font-body, sans-serif)',
            letterSpacing: '0.01em',
            pointerEvents: 'none',
            whiteSpace: 'normal',
            textAlign: 'center',
            transformOrigin: 'bottom right',
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            zIndex: 51,
          }}
          role="status"
          aria-live="polite"
          aria-atomic="true"
        >
          {text}
          {/* tail */}
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              bottom: -7,
              right: 18,
              width: 0,
              height: 0,
              borderLeft: '7px solid transparent',
              borderRight: '7px solid transparent',
              borderTop: '7px solid var(--dt-bubble-bg, rgba(15,15,15,0.88))',
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
}
