# Phase 4 — Ghibli Desktop Atmosphere (implementation plan)

> All Ghibli-gated (`worldId === 'ghibli'`); other worlds untouched. Dev runs Turbopack — shaders must be JS string modules (`src/shaders/*.js`), never `.glsl` imports.

## Shader audit (done)
- `godrays.glsl` — PASS as-is. Uniforms `u_resolution`, `u_time`, `u_color` (default #fff0c0).
- `mist.glsl` — PASS as-is. fBm ground mist. `u_color` (default #e8f0e0).
- `wisps.glsl` — CONDITIONAL: declares `u_core` + `u_halo` (two colors) which the shared `ShaderPlane` uniform auto-detect doesn't initialize → silent black. **FIX:** rename `u_core`→`u_color_top` and `u_halo`→`u_color_bottom` in BOTH the declaration AND the body `mix(...)` (matches the existing pollen-pattern auto-detect). Highest correctness risk — update both places.
- `pollen.js`, `soot.js` — healthy; soot reused on desktop unchanged.

## Two canvases are required (not one)
Soot must sit ABOVE windows; godrays/mist/wisps must sit BEHIND windows. A single fixed canvas can't straddle the window z-stack. So: one atmosphere canvas behind windows + one soot canvas above. Total desktop WebGL contexts = 2 (within the ~8–16 budget).

## Z-index (use these — avoids the window-overtake bug)
Windows start at z:20 and only increment on focus (no ceiling), so the dock/soot must sit well above any window:
- z:8 — GhibliAtmosphereCanvas (godrays+mist+wisps), behind windows. Mounts only when `isGhibli && conservatoryActive && !reducedMotion && atmosphereEnabled`.
- z:20–N — windows
- z:45 GhibliMoon, z:50 Mascot, z:90 IconStrip, z:100 MenuBar (unchanged)
- **z:200 — GhibliDock** (bottom-center; high enough to never be buried by focused windows; still below WorldPicker z:300 / menus z:400)
- **z:250 — GhibliSootCanvas** (topmost atmosphere, pointer-events:none, mouse-reactive). Mounts when `isGhibli && !reducedMotion && atmosphereEnabled`.

## Steps
**4-A (no WebGL):**
1. `src/hooks/useConservatoryMode.js` — subscribe to `window` event `conservatory-mode-changed` (`{detail:{active:boolean}}`), return active bool.
2. `src/hooks/usePrefersReducedMotion.js` — matchMedia, same pattern as GlassDock.
3. `src/components/desktop/GhibliDock.jsx` — thin wrapper around the reusable `GlassDock` (accepts tiles/onTileClick/style). Fixed bottom-center at z:200, offset left by ~half IconStrip width so it's visually centered; cap width to reserve ~140px mascot clearance. Tiles from `welcomeContent.ts` dockTiles; `onTileClick` → `openWindow(tile.appId)`; null-appId (whisperwell handled in Phase 3 via open-app, else no-op). Render null if not ghibli.
4. Wire `GhibliDock` into `Desktop.jsx` (gated `isGhibli`).

**4-B (shader modules):**
5–7. Create `src/shaders/godrays.js`, `mist.js`, `wisps.js` (string default-export, pattern of `pollen.js`). Apply the wisps uniform rename.

**4-C (conservatory stack):**
8. `src/components/effects/GhibliAtmosphereCanvas.jsx` — one R3F Canvas (`alpha`, `powerPreference:'low-power'`, `dpr=[1,1]`), three ShaderPlanes (godrays/mist/wisps, ascending renderOrder), `position:fixed inset:0 pointerEvents:none zIndex:8`. Add `godRaysOnlyMode` fallback prop. Import via `dynamic(..., {ssr:false})` in Desktop.
9. Wire into Desktop behind `isGhibli && conservatoryActive && !reducedMotion && atmosphereEnabled`.
10. In `FileManager.jsx` guard the in-window `GlassShimmerOverlay` with `!reducedMotion` so it doesn't spin a context for reduced-motion users.

**4-D (soot on desktop):**
11. `src/components/effects/GhibliSootCanvas.jsx` — R3F Canvas, one soot ShaderPlane (`trackMouse`), `position:fixed inset:0 pointerEvents:none zIndex:250`. `dynamic ssr:false`.
12. Wire into Desktop behind `isGhibli && !reducedMotion && atmosphereEnabled`.

**4-E (prefs + polish):**
13. `prefsStore.js` — add `atmosphereEnabled: true` default + `toggleAtmosphere` action.
14. Add the toggle to SettingsPanel.
15. (Optional) windowStore z-index ceiling note (Risk 6) — dock at z:200 already sidesteps it; leave a note rather than refactor.

## Risks
- wisps rename must touch declaration AND body or colors break/black.
- 3 contexts if FileManager-conservatory + atmosphere + soot all on at once — within budget; monitor.
- Dock vs mascot: keep dock width-capped (~140px right clearance).
- All R3F canvases MUST be `dynamic(ssr:false)` — no SSR for THREE.
- Don't remove IconStrip — it carries world-switch/settings/mascot controls the dock lacks.
