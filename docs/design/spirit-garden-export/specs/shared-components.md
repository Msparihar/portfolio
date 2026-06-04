# Spirit Garden — Shared / Reusable Components

## SG Backdrop (reusable component `s3fxKI`)
Used as a `ref` in Conservatory (and available for any new screen).
- Frame: 1440 × 900, fill `#121c15`, clip true
- Contents:
  - `bZkFJ`: Wallpaper image 1520×980, offset −40/−40, blur 13px
  - `BHC5q`: Dusk gradient (linear 180°, full frame)

## SG Dock (reusable component `TLDts`)
Used as a `ref` on every main screen at x526 y786.
See full spec in `dock-hover.md`.

---

## Window Chrome (shared across all app screens)
Pattern used in Grove, Conservatory, Whisperwell, Letters, Atelier:

| Property | Value |
|---|---|
| Corner radius | 26px |
| Fill | `#fffdf7` @ 85% (`E6` hex alpha) |
| Stroke | `#ffffff` @ 65% (`A6`), 1.5px inner |
| Background blur | 16px |
| Shadow | color `#3a4a2e` @25% (`40`), blur 48, offset y+20 |
| Clip | true |
| Titlebar height | 54px |
| Titlebar padding | 0 top/bottom, 18px left/right |
| Titlebar divider | 1px `#33442f` @10% (`1A`) |

### Traffic Lights (`GH3K3`)
Three standard window control dots (close/minimise/fullscreen), horizontal, gap 8.

## Atmosphere Layer Order (all screens)
Standard order when all shaders are present:
1. Wallpaper (blurred)
2. Dusk gradient overlay
3. Warm glow radial (Conservatory only)
4. `godrays.glsl` (Conservatory only)
5. `mist.glsl` (Conservatory only)
6. `wisps.glsl` (Conservatory only)
7. `pollen.glsl`
8. App window
9. Dock
10. Poem footer
11. `soot.glsl` (always topmost)

## Poem Footer (all screens)
Position: centered, full 1440px wide, y 828–878 (varies per screen)
Style: Newsreader 14px italic, `#f3e9d4` @ 76% (`C2` hex alpha)
Each screen has a unique line of poetry.

## Background Dusk Gradient (all screens)
Two gradient fills stacked:
1. Linear 180°: `#0d1a28` @70% → `#20302E` @55% → `#5e4726` @45% → `#0a140c` @93%
2. Radial centered at y 62%: `#ffcf78` @25% → transparent, size 80%×50%
