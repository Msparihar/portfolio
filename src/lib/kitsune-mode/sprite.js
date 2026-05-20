/**
 * Sprite renderer for the kitsune mascot.
 *
 * TODO(v0.8.1): replace placeholder PNG with 8-frame walk-cycle sprite sheet.
 * Current implementation draws the single placeholder image at 64×64 px with:
 *   - horizontal flip via ctx.scale(-1,1) for direction
 *   - 200ms-period scale wobble (1.0→1.05) during walking to fake locomotion
 *   - slight rotation toward velocity direction while falling
 *
 * The image is preloaded on first call so the rAF loop never blocks on a decode.
 */

const SPRITE_SIZE = 64;
const WOBBLE_PERIOD = 200; // ms — full wobble cycle length
const WOBBLE_AMP    = 0.05; // scale amplitude (+/- from 1.0)

// Preloaded Image instance (lazy singleton)
let _img = null;
let _imgReady = false;

function ensureImage() {
  if (_img) return;
  _img = new Image();
  _img.src = '/images/mascot/ghibli-watercolor/02-walking.png';
  _img.onload = () => { _imgReady = true; };
}

/**
 * Draw the kitsune sprite onto the canvas context.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {{ x: number, y: number, state: string, facingLeft: boolean, vy: number, now: number }} opts
 */
export function drawKitsune(ctx, { x, y, state, facingLeft, vy, now }) {
  ensureImage();
  if (!_imgReady) return;

  const half = SPRITE_SIZE / 2;

  ctx.save();
  ctx.translate(x, y);

  // ── Direction flip ────────────────────────────────────────────────────────
  if (facingLeft) {
    ctx.scale(-1, 1);
  }

  // ── State-specific transforms ─────────────────────────────────────────────
  if (state === 'walk-left' || state === 'walk-right') {
    // Scale wobble: sine wave over time simulates leg movement
    const wobble = 1.0 + WOBBLE_AMP * Math.sin((now / WOBBLE_PERIOD) * Math.PI * 2);
    ctx.scale(wobble, wobble);
  } else if (state === 'fall' || state === 'jump') {
    // Lean slightly in the direction of vertical velocity (positive vy = falling)
    const tilt = (vy / 20) * 0.3; // max ~0.3 rad at terminal velocity
    ctx.rotate(facingLeft ? -tilt : tilt);
  }

  // ── Draw image centered on (0,0) ──────────────────────────────────────────
  ctx.drawImage(_img, -half, -half, SPRITE_SIZE, SPRITE_SIZE);

  ctx.restore();
}
