# Spirit Garden — Whisperwell (Chat / AI)
Node ID: `BS1Lh`
Screenshot: `screens/whisperwell.png`

## Frame
| Property | Value |
|---|---|
| Size | 1440 × 900 |
| Background fill | `#121c15` |
| Canvas position | x1560 y12020 |

## Layer Stack
| Layer | Node | Notes |
|---|---|---|
| 1 | `dp3V7` | Wallpaper 1536×996, offset −48/−48, blur 13px |
| 2 | `tXgJJ` | Dusk gradient (linear + radial) |
| 3 | `ArWmd` | `pollen.glsl` shader, full frame |
| 4 | `RdBDE` | Whisperwell Window at x220 y104 |
| 5 | `YZAcF` | Dock ref at x526 y786 |
| 6 | `fMrQN` | Poem footer at y872 |
| 7 | `lyAAQ` | `soot.glsl` shader, full frame |

## Whisperwell Window (`RdBDE`)
- Size: 1000 × 660 at x220 y104
- Corner radius: 26px
- Fill: `#fffdf7` @85%
- Stroke: `#ffffff` @65%, 1.5px inner
- Background blur: 16px
- Shadow: `#3a4a2e` @25%, blur 48, offset y+20
- Layout: vertical

### Titlebar (`kYGO5`) — height 54, padding 0/18, justify space-between
- Left: traffic lights + "Whisperwell" title (Newsreader 18px italic `#33442f`)
- Right: context controls (inferred from pattern)

### Titlebar divider (`FDzME`): 1px `#33442f` @10%

### Body (`kiXBW`) — layout vertical, gap 14, padding 30

#### Well Pool (`EtUxW`) — fill_container wide, height 190, r22, clip true
- Fill: radial gradient, center y 42% — `#123338` outer → `#0a1f24` @60% → `#06151a` inner
- Three concentric ring ellipses (decorative ripples): `#bfe9ec`, `#cdeef0`, `#e0f4f5` at low opacity
- Moon glint (`beOWc`): ellipse 76×20, `#ffe9c2` @55%, blur 6px
- Pool label (`vGu65`): "THE WHISPERING WELL" — Geist 10px 600 `#a7cdcd`, letter-spacing 2
- Invite text (`J7Aek`): "Whisper, and the garden listens." — Newsreader 19px italic `#dcf0f0`, centered

#### Transcript (`N80xWN`) — layout vertical, gap 14
**User whispers** (right-aligned pills) — `dwmgn` / `MtTIe`: r999, fill `#33442f` @6%, padding 8/16
**Garden replies** (left, with marker): 
- Marker (`pZppq`): 28×28 circle, fill `#4a7c59` @8%, stroke `#4a7c59` @15%
- Text: Newsreader 16px `#33442f`, line-height 1.5

Sample reply 1: "The wisteria is loudest this morning. Three new shoots by the eastern stones — go before the bees lay claim."
Sample reply 2: "She is kept in the pressed pages — the thirty-first of May, the day the arch first turned to lavender."

#### Spell Chips (`w4G89`) — horizontal row, gap 10
Label: "cast a spell" — Geist 11px italic `#8a9678`
Chips (r999, fill `#ffffff` @55%, stroke `#ffffff` @70%, padding 6/13, gap 6):
| Emoji | Label |
|---|---|
| 🌱 | plant |
| 👂 | listen |
| 🌬 | wander |
| 🕯 | remember |
| ☾ | dream |
Label font: Geist 12px 500 `#52634a`

#### Whisper Input Bar (`DJ5c5`) — pill, fill `#ffffff` @80%, stroke `#ffffff` @70%, padding 8/8/8/20, gap 12
- Cursor icon: "◌" Inter 16px `#6f8a86`
- Placeholder: "whisper into the well…" — Geist 14px `#8a9678`
- Send button (`L4SIR`): 40×40 circle, gradient `#5aa0a0`→`#3f6e4c` at 135°, shadow `#2f5d3f` @35% blur 10; "✦" icon

## Poem Footer (`fMrQN`)
"spoken softly, the garden always answers in kind"
— Newsreader 14px italic, `#f3e9d4` @76%, centered, y872
