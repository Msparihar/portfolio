# PostHog Desktop OS — Shell Architecture Reference

Study of `D:/Projects/portfolio/Research/posthog.com` vs our portfolio at
`D:/Projects/portfolio/src/`. Scope: OS shell mechanics only — window system,
taskbar/dock, boot sequence, app registry, keyboard shortcuts, easter eggs.
Theming and content/routing excluded.

---

## 1. Technology Stack Comparison

| Concern | PostHog | Our Portfolio |
|---|---|---|
| Framework | Gatsby | Next.js |
| State | React Context (`src/context/App.tsx`) | Zustand (`src/store/windowStore.js`) |
| Drag + resize | framer-motion `drag` | react-rnd |
| Animations | framer-motion `AnimatePresence` | None |
| UI primitives | Radix UI (ContextMenu, Dialog, MenuBar) | Custom |
| Lazy load | Gatsby dynamic | Next.js `dynamic()` |

PostHog's choice to use framer-motion for both drag and animations is the single
most consequential architectural difference. It means every window has coordinated
enter/exit transitions tied to the same system that handles dragging.

---

## 2. App Registry

**File:** `src/context/App.tsx` (lines ~100–350)

PostHog keeps a static `appSettings` map keyed by route path. Every app declares
its own size/position contract at registration time rather than computing it at
open time.

```
appSettings: {
  '/paint': { sizeConstraints: { min: {w:600,h:500}, max: {w:2000,h:2000} } },
  '/ask-max': { modal: { type: 'floating' } },
  '/search': { positionDefaults: { x: 'topCenter' } },
  'cher': { ... },
  'hedgehog-generator': { ... },
  ...~40 total routes
}
```

Each entry can include:
- `sizeConstraints.min / max` — hard limits enforced during resize
- `positionDefaults` — where the window spawns (center, topCenter, etc.)
- `modal.type: 'standard' | 'floating' | 'side'` — changes render path entirely
- `fixedSize: true` — disables resize handles
- `minimal: true` — strips titlebar chrome

Our store (`src/store/windowStore.js:1–30`) has `APP_DEFAULTS` for 8 apps but
only stores `width/height/x/y` — no constraints, no modal type, no position
strategies. Any app can be resized to any size.

**What to steal:** The static registry pattern. Move app contracts out of
`APP_DEFAULTS` and into a typed map that includes `sizeConstraints` and
`modalType`. The window-open code then reads these at open time rather than
applying one-size-fits-all logic.

---

## 3. Window State Model

**File:** `src/context/Window.tsx:6–63`

The `AppWindow` interface carries more state than most window managers:

```typescript
interface AppWindow {
  key: string
  path: string
  element: React.ReactNode
  zIndex: number
  minimized: boolean
  size: { width: number; height: number }
  previousSize: { width: number; height: number }   // for un-maximize
  position: { x: number; y: number }
  previousPosition: { x: number; y: number }        // for un-maximize
  sizeConstraints: { min: {...}; max: {...} }
  fixedSize: boolean
  minimal: boolean
  fromOrigin?: { x: number; y: number }             // click position for spawn anim
  modal?: { type: 'standard' | 'side' | 'floating' }
  appSettings?: AppSetting
  ref?: React.RefObject<HTMLDivElement>              // portal target (Cher easter egg)
  positionDefaults?: { x: number; y: number }
  fromHistory?: boolean
  props: any
}
```

The `previousSize / previousPosition` pair is the maximize/restore pattern —
store current → maximize → restore uses stored values. No boolean flag needed.

The `ref` field is unusual: it gives child components direct DOM access to the
window element so easter-egg portals can render inside the window frame (see
section 10).

Our `windowStore.js` uses a similar shape but is missing: `sizeConstraints`,
`fromOrigin`, `modal`, `ref`, `previousPosition/Size` as explicit fields
(maximize stores to `prevPosition/prevSize` ad-hoc).

---

## 4. Window Z-Index: Reassign vs Always-Increment

