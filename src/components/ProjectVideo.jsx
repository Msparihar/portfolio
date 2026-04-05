"use client";

import { useEffect, useRef } from 'react';

const FILL_STYLE = { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' };
const EMPTY_STYLE = {};

export default function ProjectVideo({ src, alt, fill, className, onLoad }) {
  const videoRef = useRef(null);
  const mp4Src = src.replace('.webm', '.mp4');
  const posterSrc = src.replace('.webm', '-poster.png');

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');

    // Play or pause based on current preference
    if (mediaQuery.matches) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }

    const handleChange = (e) => {
      if (e.matches) {
        video.pause();
      } else {
        video.play().catch(() => {});
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  return (
    <video
      ref={videoRef}
      muted
      loop
      playsInline
      aria-label={alt}
      poster={posterSrc}
      className={className}
      style={fill ? FILL_STYLE : EMPTY_STYLE}
      onLoadedData={onLoad}
    >
      <source src={src} type="video/webm" />
      <source src={mp4Src} type="video/mp4" />
    </video>
  );
}
