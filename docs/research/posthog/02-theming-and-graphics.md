# PostHog Theming, Visual Style & Graphics Research

> Scope: theming + visual style + graphics inventory only.
> OS shell mechanics and content/routing are covered by separate agents.
> Repo studied: `D:/Projects/portfolio/Research/posthog.com`
> Comparison: `D:/Projects/portfolio/src/config/themes.js` + `worlds.js`

---

## 1. Design Tokens

### 1.1 Token Architecture

PostHog uses a **two-layer indirection** for every color token:

1. **Tailwind config** maps semantic names to CSS variable references using RGB-triplet syntax
2. **`global.css`** defines the actual RGB triplet values, gated behind `data-scheme` + `.light`/`.dark`

```js
// tailwind.config.js — layer 1: semantic name → CSS variable bridge
colors: {
  primary: 'rgb(var(--bg) / <alpha-value>)',
  'primary-dark': 'rgb(var(--bg-dark) / <alpha-value>)',
  red: 'rgb(var(--text-primary) / <alpha-value>)',
  yellow: '#F7A501',
  blue: '#2F80FA',
}
```

```css
/* global.css — layer 2: actual values per scheme × mode */
[data-scheme='primary'] {
  &.light {
    --bg: 253 253 248;          /* #FDFDF8 warm off-white */
    --bg-dark: 245 245 237;
    --text-primary: 77 79 70;   /* warm near-black */
    --text-secondary: 91 95 90;
    --text-muted: 133 136 128;
    --border: 220 221 214;
    --accent: 232 232 225;
    --input-bg: 236 237 230;
    --input-border: 202 203 196;
  }
  &.dark {
    --bg: 30 31 35;
    --bg-dark: 24 25 29;
    --text-primary: 234 236 246;
    --text-secondary: 180 183 195;
    --text-muted: 122 126 143;
    --border: 59 61 72;
    --accent: 41 43 52;
  }
}
```

The RGB-triplet pattern (`253 253 248` without commas) is required for Tailwind's `<alpha-value>` injection to work. A class like `bg-primary/50` resolves to `rgb(253 253 248 / 0.5)` automatically.

### 1.2 Three-Tier Surface System

PostHog defines three `data-scheme` levels on any container, not just body. This enables locally-scoped dark/light surfaces on any DOM node:

```css
/* global.css — secondary scheme shifts the surface ~1 step darker */
[data-scheme='secondary'] {
  &.light {
    --bg: 238 238 231;          /* #EEEDE7 — body background color */
    --accent: 220 221 213;
  }
  &.dark {
    --bg: 24 25 29;
    --accent: 30 31 35;
  }
}

[data-scheme='tertiary'] {
  &.light {
    --bg: 220 221 213;
    --accent: 210 211 203;
  }
  &.dark {
    --bg: 18 19 23;
    --accent: 24 25 29;
  }
}
```

File reference: `src/styles/global.css` lines 1–396

### 1.3 Named Color Palette

From `tailwind.config.js`:

| Token | Value | Use |
|---|---|---|
| `yellow` | `#F7A501` | Primary CTA accent (orange-yellow) |
| `blue` | `#2F80FA` | Link / info color |
| `red` | `#F54E00` | Brand red (buttons, Squeak pagination) |
| `orange` | `#EB9D2A` | Warmth / highlights |
| `teal` | `#29DBBB` | Success / product tag |
| `green` | `#6AA84F` | Positive / growth |
| `purple` | `#B62AD9` | Feature flags, experiments |
| `light-1..12` | Warm off-white scale | Background ramp, no blue tint |

The warm bias is intentional — all neutrals pull slightly toward cream/beige (HSL hue ~60-70) rather than cool gray.

### 1.4 Skin & Wallpaper Variants

PostHog has two orthogonal axes of visual variation beyond light/dark:

**Skin mode** (`data-skin` on `<body>`): switches between `modern` and `classic` via Tailwind custom variants:
```js
// tailwind.config.js
addVariant('skin-modern', 'body[data-skin="modern"] &')
addVariant('skin-classic', 'body[data-skin="classic"] &')
```

