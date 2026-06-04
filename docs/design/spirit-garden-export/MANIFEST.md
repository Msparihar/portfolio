# Spirit Garden Export — Master Manifest

Source file: `docs/design/worlds.pen`
Export date: 2026-06-04
Exported by: Claude Code (read-only — no edits to .pen file)

---

## SCREENS (10 total)
PNG screenshots at 2× visual scale via `get_screenshot`.
Location: `docs/design/spirit-garden-export/screens/`

| File | Frame Name | Node ID | Size |
|---|---|---|---|
| `welcome.png` | Welcome (lock screen / landing) | `i2bEv` | 1440 × 900 |
| `grove.png` | Grove (Files, simple) | `djAGK` | 1440 × 900 |
| `conservatory.png` | Conservatory (Files, cinematic) | `L4fdae` | 1440 × 900 |
| `whisperwell.png` | Whisperwell (Chat / AI) | `BS1Lh` | 1440 × 900 |
| `letters.png` | Letters (Mail) | `U8bDl` | 1440 × 900 |
| `atelier.png` | Atelier (Gallery) | `u1XaNz` | 1440 × 900 |
| `almanac.png` | Almanac (Journal) | `pXnqd` | 1440 × 900 |
| `dock-hover.png` | Dock — Hover & Magnification (study) | `qyIWF` | 940 × ~320 |
| `dock-motion-spec.png` | Dock Motion Spec (annotations) | `Sll4v` | 760 × 470 |
| `soot-sprite-states.png` | Soot Sprite Interaction States | `Su8QG` | 780 × 360 |

Note: Screens are delivered as embedded screenshots captured via the Pencil MCP `get_screenshot` tool. The `export_nodes` tool failed for this file — the screenshots are the PNG visual record. Engineers should use the spec docs for pixel-accurate values.

---

## ASSETS (individual components)
PNG screenshots of individual components/widgets.
Location: `docs/design/spirit-garden-export/assets/`

| File | Component Name | Node ID | Notes |
|---|---|---|---|
| `dock.png` | Dock bar (full, rest state) | `EvaDP` | 6 tiles |
| `widget-weather.png` | Weather widget | `Jcgsq` | 212px wide |
| `widget-nowplaying.png` | Now Playing widget | `U2t1mB` | 268px wide |
| `widget-intention.png` | Today's Intention widget | `JhlKI` | 212px wide |
| `widget-memory.png` | A Memory postcard widget | `oZ3t5` | 212px wide |
| `enter-chip.png` | "Enter the Garden" CTA chip | `rtWvK` | pill button |
| `avatar.png` | Fox avatar circle (lock screen) | `APGDX` | 74×74 circle |
| `mascot-kitsune.png` | Kitsune mascot (from design) | `xTgmx` | 240×240, refs external webp |
| `hero-group.png` | Full hero group (clock + chip) | `ts80h` | full-width |
| `dock-tile-sprout.png` | Dock icon — Sprout (Files/Grove) | `fBUBt` | 50×50 |
| `dock-tile-terminal.png` | Dock icon — Terminal | `a8JWKh` | 50×50 |
| `dock-tile-mail.png` | Dock icon — Mail | `DZuB0` | 50×50 |
| `dock-tile-book.png` | Dock icon — Book (Almanac) | `Orkwf` | 50×50 |
| `dock-tile-palette.png` | Dock icon — Palette (Atelier) | `B69mB` | 50×50 |
| `dock-tile-compass.png` | Dock icon — Compass (AI/Whisperwell) | `HQVjO` | 50×50 |
| `almanac-book.png` | Almanac book object (leather cover + pages) | `ePOHN` | 1200×712 |

Note: Asset files are delivered as embedded screenshots. The node-ID-to-name mapping above is the canonical reference.

---

## SPEC DOCS (10 files)
Location: `docs/design/spirit-garden-export/specs/`

