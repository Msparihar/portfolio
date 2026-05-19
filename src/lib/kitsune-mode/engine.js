/**
 * KitsuneEngine — DOM-platform walker engine.
 *
 * Pure JS (no framework deps). One rAF loop drives physics + state.
 * Platform list is refreshed by setInterval (decoupled from rAF).
 *
 * States: idle | walk-left | walk-right | jump | fall | land
 */

const GRAVITY       = 0.55;   // px/frame² — how fast the fox accelerates downward
const WALK_SPEED    = 1.8;    // px/frame horizontal when walking
const JUMP_VEL      = -12;    // initial Y velocity on jump (negative = upward)
const LAND_FRAMES   = 18;     // frames to stay in 'land' state before resuming
const IDLE_INTERVAL = 3000;   // ms between idle → walking decisions
const WALK_DIR_CHANGE_CHANCE = 0.005; // per-frame chance to reverse direction while walking
const JUMP_CHANCE   = 0.015;  // per-frame chance to jump while walking (if platform above)

export class KitsuneEngine {
  /**
   * @param {HTMLCanvasElement} canvas
   * @param {{ platformSelector: string, viewportPadding: { top: number }, minWidth: number }} opts
   */
  constructor(canvas, opts = {}) {
    this._canvas   = canvas;
    this._ctx      = canvas.getContext('2d');
    this._opts     = {
      platformSelector: opts.platformSelector ?? '[data-kitsune-platform]',
      viewportPadding:  opts.viewportPadding  ?? { top: 100 },
      minWidth:         opts.minWidth         ?? 50,
    };

    // Physics state
    this._x  = window.innerWidth  / 2;
    this._y  = 0; // starts at top, falls to first platform
    this._vx = 0;
    this._vy = 0;

    // State machine
    this._state      = 'fall';
    this._landTimer  = 0;
    this._idleTimer  = null;
    this._facingLeft = false;

    // Cached platform rects refreshed every 500ms
    this._platforms = [];

    // rAF handle
    this._rafId     = null;
    this._destroyed = false;

    this._setupCanvas();
    this._startPlatformRefresh();
    this._startIdleTimer();
    this._startLoop();

    // Visibility API — pause when tab is hidden
    this._onVisibility = () => {
      if (document.hidden) {
        this._pauseLoop();
      } else {
        this._resumeLoop();
      }
    };
    document.addEventListener('visibilitychange', this._onVisibility);

    // Debounced resize
    this._resizeTimer = null;
    this._onResize = () => {
      clearTimeout(this._resizeTimer);
      this._resizeTimer = setTimeout(() => this._setupCanvas(), 100);
    };
    window.addEventListener('resize', this._onResize);
  }

  // ── Canvas setup ─────────────────────────────────────────────────────────────

