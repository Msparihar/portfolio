# Spirit Garden — Design Tokens

## Source
Extracted from `docs/design/worlds.pen` via `get_variables`.

Note: These are the OLD Grimoire world tokens that are still defined in the file.
The Spirit Garden uses its own inline color/type values (listed per-screen in each spec).
The tokens below are present in the file but are NOT the Spirit Garden palette.

| Token | Type | Value |
|---|---|---|
| `gr-bg` | color | `#140f0a` |
| `gr-body` | font | `EB Garamond` |
| `gr-display` | font | `Cinzel` |
| `gr-gold` | color | `#b08428` |
| `gr-gold-bright` | color | `#d8b24c` |
| `gr-ink` | color | `#3a2c18` |
| `gr-ink-soft` | color | `#6b5a3e` |
| `gr-ink-strong` | color | `#241809` |
| `gr-leather` | color | `#2c1a0e` |
| `gr-leather-edge` | color | `#4a2f18` |
| `gr-line` | color | `#b59c6a` |
| `gr-parchment` | color | `#e9dcb8` |
| `gr-parchment-edge` | color | `#cdb784` |
| `gr-rubric` | color | `#8c2f23` |

## Spirit Garden Actual Palette (from design nodes — no named variables)

### Base / Background
| Role | Hex |
|---|---|
| Canvas / world bg | `#121c15` |
| Dusk sky gradient top | `#0d1a28` @ 70% |
| Dusk sky gradient mid | `#20302E` @ 55% |
| Dusk horizon warmth | `#5e4726` @ 45% |
| Dusk sky gradient bottom | `#0a140c` @ 93% |
| Horizon radial bloom | `#ffcf78` @ 25% radial |

### Glass / Window Chrome
| Role | Hex |
|---|---|
| Window fill | `#fffdf7` @ 85% |
| Window stroke | `#ffffff` @ 65% |
| Background blur | 16px |
| Window shadow | `#3a4a2e` @ 25%, blur 48px, offset y+20 |
| Window corner radius | 26px |
| Titlebar hair divider | `#33442f` @ 10% |

### Widget Glass
| Role | Hex |
|---|---|
| Widget fill | `#fdfaf2` @ 90% |
| Widget stroke | `#ffffff` @ 65% |
| Widget bg blur | 12px |
| Widget shadow | `#4b5e3d` @ 20%, blur 24px, offset y+10 |
| Widget corner radius | 22px |

### Text Colors
| Role | Hex | Font |
|---|---|---|
| Primary dark green | `#33442f` | — |
| Secondary muted green | `#52634a` | — |
| Tertiary label | `#6f7e63` | — |
| Section label (caps) | `#6f7e63` | Geist 10px 600, letter-spacing 2 |
| Light cream | `#f9f4e8` | — |
| Off-white | `#fffdf6` | — |
| Warm parchment | `#ece6d6` | — |
| Poem footer | `#f3e9d4` @ 76% | Newsreader 14px italic |

### Accent / Action
| Role | Hex |
|---|---|
| Primary green gradient start | `#5a9268` |
| Primary green gradient end | `#3f6e4c` |
| Tag bg | `#4a7c59` @ 15% |
| Active nav bg | `#4a7c59` @ 15% |
| Now-playing progress fill | `#4a7c59` |
| Track bg | `#33442f` @ 15% |

### Dock
| Role | Hex |
|---|---|
| Dock fill layer 1 | `#ffffff` @ 12% |
| Dock fill layer 2 | gradient `#ffffff66`→`#ffffff14`→`#ffffff00` at 120° |
| Dock stroke | `#ffffff` @ 70% |
| Dock bg blur | 10px |
| Dock shadow | `#000000` @ 22%, blur 30px, offset y+14 |
| Dock corner radius | 24px |
| Dock padding | 10px top/bottom, 14px left/right |
| Dock gap between tiles | 12px |

## Typography Scale

| Element | Family | Size | Weight | Style |
|---|---|---|---|---|
| Clock (Welcome) | Newsreader | 132px | 500 | normal |
| Greeting (Welcome) | Newsreader | 23px | 400 | italic |
| Date (Welcome) | Geist | 14px | 500 | normal, letter-spacing 2 |
| Window title | Newsreader | 18px | 400 | italic |
| Section breadcrumb label | Geist | 10px | 600 | caps, letter-spacing 2 |
| Content heading h1 | Newsreader | 27px | 400 | italic |
| Letter subject | Newsreader | 30px | 400 | italic |
| Letter body | Newsreader | 15px | 400 | normal, line-height 1.5 |
| Body / nav items | Geist | 14px | 500–600 | normal |
| Widget label (caps) | Geist | 10px | 600 | caps, letter-spacing 2 |
| Widget value | Newsreader | 40px (temp), 18px (quote) | 500/400 | — |
| Song title | Newsreader | 16px | 400 | normal |
| Song artist | Geist | 11px | 400 | normal |
| Swipe hint | Geist | 11px | 500 | letter-spacing 1.5 |
| Poem footer | Newsreader | 14px | 400 | italic |
| Page curl hint | Geist | 9px | 400 | italic, letter-spacing 1 |
| Dock hover label | Geist (inferred) | — | — | frosted chip, white text |