**PostHog** (`src/context/App.tsx` — `bringToFront` function):

```typescript
// Focused window gets windows.length. Every window above the old position
// decrements by 1. Net result: zIndex values stay in range [1..N].
const bringToFront = (key: string) => {
  setWindows(prev => {
    const target = prev.find(w => w.key === key)
    const targetZ = target.zIndex
    return prev.map(w => {
      if (w.key === key) return { ...w, zIndex: prev.length }
      if (w.zIndex > targetZ) return { ...w, zIndex: w.zIndex - 1 }
      return w
    })
  })
}
```

**Our store** (`src/store/windowStore.js:~95`):

```javascript
focusWindow: (appId) => {
  set(state => ({
    windows: state.windows.map(w =>
      w.appId === appId ? { ...w, zIndex: state.nextZIndex } : w
    ),
    nextZIndex: state.nextZIndex + 1
  }))
}
```

PostHog's approach keeps zIndex values compact and predictable — a window
always knows its relative rank. Ours lets `nextZIndex` grow unboundedly.
After many open/close cycles, `nextZIndex` could reach values that conflict
with fixed-position UI (tooltips, modals at z-50 through z-9999). PostHog's
reassign never has this problem.

---

## 5. Window Open Animation — `fromOrigin`

**File:** `src/context/App.tsx` (keyboard + click handler) and
`src/components/AppWindow/index.tsx:189–230`

When a user clicks a desktop icon, the click position is captured:

```typescript
// App.tsx — captured on every desktop interaction
lastClickedElementRect = event.currentTarget.getBoundingClientRect()
```

Then when the window mounts, `fromOrigin` is set to the click rect's center.
The AppWindow uses this as the animation origin:

```typescript
// AppWindow/index.tsx ~line 200
const fromOrigin = appWindow.fromOrigin ?? { x: 0, y: 0 }

<motion.div
  initial={{ scale: 0.08, x: fromOrigin.x, y: fromOrigin.y, opacity: 0 }}
  animate={{ scale: 1, x: 0, y: 0, opacity: 1 }}
  exit={{ scale: 0.005, x: windowPosition.x, y: windowPosition.y, opacity: 0 }}
  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
>
```

The exit animation collapses the window toward its current position (toward
the taskbar visually). The open animation "explodes" from the icon position.

This is the most polished UX detail in the entire shell. Our portfolio has zero
open/close animations.

---

## 6. Window Drag — framer-motion Pattern

**File:** `src/components/AppWindow/index.tsx:240–280`
**File:** `src/components/Desktop/DraggableDesktopIcon.tsx:50–90`

PostHog does NOT use react-rnd. Drag is framer-motion native:

```typescript
// In AppWindow — the motion.div that wraps the window
const dragControls = useDragControls()

<motion.div
  drag
  dragControls={dragControls}
  dragListener={false}          // prevents default drag-on-anywhere behavior
  dragMomentum={false}          // no physics/throwing
  dragConstraints={containerRef}
  onDragEnd={handleDragEnd}
>
  {/* Title bar — the ONLY drag handle */}
  <div onPointerDown={(e) => dragControls.start(e)}>
    {title}
  </div>
  {/* Window content — not draggable */}
  <div>{children}</div>
</motion.div>
```

`dragListener={false}` + `dragControls.start(e)` on the handle = drag is
ONLY possible from the titlebar. Without this, clicking anywhere on the window
would start a drag.

For desktop icons (`DraggableDesktopIcon.tsx`):

```typescript
// hasDragged prevents click firing after a drag gesture
const hasDragged = useRef(false)

<motion.div
  drag
  whileDrag={{ scale: 1.1, rotate: 2 }}   // visual feedback during drag
  onDragStart={() => { hasDragged.current = true }}
  onDragEnd={() => { /* save position to localStorage */ }}
  onClick={() => {
    if (hasDragged.current) { hasDragged.current = false; return }
    // normal click handler
  }}
>
```

The `hasDragged` guard (`DraggableDesktopIcon.tsx:~line 60`) is essential.
Without it, releasing a drag fires a click event, which opens the app.