| File | Contents |
|---|---|
| `tokens.md` | Design tokens (file variables + Spirit Garden actual palette, typography scale) |
| `welcome.md` | Welcome / lock screen — full layer stack, all widget specs, enter chip, mascot, shaders |
| `files-grove.md` | Grove (Files simple) — window chrome, sidebar nav, file card grid |
| `files-conservatory.md` | Conservatory (Files cinematic) — differences from Grove, extra shaders |
| `whisperwell.md` | Whisperwell (Chat/AI) — well pool, transcript, spell chips, input bar |
| `letters.md` | Letters (Mail) — mailbox pane, message list, reading pane, letter body |
| `atelier.md` | Atelier (Gallery) — filter chips, 3-column masonry gallery |
| `almanac.md` | Almanac (Journal) — physical book metaphor, pages, ribbons, page curl |
| `dock-hover.md` | Dock hover study — rest state, hover/magnify state, full dock component spec |
| `dock-motion-spec.md` | Dock motion spec — all 5 interaction behaviors with easing values |
| `soot-sprite-states.md` | Soot sprite states — Idle/Alert/Angry/Fleeing anatomy + transition logic |
| `shared-components.md` | Shared chrome, window pattern, atmosphere layer order, poem footer |

---

## EXISTING ON-DISK ASSETS (reuse — do NOT re-export)
Location: `docs/design/`

| File | Role |
|---|---|
| `pollen.glsl` | Ambient pollen particle shader — used on every screen |
| `soot.glsl` | Soot sprite animated shader — used on every screen (topmost) |
| `godrays.glsl` | God rays atmospheric shader — Conservatory only |
| `mist.glsl` | Ground mist shader — Conservatory only |
| `wisps.glsl` | Spirit wisps shader — Conservatory only |
| `glass-shimmer.glsl` | Glass shimmer overlay (screen blend) — Conservatory window only |
| `mascot-ghibli-idle.webp` | Kitsune mascot idle pose — Welcome screen |
| `mascot-ghibli-skygaze.webp` | Kitsune mascot skygaze pose — available for use |
| `image.png` | Reference image (provenance unclear) |
| `spirit-garden.md` | Design narrative / concept doc |
| `images/` | Generated reference images (6 PNGs from prior sessions) |

Wallpaper referenced in design: `public/images/worlds/ghibli/wallpaper.webp` (in app's public dir)

---

## REUSABLE COMPONENTS IN .PEN FILE
| Component | Node ID | Description |
|---|---|---|
| SG Backdrop | `s3fxKI` | Blurred wallpaper + dusk grade — shared backdrop base |
| SG Dock | `TLDts` | Full dock bar with all 6 tiles — used by ref on every screen |

---

## NOTES FOR BUILD AGENTS

1. **Pixel values**: All sizes are at 1× (design canvas units). Implement at 1×; the OS/app handles device-pixel scaling.
2. **Shaders**: Six GLSL files exist on disk. Wire them as animated `<canvas>` or WebGL overlays at the z-indices specified per screen.
3. **Glass blur**: Use CSS `backdrop-filter: blur(Npx)` for all window chrome and widgets.
4. **Fonts**: Newsreader (Google Fonts, variable italic), Geist (Vercel), Inter (fallback for emoji/symbols).
5. **Dock dock**: The dock is a **reusable component** — render once, share across all screens. Magnification is pure JS (pointer proximity → CSS transform scale on each tile).
6. **Soot sprite interaction**: JS proximity detection drives state (Idle → Alert → Angry → Fleeing). The `soot.glsl` shader renders the visual; JS provides position/state uniforms.
7. **export_nodes tool failure**: The Pencil MCP `export_nodes` tool failed for this file regardless of path format tried (relative, absolute Windows, absolute Unix-style). All visual references are delivered as `get_screenshot` captures embedded in the session. The spec docs contain all numeric values needed for pixel-accurate implementation without relying on the PNG exports.