**Wallpaper** (`data-wallpaper` on `<body>`): 7 named wallpapers, each activating CSS classes via:
```js
const wallpapers = ['keyboard-garden', 'desert', 'highway', 'beach', 'galaxy', 'mountain', 'clouds']
wallpapers.forEach((wallpaper) => {
    addVariant(`wallpaper-${wallpaper}`, `body[data-wallpaper="${wallpaper}"] &`)
})
```

These are set by `static/scripts/theme-init.js` on page load from `localStorage.siteSettings`, before first paint:
```js
// static/scripts/theme-init.js (pre-body script, FOUC-free)
const savedSkin = JSON.parse(localStorage.getItem('siteSettings') || '{}').skinMode || 'modern'
document.body.setAttribute('data-skin', savedSkin)
const savedWallpaper = JSON.parse(localStorage.getItem('siteSettings') || '{}').wallpaper || 'keyboard-garden'
document.body.setAttribute('data-wallpaper', savedWallpaper)
```

### 1.5 Dark/Light Theme Switching

Also FOUC-free via pre-body script. The switching function sets `document.body.className` directly:
```js
// static/scripts/theme-init.js
function setTheme(newTheme) {
    window.__theme = newTheme
    document.body.className = newTheme     // 'light' or 'dark'
    window.__onThemeChange(newTheme)
}
window.__setPreferredTheme = function (theme) {
    const newTheme = theme === 'system' ? (darkQuery.matches ? 'dark' : 'light') : theme
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    return newTheme
}
```

Default is `'light'` (not system). The `MainNav` toggle calls `window.__setPreferredTheme()` directly — no React state involved, so there's no re-render overhead for the theme switch.

### 1.6 Typography Tokens

From `tailwind.config.js`:

| Token | Family |
|---|---|
| `font-sans` | `IBM Plex Sans Variable` (variable font) |
| `font-serif` | `Charter`, then `MatterVF` |
| `font-code` | `Source Code Pro` |
| `font-rounded` | `Open Runde` (4 weights: 400, 500, 600, 700 from Cloudinary) |
| `font-squeak` | `Squeak` (bold only, local woff2/woff) |
| `font-fairytale` | `Fairytale` (local woff2/woff) |

Body default: `IBM Plex Sans Variable` — variable font, no separate weight files needed.
Blog/article content: `Charter` (serif, 2 weights from Cloudinary).
Letter spacing: headings use `letter-spacing: -0.015em`; blockquotes same.

The `cqh`/`cqw` container query units are used for team page name sizing (`font-size: 8cqh`), which scales names responsively without media queries.

### 1.7 Spacing & Radius Tokens

No custom spacing scale — Tailwind defaults used. Shadow scale is minimal:
```js
boxShadow: {
  md: '0 2px 4px rgba(0,0,0,0.05), 0 1px 2px rgba(0,0,0,0.07)',
  xl: '0 10px 30px rgba(0,0,0,0.08)',
}
```
Light, almost imperceptible shadows — surfaces are separated by color contrast alone, not shadow depth.

---

## 2. Animations & Transitions

### 2.1 Animation Library Stack

| Library | Version | Role |
|---|---|---|
| `framer-motion` | `^4.1.17` | Component-level scroll-triggered + spring animations |
| `@dotlottie/react-player` | `^1.6.6` | `.lottie` container format playback |
| `lottie-react` | `^2.4.1` | `.json` Lottie playback |
| `react-lottie` | `^1.2.3` | Legacy `.json` Lottie playback |
| CSS keyframes (native) | — | Hero entry animations, hover states, page-level decorative |

### 2.2 Hero Entry Animation System

Pure CSS, no JS. Located at `src/components/Home/hero.css`.

Three keyframes:
- `staggerInLg`: `translateY(100% → 0)`, used at > 1200px
- `staggerInSm`: `opacity 0→1 + translateY(80% → 0)`, used at ≤ 1200px
- `fadeIn`: `opacity 0→1`, used for subtitle and CTAs

