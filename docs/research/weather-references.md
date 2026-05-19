# Weather & Particle System References

Research findings for implementing the 8-state weather system with particle effects for the portfolio Desktop OS.

---

## 1. react-weather-effects

**Repo:** https://github.com/rauschermate/react-weather-effects  
**Stack:** React, Next.js (App Router), Three.js, WebGL  
**Last Activity:** Active development

### Summary
React component library providing animated weather effects (rain, snow, fog) that overlay on background images. Uses Three.js for 3D particles and custom WebGL shaders. Includes lightning effects with GSAP transitions.

### Implemented Features
- **Particle types:** Rain (WebGL), Snow (Three.js), Fog (Three.js with custom blending)
- **Weather states:** Rain variants (standard, storm, drizzle, fallout), Snow variants (gentle, stormy), Fog variants (light, dense)
- **Blending:** Custom Three.js blending for fog, GSAP animations for smooth transitions
- **Time-of-day:** Lightning effects suggest state switching capability

### Notable Patterns
Uses modular architecture with separate folders per weather type (`/src/app/rain/`, `/src/app/snow/`, `/src/app/fog/`). State management via navbar component switching. WebGL shaders for rain suggest low-overhead per-frame updates.

### Worth Stealing
- **Custom shader approach** for rain (WebGL vs Canvas2D) — more performant for high particle counts
- **Three.js TextureGeometry + custom material** for fog overlays (not just DOM opacity)
- **Modular structure:** separate systems per weather type make state cycling and testing easier

---

## 2. sparticles

**Repo:** https://github.com/simeydotme/sparticles  
**Stack:** Vanilla JS, Canvas 2D  
**Stars:** 1K+  
**Performance:** 1,000 particles at 9% CPU / 120fps (claimed)

### Summary
Lightweight, high-performance Canvas 2D particle library. Single RAF loop, configurable per-particle behavior (speed, drift, alpha, direction). Supports custom shapes and images. ~2KB minified.

### Implemented Features
- **Particle types:** Generic shapes + image-based (supports snow, rain, sparkles)
- **Blending:** `globalCompositeOperation` for custom blend modes
- **Customization:** Direction, drift, alphaSpeed, variance all configurable without code changes
- **Single loop:** One RAF per instance, no per-particle overhead

### Notable Patterns
Configuration-driven rather than class-based. Weather effects achieved through parameter tuples (e.g., snow = `{direction: 180, drift: 5-10, alphaSpeed: 5, color: white}`). Minimal API surface.

### Worth Stealing
- **Config-first architecture** — no need to subclass for weather variants, just JSON params
- **Alpha-speed parameter** — pulsing firefly effect could use `alphaSpeed: 20` with high min/max variance
- **Drift without wind:** Builtin `drift` parameter handles lateral sway; wind strength becomes a config multiplier

---

## 3. atmospheric-weather-card

**Repo:** https://github.com/shpongledsummer/atmospheric-weather-card  
**Stack:** Canvas 2D, vanilla JS  
**Platform:** Home Assistant integration  
**Performance Focus:** "Almost a third of code exists purely to keep it fast"

### Summary
Animated weather card with procedurally generated clouds, birds, planes, shooting stars, aurora, and wind vapor effects. Extensive performance tuning (3 presets: low/default/ultra, adjustable DPR, frame rate, cloud detail, effects intensity).

### Implemented Features
- **Particle types:** Birds, planes, shooting stars, aurora, wind vapor
- **Weather states:** Implied (aurora for clear/night, wind vapor correlates to wind strength)
- **Time-of-day:** Aurora suggests night-specific effects
- **Performance settings:** Dynamic DPR (0.5–2.0), frame rate toggle (30/60 fps), effects intensity (0–2)
- **Blending:** Canvas filters (darken, vivid, muted, warm) applied post-render

### Notable Patterns
Decouples visual quality from logic. Cloud generation uses procedural algorithm with adjustable puff detail. Effects intensity controls spawn rate (0 disables, 2 doubles). DPR scaling avoids DOM reflow during render.

### Worth Stealing
- **Effects intensity dial** — maps to spawn rate multiplier; perfect for wind strength multiplier
- **Procedural cloud detail** — procedural approach beats sprite atlas for memory
- **Preset system** — UX for "use default" vs "custom tuning"; good test harness

---

## 4. Interactive Desktop OS Portfolio

**Repo:** https://github.com/Justinianus2001/my-portfolio  
**Stack:** Vanilla JS, CSS animations, Canvas (particles)  
**Features:** Window management, taskbar, alt-tab, boot sequence

### Summary
Desktop OS simulator with animated background, glass-morphism UI, particle effects, and procedural background music. Shows how to layer window management on top of animated particle backdrop.

### Implemented Features
- **Particle types:** Colorful particles + geometric shapes
- **Rendering:** RequestAnimationFrame-based with CSS hardware acceleration
- **Blending:** Glass-morphism (backdrop blur) as overlay
- **Architecture:** Class-based DesktopPortfolio as root; particle system separate

### Notable Patterns
Throttled event handlers for window drag/resize. DOM caching for element references. Hardware-accelerated CSS animations reduce per-frame cost. Particle system runs independently from window manager.

### Worth Stealing
- **Independent particle loop** decoupled from DOM management — can toggle visibility without stopping simulation
- **Throttled input handlers** — window dragging / resizing doesn't starve RAF
- **Glass-morphism overlay** — soft-light blend mode achieved via backdrop-filter, not canvas compositing

---

## 5. Codrops: Tropical Particles Rain with Three.js

**Article:** https://tympanus.net/codrops/2021/03/17/tropical-particles-rain-animation-with-three-js/  
**Stack:** Three.js, WebGL  
**Level:** Production-grade tutorial