  _setupCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const W   = window.innerWidth;
    const H   = window.innerHeight;
    this._canvas.width  = W * dpr;
    this._canvas.height = H * dpr;
    this._canvas.style.width  = `${W}px`;
    this._canvas.style.height = `${H}px`;
    this._ctx.scale(dpr, dpr);
    this._W   = W;
    this._H   = H;
    this._dpr = dpr;
  }

  // ── Platform refresh (decoupled from rAF) ────────────────────────────────────

  _startPlatformRefresh() {
    this._refreshPlatforms();
    this._platformInterval = setInterval(() => this._refreshPlatforms(), 500);
  }

  _refreshPlatforms() {
    const { platformSelector, viewportPadding, minWidth } = this._opts;
    const nodes = document.querySelectorAll(platformSelector);
    const pads  = viewportPadding;
    const rects = [];

    nodes.forEach((el) => {
      const r = el.getBoundingClientRect();
      // Skip tiny or viewport-padded elements
      if (r.width < minWidth) return;
      if (r.top < (pads.top ?? 0)) return;
      rects.push({ left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width });
    });

    this._platforms = rects;
  }

  // ── Idle timer ───────────────────────────────────────────────────────────────

  _startIdleTimer() {
    this._idleTimer = setInterval(() => {
      if (this._state !== 'idle') return;
      if (Math.random() < 0.5) {
        this._setState(Math.random() < 0.5 ? 'walk-left' : 'walk-right');
      }
    }, IDLE_INTERVAL);
  }

  // ── State machine helpers ────────────────────────────────────────────────────

  _setState(s) {
    this._state = s;
    if (s === 'walk-left')  { this._facingLeft = true;  this._vx = -WALK_SPEED; }
    if (s === 'walk-right') { this._facingLeft = false; this._vx =  WALK_SPEED; }
    if (s === 'idle')       { this._vx = 0; }
    if (s === 'jump')       { this._vy = JUMP_VEL; }
    if (s === 'fall')       { /* vy set by gravity */ }
    if (s === 'land')       { this._vx = 0; this._vy = 0; this._landTimer = LAND_FRAMES; }
  }

  // ── Find the platform the fox is standing on ─────────────────────────────────

  _currentPlatform() {
    const FOOT_Y   = this._y + 32; // fox is 64px tall, feet at y+32
    const FOOT_X   = this._x;
    const SNAP_TOL = 4;

    for (const p of this._platforms) {
      if (
        FOOT_X >= p.left - 2 &&
        FOOT_X <= p.right + 2 &&
        Math.abs(FOOT_Y - p.top) <= SNAP_TOL + Math.abs(this._vy) + 2
      ) {
        return p;
      }
    }
    return null;
  }

  // ── Find closest platform above the fox ──────────────────────────────────────

  _platformAbove() {
    const HEAD_Y = this._y - 32;
    const FOX_X  = this._x;
    let best     = null;
    let bestDist = Infinity;

    for (const p of this._platforms) {
      if (p.bottom > HEAD_Y) continue; // platform is below or at head level
      if (FOX_X < p.left || FOX_X > p.right) continue; // not horizontally overlapping
      const d = HEAD_Y - p.bottom;
      if (d < bestDist) { bestDist = d; best = p; }
    }
    return best;
  }

  // ── Landing collision check ───────────────────────────────────────────────────

  _checkLanding() {
    if (this._vy < 0) return null; // moving upward — can't land
    const FOOT_Y   = this._y + 32;
    const NEXT_Y   = FOOT_Y + this._vy;
    const FOX_X    = this._x;

    for (const p of this._platforms) {
      if (FOX_X < p.left - 2 || FOX_X > p.right + 2) continue;
      if (FOOT_Y <= p.top && NEXT_Y >= p.top) {
        return p;
      }
    }
    return null;
  }

  // ── Main physics tick ────────────────────────────────────────────────────────

  _tick() {
    const { _W, _H } = this;

    switch (this._state) {

      case 'idle': {
        // Already handled by idleTimer, just gravity-check (shouldn't fall while idle but safety net)
        if (!this._currentPlatform()) this._setState('fall');
        break;
      }

      case 'walk-left':
      case 'walk-right': {
        this._x += this._vx;

        // Random direction flip
        if (Math.random() < WALK_DIR_CHANGE_CHANCE) {
          this._setState(this._state === 'walk-left' ? 'walk-right' : 'walk-left');
          break;
        }

        const plat = this._currentPlatform();
        if (!plat) {
          // Walked off the edge — fall
          this._setState('fall');
          break;
        }

        // Edge detection — turn around near platform edges
        if (this._x <= plat.left + 4)  { this._setState('walk-right'); break; }
        if (this._x >= plat.right - 4) { this._setState('walk-left');  break; }

        // Clamp to viewport
        if (this._x < 0)   { this._x = 0;  this._setState('walk-right'); break; }
        if (this._x > _W)  { this._x = _W; this._setState('walk-left');  break; }

        // Occasionally jump if there's a platform above
        if (Math.random() < JUMP_CHANCE && this._platformAbove()) {
          this._setState('jump');
        }
        break;
      }

      case 'jump': {
        this._x  += this._vx;
        this._vy += GRAVITY;
        this._y  += this._vy;

        // Transition to fall when apex reached
        if (this._vy >= 0) this._setState('fall');
        break;
      }

      case 'fall': {
        this._vy += GRAVITY;
        this._y  += this._vy;

        const landing = this._checkLanding();
        if (landing) {
          this._y = landing.top - 32; // snap feet to platform top
          this._setState('land');
          break;
        }

        // Floor fallback — below viewport → spawn at top center
        if (this._y > _H + 64) {
          this._x  = Math.random() * _W;
          this._y  = -64;
          this._vy = 0;
        }
        break;
      }

      case 'land': {
        this._landTimer--;
        if (this._landTimer <= 0) {
          this._setState('idle');
        }
        break;
      }
    }
  }

  // ── rAF loop ─────────────────────────────────────────────────────────────────

  _loop() {
    if (this._destroyed) return;
    this._rafId = requestAnimationFrame(() => this._loop());
    this._tick();
    this._draw();
  }

  _startLoop() {
    if (this._rafId) return;
    this._rafId = requestAnimationFrame(() => this._loop());
  }

  _pauseLoop() {
    if (this._rafId) {
      cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
  }

  _resumeLoop() {
    if (!this._rafId && !this._destroyed) {
      this._startLoop();
    }
  }

  // ── Draw (delegated to sprite module) ────────────────────────────────────────

  _draw() {
    const { _ctx, _W, _H } = this;
    _ctx.clearRect(0, 0, _W, _H);
    // draw() is injected by KitsuneMode after loading the sprite module
    if (typeof this._drawSprite === 'function') {
      this._drawSprite(_ctx, {
        x:          this._x,
        y:          this._y,
        state:      this._state,
        facingLeft: this._facingLeft,
        vy:         this._vy,
        now:        performance.now(),
      });
    }
  }

  /** Called by KitsuneMode to inject the sprite draw function */
  setDrawSprite(fn) {
    this._drawSprite = fn;
  }

  // ── Cleanup ───────────────────────────────────────────────────────────────────

  destroy() {
    this._destroyed = true;
    this._pauseLoop();
    clearInterval(this._platformInterval);
    clearInterval(this._idleTimer);
    clearTimeout(this._resizeTimer);
    document.removeEventListener('visibilitychange', this._onVisibility);
    window.removeEventListener('resize', this._onResize);
  }
}
