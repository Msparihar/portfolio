# Spirit Garden — Grove (Files, simple)
Node ID: `djAGK`
Screenshot: `screens/grove.png`

## Frame
| Property | Value |
|---|---|
| Size | 1440 × 900 |
| Background fill | `#121c15` |
| Layout | none (absolute positioning) |
| Canvas position | x1560 y11000 |

## Layer Stack (bottom to top)
| Layer | Node | Notes |
|---|---|---|
| 1 | `jQBtq` | Wallpaper 1536×996, offset −48/−48, blur 13px |
| 2 | `OFfgE` | Dusk gradient (linear + radial combined) |
| 3 | `AVOuL` | `pollen.glsl` shader, full frame |
| 4 | `Ucq0q` | Grove Window — see below |
| 5 | `I2Iu9j` | Dock ref (`TLDts`) at x526 y786 |
| 6 | `uP6U7` | Poem footer at y872 |
| 7 | `A1OXa` | `soot.glsl` shader, full frame |

## Grove Window (`Ucq0q`)
- Size: 1080 × 684 at x180 y92
- Corner radius: 26px
- Fill: `#fffdf7` @85%
- Stroke: `#ffffff` @65%, 1.5px inner
- Background blur: 16px
- Shadow: `#3a4a2e` @25%, blur 48, offset y+20
- Clip: true
- Layout: vertical

### Titlebar (`YZI8L`) — height 54, padding 0/18, justify space-between
**Left side** (`fWnxb`): traffic lights group (`GH3K3`) + "The Grove" Newsreader 18px italic `#33442f`
**Right side** (`KXqiF`):
- Search pill (`g1VNN`): r999, fill `#ffffff` @55%, stroke `#ffffff` @70%, padding 7/14, gap 8
- View toggle (`b07SzT`): r10, fill `#ffffff` @55%, padding 3, gap 2

**Titlebar divider** (`Lbq9k`): 1px `#33442f` @10%

### Body (`PeuHt`) — fill_container

#### Sidebar (`ReMNm`) — width 248, layout vertical, padding 18/14, fill `#fbf7ec` @20%
**PLACES section:**
- Label: "PLACES" — Geist 10px 600 `#6f7e63`, letter-spacing 2
- `nav-Garden` (active): r12, fill `#4a7c59` @15%, padding 9/11 — 🌻 Inter 16px + "Garden" Geist 14px 600 `#2f5d3f`
- `nav-Greenhouse`: r12, fill transparent — 🌿 + "Greenhouse" Geist 14px 500 `#46583f`
- `nav-Journals`: 📔 + "Journals"
- `nav-Atelier`: + "Atelier"
- `nav-Letters`: + "Letters"
- `nav-Spirits`: + "Spirits"

**TAGS section:**
- Label: "TAGS" — same style
- `tag-Seeds`, `tag-Blooms`, `tag-Roots` — pill tags, padding 7/11

**Sidebar divider** (`hQawn`): 1px `#33442f` @10% h fill_container

#### Main Panel (`Ow3lW`) — layout vertical, gap 18, padding 24
**Header (`v6NIzV`)**: justify space-between
- Left crumb (`M5cwhw`): "THE GROVE  ›  GARDEN" Geist 10px 600 `#8a9678`, letter-spacing 2 + "Garden" Newsreader 27px italic `#33442f`, line-height 1
- Right sort pill (`eRzB0`): "Recently tended ▾" Geist 12px `#52634a`, r999, fill `#ffffff` @50%

**Grid (`Q0x35f`)** — 2 rows of 4 cards each, gap 16

File cards — corner radius 18, fill `#ffffff` @40%, stroke `#ffffff` @50%, padding 14, gap 10, layout vertical:
| Card | Tile color | Name | Meta |
|---|---|---|---|
| Sunflower Notes | `#ffd98a`→`#f0a94a` gradient | "Sunflower Notes" | "12 items" |
| Herb Garden | `#a3cf94`→`#5a9268` gradient | "Herb Garden" | "8 items" |
| Meadow.png | wallpaper image thumbnail | "Meadow.png" | "1.4 MB" |
| Morning Dew.txt | white @50% | "Morning Dew.txt" | "2 KB" |
| Birdsong.mp3 | white @50% | "Birdsong.mp3" | "3:58" |
| Field Journal | `#cdb6e0`→`#8a6fb0` gradient | "Field Journal" | "in progress" |
| Kitsune.png | wallpaper image thumbnail | "Kitsune.png" | "2.1 MB" |
| Spirit Sightings | `#9fd3e0`→`#4a93a8` gradient | "Spirit Sightings" | "6 items" |

Tile: 54×54, r14
Name: Geist 13px 600 `#33442f`
Meta: Geist 11px `#6f7e63`

**Footer area**: flex spacer + `#33442f` @8% 1px hair + footer bar

## Poem Footer (`uP6U7`)
"every seed you plant here keeps its own quiet record"
— Newsreader 14px italic, `#f3e9d4` @76%, centered, y872
