# Spirit Garden — Letters (Mail)
Node ID: `U8bDl`
Screenshot: `screens/letters.png`

## Frame
| Property | Value |
|---|---|
| Size | 1440 × 900 |
| Background fill | `#121c15` |
| Canvas position | x3120 y12020 |

## Layer Stack
| Layer | Node | Notes |
|---|---|---|
| 1 | `z6QXEm` | Wallpaper 1536×996, offset −48/−48, blur 13px |
| 2 | `M3Tpr` | Dusk gradient |
| 3 | `oCAqL` | `pollen.glsl` shader |
| 4 | `xwB2C` | Dock ref at x526 y786 |
| 5 | `q2Oy1` | Poem footer at y872 |
| 6 | `JKzgI` | Letters Window at x180 y92 |
| 7 | `qpGBQ` | `soot.glsl` shader |

## Letters Window (`JKzgI`)
- Size: 1080 × 684 at x180 y92
- Same glass chrome as Grove (r26, fill `#fffdf7` @85%, blur 16, shadow, stroke)
- Layout: vertical

### Titlebar (`LUBM3`) — "Letters" as title (Newsreader 18px italic)

### Body (`m9oAe`) — three-column horizontal layout

#### Mailboxes Pane (`LBFTj`) — width 228, layout vertical, gap 5, padding 18/14, fill `#fbf7ec` @20%
Label: "MAILBOXES" — Geist 10px 600 `#6f7e63`, letter-spacing 2

Mailbox items (r12, padding 9/11, justify space-between):
| Mailbox | State | Badge |
|---|---|---|
| Received | Active: fill `#4a7c59` @15% | "3" Geist 11px 600 `#3f6e4c` |
| Sent | Inactive: transparent | — |
| Drafts | Inactive | "1" Geist 11px 600 `#8a9678` |
| Pressed & kept | Inactive | "9" Geist 11px 600 `#8a9678` |

Seasonal quote card (`AVY2U`): r14, fill `#ffffff` @35%, stroke `#ffffff` @40%, padding 13, gap 4
- "THIS SEASON" — Geist 9px 600 `#8a9678`, letter-spacing 2
- Quote: ""The wind brings news from every meadow."" — Newsreader 14px italic `#33442f`, line-height 1.35

#### Message List (`hpJ31`) — width 340, layout vertical

List header (`JQXgA`): justify space-between, padding 16/18/12/18
- Left: thread name label + "Received" subheader
- Right: "3 new" Geist 11px 500 `#6f7e63`

Divider: 1px `#33442f` @8%

Message rows (layout vertical, gap 4, padding 6/10):
| Row | Fill | Stroke |
|---|---|---|
| Vesper the fox (active/selected) | `#ffffff` @55% | `#ffffff` @50% |
| The west wind | transparent | transparent |
| A forest spirit | transparent | transparent |
| Old gardener Mori | transparent | transparent |
| A slow correspondent | transparent | transparent |

Each row: r14, padding 11, gap 11

#### Reading Pane (`D0keP`) — fill_container, layout vertical, gap 18, padding 26/30/22/30

Letter header (`Bw5tm`): gap 14
- Avatar (`WLOPp`): 52×52 r999, gradient `#f1b487`→`#c8784a` at 135°, shadow `#c8784a` @35% blur 12
- Sender info columns
- Keep star button (`oNrHc`): 38×38 r999, fill `#ffffff` @50%, stroke `#ffffff` @70%

Subject (`Rt5K8`): "On the matter of the missing plums"
— Newsreader 30px italic `#33442f`, line-height 1.1

Divider: 1px `#33442f` @8%

Letter body (`Iu4AU`): layout vertical, gap 14
- Paragraphs: Newsreader 15px `#46583f`, line-height 1.5
- Salutation + sign-off: `#33442f`
- Signature (`S7SBE`): "Vesper" — Newsreader 19px italic `#33442f`

Sample letter from Vesper the fox about stolen plums, offering a river stone in return.

Actions bar (`c0aNi3`): gap 10
- Reply button (`pHrpc`): r999, gradient `#5a9268`→`#3f6e4c`, padding 10/18, gap 8
- Keep button (`zO9cs`): r999, fill `#ffffff` @55%, stroke `#ffffff` @70%, padding 10/18, gap 8
- Flex spacer
- "let it drift off →" — Geist 12px italic `#8a9678`

## Poem Footer (`q2Oy1`)
"every letter here is carried in on a passing breeze"
— Newsreader 14px italic, `#f3e9d4` @76%, centered, y872
