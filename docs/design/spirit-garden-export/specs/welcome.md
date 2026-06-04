# Spirit Garden — Welcome (Lock Screen)
Node ID: `i2bEv`
Screenshot: `screens/welcome.png`

## Frame
| Property | Value |
|---|---|
| Size | 1440 × 900 |
| Background fill | `#121c15` |
| Layout | none (absolute positioning) |
| Clip | true |

## Layer Stack (bottom to top)
| Layer | Node | Type | Notes |
|---|---|---|---|
| 1 | `Mu8MO` | bg-painting | Wallpaper image, 1520×980, offset −40/−40, blur 13px |
| 2 | `USnDa` | dusk-grade | Linear gradient overlay 180°, full frame |
| 3 | `Xqu9c` | horizon-bloom | Radial gradient `#ffcf78` @25%→transparent, 1440×900 |
| 4 | `jFEdH` | mascot-contact-shadow | Ellipse 164×24 @x1126 y784, fill `#0a1408` @36%, blur 14px |
| 5 | `BzItI` | Pollen shader | `pollen.glsl`, full frame — animated |
| 6 | `ts80h` | Hero group | Vertical layout, centered in 1440×900 starting at y118 |
| 7 | `Jcgsq` | w-weather | Widget at x72 y96 |
| 8 | `U2t1mB` | w-nowplaying | Widget at x72 y560 |
| 9 | `JhlKI` | w-intention | Widget at x1156 y128, w212 |
| 10 | `U243zx` | poem footer | Text at y878 |
| 11 | `xTgmx` | Mascot — Kitsune | Image 240×240 at x1086 y560 |
| 12 | `oZ3t5` | w-memory | Widget at x1156 y300, w212 |
| 13 | `kS6ND`, `dzOqr`, `L57pY` | dandelion decorations | Small floating dandelion sprites |
| 14 | `EvaDP` | Dock | At x526 y786 (ref `TLDts`) |
| 15 | `C1VAmT` | Soot Sprites shader | `soot.glsl`, full frame — animated |

## Hero Group (`ts80h`) — Vertical Layout, centered
| Element | Node | Font | Size | Color |
|---|---|---|---|---|
| Avatar circle | `APGDX` | — | 74×74 | Fill `#fffdf7` @70%, stroke `#ffffff` @60%, blur 10px bg, r999 |
| Spacer | `smdvL` | — | 8px gap | — |
| Greeting | `vJGLJ` | Newsreader italic | 23px | `#f9f4e8`, shadow blur 8 |
| Clock | `R3p528` | Newsreader 500 | 132px | `#fffdf6`, line-height 1, two shadows |
| Date | `uiJwJ` | Geist 500 | 14px | `#ece6d6`, letter-spacing 2, shadow blur 6 |
| Spacer | `E2sdI` | — | 18px | — |
| Enter chip | `rtWvK` | — | — | See Enter Chip spec below |
| Hint gap | `D5yEC2` | — | 6px | — |
| Swipe hint | `a3uh3f` | Geist 500 | 11px | `#f1ecdb` @80%, letter-spacing 1.5 |

## Enter the Garden Chip (`rtWvK`)
- Corner radius: 999 (pill)
- Fill: `#fdfaf2` @ 90%
- Stroke: `#ffffff` @ 60%, 1.5px inner
- Background blur: 10px
- Shadow: `#5b6e4d` @25%, blur 20, offset y+8
- Padding: 6px top/bottom, 6px right, 22px left
- Gap: 14px
- **Left label** (`r5JPiP`): "Enter the Garden" — Newsreader 17px, `#33442f`
- **Right arrow button** (`ENE9g`): 42×42 circle, gradient `#5a9268`→`#3f6e4c` at 135°, shadow blur 10 `#2f5d3f` @40%; contains "→" Inter 19px 600 `#f7f3e8`

## Widgets (shared glass treatment)
All widgets: fill `#fdfaf2` @90%, stroke `#ffffff` @65%, bg blur 12px, shadow `#4b5e3d` @20% blur 24 y+10, corner-radius 22, padding 18.

### Weather Widget (`Jcgsq`) — 212 wide, at x72 y96
- Row: 🍃 icon + "Gentle breeze" — Newsreader 17px `#33442f`
- Bottom row: "18°" — Newsreader 40px 500 `#33442f`, line-height 1 + "clear skies / over the meadow" — Geist 11px `#52634a`

### Now Playing Widget (`U2t1mB`) — 268 wide, at x72 y560
- Label: "NOW PLAYING" — Geist 10px 600 `#6f7e63`, letter-spacing 2
- Album art (`S9dsD`): 46×46 r12, gradient `#7fb08a`→`#4a7c59` at 135°, ♪ icon Inter 20px `#f7f3e8`
- Song (`t0IUcv`): "The Path of the Wind" — Newsreader 16px `#33442f`
- Artist (`vDGKJ`): "Joe Hisaishi · My Neighbor Totoro" — Geist 11px `#6f7e63`
- Progress track: height 5, r999, bg `#33442f` @15%; fill `#4a7c59`
- Times: Geist 10px `#6f7e63`

### Intention Widget (`JhlKI`) — 212 wide, at x1156 y128
- Label: "TODAY'S INTENTION" — Geist 10px 600 `#6f7e63`, letter-spacing 2
- Quote: "Plant one idea. Water it twice." — Newsreader 18px italic `#33442f`, line-height 1.35
- Tag chip (`YU1xK`): r999, fill `#4a7c59` @15%, padding 5/12; 🌱 Inter 12px + "in progress" Geist 12px 500 `#3f6e4c`

### Memory Widget (`oZ3t5`) — 212 wide, at x1156 y300, padding 12
- Label: "A MEMORY" — Geist 10px 600 `#6f7e63`, letter-spacing 2
- Photo (`f2dvS`): fill_container wide, 112px tall, r12, wallpaper image
- Caption (`krz7D`): "Last evening, in the meadow" — Newsreader 13px italic `#33442f`

## Mascot — Kitsune
- Node `xTgmx`: image rectangle 240×240 at x1086 y560
- Image file: `mascot-ghibli-idle.webp` (already on disk at `docs/design/mascot-ghibli-idle.webp`)
- Contact shadow (`jFEdH`): ellipse 164×24, `#0a1408` @36%, blur 14px

## Decorative Dandelions
Three dandelion sprites (tuft + stem + seed) positioned absolutely:
- `kS6ND`: 16×16 at x432 y298, rotation 16°
- `dzOqr`: 13×13 at x902 y238, rotation −12°
- `L57pY`: 11×11 at x348 y452, rotation 24°
Each tuft is a blurred ellipse `#fdfaf2` @85%.

## Poem Footer (`U243zx`)
"the spirit garden remembers every visitor"
— Newsreader 14px italic, `#3a4a32` @60%, centered, width 1440, y878

## Shaders (animated, full-frame 1440×900)
| Shader | File | Blend |
|---|---|---|
| Pollen (`BzItI`) | `pollen.glsl` | normal |
| Soot Sprites (`C1VAmT`) | `soot.glsl` | normal |
