# Spirit Garden — Atelier (Gallery)
Node ID: `u1XaNz`
Screenshot: `screens/atelier.png`

## Frame
| Property | Value |
|---|---|
| Size | 1440 × 900 |
| Background fill | `#121c15` |
| Canvas position | x3120 y11000 |

## Layer Stack
| Layer | Node | Notes |
|---|---|---|
| 1 | `okGal` | Wallpaper 1536×996, offset −48/−48, blur 13px |
| 2 | `fP0r3` | Dusk gradient |
| 3 | `y2hTsh` | `pollen.glsl` shader |
| 4 | `S0u62L` | Dock ref at x526 y786 |
| 5 | `onCqk` | Poem footer at y872 |
| 6 | `NqD24` | Atelier Window at x130 y78 |
| 7 | `jeedY` | `soot.glsl` shader |

## Atelier Window (`NqD24`)
- Size: 1180 × 712 at x130 y78
- Corner radius: 26px; same glass chrome as other windows
- Layout: vertical

### Titlebar (`hRp6x`) — "Atelier" as title

### Content (`jAxAC`) — layout vertical, gap 18, padding 24

#### Header (`n7DRX`) — justify space-between, align end
Left crumb (`V7xFbO`):
- "THE ATELIER · COLLECTION" — Geist 10px 600 `#8a9678`, letter-spacing 2
- "Seasons" — Newsreader 27px italic `#33442f`, line-height 1

Right: "48 works gathered through the year" — Geist 12px `#6f7e63`

#### Filter Chips (`Saj32`) — horizontal row, gap 8
| Chip | Fill | Text color | State |
|---|---|---|---|
| All | gradient `#5a9268`→`#3f6e4c` | `#ffffff` 600 | Active |
| Spring | `#ffffff` @50%, stroke `#ffffff` @70% | `#52634a` 500 | Inactive |
| Summer | same | same | Inactive |
| Autumn | same | same | Inactive |
| Winter | same | same | Inactive |
| Spirits | same | same | Inactive |

All chips: r999, padding 7/15, Geist 13px

#### Gallery (`dMMcU`) — 3-column masonry, gap 16

Art cards (fill_container wide per col, r16, fill `#ffffff` @50%, stroke `#ffffff` @50%):
| Col | Card 1 | Card 2 |
|---|---|---|
| Col 1 | "Morning Meadow" (image: Ghibli landscape) | "Kitsune at Dusk" (image) |
| Col 2 | "First Bloom" (spring painting) | "Rainlight" (atmospheric) |
| Col 3 | "Wisteria Path" (wisteria arch) | "Greenhouse" (glass structure) |

Each card contains: image thumbnail (fill_container, rounded top) + caption area below

## Poem Footer (`onCqk`)
"the meadow keeps a portrait of every season"
— Newsreader 14px italic, `#f3e9d4` @76%, centered, y872
