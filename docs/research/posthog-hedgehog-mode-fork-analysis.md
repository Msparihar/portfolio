# PostHog Hedgehog Mode Fork Analysis

**Date:** May 20, 2026  
**Goal:** Determine if `@posthog/hedgehog-mode` can be forked and reskinned as a kitsune-themed mascot for the portfolio.

## Package Overview

**Package Name:** `@posthog/hedgehog-mode`  
**Current Version:** 0.0.48  
**Repository:** [github.com/PostHog/hedgehog-mode](https://github.com/PostHog/hedgehog-mode)  
**NPM:** [@posthog/hedgehog-mode](https://www.npmjs.com/package/@posthog/hedgehog-mode)  
**Weekly Downloads:** 12,501  
**Last Release:** ~2 months ago (Q1 2026)  
**Language:** TypeScript (75.9%)  
**Framework:** React 18+ with PixiJS rendering

## License

**MIT License** — permissive for forking, modification, and commercial use. ✅ **Forkable.**

## Maintenance & Activity

- **Maintainers:** 12 open-source collaborators on the PostHog organization
- **Release Cadence:** Healthy; version 0.0.48 released within last 2 months
- **Recent Work:** Hedgehog Mode V2 shipped (referenced in Feb 2025 PR #28258)
- **Status:** ✅ **Actively maintained** — low risk for long-term support

## Core Architecture

### Engine Type
PixiJS-powered game engine — sprites rendered via WebGL/Canvas, not DOM. Creatures navigate DOM elements as platforms using CSS selectors for collision detection.

### What It Does
- Animated characters (hedgehogs) walk on top of page elements
- Customizable skins: `default`, `spiderhog`, `robohog`, `hogzilla`, `ghost`
- Accessory system: top hats, capes, and other decorations
- Static component mode for avatars
- ~10 color options per skin

### Dependencies
**6 dependencies** (lean stack):
- `pixi.js` — rendering engine
- `react` — peer dependency (requires 18+)
- `next` — optional; works with Next.js 14+
- Build tooling (TypeScript, bundler deps)

**Note:** One documented Next.js 16 quirk with Turbopack + React version conflicts; suggests using Webpack or pinning React canary. Not a blocker for custom fork.

## Customization Surface

### Asset Loading
- **Model:** Assets copied to `public/` directory during setup; passed to component via `assetsUrl` prop
- **Format:** Not fully detailed in public docs, but appears to be:
  - PNG sprite sheets (multiple skins)
  - JSON metadata (frame definitions, animation timings, hitbox data)
- **Key Detail:** `assetsUrl` is configurable — appears designed to support custom asset directories

### Customization API
The library exposes `HedgehogCustomization` component with:
- Skin selection (5 built-in skins)
- Color options (10+ per skin)
- Accessory toggles
- (Likely) `assetsUrl` override for custom assets

### Extensibility Assessment
**Partial:** The architecture *supports* dropping in custom assets via `assetsUrl`, but:
- The sprite sheet format (PNG/JSON structure) is not documented in search results
- No explicit API for adding new character models (kitsune sprites)
- Community feature requests exist for "custom skins" (GitHub issue #31083), suggesting this wasn't a first-class feature at launch
- Built-in skins are hardcoded references (`default`, `spiderhog`, etc.) — custom skins may require source modification

## Source Code Footprint

**Estimated LOC:** ~800–1500 lines of core engine (TypeScript)
- Rendering loop (PixiJS setup)
- Sprite animation controller
- Platform collision detection
- Customization UI wrapper
- Utilities for animation frames and timing

**Verdict:** Compact. Forking is manageable; not a massive codebase to maintain long-term.

## Fork Viability: Asset Replacement

### Best-Case Scenario
If `assetsUrl` accepts a folder with a known structure (e.g., `public/kitsune/sprites/`) and the library dynamically loads skins:
```
kitsune-mode/
  public/
    kitsune/
      default.json          # frame metadata + animation timings
      default.png           # sprite sheet
      gray.json
      gray.png
      etc.
```

Then forking could be as simple as:
1. Replace hedgehog sprites with kitsune sprites
2. Update sprite sheet metadata (frame counts, animations, hitbox offsets)
3. Rename skins in config (`default` → `white`, etc.)
4. Ship it

**Migration effort:** 2–4 hours (art asset creation + JSON metadata tuning).

### Likely Reality
The sprite format is probably **not** fully documented outside the repo. The fork path would require:
1. Cloning `hedgehog-mode`
2. Reverse-engineering the sprite format by examining source code and existing PNG/JSON files
3. Recreating kitsune sprite sheets to match the hedgehog dimensions and animation keyframes
4. Testing on-device to dial in physics and collision boxes

**Migration effort:** 8–16 hours (includes sprite asset creation + debugging).

### Worst-Case Scenario
If skins are hardcoded with hedgehog-specific logic (animations, hitboxes, logic) and not data-driven:
- Would require more invasive source changes
- Not recommended without forking and owning the entire codebase

## Community Context

- **Existing Feature Requests:** GitHub issue #31083 ("Custom skins for hedgehog mode") indicates community interest in extensibility — suggests the core team hasn't prioritized this yet
- **Proof of Concept:** PostHog's own demo includes 5+ skins, proving multi-character support is feasible
- **Risk:** Forking aligns with a known feature gap, but you'd be solving it alone

## Build & Deployment Notes

### Setup Steps (for reference)
1. `npm i @posthog/hedgehog-mode` (or fork equivalent)
2. Copy sprite assets to `public/`
3. Import `HedgehogModeRenderer` into React app
4. Wrap with `HedgehogCustomization` for skin selection

### Next.js Compatibility
- ✅ Works with Next.js 14
- ⚠️ Known quirk with Next.js 16 + Turbopack (React version conflicts)
- Workaround: Stick to Webpack or pin React canary version

---

## RECOMMENDATION: **FORK — WITH CAVEATS**

### ✅ Go Ahead If:
1. **You want full creative control** over animations, hitboxes, and character behavior
2. **Art is ready or easily customizable** — sprite sheet creation is the bottleneck, not code
3. **Maintenance burden is acceptable** — you own a 1.5K LOC codebase and keep PixiJS deps current
4. **Timeline allows research** — expect 1–2 hours reverse-engineering the sprite format before asset creation

### ❌ Don't Fork If:
1. You need the feature fast (< 4 hours) and can't dedicate art time
2. You want to avoid maintaining a separate package long-term
3. You prefer to wait for PostHog's custom-skins feature (issue #31083 is open; could ship in 2026)

---

## Migration Path (If Approved)

### Phase 1: Understanding (1–2 hours)
1. Clone [github.com/PostHog/hedgehog-mode](https://github.com/PostHog/hedgehog-mode)
2. Examine `src/` directory:
   - Find sprite sheet loading code (how PNG/JSON are parsed)
   - Extract animation frame definitions from existing hedgehog skins
   - Identify hitbox / collision metadata
3. Dump existing sprite sheet PNGs to understand dimensions, frame layout, animation counts

### Phase 2: Asset Creation (4–8 hours)
1. Create kitsune sprite sheet(s) matching hedgehog dimensions
   - If hedgehog is ~64x64 per frame, kitsune should match
   - Create animation sequences: walk, idle, jump, fall (match PostHog's set)
2. Generate JSON metadata for each kitsune variant (white, gray, shadow, etc.)
   - Frame offsets, hitboxes, animation FPS
3. Test sprite sheets in PixiJS sandbox to verify rendering

### Phase 3: Forking & Integration (2–3 hours)
1. Create `kitsune-mode` repo under personal GitHub
2. Swap hedgehog sprites → kitsune sprites in `public/`
3. Rename skins in config files (`default` → `white`, `spiderhog` → `shadowed`, etc.)
4. Update package.json metadata, branding
5. Test in portfolio app with `HedgehogModeRenderer` → `KitsuneMode​Renderer`
6. Deploy to portfolio

### Phase 4: (Optional) Custom Enhancements (2+ hours)
- Add kitsune-specific behaviors (tail physics, ear flicks, shape-shifting visual effect)
- Implement "realm switching" Easter egg (correlate to portfolio world themes)
- Add sound effects (fox chirps instead of hedgehog grunts)

---

## Bottom Line

**Fork is viable.** The code is small, MIT-licensed, and the customization surface exists. The real work is asset creation, not engineering. If you have sprites or can generate them (Stable Diffusion + sprite sheet cleanup), forking nets you a polished, maintainable mascot that fits your portfolio's whimsy.

**Budget:** 1–2 weeks of part-time work (code ~6 hours, art/animation tuning 8–12 hours).

**Alternative:** Wait for PostHog's custom-skins feature and contribute kitsune skins upstream, then use the official package. Lower maintenance, but loses uniqueness.

---

## References

- [PostHog/hedgehog-mode GitHub](https://github.com/PostHog/hedgehog-mode)
- [@posthog/hedgehog-mode npm](https://www.npmjs.com/package/@posthog/hedgehog-mode)
- [Custom skins feature request (GitHub #31083)](https://github.com/PostHog/posthog/issues/31083)
- [Hedgehog Mode V2 PR (GitHub #28258)](https://github.com/PostHog/posthog/pull/28258)
- PostHog brand handbook: [Logos, brand, hedgehogs](https://posthog.com/handbook/company/brand-assets)