Our `DesktopIcon.jsx` has no drag at all. Our `Window.jsx` uses react-rnd's
`dragHandleClassName` which works but provides no animation tie-in.

---

## 7. Window Resize — Manual Hit Targets

**File:** `src/components/AppWindow/index.tsx:252–266, 954–1025`

PostHog doesn't use react-rnd for resize either. Five manual resize handles:

```
right edge    — horizontal resize
left edge     — horizontal resize
bottom edge   — vertical resize
bottom-right  — diagonal resize (SE)
bottom-left   — diagonal resize (SW)
```

Each handle is a `<div>` with `onPointerDown` that sets a `resizeDirection`
ref. A global `pointermove` listener then computes the new size, clamped to
`sizeConstraints.min/max`. No top-edge resize (intentional — preserves
titlebar as drag area).

This is more work than react-rnd but gives precise control. The `sizeConstraints`
enforcement during resize is the key benefit — react-rnd has `minWidth/maxWidth`
props but they're not tied to a per-app registry.

---

## 8. Snap-to-Side

**File:** `src/context/App.tsx` — `handleSnapToSide` function
**File:** `src/components/AppWindow/index.tsx` — `onDragEnd`

When a drag ends, AppWindow checks if the window is near a viewport edge:

```typescript
// AppWindow/index.tsx
const SNAP_THRESHOLD = -50  // line 59

const handleDragEnd = (event, info) => {
  const { x, y } = info.point
  if (x < SNAP_THRESHOLD) {
    handleSnapToSide('left')
  } else if (x > window.innerWidth - SNAP_THRESHOLD) {
    handleSnapToSide('right')
  }
}
```

`handleSnapToSide` in App.tsx:

```typescript
const handleSnapToSide = (side: 'left' | 'right') => {
  const w = window.innerWidth / 2
  const h = window.innerHeight - TASKBAR_HEIGHT
  setFocusedWindow(prev => ({
    ...prev,
    size: { width: w, height: h },
    position: {
      x: side === 'left' ? 0 : w,
      y: TASKBAR_HEIGHT
    },
    previousSize: prev.size,
    previousPosition: prev.position
  }))
}
```

After snapping, the window fills exactly half the viewport. `previousSize/
previousPosition` are preserved so un-snapping restores the window.

Our store has `maximizeWindow` but no snap-to-side. Keyboard shortcut
`Shift+←` / `Shift+→` also triggers this (see section 12).

---

## 9. Keyboard Shortcut System

**File:** `src/context/App.tsx:2044–2265`
**Reference page:** `src/pages/kbd/index.tsx`

A single `keydown` listener on `document` handles all 17 shortcuts. The guard:

```typescript
const target = event.target as HTMLElement
if (
  target.tagName === 'INPUT' ||
  target.tagName === 'TEXTAREA' ||
  target.shadowRoot ||
  target.closest('.mdxeditor')
) return
```

This correctly skips text inputs, shadow DOM, and rich-text editors. Our
`WindowManager.jsx` only handles Escape and has no equivalent guard.

Full shortcut map (from `kbd/index.tsx` + `App.tsx`):

```
Navigation
  Cmd/Ctrl+K or /     Open search
  Shift+?             Open AI chat
  ,                   Open display options
  .                   Open keyboard shortcuts page

Appearance
  \                   Cycle color themes (light → dark → system)
  Shift+\             Cycle wallpapers
  Shift+Z             Start screensaver

Window management
  Shift+M             Toggle OS mode / website mode
  Shift+<             Show active windows panel
  Shift+>             Focus next open window
  Shift+X             Close all windows
  Shift+C             Copy shareable URL to clipboard

Active window
  Shift+W             Close focused window
  Shift+↑             Maximize window
  Shift+↓             Minimize window
  Shift+←             Snap to left half
  Shift+→             Snap to right half
  Shift+F             Search window content
```

Platform detection in `kbd/index.tsx`:

