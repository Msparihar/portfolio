'use client';

/**
 * Full-screen world tint overlay.
 * Reads --dt-tint-color (background image/gradient) and --dt-tint-opacity (0..1)
 * Sits between the wallpaper/gradient layers (z 0..1) and the windows (z 100+).
 * pointer-events: none so it never blocks clicks or right-click context menu.
 */
export default function TintOverlay() {
  return (
    <div
      aria-hidden="true"
      className="absolute inset-0 pointer-events-none"
      style={{
        backgroundImage: 'var(--dt-tint-color, none)',
        opacity: 'var(--dt-tint-opacity, 0)',
        mixBlendMode: 'multiply',
        zIndex: 5,
        transition: 'opacity 400ms ease',
      }}
    />
  );
}
