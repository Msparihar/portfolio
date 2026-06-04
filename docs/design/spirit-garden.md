# Spirit Garden — Ghibli dusk desktop OS (design)

> **Status:** Pencil design only — NOT in code yet. Source of truth for the *design* is
> `docs/design/worlds.pen` (open in Pencil). This doc is the written record of what's in there,
> the decisions, the tokens, and the open issues. Tracker row lives in `docs/IDEAS.md`.

## Concept

A reimagined portfolio landing as a **Ghibli dusk desktop OS** — a real painted meadow wallpaper,
blurred and graded to evening, with frosted-glass widgets, a glass dock, a transparent mascot
kitsune, and live shader motion (drifting fireflies + roaming soot sprites). Replaces the old
dark-fantasy mockups (`P1`–`P9` frames in the same .pen) as the intended landing experience.

## Where it lives

- **Designs:** `docs/design/worlds.pen` — frames prefixed `NEW: Spirit Garden — …`.
- **Shaders:** `docs/design/{pollen,soot}.glsl` (mine, in use). Also present, sub-agent-created and
  **unaudited / not yet wired**: `godrays.glsl`, `mist.glsl`, `wisps.glsl`, `glass-shimmer.glsl`.
- **Mascot assets:** `docs/design/mascot-ghibli-idle.webp` (transparent cutout, in use),
  `mascot-ghibli-skygaze.webp`. Source PNGs in `public/images/mascot/ghibli*/` (gitignored).
- **Wallpaper:** `public/images/worlds/ghibli/wallpaper.webp` (1440×900, exact-fit), referenced as
  `../../public/images/worlds/ghibli/wallpaper.webp`.

## Screen inventory (node IDs in worlds.pen)

| Screen | Node ID | State |
|--------|---------|-------|
| Welcome (homepage) | `i2bEv` | complete — the reference screen |
| Grove (Files) | `djAGK` | complete |
| Conservatory (Files) | `L4fdae` | ⚠️ likely a DUPLICATE of Grove — reconcile/delete one |
| Atelier (Gallery) | `u1XaNz` | complete |
| Almanac (Journal) | `pXnqd` | complete |
| Whisperwell | `BS1Lh` | complete |
| Letters (Mail) | `U8bDl` | complete |

**Reusable components:** `SG Dock` (`TLDts`), `SG Backdrop` (`s3fxKI`).
**Reference studies:** Dock Hover & Magnification (`qyIWF`), Dock Motion Spec (`Sll4v`).
_(The 10-variant "Dock Studies" gallery was removed 2026-06-01 once the dock was chosen.)_

## Design tokens

**Backdrop:** wallpaper rectangle oversized (~-40px bleed) + `blur(13)`, then a **dusk grade** overlay:
linear 180° `#0d1a28B3 → #20302E8C @.4 → #5e472673 @.57 → #0a140cED`, plus a **horizon bloom**
radial (center y .62) `#ffcf7840 → transparent`. Frame base `#121c15`.

**Glass widgets:** fill `#fdfaf2E6`, stroke `#ffffffA6` 1.5px inner, radius 22, `background_blur 12`,
shadow `#4b5e3d33`.

**Dock (final, = `SG Dock`):** transparent pill fill `#ffffff1F` + diagonal gloss (120°), stroke
`#ffffffB3`, radius 24, padding [10,14], gap 12, `background_blur 10`. Six 50px tiles, radius 13,
each a 135° gradient + top gloss + colored shadow, with a **solid-filled white SVG-path glyph**
(Pencil's icon libraries are outline-only — glyphs are hand-drawn filled paths):

| App | Glyph | Gradient lo → hi |
|-----|-------|------------------|
| Garden | sprout | `#5fd97a → #2ea84f` |
| Terminal | terminal | `#3ad9c4 → #0e9488` |
| Letters | mail | `#ff8a7a → #ef4e3a` |
| Journal | book | `#ffc24d → #f0921d` |
| Gallery | palette | `#c08cf5 → #8b3fe0` |
| Explorer | compass | `#5bb8f5 → #1f7fd6` |

Centered: 388px wide → x:526 on a 1440 frame (midpoint 720).

**Type:** Newsreader (display/serif, clock + poems), Geist (UI text), cream `#f3efe2`/`#f9f4e8`,
muted `#8fa0a4`. **Mascot:** transparent kitsune, no drop-shadow halo, soft contact-shadow ellipse.

## Motion

- **`pollen.glsl`** (`@time`): drifting fireflies/pollen — warmer + denser near the ground, cooler/sparser high.
- **`soot.glsl`** (`@time` + `@mouse`): three soot sprites roam between component spots, hop while
  running, dwell on arrival; on cursor proximity they glare red, tremble, and flee to the farthest corner.
- **Dock hover (spec only — coded in JS):** magnify hovered icon 1.0→1.6, neighbors 1.3/1.12, lift
  -8px, ease `cubic-bezier(0.2,0.8,0.2,1)` ~120ms; name label after 150ms; click launch-bounce;
  honor `prefers-reduced-motion`. Full numbers in the `Dock Motion Spec` frame (`Sll4v`).

## Open issues / cleanup

1. **Duplicate Files screen** — `Grove (djAGK)` vs `Conservatory (L4fdae)`. Pick one, delete the other.
2. **Homepage dock** (`i2bEv` → `EvaDP`) is a standalone copy, not an `SG Dock` instance. Convert for single-source editing.
3. **Unaudited shaders** — `godrays/mist/wisps/glass-shimmer.glsl` created by sub-agents; review, name their intended screens, wire or delete.
4. **One-writer rule** — when filling shared components, never let an agent + main session both write (it duplicated the dock tiles once). See memory `pencil-screenshot-quirks.md`.

## Next step

Port the Spirit Garden as the **live Next.js homepage** (currently nothing here exists in code).
That's a separate implementation effort — write a PRD in `docs/prd/` before starting.