### Summary
Detailed tutorial on building a tropical rain particle system with Three.js. Covers custom geometry, instancing, and bloom effects. Uses sprite-based particles with gravity and wind.

### Implemented Features
- **Particle types:** Rain droplets with trail effect
- **Physics:** Gravity + wind drift, particle recycling at screen bottom
- **Blending:** Bloom post-processing for glow
- **Optimization:** Instanced geometry (single draw call for 1000s of particles)

### Notable Patterns
Sprite-based particles using Three.js PointsMaterial. Custom shader for particle size/alpha falloff. Recycling pool instead of allocation/GC churn. Bloom effect as post-processing pass (not per-particle).

### Worth Stealing
- **Instanced rendering** — one draw call instead of 1,000; scales to our 8 weather states
- **Particle recycling via modulo** — respawn at top when Y < threshold
- **Bloom post-processing** — firefly glow effect can use threejs postprocessing.EffectComposer

---

## 6. Red Stapler: Three.js Realistic Rain Tutorial

**Tutorial:** https://redstapler.co/three-js-realistic-rain-tutorial/  
**Stack:** Three.js, WebGL, custom shaders  

### Summary
Practical guide to building realistic rain with proper lighting, fog, and depth cues. Covers shader customization for rain streaks and interactive camera control.

### Implemented Features
- **Particle types:** Rain streaks (line-based, not dots)
- **Lighting:** Fog + directional light for depth
- **Interactivity:** Mouse-driven camera, parallax depth
- **Optimization:** Geometry instancing

### Notable Patterns
Rain streaks rendered as angled lines using custom vertex shader. Fog layer adds depth. No per-particle update needed if wind direction is uniform.

### Worth Stealing
- **Streak rendering** — our rain spec says "angled streaks"; shader-based beats sprite rotation
- **Uniform wind:** Single wind vector in shader eliminates per-particle updates

---

## 7. Three.js Snowfall Demo

**Demo:** https://threejsdemos.com/demos/particles/snow  
**Stack:** Three.js, WebGL  

### Summary
Classic snowfall with wind drift, sprite-based flakes, and vertical fall velocity. 50,000 particles at 60fps. Shows particle recycling pattern for continuous snow.

### Implemented Features
- **Particle types:** Snow flakes with drift
- **Physics:** Gravity, wind sway, particle recycling
- **Optimization:** Sprite texture atlas, single draw call

### Notable Patterns
Flakes recycled at Y threshold. Drift applied per frame (not per-particle update). Particle pool reuse avoids allocation.

### Worth Stealing
- **Wind drift pattern:** driftAmount = windStrength * sin(time + particleID) — creates natural sway without per-particle wind vector
- **Recycling threshold:** if (Y < minHeight) { position.y = maxHeight; position.x = randomX(); }

---

## Recommended Starting Point

**Start with:** (1) **sparticles** + (2) **react-weather-effects**

**Why:**
1. **sparticles** teaches the minimal canvas-based particle loop you need — single RAF, config-driven weather variants, blend modes. ~2KB baseline to learn from.
2. **react-weather-effects** shows modular architecture (separate systems per state) and how to layer weather effects (fog overlay with custom blending). Three.js gives scaling proof if we hit perf walls later.

**Implementation order:**
1. Build single RAF loop with config-driven particle generator (sparticles style)
2. Implement the 8 weather states as param presets (direction, drift, alphaSpeed, particle count)
3. Add time-of-day color tint via Canvas filter or shader
4. Implement auto-cycle timer with 3-minute interval, biased toward local hour
5. Overlay soft-light blend via `globalCompositeOperation` (sparticles pattern)
6. If perf bottlenecks emerge at 10k+ particles, migrate rain/snow to Three.js instancing (react-weather-effects pattern)

**Key decisions to make:**
- **Canvas 2D vs WebGL start:** Canvas 2D (sparticles) simpler, supports all 8 states. WebGL (Three.js) for scaling beyond 5k particles.
- **Blend mode approach:** Canvas `globalCompositeOperation` (light, fast) vs post-processing (heavy, polished). Start with compositeOp.
- **Wind vector:** Uniform (single value passed to RAF loop) scales better than per-particle updates.

---

## Feature Checklist for Our Spec

| Feature | sparticles | react-weather | atmospheric-card | Three.js demos |
|---------|-----------|---------------|------------------|----------------|
| 8+ weather states | ⚠️ Config | ✓ Built-in | ✓ Implied | ✓ Tutorials show pattern |
| Rain (angled streaks) | ⚠️ Needs shader | ✓ WebGL shaders | ✓ Canvas | ✓ Shader example |
| Snow, pollen, petal, dust | ✓ Sprite-based | ✓ Sprites | ✓ Particles | ✓ Sprites |
| Firefly (pulsing alpha) | ✓ alphaSpeed param | ✓ Custom | ⚠️ Coded | ✓ Shader variance |
| Time-of-day tint | ✗ Manual overlay | ✓ GSAP animations | ✓ Canvas filters | ⚠️ Post-processing |
| Blend mode (soft-light) | ✓ compositeOp | ✓ Three.js blending | ✓ Canvas filters | ✓ Post-processing |
| Wind strength multiplier | ✓ Drift param | ⚠️ Manual | ✓ Effects intensity | ✓ Wind in shader |
| Single RAF loop | ✓ By design | ✗ Per-system | ✗ Per-effect | ✗ Per-geometry |
| Performance targets | ✓ 9% @ 1k | ⚠️ Unspecified | ✓ Tunable | ✓ 60fps @ 50k |

