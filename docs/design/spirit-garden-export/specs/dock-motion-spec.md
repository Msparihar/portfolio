# Spirit Garden — Dock Motion Spec (Annotations)
Node ID: `Sll4v`
Screenshot: `screens/dock-motion-spec.png`

## Frame
| Property | Value |
|---|---|
| Size | 760 × 470 |
| Fill | `#13201a` |
| Layout | vertical, gap 12 |
| Padding | 20/24 |
| Canvas position | x2860 y13580 |

## Header
- Title: "DOCK MOTION — INTERACTION SPEC" — Newsreader 20px 600 `#f3efe2`
- Subtitle: "macOS-style behaviors for the live (coded) dock" — Geist 12px `#8fa0a4`

## Spec Blocks (2-column layout, gap 14)

### Column A

**01 HOVER MAGNIFY**
| Property | Value |
|---|---|
| Hovered | scale 1.0 + 1.6 |
| Neighbors | ±1 icon: 1.12, ±2 icon: smaller |
| Falloff | radius ~2 icons |
| Lift | `translateY(-5px)` |
| Easing | `cubic-bezier(0.2, 0.2, 0, 2.0)` |
| Tracking | follows pointer X continuously |

**03 CLICK / LAUNCH**
| Property | Value |
|---|---|
| Press | scale 0.92 over 80ms |
| Launch | `translateY(-14%, 0, 0) (damped)` ~500ms into bounce |
| Running | indicator dot fades in beneath tile |

### Column B

**02 NAME LABEL (tooltip)**
| Property | Value |
|---|---|
| Trigger | after 150ms hover, above icon |
| In | `y: +5px → 0, opacity: 0→1`, over 90ms |
| Style | frosted dark chip, white text |
| Out | fades immediately on leave |

**04 ENTER / IDLE**
| Property | Value |
|---|---|
| On load | drifts up + fades — `translateY 24→0, 400ms` |
| Idle | icons perfectly still |
| Reduced | disable magnify + bounce; keep fades |

**05 ALREADY LIVE (shader)**
| Shader | Details |
|---|---|
| Pollen | drift + twinkle (`pollen.glsl` @1x time) |
| Soot | roam + scatter; glare red + flee to corner (`soot.glsl` @mousemove) |

All spec blocks: corner radius 14, fill `#1c2a21`, stroke `#ffffff` @12%, padding 14, gap 6
Section index numbers: Geist 11px 600 `#6f9adf`
Section titles: Geist 13px 600 `#e8efe2`
Row labels: Geist 12px `#8fa0a4` or `#a0b8a0`
Row values: Geist 12px `#d0e0d0` (monospace-style)