Stagger pattern via `nth-of-type`:
```css
.home-hero-title span:nth-of-type(N) {
    animation: staggerInLg 0.6s ease-out calc(N * 100ms) both;
}
```

Timing ladder:
- Title spans: 100ms → 500ms (5 spans × 100ms each)
- Subtitle: `fadeIn 2s` at `0.7s` delay
- CTA button 1: `fadeIn 3s` at `1200ms`
- CTA button 2: `fadeIn 3s` at `1600ms`
- CTA button 3: `fadeIn 3s` at `2400ms`
- CTA paragraph: `fadeIn 3s` at `2000ms`

The entire page "breathes in" over 2.4 seconds from first paint.

### 2.3 Tailwind Keyframe Animations (tailwind.config.js)

PostHog registers 20+ named animations in Tailwind. Notable ones:

```js
keyframes: {
    wiggle:      { '0%,100%': {transform: 'rotate(-3deg)'}, '50%': {transform: 'rotate(3deg)'} },
    grow:        { '0%': {transform: 'scale(0.9)'}, '100%': {transform: 'scale(1)'} },
    develop:     { '0%': {transform: 'scaleY(0)', transformOrigin: 'top'}, '100%': {transform: 'scaleY(1)'} },
    float:       { '0%,100%': {transform: 'translateY(0px)'}, '50%': {transform: 'translateY(-20px)'} },
    breathe:     { '0%,100%': {opacity: 1}, '50%': {opacity: 0.6} },
    shimmer:     { '0%': {backgroundPosition: '200% 0'}, '100%': {backgroundPosition: '-200% 0'} },
    'hogfather-roll':  { /* multi-step mascot tumble */ },
    'hogfather-jump':  { '0%,100%': {transform: 'translateY(0)'}, '50%': {transform: 'translateY(-20px)'} },
    'slide-left':      { '0%': {transform: 'translateX(0)'}, '100%': {transform: 'translateX(-50%)'} },
    'ping-once':       { '0%': {transform: 'scale(1)', opacity: 1}, '100%': {transform: 'scale(2)', opacity: 0} },
}
```

Utility classes map to these: `animate-wiggle`, `animate-float`, `animate-breathe`, etc.

### 2.4 Framer Motion: Scroll-Triggered Pattern

`src/components/AnimateIntoView/index.js` — the canonical scroll-reveal wrapper:

```js
// Default: slide in from 100px above + fade in, spring physics, 0.3s delay
export default function AnimateIntoView({
    hidden = { top: -100, opacity: 0 },
    shown = { top: -60, opacity: 1, transition: { duration: 0.5, type: 'spring', delay: 0.3 } },
}) {
    const [ref, inView] = useInView({ threshold: 1 })
    // starts animation when fully in view (threshold: 1)
    ...
}
```

Spring type with `duration: 0.5` gives a soft deceleration. Threshold `1` means the element must be fully visible before animating — prevents partial-entry jitter.

### 2.5 CSS-Only Hover Invert Pattern

`src/styles/global.css` defines `.hover-invert` — a pure-CSS color swap on hover using CSS variable reassignment:

```css
.hover-invert {
    &:hover, &.active {
        --bg: var(--text-primary);
        --text-primary: var(--bg);
        /* effectively inverts bg/text without any JS */
    }
}
```

This is elegant for nav items and buttons — no `useState`, no classList toggling.

### 2.6 Expand/Collapse (details/summary)

```css
details summary::after {
    transition: transform 0.25s ease-out;
}
details[open] summary::after {
    transform: rotate(180deg);
}
```
`0.25s ease-out` — snappy but not jarring. Consistent across all accordion instances.

### 2.7 Lottie Asset Inventory

All in `static/lotties/`:

