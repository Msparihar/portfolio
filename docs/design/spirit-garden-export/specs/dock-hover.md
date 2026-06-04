# Spirit Garden — Dock Hover & Magnification (Study)
Node ID: `qyIWF`
Screenshot: `screens/dock-hover.png`

## Frame
| Property | Value |
|---|---|
| Size | 940 wide (auto height) |
| Fill | `#0f1518` |
| Layout | vertical, gap 18 |
| Padding | 28/34/34/34 |
| Canvas position | x2860 y13040 |

This is a **study frame** — not a full OS screen, but a design annotation showing dock behavior states.

## Title Section
- "DOCK — HOVER & MAGNIFICATION" — Newsreader 22px 600 `#f3efe2`, letter-spacing 1
- Description: "How the dock animates on pointer hover — icons magnify with a graduated falloff, lift, and reveal a name label. (Live app: JS transform on pointer proximity; shown here as states.)" — Geist 12px `#8fa0a4`, line-height 1.4

## State 1: Rest (`GWMWA`) — height 132, r16, background wallpaper image
- Label chip (`l0INqj`): r8, fill `#0b1014` @70%, absolute at x14 y12, padding 3/9 — "Rest" text
- Dock (`iN3Bw`): same glass treatment as main dock (see Dock spec)
- Icons: 6 tiles, all at default size (50×50)

## State 2: Hover — magnify + label (`CtMbO`) — height 188, r16, wallpaper bg, padding bottom 16
- Label chip (`QsOo3`): "Hover" at x14 y12
- Dock (`g4dU4`): same glass, align end (icons lift to bottom of container)
- Magnified center icon (Almanac/Book): larger than neighbors — graduated falloff effect
  - Hovered: scale 1.0 + 1.6 (hovered icon is biggest)
  - Neighbors: scale 1.0 + 1.2 (adjacent icons get partial magnification)
  - Falloff: follows gaussian-like curve, radius ~2 icons
  - Lift: `translateY(-5px)` on hovered icon
- **Hover label** (`zEE7m`): r10, fill `#0f1c14` @95%, shadow `#000000` @35% blur 12 offset y+4, padding 5/13 — label text (font: white)
  - Absolute at x432 y40
  - **Triangle tip** (`JcS9g`): polygon 13×8, fill `#0f1c14` @95%, rotated 180°, at x460 y66

## Dock Component Spec (`EvaDP` / `TLDts`)

### Container
| Property | Value |
|---|---|
| Corner radius | 24px |
| Fill layer 1 | `#ffffff` @ 12% |
| Fill layer 2 | linear gradient 120°: `#ffffff66` → `#ffffff14` @45% → `#ffffff00` |
| Stroke | `#ffffff` @ 70%, 1px inner |
| Background blur | 10px |
| Shadow | `#000000` @22%, blur 30, offset y+14 |
| Padding | 10px top/bottom, 14px left/right |
| Gap between tiles | 12px |

### Dock Icon Tiles
All tiles: 50×50, corner radius 13, stroke `#ffffff` @30% 1px inner
Two fill layers each: (1) color gradient at 135°, (2) highlight gradient `#ffffff66`→`#ffffff00` at 180°

| Tile | Node | Gradient | Shadow tint |
|---|---|---|---|
| Sprout (Files/Grove) | `fBUBt` | `#5fd97a`→`#2ea84f` | `#2ea84f` @45% |
| Terminal | `a8JWKh` | `#3ad9c4`→`#0e9488` | `#0e9488` @45% |
| Mail | `DZuB0` | `#ff8a7a`→`#ef4e3a` | `#ef4e3a` @45% |
| Book (Almanac) | `Orkwf` | `#ffc24d`→`#f0921d` | `#f0921d` @45% |
| Palette (Atelier) | `B69mB` | `#c08cf5`→`#8b3fe0` | `#8b3fe0` @45% |
| Compass (AI) | `HQVjO` | `#5bb8f5`→`#1f7fd6` | `#1f7fd6` @45% |

All tile glyphs: white SVG path, 24×24

### Tile Shadow
All tiles: outer shadow, blur 6, color = tile shadow tint color, offset y+3