```typescript
const platform = window.navigator.platform
const isMac = platform.toLowerCase().includes('mac')
const modifierKey = isMac ? 'CMD' : 'CTRL'
```

`Shift+C` (shareable URL) is a non-obvious power-user feature: it writes
the full window state (positions, sizes, open apps) to clipboard as a URL.

---

## 10. Shareable Desktop URL

**File:** `src/context/App.tsx` — `desktopParams` and `shareableDesktopURL`

All open windows are encoded into the URL as a query parameter:

```typescript
// Positions stored as percentages to be resolution-independent
const desktopParams = windows.map(w => ({
  path: w.path,
  x: (w.position.x / window.innerWidth) * 100,
  y: (w.position.y / window.innerHeight) * 100,
  width: w.size.width,
  height: w.size.height
}))

const shareableDesktopURL = `${window.location.origin}?windows=${
  encodeURIComponent(JSON.stringify(desktopParams))
}`
```

On page load, these params are read and each window is opened at the encoded
position (scaled back to absolute pixels for the current viewport). This means
a link captured on a 1440p monitor opens reasonably on a 1080p monitor.

Our store persists `savedPositions` to localStorage via Zustand `persist`
middleware, but only per-app — not as a shareable snapshot.

---

## 11. Boot Sequence

**File:** `src/components/Desktop/index.tsx`

Desktop mount fires a ready signal after first render:

```typescript
useEffect(() => {
  window.__desktopLoaded = true
  window.dispatchEvent(new CustomEvent('desktopLoaded'))
}, [])
```

External code (embed scenarios, tests) can listen for `desktopLoaded` instead
of polling. The `window.__desktopLoaded` flag handles the case where the listener
was attached after the event already fired.

Compact/iframe detection:

```typescript
const compact = window !== window.parent
```

When `compact === true`, the shell renders in a reduced mode suitable for
embedding in docs or iframes. Several UI elements are hidden.

postMessage bridge (App.tsx) handles:
- `docs-ready` — iframe signals it's mounted
- `theme-toggle` — parent page requests theme change
- `navigate` — parent page opens a specific path

---

## 12. Desktop Icon Grid Layout

**File:** `src/components/Desktop/index.tsx:80–140`

Icons are arranged in a 2-column layout computed from container dimensions:

```typescript
// Two columns, icons flow top-to-bottom in each column
const iconsPerColumn = Math.floor(containerHeight / ICON_SIZE)
const column = Math.floor(index / iconsPerColumn)
const row = index % iconsPerColumn
const x = column * (ICON_SIZE + GAP)
const y = row * (ICON_SIZE + GAP)
```

Saved positions are read from `localStorage['desktop-icon-positions']` on
mount. Each position is validated against current viewport bounds and clamped:

```typescript
const clampedX = Math.max(0, Math.min(containerWidth - ICON_SIZE, savedPos.x))
const clampedY = Math.max(0, Math.min(containerHeight - ICON_SIZE, savedPos.y))
```

This handles the case where an icon was saved off-screen (window resized,
orientation changed). Right-click context menu includes "Reset icons" which
clears localStorage and re-applies the column layout.

Our `DesktopIcon.jsx` has no drag or position persistence — icons are at
fixed grid positions set by CSS.

---

## 13. Active Windows Panel

**File:** `src/components/ActiveWindowsPanel/index.tsx`

A `SidePanel` (width `w-80`, slides in from right) triggered by `Shift+<`:

- Lists all open windows by title
- Minimized windows shown at `opacity-60` with italic text
- Each row has a group-hover `×` close button
- "Close all" button → `animateClosingAllWindows()` + close panel
- Share section: read-only URL input + copy-to-clipboard icon
- Escape key closes panel (local `keydown` listener)
- Inline shortcut hint: "Shift+C to copy"

`animateClosingAllWindows` sets a flag that triggers a staggered exit animation
on all windows before clearing the array.

We have no equivalent. The closest is that clicking minimized taskbar buttons
restores windows, but there's no overview panel.