| File | Category | Notes |
|---|---|---|
| `product-icons/ab-testing.lottie` | Product icon | Animated on hover |
| `product-icons/data-pipeline.lottie` | Product icon | |
| `product-icons/data-warehouse.lottie` | Product icon | |
| `product-icons/feature-flags.lottie` | Product icon | |
| `product-icons/product-analytics.lottie` | Product icon | |
| `product-icons/session-replay.lottie` | Product icon | |
| `product-icons/surveys.lottie` | Product icon | |
| `product-icons/web-analytics.lottie` | Product icon | |
| `hogzilla-swipe.lottie` | Character animation | Giant hedgehog swipe gesture |
| `kendrick.lottie` | Character animation | Named hedgehog |
| `loading.json` / `loading.lottie` | UI feedback | Spinner |
| `hourglass-white.lottie` | UI feedback | Wait state |
| `rainbow.lottie` | Decoration | Celebratory |
| `office.lottie` | Scene | Office environment |
| `toy.lottie` | Scene | Toy/fun scene |

Also: `src/components/Home/lotties/dark.ts` — dark-mode variant Lottie config (color overrides for light-canvas Lotties).

---

## 3. Iconography

### 3.1 Icon Sources

PostHog uses a hybrid icon system:

1. **Inline SVG via Tailwind `backgroundImage`** — for bullets, chevrons, arrows (defined directly in `tailwind.config.js`):
   ```js
   backgroundImage: {
     'arrow-right': "url(\"data:image/svg+xml,...\")",
     'chevron-right': "url(\"data:image/svg+xml,...\")",
   }
   ```

2. **`src/components/Icons/Icons.tsx`** — React component library, rendered as inline SVG. Referenced via `useDarkMode` hook for color switching.

3. **Spritesheet** — `static/images/sprited-icons.svg` and `static/images/home-sprite.svg`. Sprite approach for frequently-reused icons.

4. **`static/images/product-icons.png`** — raster spritesheet for product icons (fallback/legacy).

5. **`static/icons/return.svg`** — standalone SVG (minimal, suggests most icons are in the component or spritesheet).

### 3.2 Naming Convention

From `Icons.tsx`: PascalCase React component names (`IconArrowRight`, `IconChevronDown`). The component file is the single source of truth for UI icons; platform-specific social/brand logos live in their respective component folders (e.g., `ContactSales/images/airbus_dark.svg`).

---

## 4. Graphics Inventory

### 4.1 Mascot Characters (Hedgehogs)

The hedgehog is PostHog's primary visual identity. All characters follow the same base: spiky silhouette, large white eyes, orange/brown coloring.

**`static/images/` root:**

| File | Format | Description |
|---|---|---|
| `hedgehog.svg` | SVG | Canonical base hedgehog — clean vector |
| `builder-hog.png` | PNG | Hedgehog in hard hat, building something |
| `tractor-hog.png` | PNG | Hedgehog driving a tractor |
| `astrohog.gif` | GIF | Animated astronaut hedgehog |
| `hogzilla.jpg` | JPG | Giant kaiju-scale hedgehog looming over city |

**`src/components/Home/images/` (component-local, Cloudinary-hosted):**

| File | Description |
|---|---|
| `builder-hog.png` | Hard hat hedgehog (home page variant) |
| `busy-hog.png` | Multitasking hedgehog |
| `conversion-hog.png` | Hedgehog with funnel/conversion UI |
| `distinguished-hog.png` | Formal/distinguished hedgehog |
| `experiment-hog.png` | Scientist hedgehog with lab equipment |
| `mission-control-hog.png` | Hedgehog at mission control desk |
| `recording-hog.png` | Hedgehog with camera/recording equipment |
| `godzilla.png` / `godzilla-mobile.png` | Godzilla-style monster hedgehog |
| `hogflix-mobile.png` | Netflix-parody hedgehog scene |
| `host-hogs.png` | Group of hedgehog characters hosting |

**Deskhog items** (`static/images/deskhog/` — desk toy versions):
`sparksjoy.png`, `does_not_spark_joy.png`, `bad-internet.png`, `eu-thumbsup.png`, `thumbs-down-eu.png`, `ben-peace.png`, `lottie-hype.gif`

