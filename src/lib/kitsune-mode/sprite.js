/**
 * Sprite renderer for the kitsune mascot.
 *
 * Draws from an 8-frame walk-cycle strip (1600×200 px, 200×200 per frame,
 * frame 0 at the left). The art faces LEFT in every frame, with the paws
 * resting 4 px above the bottom edge of the cell.
 *   - walking: steps through the 8 frames on the clock (`now`), ~10 fps
 *   - idle / land / fall / jump: holds a single still frame
 *   - horizontal flip via ctx.scale(-1,1) when the fox should face RIGHT
 *   - slight nose-down/nose-up tilt from vertical velocity while falling/jumping
 *   - drawn at 64×64 px, nudged down so the paws (not the cell edge) sit on
 *     the engine's foot line at y + 32
 *
 * The image is preloaded on first call so the rAF loop never blocks on a decode.
 */

const SPRITE_SIZE    = 64;  // on-screen px — engine.js assumes feet at y + 32
const FRAME_SIZE     = 200; // source px per frame (square cells)
const FRAME_COUNT    = 8;
const FRAME_DURATION = 100; // ms per walk frame (~10 fps)
const STILL_FRAME    = 0;   // frame held in every non-walking state
const FOOT_PAD       = 4;   // source px of empty space below the paws

// Preloaded Image instance (lazy singleton)
let _img = null;
let _imgReady = false;

function ensureImage() {
  if (_img) return;
  _img = new Image();
  _img.src = '/images/mascot/ghibli-watercolor/kitsune-walk.png';
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

  const half    = SPRITE_SIZE / 2;
  const walking = state === 'walk-left' || state === 'walk-right';

  // ── Frame pick ────────────────────────────────────────────────────────────
  const frame = walking
    ? Math.floor(now / FRAME_DURATION) % FRAME_COUNT
    : STILL_FRAME;

  ctx.save();
  ctx.translate(x, y);

  // ── Direction flip ────────────────────────────────────────────────────────
  // The art faces left, so mirror it only when the fox faces right.
  if (!facingLeft) {
    ctx.scale(-1, 1);
  }

  // ── State-specific transforms ─────────────────────────────────────────────
  if (state === 'fall' || state === 'jump') {
    // Lean slightly in the direction of vertical velocity (positive vy = falling)
    const tilt = (vy / 20) * 0.3; // max ~0.3 rad at terminal velocity
    // Negative rotation dips the nose of the left-facing art; the flip above
    // mirrors it for free, so one sign works for both directions.
    ctx.rotate(-tilt);
  }

  // ── Draw frame centered on (0,0), paws on the foot line ───────────────────
  const footShift = FOOT_PAD * (SPRITE_SIZE / FRAME_SIZE);
  ctx.drawImage(
    _img,
    frame * FRAME_SIZE, 0, FRAME_SIZE, FRAME_SIZE,
    -half, -half + footShift, SPRITE_SIZE, SPRITE_SIZE,
  );

  ctx.restore();
}
