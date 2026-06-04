'use client';

import Image from 'next/image';

export default function DuskBackdrop({
  wallpaperSrc = '/images/worlds/ghibli/wallpaper.webp',
}) {
  return (
    <div
      style={{ position: 'absolute', inset: 0, overflow: 'hidden', zIndex: 0 }}
      aria-hidden="true"
    >
      <Image
        src={wallpaperSrc}
        alt=""
        fill
        priority
        sizes="100vw"
        style={{
          objectFit: 'cover',
          objectPosition: 'center',
          transform: 'scale(1.056) translate(-2.78%, -4.44%)',
          filter: 'blur(13px)',
        }}
      />

      {/* dusk-grade: 180° linear */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(180deg,
            rgba(13, 26, 40, 0.70) 0%,
            rgba(32, 48, 46, 0.55) 38%,
            rgba(94, 71, 38, 0.45) 68%,
            rgba(10, 20, 12, 0.93) 100%)`,
        }}
      />

      {/* horizon-bloom: radial warm glow */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse 100% 60% at 50% 72%, rgba(255,207,120,0.25) 0%, transparent 70%)',
        }}
      />
    </div>
  );
}
