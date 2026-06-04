# Spirit Garden — Almanac (Journal)
Node ID: `pXnqd`
Screenshot: `screens/almanac.png`

## Frame
| Property | Value |
|---|---|
| Size | 1440 × 900 |
| Background fill | `#121c15` |
| Canvas position | x0 y12020 |

## Layer Stack
| Layer | Node | Notes |
|---|---|---|
| 1 | `s4FpG5` | Wallpaper 1536×996, offset −48/−48, blur 13px |
| 2 | `TRlXo` | Dusk gradient |
| 3 | `ePOHN` | Almanac Book at x120 y76 |
| 4 | `aCWYo` | `pollen.glsl` shader |
| 5 | `vPs57` | Dock ref at x526 y786 |
| 6 | `t9c4tk` | Poem footer at y872 |
| 7 | `DqMO5` | `soot.glsl` shader |

## Almanac Book (`ePOHN`)
The Almanac uses a **physical book metaphor** rather than an app window.
- Size: 1200 × 712 at x120 y76
- Corner radius: 12px
- Fill: gradient `#d3bd92`→`#bd9e6c` @50%→`#a8895a` at 120° (leather cover)
- Stroke: `#6e5836`, 1px
- Shadow: `#000000` @45%, blur 56, offset y+24
- Layout: none (absolute)
- Clip: true

### Decorative Cover Elements
- `yxI5i`: Tooled border frame 1172×684 at x14 y14, r8, no fill, stroke `#f0e7d0`
- Corner blooms: "✿" Inter 18px `#9d8ec9` at all 4 corners (x8/x1168, y8/y680)
- Page stack layers (behind pages):
  - `PaLxI`: 1164×660 at x18 y40, r7, `#b09766`
  - `litht`: 1158×660 at x21 y35, r6, `#c6af80`
  - `uaJaR`: 1152×660 at x24 y30, r5, `#d8c596`

### Spine Shadow
- `azvYe`: 80×660 at x560 y26 — gradient `#2a1c0a` @0%/35%/0% left-to-right

### Ribbon Bookmarks
- Crimson ribbon (`Q52Iw`): 20×248 at x980 y8, fill `#9d8ec9`
  - Tip (`Lz065`): triangle 20×13, rotated 180°, `#7d6ea9`
- Gold ribbon (`F09obm`): 20×318 at x1012 y8, fill `#88a079`
  - Tip (`N1gS5C`): triangle 20×13, rotated 180°, `#6f8a62`

### Page Curl (bottom-right corner)
Three overlapping paths at x1096 y608 (78×78):
- `Qgt8E`: curl-reveal, fill `#f4ead2`
- `pTaYD`: curl-shadow, fill `#2a1f0e` @22%, blur 6px
- `LBpis`: curl-flap, gradient `#c7b083`→`#f3e9cf` at 315°, stroke `#b8a06a` @50% 0.5px
- `CQgRK`: curl-crease, stroke `#fff7e0` 1.5px
- `ZfIGc`: "turn the page" — Geist 9px italic `#8a7444` @60%, letter-spacing 1, at x1086 y690

### Open Pages (`d6VdcW`) — 1148×660 at x26 y26, clip true, r4
Two side-by-side pages, each fill `#ece1c2` + radial vignette `#6b5226` @25% at center.

#### Left Page (`tgIJa`) — width 574, padding 44/46/40/52, layout vertical, gap 16
- Index title
- Decorative divider with `+` ornament
- `Kf5H4` Index list: chapter entries (layout vertical, gap 15)
- Flex spacer
- Flourish: "✿   ❦   ✿" — Inter 13px `#8a7444` @40%

#### Right Page (`j1G6f`) — fill_container, padding 44/52/40/46, layout vertical, gap 14
- Date: "ON THE XXXI DAY OF MAY · YEAR THREE" — Geist 10px 600 `#8a6a3a`, letter-spacing 2
- Title: "The Wisteria Opened" — Newsreader 26px italic `#3a2c14`, line-height 1.05
- Rule: 130×2, fill `#8a7444` @45%
- `first` section: drop cap + first paragraph
- Body paragraph (`H95dih`): Newsreader 15.5px `#4a3622`, line-height 1.6
- `keepsake` section: inline keepsake item
- Flex spacer
- Folio: "~  xxxi  ~" — Newsreader 13px italic `#8a6a3a`, centered

## Poem Footer (`t9c4tk`)
"turn each page gently — the ink is still drying"
— Newsreader 14px italic, `#f3e9d4` @76%, centered, y872
