'use client';

import { useEffect, useRef } from 'react';

// ─── Particle type renderers ──────────────────────────────────────────────────

function drawPollen(ctx, p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 240, 180, ${p.alpha})`;
  ctx.fill();
}

function drawPetal(ctx, p) {
  ctx.save();
  ctx.translate(p.x, p.y);
  ctx.rotate(p.rot);
  ctx.beginPath();
  ctx.ellipse(0, 0, p.r * 2.2, p.r * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(255, 180, 180, ${p.alpha})`;
  ctx.fill();
  ctx.restore();
}

function drawDust(ctx, p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(200, 190, 175, ${p.alpha * 0.65})`;
  ctx.fill();
}

function drawSnow(ctx, p) {
  ctx.beginPath();
  ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
  ctx.fillStyle = `rgba(235, 245, 255, ${p.alpha})`;
  ctx.fill();
}

const RENDERERS = {
  pollen: drawPollen,
  petal:  drawPetal,
  dust:   drawDust,
  snow:   drawSnow,
};

// ─── Particle initializer ─────────────────────────────────────────────────────

function initParticle(p, config, W, H) {
  p.x     = Math.random() * W;
  p.y     = Math.random() * H;
  p.vy    = config.speed * (0.5 + Math.random() * 1.0);
  p.vx    = config.windX * (0.5 + Math.random() * 1.0);
  p.r     = 1.5 + Math.random() * 2.5;
  p.alpha = 0.3 + Math.random() * 0.55;
  p.rot   = Math.random() * Math.PI * 2;
  p.drot  = (Math.random() - 0.5) * 0.02;
  return p;
}

function buildParticlePool(config, W, H) {
  const pool = [];
  for (let i = 0; i < config.count; i++) {
    const p = initParticle({}, config, W, H);
    // Stagger initial Y so they don't all appear at once
    p.y = Math.random() * H;
    pool.push(p);
  }
  return pool;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * Fullscreen particle canvas overlay.
 *
 * Props:
 *   config  — { type, count, speed, windX }
 *   enabled — boolean; when false the canvas renders nothing
 *
 * Architecture:
 *   Single rAF loop (tickParticles) iterates the pool array.
 *   No per-particle interval or timeout. Particles recycle via Y threshold —
 *   when a particle drifts past the bottom, it resets to y=0 with a fresh X.
 *   DPR is capped at 2 to avoid perf hits on HiDPI displays.
 *   Resize is debounced 100ms; rebuilds the pool on significant size change.
 *   Tab-visibility pauses the rAF to save CPU when the page is hidden.
 */
export default function ParticleCanvas({ config, enabled }) {
  const canvasRef = useRef(null);
  // Refs so the rAF closure always reads the latest values without re-mounting
  const poolRef    = useRef([]);
  const rafRef     = useRef(null);
  const configRef  = useRef(config);
  const enabledRef = useRef(enabled);
  const sizeRef    = useRef({ W: 0, H: 0, dpr: 1 });

  // Keep refs in sync with props without restarting the loop
  useEffect(() => { configRef.current  = config;  }, [config]);
  useEffect(() => { enabledRef.current = enabled; }, [enabled]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // ── Resize ────────────────────────────────────────────────────────────────
    function applySize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const W   = window.innerWidth;
      const H   = window.innerHeight;
      canvas.width  = W * dpr;
      canvas.height = H * dpr;
      canvas.style.width  = `${W}px`;
      canvas.style.height = `${H}px`;
      ctx.scale(dpr, dpr);
      sizeRef.current = { W, H, dpr };
      // Rebuild pool so particles fill the new dimensions
      poolRef.current = buildParticlePool(configRef.current, W, H);
    }

    applySize();

    let resizeTimer = null;
    function onResize() {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(applySize, 100);
    }
    window.addEventListener('resize', onResize);

    // ── rAF loop ──────────────────────────────────────────────────────────────
    function tickParticles() {
      rafRef.current = requestAnimationFrame(tickParticles);

      if (!enabledRef.current) {
        ctx.clearRect(0, 0, sizeRef.current.W, sizeRef.current.H);
        return;
      }

      const { W, H }  = sizeRef.current;
      const cfg       = configRef.current;
      const renderer  = RENDERERS[cfg.type] ?? drawDust;
      const pool      = poolRef.current;

      ctx.clearRect(0, 0, W, H);

      for (let i = 0; i < pool.length; i++) {
        const p  = pool[i];
        p.x     += p.vx;
        p.y     += p.vy;
        p.rot   += p.drot;

        // Recycle: when particle drifts below bottom, reset to top with new X
        if (p.y > H + p.r * 2) {
          p.x   = Math.random() * W;
          p.y   = -p.r * 2;
          p.vx  = cfg.windX * (0.5 + Math.random() * 1.0);
          p.vy  = cfg.speed * (0.5 + Math.random() * 1.0);
        }

        renderer(ctx, p);
      }
    }

    rafRef.current = requestAnimationFrame(tickParticles);

    // ── Visibility ────────────────────────────────────────────────────────────
    function onVisibilityChange() {
      if (document.hidden) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      } else if (!rafRef.current) {
        rafRef.current = requestAnimationFrame(tickParticles);
      }
    }
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(resizeTimer);
      window.removeEventListener('resize', onResize);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
    // Intentionally no deps — loop lifecycle is self-contained, config/enabled read via refs
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <canvas
      ref={canvasRef}
      style={{
        position:      'absolute',
        inset:         0,
        pointerEvents: 'none',
        zIndex:        6,
      }}
    />
  );
}
