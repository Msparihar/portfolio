# 🦊 Golden Kitsune Walker — BENCHMARK (do not edit or delete)

This is a **frozen reference**: the first AI-generated, sliced, and animated walking
kitsune that came out clean. Treat it as set in stone — a benchmark for the
sprite-sheet pipeline and a reusable asset for the Spirit Garden lobby. Don't
regenerate or overwrite these files; if you improve the technique, make a *new*
folder and leave this one untouched.

Open `demo.html` in a browser to see it walk.

## Files
- `kitsune-walk.png` — the final sheet: **3 frames, 377×490 px per cell, 1131×490 total**, fully transparent, feet aligned.
- `source-sheet-raw.png` — the raw `gpt-image-1` single-row generation it was cut from (had a 4th frame cut off at the canvas edge, which the slicer dropped).
- `demo.html` — self-contained standalone page that animates the walker.

## How it was made (the pipeline)
1. **Generate** — OpenAI `gpt-image-1`, `size:'1536x1024'`, `background:'transparent'`. Prompt = a single-row FILM STRIP with clearly-separated transparent gaps (this layout slices far more reliably than a grid, which gpt-image-1 fills with an opaque haze):
   > Transparent PNG ... a horizontal FILM STRIP of cells in ONE single row, each cell separated by a WIDE band of empty transparency so no creature touches another. Each cell holds the SAME chibi three-tailed kitsune fox spirit (Studio Ghibli watercolor, cream-and-white fur, amber eyes, three tails), side profile facing RIGHT, same size, feet on the same baseline. Reading left→right gives one smooth WALK CYCLE. Keep the whole fox inside its cell (do not crop ears/nose/tails). No ground/shadow/grid/text.
2. **Auto-slice** — `sharp`: read the alpha channel, split into frames by transparent column-gaps (`ALPHA=22`, `GAP=6`, `MIN_W/H=60`, `PAD=16`), tight-crop each, **drop any frame touching the canvas edge** (incomplete/cut), align feet to a common baseline, repack into an even strip.
3. **Animate** — CSS only, two stacked animations: one steps the frames, one carries it across and flips facing.

## Reuse — drop-in animation (display ~85×110)
```css
.kitsune-walker { position: absolute; width: 85px; height: 110px;
  animation: kitWalkAcross 19s linear infinite; }
.kitsune { width: 85px; height: 110px;
  background: url('kitsune-walk.png') 0 0 / 255px 110px no-repeat;
  animation: kitStep .65s steps(3) infinite;
  filter: drop-shadow(0 6px 6px rgba(20,30,15,.25)); }
@keyframes kitStep { from { background-position-x: 0 } to { background-position-x: -255px } }
@keyframes kitWalkAcross {
  0%{transform:translateX(40px) scaleX(1)} 48%{transform:translateX(1320px) scaleX(1)}
  50%{transform:translateX(1320px) scaleX(-1)} 98%{transform:translateX(40px) scaleX(-1)}
  100%{transform:translateX(40px) scaleX(1)} }
```
Sheet faces RIGHT by default → `scaleX(1)` walking right, `scaleX(-1)` walking left.
Display sizing: element width = `255/3 = 85`; `background-size` width = `3 × 85 = 255`.
