# Portfolio OS — Prototype Changelog

This document tracks design changes made in **this prototype** (`Portfolio OS.html` + `app.js`)
that are **not yet ported** to the real codebase at `portfolio/`. Use it as a handoff
checklist when you're ready to migrate features into `portfolio/src/`.

Status legend:
- 🟡 In prototype only — needs porting
- 🟢 Ported to `portfolio/` codebase
- 🔵 Prototype-only (intentionally not shipping)

---

## 2026-04-28 — Weather system

🟡 **Decoupled weather from wallpaper.** Weather is now its own subsystem with its own
state, cycle, and overlays. Wallpaper rotation no longer drives the vibe label or particles.

**New config block** (lives in `app.js`, belongs in `portfolio/src/config/worlds.js` or a sibling `weather.js`):
- `WEATHER_STATES` — 8 states: `highwind`, `cloudsea`, `meadowsun`, `drizzle`, `goldhour`,
  `firefly`, `firstlight`, `starshine`. Each carries `{vibe, particles, tint}`.
- `WEATHER_CYCLE` — rotation pool (4 default states; time-of-day exclusives are added at runtime).
- `WEATHER_CYCLE_MS` — 3 minutes per state.

**New particle types:**
- `rain` — angled streak rendering (uses `lineTo`, leans with wind).
- `firefly` — pulsing alpha (sine wave per particle).
- Existing `pollen` / `petal` / `dust` / `snow` unchanged.

**New overlays in `Desktop.jsx`** (currently inline divs in `Portfolio OS.html`):
- `#weather-tint` — atmospheric haze, set by current weather state. 2s ease transition.
- `#tod-tint` — time-of-day color wash. `mix-blend-mode: soft-light`. 60s linear transition.

**Time-of-day:** 9 color stops interpolated across 24h (deep navy midnight → peach sunrise →
invisible noon → coral sunset). Recomputes every minute.

**Auto-cycle:** every 3 min picks a weighted-random state, biased by the local hour
(firstlight 5–8am, goldhour 17–20h, firefly/starshine 20h–5am).

**Public API** (for tweak panel / world store integration):
```js
window.__weather = {
  set(key),            // pin a weather state
  setAuto(bool),       // pause / resume auto-cycle
  setWind(0.1..3),     // multiplier on particle drift
  list(),              // available state keys
  current(),           // current key
};
```

**Tweak controls added:**
- Weather segmented picker (Auto + 7 named states)
- Wind strength slider (0.1× → 3×)
- Time-of-day tint toggle

**Porting notes for the real app:**
- Move `WEATHER_STATES` / `WEATHER_CYCLE` to `portfolio/src/config/worlds.js` (alongside `WORLDS`),
  or into a new `portfolio/src/config/weather.js` if you want to keep `worlds.js` lean.
- The weather state belongs in a Zustand store next to `windowStore` — call it `weatherStore`.
  Each world can declare a `weatherCycle` array so worlds get their own moods (Westeros gets
  `snowfall`/`bitterwind`/`stormcloud` instead of `meadowsun`).
- `Desktop.jsx` mounts `<WeatherTint />` and `<TimeOfDayTint />` as siblings to `<Wallpaper />`
  and `<ParticleCanvas />`. Both subscribe to `weatherStore`.
- Particle canvas needs the rain & firefly branches added to its `tickParticles` loop.
- The `__windStrength` should become a user-pref persisted alongside theme/world choice.

---

## 2026-04-27 — Wallpaper animation + particles

🟡 **Ken Burns drift** on wallpaper layers (slow scale + translate, 90s loop).
🟡 **Particle canvas** overlay with per-wallpaper `{type, count, speed, windX}` config.
🟡 Wallpaper rotates every 60s with crossfade (already partially in `worlds.js` — verify).

Tweak: "Animate wallpaper" toggle (Ken Burns + particles, single switch).

**Porting notes:**
- New component: `portfolio/src/components/desktop/ParticleCanvas.jsx`. One rAF loop
  total, not one per particle. Resizes on `window.resize`.
- Wallpaper layers need `kenburns-a` / `kenburns-b` keyframes added to `globals.css`
  (or as a styled block on the desktop component).
- `WORLDS_CONFIG.wallpapers` needs the new `{src, vibe, particles}` shape — current
  shape is just strings. Migration: convert string entries to `{src: str}` and let the
  particle config default.

---

## 2026-04-27 — Initial Ghibli world recreation

🟢 Faithful recreation of the Ghibli theme matches `portfolio/`. No port needed —
this *is* the spec for what already ships. Reference for visual parity when adding
new worlds.

---

## Open questions / not yet started

- **Real weather** (open-meteo API integration) — discussed, not built. Would gate
  on a privacy toggle since it needs geolocation.
- **Weather audio layer** — discussed, not built. Default off.
- **Per-world weather pools** — current cycle is Ghibli-flavored; Westeros and other
  worlds should get their own `WEATHER_CYCLE` arrays.
- **Animated weather glyph** in the taskbar (replace emoji with tiny SVG/canvas).
