'use client';

import Image from 'next/image';

/**
 * Static themed kitsune mascot rendered in the bottom-right of the desktop.
 * Positioned to the LEFT of the right IconStrip so it doesn't overlap.
 * Idle bob via CSS keyframe in globals.css (transform only — no layout thrash).
 * pointer-events: none so it never blocks ContextMenu or window dragging.
 */
export default function Mascot({ src, alt }) {
  if (!src) return null;

  return (
    <div
      aria-hidden="true"
      className="mascot-bob"
      style={{
        position: 'fixed',
        right: 'calc(var(--dt-iconstrip-width, 64px) + 16px)',
        bottom: 16,
        width: 110,
        height: 110,
        pointerEvents: 'none',
        zIndex: 50,
        animation: 'mascot-bob 3.6s ease-in-out infinite',
        filter: 'drop-shadow(0 6px 12px rgba(0,0,0,0.35))',
      }}
    >
      <Image
        src={src}
        alt={alt || 'Mascot'}
        width={110}
        height={110}
        priority={false}
        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
        draggable={false}
      />
    </div>
  );
}