**Animated sprites** (CSS sprite animation patterns):
- `static/images/questlog-jump-sprite.png` — sprite sheet for jumping animation
- `static/images/questlog-walk-sprite.png` — sprite sheet for walking animation
- `static/images/support-sprite.svg` — SVG sprite for support character
- `static/images/home-sprite.svg` — SVG sprite for home page elements

**Lost hog** (Cloudinary): `https://res.cloudinary.com/dmukukwp6/image/upload/posthog.com/src/images/lost-hog.png` — used on 404/error pages.

### 4.2 Product Screenshot Illustrations

PostHog layers real UI screenshots with illustrated/styled frames. All PNGs, no SVG:

**`static/images/products/product-analytics/`**
`screenshot-correlation-analysis.png`, `screenshot-dashboards.png`, `screenshot-funnels.png`, `screenshot-hogql.png`, `screenshot-lifecycle.png`, `screenshot-paths.png`, `screenshot-retention.png`, `screenshot-stickiness.png`, `screenshot-trend-area.png`, `screenshot-trend-bar.png`, `screenshot-trend-map.png`, `screenshot-trend-multiple-sparklines.png`, `screenshot-trend-sparkline.png`

**`static/images/products/session-replay/`**
`console.png`, `network.png`, `screenshot-session-replay.png`, `session-replay.png`, `timeline.png`

**`static/images/products/ab-testing/`**
`ab-testing.png`, `goals.png`, `recommendations.png`, `screenshot-ab-testing.png`, `targeting-ab.png`

**`static/images/products/feature-flags/`**
`early-access.png`, `feature-flags.png`, `multivariate.png`, `payloads.png`, `release-conditions.png`, `reports.png`, `screenshot-feature-flags.png`

**`static/images/products/product-os/`** (via `static/images/product/`)
`data-warehouse-product.png`, `feature-flags-product.png`, `integrations-cdp-product.png`, `product-analytics-product.png`, `session-replay-product.png`

Also richer context screenshots in:
- `static/images/product/session-recording/` (subfolder)
- `static/images/product/product-icons/` (subfolder)
- `static/images/product/ratings/` (subfolder)

### 4.3 Social / OG Images

`static/images/og/` — 1200×630 JPG/PNG social cards per product:
`ab-testing.jpg`, `cdp.jpg`, `data-warehouse.jpg`, `error-tracking.jpg`, `feature-flags.jpg`, `product-analytics.jpg`, `product-os.jpg`, `session-replay.jpg`, plus generic variants (`default.png`, `baa.png`, `photobooth.png`, `founder-stack.png`).

### 4.4 Scene / Editorial Illustrations

| File | Location | Description |
|---|---|---|
| `flamegraph.svg` | `static/images/` | Technical flamegraph SVG |
| `pizza-cat.gif` | `static/images/` | Animated pizza cat (humor/culture) |
| `billboard.png` / `billboard-truck.png` | `Home/images/` | PostHog OOH advertising mock |
| `slide-*.png` (×7) | `Home/images/` | Feature slides: collaboration, experimentation, flags, etc. |
| `godzilla.png` | `Home/images/` | Giant monster hedgehog over cityscape |
| `hogflix-mobile.png` | `Home/images/` | Netflix-style parody streaming UI |
| `hockeystick-growth.png` | `Home/images/` | Growth chart illustration |
| `stars.png` | `Home/images/` | GitHub stars counter illustration |
| `blackpaper-poster.jpg` / `whitepaper-poster.jpg` | `static/images/enterprise/` | Poster-style editorial art |

### 4.5 Survey & Misc Decorative

`static/images/survey/` — survey-related illustrations.
`static/images/g2/` — G2 badge SVGs (ABTesting, HighPerformer, Leader, MostImplementable variants × region × format).
`static/images/investors/` — VC/investor logos (SVG + JPG headshots): Y Combinator `1984.svg`, GV `gv.svg`/`gv_dark.svg`, `kima-ventures.png`, individual partner photos.
`static/images/customers/` / `src/components/Home/images/customers/` — customer logo images.
`static/images/competitors/` — competitor brand assets (`betterstack.png`, `elastic.png`, `grafana-loki.png`).

### 4.6 Brand Assets

