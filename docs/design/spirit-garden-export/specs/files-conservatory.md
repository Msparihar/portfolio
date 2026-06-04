# Spirit Garden — Conservatory (Files, cinematic)
Node ID: `L4fdae`
Screenshot: `screens/conservatory.png`

## Frame
| Property | Value |
|---|---|
| Size | 1440 × 900 |
| Background fill | `#121c15` |
| Canvas position | x0 y13040 |

## Difference from Grove
The Conservatory is the "cinematic" variant of the Files screen. It:
1. Uses a backdrop **ref** (`nZprX` → component `s3fxKI` SG Backdrop) instead of an inline wallpaper rectangle
2. Adds extra atmospheric shaders: **godrays**, **ground-mist**, **spirit-wisps** (not in Grove)
3. Has a `glass-shimmer.glsl` overlay on the window chrome itself
4. Window is slightly taller (712 vs 684) and wider (1100 vs 1080)
5. The poem footer sits higher (y828 vs y872)

## Layer Stack (bottom to top)
| Layer | Node | Notes |
|---|---|---|
| 1 | `nZprX` | SG Backdrop ref (wallpaper + dusk grade) |
| 2 | `W7a8i` | warm-glow radial `#ffd68a` @30%→transparent, y center 60% |
| 3 | `WJLQw` | `godrays.glsl` shader, full frame |
| 4 | `YLSCk` | `mist.glsl` ground mist, full frame |
| 5 | `wq9OX` | `wisps.glsl` spirit wisps, full frame |
| 6 | `oxTvq` | `pollen.glsl` shader, full frame |
| 7 | `C2u3MP` | Conservatory Window — see below |
| 8 | `CFbn9` | Dock ref at x526 y786 |
| 9 | `a7zuq` | Poem footer at y828 |
| 10 | `EwXiZ` | `soot.glsl` shader, full frame |

## Conservatory Window (`C2u3MP`)
- Size: 1100 × 712 at x170 y84
- Corner radius: 26px
- Fill: `#fffdf7` @85%
- Stroke: `#ffffff` @65%, 1.5px inner
- Background blur: 16px
- Shadow: `#3a4a2e` @25%, blur 48, offset y+20
- Clip: true; Layout: vertical

### Extra layer inside window
- `nnlGa` (glass-shimmer): `glass-shimmer.glsl` shader, 1100×712, positioned absolute at 0/0, opacity 85%, blend mode **screen**

### Titlebar (`BXBZz`) — height 54, same structure as Grove
"The Conservatory" as title

### Body (`HJZth`)
The body structure (sidebar with PLACES/TAGS + main panel with header/grid) is the same design language as Grove. The cinematic version uses the same sidebar nav items, same card grid, same footer bar — the primary visual difference is the richer atmospheric backdrop and the glass shimmer on the window.

## Shaders active in this scene (6 total)
`godrays.glsl`, `mist.glsl`, `wisps.glsl`, `pollen.glsl`, `glass-shimmer.glsl` (on window, screen blend), `soot.glsl`

## Poem Footer
"every seed you plant here keeps its own quiet record"
— Newsreader 14px italic, `#f3e9d4` @76%, y828 (higher than Grove's y872)
