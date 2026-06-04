# Three.js / R3F Inspiration — 3D World-Map & Explorable-World References

> Source: r/threejs goldmine scan (2026-06-04). Feeds the **3D world-map lobby** and **3D asset vault** ideas in `docs/IDEAS.md`.
> Companion data: `docs/research/threejs-reddit/INDEX.md` (authenticated Reddit API deep-mine — post media, video frames, repo links).

## What to steal first (top 3)
1. **interactive-low-poly-environment** — clone the *art direction & object placement* (closest to "stylized, low-poly, magical"). [github.com/1391819/interactive-low-poly-environment](https://github.com/1391819/interactive-low-poly-environment)
2. **THREE.Terrain** + **r3f-terrain** — Simplex/Perlin noise architecture for the base overworld terrain; THREE.Terrain = battle-tested algorithms, r3f-terrain = modern R3F patterns. [github.com/IceCreamYou/THREE.Terrain](https://github.com/IceCreamYou/THREE.Terrain) · [github.com/mozzius/r3f-terrain](https://github.com/mozzius/r3f-terrain)
3. **hello-worlds** — planetary LOD + chunking; "load/unload region on approach" → clicking a region morphs the camera and loads the themed world. [github.com/kenjinp/hello-worlds](https://github.com/kenjinp/hello-worlds) · demo: worlds.kenny.wtf

## Highest relevance — multi-world / region selection
- **hello-worlds** (kenjinp) — virtual planets at scale; chunked LOD; closest match to "multiple explorable worlds." **HIGH**
- **WorldMap** (ArthurBeaulieu) — 3D globe, raycasted click-to-region on merged country geometry (GeoJSON). The click-to-enter interaction model, clean. [github.com/ArthurBeaulieu/WorldMap](https://github.com/ArthurBeaulieu/WorldMap) **HIGH**
- **geo-three** (tentone) — tile-based geographic rendering, multi-provider, proven LOD culling. Terrain streaming if real data ever wanted. [github.com/tentone/geo-three](https://github.com/tentone/geo-three) **MED-HIGH**

## Stylized terrain & low-poly islands (the aesthetic)
- **interactive-low-poly-environment** (1391819) — complete low-poly aesthetic package: terrain, procedural objects, water, animation. **HIGH**
- **THREE.Terrain** (IceCreamYou) — Perlin/Simplex/Worley/Diamond-Square + erosion; heightmaps or pure gen; mature. **MED-HIGH**
- **r3f-terrain** (mozzius) — Simplex island gen in R3F idioms; lightweight prototyping. **MED**

## Floating-island portfolios (hub + interaction model)
- **3D-sky-island-portfolio-threejs-react** (theringsofsaturn) — island-as-hub, orbit camera, clickable nav zones. [github.com/theringsofsaturn/3D-sky-island-portfolio-threejs-react](https://github.com/theringsofsaturn/3D-sky-island-portfolio-threejs-react) **MED-HIGH**
- **3d-island_portfolio_react** (basedhound) — orbit + animated fox creature reacting to form state. Mascot-in-world pattern. [github.com/basedhound/3d-island_portfolio_react](https://github.com/basedhound/3d-island_portfolio_react) **MED**
- **ThreeJS_Portfolio** (RobinRuf) — fly-around island, checkpoint-triggered popups. [github.com/RobinRuf/ThreeJS_Portfolio](https://github.com/RobinRuf/ThreeJS_Portfolio) **MED**

## Procedural & advanced terrain
- **threejs-procedural-terrain** (dimartarmizi) — chunked LOD + biome system; biomes ↔ different "worlds." [github.com/dimartarmizi/threejs-procedural-terrain](https://github.com/dimartarmizi/threejs-procedural-terrain) **MED**
- **geo-globe-three** (NombanaMtechniix) — GeoJSON country outlines, raycast selection, hover highlights. **MED**
- **strata-game-library** (jbcom) — full R3F game framework (terrain/physics/animation/audio); reference for scaling. [github.com/jbcom/strata-game-library](https://github.com/jbcom/strata-game-library) **MED**

## Region-click interaction recipe
Combine #1 object placement + #2 raycasting + WorldMap's click-to-region flow.