---

## 14. Screensaver

**File:** `src/components/Screensaver/index.tsx`

DVD-bounce screensaver — no inactivity timer, purely manual activation:

```typescript
// Velocity: constant speed, direction flips on boundary
const [velocity, setVelocity] = useState({ x: 0.2, y: 0.15 })

// Position expressed as viewport percentage
// Boundary: logoWidthPercent = (200px / window.innerWidth) * 100
if (newX <= 0 || newX >= 100 - logoWidthPercent) newVelX = -newVelX
```

Animation runs via `requestAnimationFrame` — no CSS transitions, no
framer-motion. Lottie animation plays at the bouncing position.

Dismissal: any `mousemove` → `onDismiss()`. The screensaver does NOT activate
on inactivity — `Shift+Z` is the only trigger.

`z-index: 9999` places it above everything except browser chrome.

---

## 15. Easter Eggs

### HedgehogMode

**File:** `src/components/HedgehogMode/index.tsx`

```typescript
// SSR-safe lazy load
const [HedgehogBuddy, setHedgehogBuddy] = useState(null)
useEffect(() => {
  import('@posthog/hedgehog-mode').then(m => setHedgehogBuddy(() => m.HedgehogBuddy))
}, [])

// Activation: localStorage OR URL param
const enabled = localStorage.getItem('hedgehog-mode-enabled') === 'true'
              || new URLSearchParams(location.search).get('hedgehog_mode') === 'true'
```

Platform selectors the hedgehog walks on: `.border`, `.border-t`, `.AppWindow`.
z-index 999998 (just below screensaver at 9999).

### Cher Easter Egg

**File:** `src/components/Cher/index.tsx`

Hedgehog character peeking from the window edge. Uses `createPortal` into
the window's own DOM ref:

```typescript
// Renders inside the AppWindow's DOM node, not document.body
createPortal(
  <motion.div
    initial={{ opacity: 0, translateX: 0, rotate: 5 }}
    animate={{ opacity: 1, translateX: '33%' }}
  >
    <span className="speech-bubble">Cher?</span>
    <img src={hedgehogImg} onClick={() => {
      addWindow(<MediaPlayer videoId="nZXRV4MezEw" />)
    }} />
  </motion.div>,
  appWindow?.ref?.current || document.body
)
```

Clicking the character opens a `MediaPlayer` window with a YouTube video.
The speech bubble uses a CSS `before:` pseudo-element for the arrow.

### Confetti

**File:** `src/context/App.tsx`

```typescript
import ReactConfetti from 'react-confetti'
// ...
{confetti && <ReactConfetti recycle={false} onConfettiComplete={() => setConfetti(false)} />}
```

Triggered by `setConfetti(true)` — called from specific app interactions.

---

## 16. `inView` Window Overlap Detection

**File:** `src/components/AppWindow/index.tsx:189–209`

When a window is moved, the shell checks if it's still visible:

```typescript
const inView = useMemo(() => {
  // How much of this window is covered by windows above it?
  const currentArea = size.width * size.height
  const coveredArea = windows
    .filter(w => w.zIndex > zIndex)
    .reduce((acc, w) => {
      const overlapX = Math.max(0,
        Math.min(pos.x + size.width, w.pos.x + w.size.width) -
        Math.max(pos.x, w.pos.x)
      )
      const overlapY = Math.max(0,
        Math.min(pos.y + size.height, w.pos.y + w.size.height) -
        Math.max(pos.y, w.pos.y)
      )
      return acc + overlapX * overlapY
    }, 0)
  return coveredArea / currentArea < 0.8  // <80% covered = "in view"
}, [windows, pos, size, zIndex])
```

When `inView` is false, the window header shows a "bring to front" nudge.
The 80% threshold means a window is considered obscured only when nearly
fully covered.

---

## 17. Taskbar Menu (MenuBar)

**File:** `src/components/TaskBarMenu/menuData.tsx`