`static/brand/`:
- `posthog-logo` — horizontal lockup: `black.svg`, `white.svg`, `padded.svg`, `.png` @1x/@2x
- `posthog-logomark` — mark only: same variants
- `posthog-logo-stacked` — vertical lockup: same variants

SVG primary, PNG @1x and @2x as raster fallbacks. No WebP in brand kit.

---

## 5. Graphics Style Fingerprint

This is what makes PostHog art look like PostHog — observable rules extracted from the full asset inventory:

### 5.1 The Hedgehog Formula

Every hedgehog character shares these fixed traits:
- **Silhouette**: squarish body, prominent spiky back rising in a hump, stubby legs, no visible neck
- **Face**: two large circular white eyes (sclera dominant, tiny pupil), small snout, no nose bridge
- **Coloring**: warm rust-orange + dark brown for the body, cream/white for the belly and face
- **Expression**: always expressive — curiosity or determination, never neutral
- **Outfit**: always has a human occupation prop (hard hat, lab coat, tractor seat, astronaut suit) but the hedgehog remains recognizable beneath it
- **Style**: flat or semi-flat illustration, thick stroke outlines, no photorealism

### 5.2 Color Temperature

The entire palette skews warm. There are no cool grays — backgrounds are off-white with a slight cream bias (`#FDFDF8`, `#EEEDE7`). Dark backgrounds (`#1E1F23`) pull slightly purple/warm, not blue-black. Accent colors are saturated warm tones: amber yellow (#F7A501), red-orange (#F54E00), warm blue (#2F80FA is slightly warm vs. pure `#0080FF`).

### 5.3 Typography Personality

- Body copy: IBM Plex Sans Variable — geometric, legible, slightly technical
- Hero headings: tight `letter-spacing: -0.015em` — modern editorial feel
- Blog/docs: Charter serif — print-quality reading comfort
- Display/fun: Open Runde (rounded sans) and Squeak (bold, quirky) for playful UI moments

### 5.4 Screenshot Decoration Style

Product screenshots are never bare. The pattern:
- Screenshot sits on a surface with a slight shadow or border
- Sometimes surrounded by illustrated callouts or floating UI elements
- Background is either the off-white `primary` surface or a pattern/gradient
- Consistent aspect ratio framing (~16:9 or 4:3 per product)

### 5.5 Scale Play

PostHog frequently breaks realistic scale for comedic effect:
- `godzilla.png`: hedgehog is 20× building height
- `hogzilla.lottie`: giant swipe gesture
- `billboard-truck.png`: real-scale product advertising mock

Scale violations are always accompanied by warmth (bright colors, friendly face) — never threatening.

### 5.6 The "Desk Toy" Aesthetic

`deskhog/` items (sparksjoy, bad-internet, eu-thumbsup) are posed as plastic figurines on a physical desk surface. 3/4 angle, slight shadow, photorealistic desk environment with illustrated character. This blends physical and digital — useful for status/mood indicators.

### 5.7 Sprite Animation Style

Walking and jumping animations use CSS sprite sheets (not canvas/WebGL). Sprites have:
- Fixed frame size
- Consistent 2D side-scroll perspective
- Brown/orange palette matching other hedgehog assets
- 6-12 frames per loop

---

## 6. AI Replication Prompts (gpt-image-2)

### Prompt A — Generic Hedgehog Character (base)

```
A cute illustrated hedgehog character with a round body, prominent spiky back, two large expressive white eyes with small black pupils, warm rust-orange and dark brown coloring, cream-colored belly, short stubby legs. Flat illustration style with thick outline strokes. Warm, friendly expression with a slight smile. Clean white background. No photorealism. Digital illustration, vector-art feel.
```

**Negative constraints:** no photorealistic fur texture, no gray coloring, no cool blue tones, no thin outlines

---

### Prompt B — Occupation Hedgehog (builder variant)

```
A cute cartoon hedgehog wearing a yellow construction hard hat, holding a small wrench. Round spiky body in warm rust-orange, large expressive white eyes, cream belly. Semi-flat illustration style, thick black outlines, slightly 3D shading on the hat. Friendly and determined expression. White background, no background elements. Warm color palette only.
```

**Negative constraints:** no scary expression, no sharp detailed fur, no photorealism, no cool gray tones

---

### Prompt C — Scientist Hedgehog (experiment variant)

```
A cartoon hedgehog in a tiny white lab coat, holding a test tube with a colorful liquid. Spiky orange-brown back, round white belly, large circular white eyes showing excitement. Semi-flat illustration with clean shadows. Scientific props: small microscope, test tube rack beside the character. Warm off-white background with soft gradient. No text.
```

---

### Prompt D — Giant Kaiju Hedgehog (scale-play)

```
A gigantic cartoon hedgehog looming over a tiny illustrated city skyline, Godzilla-style. The hedgehog is warm rust-orange with large friendly eyes (not scary), looking curious rather than threatening. City buildings are simplified flat-color shapes below. Dramatic lighting from above, slight sunset warm tones. Whimsical, not horror. Flat illustration style.
```

**Negative constraints:** no scary expression, no dark horror tones, no photorealism

---

### Prompt E — Desk Toy Hedgehog (physical product aesthetic)

```
A small plastic hedgehog figurine sitting on a wooden desk surface. 3/4 angle view. The figurine is warm orange with a cream belly, large round painted eyes. Photorealistic desk background (keyboard, coffee cup blurred in background), but the hedgehog itself is a toy — clean molded plastic surface, visible seam lines. Soft warm studio lighting. No text.
```

---

### Prompt F — Product Screenshot Illustration (UI framing)

```
A clean product analytics dashboard UI screenshot displayed in a rounded-corner browser window frame, floating on a warm off-white background (#FDFDF8). The dashboard shows line charts and bar charts in warm orange, amber, and blue. Slight drop shadow under the window (very subtle, 5% opacity). No browser chrome/tabs visible. Minimalist, professional. The window frame is white with a 1px warm-gray border.
```

---

### Prompt G — Hero Editorial Illustration (billboard)

```
A flat-color illustrated out-of-home advertising billboard showing a product analytics chart with a green upward arrow. Bold sans-serif headline text "See what users actually do". Warm orange accent. The billboard is mounted on a truck or van in a city street. Semi-realistic street environment, flat-color illustration style for the billboard art. Warm daylight.
```

---

### Prompt H — Animated Sprite Sheet (walking)

```
A sprite sheet showing a cartoon hedgehog character walking cycle, 8 frames arranged horizontally. Side-scroll view. Warm orange spiky body, round white eyes, tiny legs taking steps. Each frame is 64×64 pixels. Clean white background per frame. Flat illustration style, consistent style across all frames. No background elements in frames.
```

---

### Prompt I — Scene Lottie Keyframe (office)

```
A flat-color illustrated office scene: a small hedgehog character sitting at a computer desk. Monitor shows a graph. Office plants, coffee mug, sticky notes on the wall behind. Warm color palette: cream walls, wooden desk, orange hedgehog. Suitable for animation — clean shapes, no fine detail, flat shadow layers. Isometric-ish 3/4 perspective. No text visible.
```

---

## 7. Gap Analysis: PostHog vs Portfolio Theming

### 7.1 Token Architecture

| Dimension | PostHog | Portfolio |
|---|---|---|
| Token namespace | No prefix (`--bg`, `--text-primary`) | `--dt-` prefix for all OS tokens |
| Scope | CSS class on `body` (`.light`/`.dark`) | Inline style on `.desktop-canvas` |
| Scheme levels | 3 (`primary`/`secondary`/`tertiary`) | 1 (no nested scheme levels) |
| Alpha-composable | Yes (RGB-triplet + `<alpha-value>`) | Partial (some vars have separate opacity variants) |
| Skin variants | `data-skin` (2 modes) | `data-world` via world classes |
| Wallpaper variants | 7 named wallpapers via `data-wallpaper` | Radial gradient CSS, no named wallpapers |

**Gap:** Portfolio lacks the 3-tier surface scheme. All windows and panels share the same token set — there's no way to say "this panel is secondary surface" without hardcoding colors.

### 7.2 Dark Mode

PostHog: pre-body `<script>` sets `body.className` before first paint — zero FOUC.
Portfolio: no dark mode at all currently. Worlds change the entire palette but there's no light/dark axis.

**Gap:** If a world ever needs a light variant (Ghibli day vs night), there's no mechanism for it. PostHog's `body.className` + `data-scheme` pattern would handle this cleanly.

### 7.3 Animations

| Dimension | PostHog | Portfolio |
|---|---|---|
| Entry animations | Pure CSS keyframes, staggered nth-of-type | Framer Motion (from `worlds.js`) |
| Scroll reveal | Framer Motion InView + spring | Not documented as standard |
| Lottie | 3 libraries, 15+ assets | None |
| Hover state | CSS variable swap (no JS) | Not implemented |
| Character animation | Sprite sheets + Lottie | None |

**Gap:** No character/mascot animation in portfolio. No Lottie pipeline. The `.hover-invert` CSS pattern is missing — currently hover states likely use Tailwind `hover:` with hardcoded values rather than contextual variable swaps.

### 7.4 Typography

PostHog uses variable fonts (IBM Plex Sans Variable) for zero layout shift across weights.
Portfolio uses static web fonts — weight changes cause FOUT if fonts aren't preloaded.

### 7.5 Graphics

PostHog has a full mascot system (10+ hedgehog variants), scene illustrations, animated sprites, Lottie product icons.
Portfolio has none of these — all worlds use CSS/gradient backgrounds without illustrated characters.

**Opportunity:** The portfolio worlds are strong on environmental theming but weak on character identity. Adding world-specific mascot variants (a hedgehog in Elden Ring armor, a Totoro-style creature for Ghibli, a Night's Watch crow for GoT) would dramatically increase visual personality.

---

## 8. Graphics Generation Backlog

Prioritized by visual impact vs. implementation effort.

### Priority 1 — Foundation (generates portfolio personality immediately)

1. **Base mascot** — A single "portfolio hedgehog" or custom character equivalent (can be any creature), flat illustration style, warm palette, 300×300px. This is the baseline all variants will extend. Use Prompt A above as the starting spec, adapted for the portfolio's own identity.

2. **World-specific mascot variant × 3** — Same character in 3 outfits:
   - Elden Ring: tarnished armor, glowing golden eyes, dark moody background
   - Ghibli: small round creature in a straw hat, forest light
   - GoT: Night's Watch black cloak OR a dragon atop a cliff

3. **Desktop OS icon set** — 8 flat app icons (Terminal, File Manager, Browser, Settings, Notes, Music, Gallery, About) in each world's palette. 64×64px each. SVG preferred.

### Priority 2 — Environment (world-specific polish)

4. **Elden Ring wallpaper** — Dark stone texture, golden fog at horizon, Erdtree silhouette faint in background. 1920×1080, radial-gradient style, no text.

5. **Ghibli wallpaper** — Watercolor-style rolling hills, cloud wisps, afternoon light. Warm cream → sky blue gradient. 1920×1080.

6. **GoT wallpaper × 4** — One per region:
   - North: snowfield, gray-blue, sparse bare trees
   - King's Landing: warm stone rooftops, orange twilight
   - Night's Watch: black stone wall, ice blue fog
   - Dragonstone: volcanic rock, stormy sea, deep red sky

### Priority 3 — Interactive Elements (micro-details)

7. **Taskbar dock icons** — Circular or squircle icons at 48px, world-aware coloring. For: home, apps, settings, network, battery.

8. **Window decoration art** — Small corner illustrations per world that appear in app window titlebars (tiny Erdtree leaf, tiny totoro silhouette, tiny dragon).

9. **Loading animation frames** — 8-frame sprite sheet of the portfolio mascot, walking or spinning. Used for app launch states.

10. **404 / error state illustration** — Mascot looking lost or confused, warm color, minimal background. Can directly reuse Lost Hog concept.
