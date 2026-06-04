# Spirit Garden — Phased Build Plan

> Port the Ghibli "Spirit Garden" design (audited complete) into the live Next.js app.
> Exact values: `docs/design/spirit-garden-export/specs/*.md` + `tokens.md`. Design intent: `docs/design/spirit-garden.md`.
> Every phase is independently deployable. Ghibli-specific work is gated on `worldId === 'ghibli'` so Elden Ring / GoT are untouched.

## Token strategy
Promote the design's inline colors to new `--sg-*` CSS custom properties under a `.world-ghibli` scope in `globals.css`, layered on top of the existing `--dt-*` world tokens. Keeps everything per-world overridable; nothing hardcoded in components.

## Reuse map (current app)
- World theming: `worlds.js` (CSS-var overrides) + `worldContent.ts` (content SSOT, `AppId`/`WorldId` types) + `--dt-*` in `globals.css`.
- Shell/entry chain: `DesktopPage.jsx` → `BootOverlay` → `Desktop.jsx`; windows via `windowStore` + `WindowManager.jsx`.
- Reskinnable existing apps: `FileManager.jsx` → Grove/Conservatory, `Gallery.jsx` → Atelier, `Journal.jsx` → Almanac (already has a Ghibli skin + react-pageflip), `Mail.jsx` → Letters.
- R3F stack already installed (`@react-three/*`, `three`) — GLSL planes need no new deps, but `.glsl` raw-import needs a `next.config.js` webpack rule.

## Phase 1 — Welcome landing (centrepiece, first shippable)
**Outcome:** first visit (Ghibli, desktop) shows the dusk lock-screen — wallpaper + dusk grade + pollen + soot, time-aware greeting, big live clock + date, four glass widgets (weather/now-playing/intention/memory), kitsune mascot, glass dock, "Enter the Garden" CTA. Returning visitors skip it (`sg_entered_ghibli` in localStorage). SEO name/role stays in DOM.
- **Create:** `welcome/WelcomeLanding.jsx`, `welcome/DuskBackdrop.jsx`, `welcome/HeroGroup.jsx`, `welcome/WelcomeWidget.jsx`, `welcome/GlassDock.jsx`, `effects/GlslCanvas.jsx`, `effects/SootSpriteCanvas.jsx`.
- **Modify:** `globals.css` (`.world-ghibli` `--sg-*` block), `DesktopPage.jsx` (insert WelcomeLanding into boot flow), `next.config.js` (`.glsl` raw rule), `layout.jsx` (preload wallpaper + Newsreader weights).
- **Asset:** copy `docs/design/mascot-ghibli-idle.webp` → `public/images/mascot/ghibli/idle-sg.webp` (don't overwrite existing `idle.png`).
- **Build one themeable component** (Ghibli is the default skin) so other worlds get a welcome near-free.

## Phase 2 — reskin existing apps via tokens (Ghibli)
**Outcome:** Grove/Atelier/Almanac/Letters render in Spirit Garden language. Each sub-phase independent.
- 2a **Grove** (`FileManager.jsx`): Ghibli sidebar (Places/Tags), card grid mapped to real projects, + Conservatory toggle (cinematic mode → desktop-level godrays/mist/wisps + window glass-shimmer).
- 2b **Atelier** (`Gallery.jsx`): 3-col masonry + season filter chips.
- 2c **Almanac** (`Journal.jsx`): update Ghibli skin to leather-book spec, ribbons, page curl; suppress window chrome (chromeless book).
- 2d **Letters** (`Mail.jsx`): three-column Ghibli layout branch (mailboxes / list / reading pane).
- **Modify also:** `worldContent.ts` (Ghibli app titles → The Grove/Atelier/Almanac/Letters + poem footers), `windowStore.js` (`APP_DEFAULTS` sizes per spec). **Create:** `effects/GlassShimmerOverlay.jsx`, `welcome/PoemFooter.jsx`.

## Phase 3 — net-new app: Whisperwell (chat/AI)
**Outcome:** Compass dock tile opens the Ghibli well/chat screen.
- **Create:** `apps/Whisperwell.jsx`. **Modify:** `worldContent.ts` (add `whisperwell` to `AppId` + all-world content), `windowStore.js` (`APP_DEFAULTS`), `WindowManager.jsx` (register). Send wired to a graceful stub for now; real AI = later ticket. Non-Ghibli worlds get minimal fallback content (TS requires all worlds).

## Phase 4 — atmosphere integration + dock promotion
**Outcome:** Ghibli desktop gains the glass dock (alongside the existing utility IconStrip — keep its world-switch/settings/mascot controls), roaming soot sprites, and the Conservatory shader stack.
- **Modify:** `Desktop.jsx` (Ghibli-gated GlassDock + SootSpriteCanvas + conservatory shaders), `FileManager.jsx` (dispatch conservatory-mode event), `GlslCanvas.jsx` (shared R3F context if WebGL context limit hit).
- **Audit `mist.glsl` + `wisps.glsl`** (currently unaudited) before shipping; godrays-only fallback if they don't compile.
- Document a z-index map (wallpaper→gradients→shaders→windows→dock→soot) to prevent collisions.

## Phase 5 — polish, SEO, cross-world regression
SEO/ATS: sr-only `<h1>` always in DOM, avatar `aria-label` with real name, JSON-LD intact. Perf: gate shaders behind `prefers-reduced-motion` (static fallback), `next/image priority` wallpaper for LCP. Regression: confirm Journal/Gallery/FileManager/Mail unchanged in Elden Ring + GoT. Returning-visitor reset option. Mobile → MobileFallback.

## Product decisions (defaults chosen — flag to change)
1. First-time visitors land in **Ghibli** (Spirit Garden); returning visitors skip the lock-screen (per-world key). Mobile skips to desktop.
2. Files = **one window**, Grove default + Conservatory toggle (NOT two apps). [user-confirmed]
3. Desktop keeps the **slim utility strip AND** adds the glass dock — no lost controls.
4. Whisperwell ships with a **stub send**; real AI later.
5. Weather / now-playing widgets are **static placeholders** for first ship.

## Key risks
- `.glsl` raw import needs a `next.config.js` webpack rule (raw-loader / `?raw`).
- WebGL context limit (~16): use ONE shared R3F `<Canvas>` with multiple shader planes, not many canvases.
- Mascot webp lives in `docs/design/`, must be copied to `public/`.
- Almanac & some Letters layouts are layout branches, not pure token swaps.
- Poem footers on windowed apps render at desktop level (fixed), keyed to focused app.
- Default-world change (`Desktop.jsx` currently defaults `elden-ring`) → make Ghibli consistent with the FOUC script in `layout.jsx`.