Built with Radix `MenuBar`. The `useMenuData()` hook constructs a nested data
structure consumed by the Radix `MenuBar.Item` tree. Each item can have:

- `label` + `onClick` — action item
- `shortcut` — rendered as keyboard hint (right-aligned)
- `children` — submenu
- `mobileDestination` — collapses submenu to a simple link on mobile
- `separator: true` — visual divider

The logo menu (leftmost) contains OS-level items: display options, mode toggle,
screensaver activation, close all windows. The `SparksJoyItems` export separates
games from non-game easter egg apps.

Our `Taskbar.jsx` has no menu — it's a flat bar with icons. No right-click
options, no system-level menu items.

---

## 18. Window-Internal Navigation History

**File:** `src/context/Window.tsx:74–78` and `src/context/App.tsx`

Each window maintains its own browser history:

```typescript
// Window context exposes navigation
goBack: () => void
goForward: () => void
canGoBack: boolean
canGoForward: boolean
```

Implemented via Gatsby `navigate()`. Each window tracks `history[]` and
`activeHistoryIndex`. The window titlebar renders back/forward buttons when
`canGoBack/canGoForward` are true.

This allows windows that render full page content (like a blog post browser)
to navigate internally without changing the parent page URL.

Our windows do not support internal navigation — each window renders a single
app component with no history.

---

## 19. Settings System

**File:** `src/context/App.tsx` — `SiteSettings` type

```typescript
type SiteSettings = {
  experience: 'posthog' | 'boring'   // OS mode vs website fallback
  colorMode: 'light' | 'dark' | 'system'
  theme: string                       // world/theme name
  skinMode: string
  cursor: string                      // custom SVG cursor name
  wallpaper: string
  screensaverDisabled: boolean
  clickBehavior: 'single' | 'double'  // icon activation
  performanceBoost: boolean           // disables animations when slow
}
```

Stored in `localStorage['siteSettings']`. The display options panel (opened
by `,`) is the UI to edit these.

`performanceBoost` is set automatically when a single animation frame takes
>700ms (measured via `performance.now()`). When enabled, framer-motion
transitions are set to `duration: 0`.

`clickBehavior` controls whether desktop icons open on single-click or
require double-click — mirrors real OS behavior preferences.

Custom SVG cursors are injected into `document.head`:

```typescript
const styleEl = document.createElement('style')
styleEl.id = 'custom-cursor-style'
styleEl.textContent = `* { cursor: url('${cursorUrl}') 16 16, auto !important; }`
document.head.appendChild(styleEl)
```

---

## 20. Dock (Mobile)

**File:** `src/components/Desktop/Dock.tsx`

Only shown on mobile (`md:hidden`). Two folder items: "Products" and "Apps".
Each folder shows a 2×2 icon grid preview. Click opens an animated popover:

```typescript
<motion.div
  initial={{ opacity: 0, scale: 0, translateY: '-100%' }}
  animate={{ opacity: 1, scale: 1, translateY: '0%' }}
>
  {folderContents}
</motion.div>
```

Desktop uses the taskbar instead. Our portfolio has a single taskbar with no
mobile-specific dock equivalent.

---

## Porting Priority

Ranked by impact-to-effort ratio for our portfolio at
`D:/Projects/portfolio/src/`.

### Priority 1 — High impact, medium effort

**1a. Window open/close animations with `fromOrigin`**

The single biggest UX gap. Add framer-motion. Store `lastClickedRect` on icon
click. Pass `fromOrigin` into `openWindow`. In `Window.jsx`, wrap `react-rnd`
in a `motion.div` with `AnimatePresence` and the scale+translate animation.

Files to change: `src/store/windowStore.js`, `src/components/desktop/Window.jsx`,
`src/components/desktop/DesktopIcon.jsx`, `src/components/desktop/WindowManager.jsx`

**1b. `bringToFront` zIndex reassignment**

Replace always-increment in `windowStore.js:~95` with the reassign pattern.
Prevents unbounded `nextZIndex` growth. Pure logic change, no UI impact.

Files to change: `src/store/windowStore.js`

