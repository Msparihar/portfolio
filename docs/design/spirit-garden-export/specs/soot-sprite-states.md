# Spirit Garden — Soot Sprite Interaction States
Node ID: `Su8QG`
Screenshot: `screens/soot-sprite-states.png`

## Frame
| Property | Value |
|---|---|
| Size | 780 × 360 |
| Fill | `#13201a` |
| Layout | vertical, gap 16 |
| Padding | 24 |
| Canvas position | x2860 y14100 |

## Header
- Title: "SOOT SPRITE — interaction states" — Newsreader 18px `#f3efe2`
- Note: "Approach a sprite → it panics, glares red, and bolts to the farthest corner; it calms when you back away." — Geist 12px `#9fb0a0`

## State Cards (`JuWgz`) — 4-column layout, gap 16
All cards: corner radius 16, fill `#1c2a21`, stroke `#ffffff` @15%, padding 16, gap 10, layout vertical, align center, justify center

### Idle (`Bw3Pq`)
Stage (`NQxMj`): 110×110, r16, fill `#15231b`, clip true
- Body: ellipse 58×58 @x26 y30, `#15110f`, blur 1.5px
- Eye L: ellipse 11×12 @x43 y43, `#f4f0e6`
- Eye R: ellipse 11×12 @x56 y43, `#f4f0e6`
Caption: "Idle" — Geist 12px `#9fb0a0`, centered

### Alert (`w2ibBC`)
Stage (`BV3VH`): 110×110, same shell
- Body: ellipse 58×58, larger eyes (13×13)
- Eye L: @x42 y42, `#f4f0e6`
- Eye R: @x55 y42, `#f4f0e6`
- Exclamation (`BMTlc`): "!" Newsreader 20px 700 `#f4f0e6` @x52 y8
Caption: "Alert"

### Angry (`YtUd9`)
Stage (`waH6J`): 110×110
- Body: ellipse 58×58, fill `#241310` (darker, reddish tint)
- Eye L: ellipse 12×6 @x42 y47, `#ff6a4a` (slitted red)
- Eye R: ellipse 12×6 @x56 y47, `#ff6a4a`
- Brow L (`OOCSJ`): rect 12×3, `#15110f`, r1.5, rotation −20°, @x41 y40
- Brow R (`FauSk`): rect 12×3, `#15110f`, r1.5, rotation +20°, @x57 y46
- Anger marks: two cross marks in red `#ff6a4a` at x74/x80 y22
Caption: "Angry"

### Fleeing (`cYy9P`)
Stage (`LHyXW`): 110×110
- Dust cloud (`L6u1pj`): ellipse 34×22 @x8 y74, `#cfe0d2` @30%, blur 3px
- Motion lines: 3 horizontal rects (14–16px wide), `#cfe0d2` @60%, y 46/56/66
- Body: ellipse 64×52, `#241310`, rotated −12° — fleeing/tilted posture
- Eye L: ellipse 12×6, `#ff6a4a`, rotated −12°
- Eye R: ellipse 12×6, `#ff6a4a`, rotated −12°
Caption: "Fleeing"

## State Transition Logic
- Pointer within ~80px of a sprite → Alert
- Pointer within ~40px → Angry
- Click/tap → Fleeing (bolt to farthest canvas corner)
- Pointer retreats → calm back to Idle over ~1.5s
- Shader (`soot.glsl`) handles the rendering; JS proximity detection drives the state