**1c. Full keyboard shortcut system**

Port the 17-shortcut handler from `App.tsx:2044–2265`. Add INPUT/TEXTAREA/shadow
DOM guard. Start with the window management shortcuts (Shift+W, Shift+↑↓←→,
Shift+X). Add a `/kbd` page listing all shortcuts.

Files to change: `src/components/desktop/WindowManager.jsx` (or a new
`useKeyboardShortcuts` hook), new `src/pages/kbd.tsx`

### Priority 2 — Medium impact, medium effort

**2a. App registry with size constraints**

Add `sizeConstraints` and `modalType` to `APP_DEFAULTS`. Enforce min/max during
resize in `Window.jsx`. Allows apps like a paint tool to declare `maxWidth: 2000`
without hardcoding it in the component.

Files to change: `src/store/windowStore.js`, `src/components/desktop/Window.jsx`

**2b. Snap-to-side**

In `Window.jsx`'s `onDragStop` (react-rnd), check `x < SNAP_THRESHOLD` or
`x > viewportWidth - SNAP_THRESHOLD`. If triggered, set to half-viewport size.
Needs `previousSize/Position` restore. Can reuse maximizeWindow's toggle pattern.

Files to change: `src/store/windowStore.js`, `src/components/desktop/Window.jsx`

**2c. `hasDragged` guard on desktop icons**

Our icons don't drag yet, but when added: the `hasDragged` ref pattern from
`DraggableDesktopIcon.tsx:~60` is essential to prevent drag-end from firing a
click. 5-line addition.

Files to change: `src/components/desktop/DesktopIcon.jsx`

### Priority 3 — Medium impact, low effort

**3a. Icon drag with position persistence**

Convert `DesktopIcon.jsx` from static CSS grid to framer-motion `drag` with
`localStorage` persistence. Use column-layout as initial positions. Add
right-click "Reset icons" to clear saved positions.

Files to change: `src/components/desktop/DesktopIcon.jsx`,
`src/components/desktop/WindowManager.jsx`

**3b. `clickBehavior` setting (single vs double-click)**

Add to settings store. `DesktopIcon.jsx` reads it to decide whether `onClick`
or `onDoubleClick` opens the app. Zero architectural change needed.

Files to change: `src/store/settingsStore.js` (or equivalent),
`src/components/desktop/DesktopIcon.jsx`

**3c. Boot ready signal**

Add `window.__desktopLoaded = true` + `CustomEvent('desktopLoaded')` in the
desktop root's `useEffect`. Zero-cost, enables embed scenarios and testing.

Files to change: `src/components/desktop/WindowManager.jsx` or root desktop
component.

### Priority 4 — Lower impact or higher effort

**4a. Active Windows Panel**

A slide-in side panel (`w-80`) listing all windows with minimize/close controls
and shareable URL. Useful as window count grows. Port the `ActiveWindowsPanel`
component directly.

**4b. Shareable desktop URL**

Encode open windows + positions into `?windows=[...]`. Requires percentage-based
position encoding for viewport independence. Pairs well with the ActiveWindowsPanel's
share section.

**4c. `inView` overlap detection**

The geometric >80% covered calculation is clever but only needed when windows
can fully obscure each other. Defer until the portfolio has many overlapping
windows in use.

**4d. Screensaver**

Easy port — `requestAnimationFrame` DVD-bounce with a bouncing logo/lottie.
Add `Shift+Z` to keyboard shortcut handler. Cosmetic feature.

**4e. Performance monitoring**

Measure first animation frame with `performance.now()`. If >700ms, set
`performanceBoost: true` in settings → `transition={{ duration: 0 }}`.
Worth adding once framer-motion is in use (Priority 1a).

**4f. Window-internal navigation history**

Only relevant if any window renders multi-page content. Not needed for current
app set (terminal, file manager, etc.).

---

*Scope: window system, taskbar, boot sequence, app registry, keyboard shortcuts, easter eggs. Theming and content/routing excluded per study scope.*
