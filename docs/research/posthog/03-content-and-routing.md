# PostHog Content, Routing & Scaling Patterns

Research focus: how PostHog's OS-metaphor site integrates content, routes URLs to window state, registers
apps, handles SEO, and wires cross-app interactions. Excludes OS shell mechanics (drag/resize/taskbar)
and theming — those are covered in companion docs.

Reference repo: `D:/Projects/portfolio/Research/posthog.com`  
Our portfolio: `D:/Projects/portfolio/src/` (Next.js 16 App Router)

---

## 1. Site Structure — URL to OS State Mapping

### Every URL IS a window

PostHog's site is a Gatsby static site where every page corresponds to an OS window. The integration
point is `gatsby-browser.tsx` and `gatsby-ssr.js` — both export a `wrapPageElement` hook that runs
for every URL:

```tsx
// gatsby-browser.tsx (line 1) and gatsby-ssr.js (line 22)
export const wrapPageElement = ({ element, props: { location } }) => {
    return (
        <Provider element={element} location={location}>
            <Wrapper />
        </Provider>
    )
}
```

`Provider` is the global App context (`src/context/App.tsx`). When a URL loads, the `Provider`
reads `element` (the Gatsby page component) and `location`, creates an `AppWindow` object from it,
and pushes it into the `windows` state array. `Wrapper` renders all `windows` as `<AppWindow>`
components. This means:

- Visiting `/blog/some-post` → opens a window showing that post
- Visiting `/docs/getting-started` → opens a handbook-style window
- Direct URL entry, browser back/forward, and Gatsby `<Link>` navigation all flow through the same
  window-creation path

**File:** `gatsby-browser.tsx` lines 1–30; `gatsby-ssr.js` lines 16–29

### Deep-linkable desktop state

The desktop state (open windows, their positions and sizes) is serialized to the URL as query
parameters. From `App.tsx` around line 2393:

```tsx
// Serialize windows to ?windows=[{path, position, size, zIndex}]
setWindows(newWindows) // mirrors to query params
```

This makes it possible to share a URL that reopens a specific multi-window layout. The initial
window at page load is always created from the current path; any `?windows=` params open
additional windows on top.

**File:** `src/context/App.tsx` lines 2297–2396

### Window creation lifecycle

1. Gatsby builds static HTML for every MDX file / programmatic page via `gatsby/createPages.ts`
2. At runtime, `wrapPageElement` fires with `{ element, location }`
3. `createNewWindow()` in `App.tsx` (line 1704) reads `location.pathname` to look up the path's
   `AppSetting` in the registry (see Section 2), then sets initial size, position, and constraints
4. Feature-flag experiment variants are resolved here too (line 1691–1701): if a path has an
   `experiment` field, `posthog.getFeatureFlag()` is called and the window may use an alternate key
5. The new `AppWindow` object is pushed to the `windows` array; `AnimatePresence` in `Wrapper`
   scales it in

**File:** `src/context/App.tsx` lines 1691–1793

### Our portfolio comparison

Our portfolio uses Next.js App Router with no equivalent URL→window mapping. Each "app" component
is rendered statically inside a desktop layout component — opening an app changes UI state but
doesn't update the URL. This means no deep-linking, no browser history, no shareable desktop state.

---

## 2. App Registry — `appSettings` Flat Map

### Where the registry lives

The entire app registry is a single TypeScript object called `appSettings` in `src/context/App.tsx`
starting at line 335. It maps URL path strings to `AppSetting` objects.

### `AppSetting` interface

```typescript
// src/context/App.tsx lines 305–330
export interface AppSetting {
    experiment?: {
        variant: 'control' | 'test'
        flag: string
    }
    size: {
        min: { width: number; height: number }
        max: { width: number; height: number }
        fixed?: boolean
        autoHeight?: boolean
    }
    position?: {
        center?: boolean
        topCenter?: boolean
        getPositionDefaults?: (
            size: { width: number; height: number },
            windows: AppWindow[],
            getDesktopCenterPosition: () => { x: number; y: number }
        ) => { x: number; y: number }
    }
    modal?: {
        type: 'standard' | 'side' | 'floating'
    }
}
```

### Representative entries

```typescript
// Homepage — experiment-gated, custom position logic
'/': {
    experiment: { variant: 'control', flag: 'homepage-redesign' },
    size: { min: { width: 800, height: 600 }, max: { width: 1200, height: 900 } },
    position: {
        getPositionDefaults: (size, windows, getCenterPos) => ({ ... })
    }
},

// Human chat modal — standard modal, fixed size
'/talk-to-a-human': {
    size: { min: { width: 600, height: 500 }, max: { width: 600, height: 500 }, fixed: true },
    modal: { type: 'standard' }
},

// Max AI chat — floating modal, fixed 400×600
'ask-max': {
    size: { min: { width: 400, height: 600 }, max: { width: 400, height: 600 }, fixed: true },
    modal: { type: 'floating' }
},

// Global search — top-center, auto-height
'search': {
    size: { min: { width: 600, height: 48 }, max: { width: 600, height: 600 }, autoHeight: true },
    position: { topCenter: true }
},

// Music player — fixed size, full-screen UI
'/fm': {
    size: { min: { width: 1100, height: 660 }, max: { width: 1100, height: 660 }, fixed: true }
}
```

**File:** `src/context/App.tsx` lines 335–1300 (the full registry spans ~965 lines)

### What metadata each entry carries

| Field | Effect |
|---|---|
| `size.min` / `size.max` | Window resize constraints |
| `size.fixed` | Disables user resize |
| `size.autoHeight` | Window grows to fit content height |
| `position.center` | Opens at desktop center |
| `position.topCenter` | Opens at top-center (used for search) |
| `position.getPositionDefaults` | Custom function for complex placement |
| `modal.type` | `standard` = chrome-less dialog; `side` = side panel; `floating` = draggable bubble |
| `experiment` | Feature-flag variant redirect |

### What the registry does NOT contain

- Window title (set dynamically by the `SEO` component via `setWindowTitle`)
- Icon (defined separately in `Desktop/index.tsx` as `useProductLinks()` and in the nav tree)
- Theme support (handled by the theming system, not here)

### Desktop icons — the visible "app launcher"

Desktop icons are a separate hardcoded list in `src/components/Desktop/index.tsx`. Each entry is
roughly:

```tsx
{ label: 'Blog', Icon: <SomeIcon />, url: '/blog', source: 'desktop' }
```

Clicking a desktop icon fires a Gatsby `navigate()` to the icon's URL, which triggers the
`wrapPageElement` hook, which opens a new window. The registry lookup happens at window creation
time — not at icon definition time.

Right-click context menu items on the desktop also use `<Link to="/about" state={{ newWindow: true }}>`,
relying on the same mechanism.

**File:** `src/components/Desktop/index.tsx` lines 420–445

### Nav menu — a third registration point

Navigation items are defined in `src/navs/index.js`:

```js
{
    name: 'Docs',
    url: '/docs',
    icon: DocsIcon,
    color: '#...',
    description: 'PostHog docs',
    children: [...],
    dynamicChildren: 'data-pipeline-sources'  // fetched at runtime from API
}
```

The `dynamicChildren` field is resolved in `App.tsx` — it fetches data from an external source
and injects nav items at runtime. This is how third-party pipeline sources appear in the nav
without being hardcoded.

**File:** `src/navs/index.js` lines 1–80

### Summary: three separate registrations to add an "app"

To expose a new section in PostHog's OS:

1. **`appSettings`** — size + position + modal type for the URL path
2. **`Desktop/index.tsx` `useProductLinks()`** — icon and label on the desktop
3. **`src/navs/index.js`** — entry in the taskbar menu tree

---

## 3. Content Sourcing

### Content types and file locations

All content is MDX files sourced from the `contents/` directory at repo root. `gatsby/createPages.ts`
runs a set of GraphQL queries over all MDX nodes, grouped by slug prefix, and calls
`actions.createPage()` for each one with the appropriate template.

The slug prefixes and their template mappings (from `createPages.ts` lines 100–370):

| Slug prefix | Template | Description |
|---|---|---|
| `/blog/` | `BlogPost` | Blog articles |
| `/docs/` | `Handbook` | Documentation |
| `/handbook/` | `Handbook` | Company handbook |
| `/manual/` | `Handbook` | Product manual |
| `/tutorials/` | `Tutorial` | Tutorial pages |
| `/tutorials/categories/` | `TutorialsCategory` | Tutorial category pages |
| `/apps/` | `App` | Integration app pages |
| `/cdp/` | `DataPipeline` / `DataWarehouseSource` | CDP/pipeline pages |
| `/customers/` | `Customer` | Customer case studies |
| `/templates/` | `Template` | Insight/feature templates |
| `/jobs/` | `Job` | Job postings (Ashby API sourced) |

Content is also sourced from non-MDX APIs:
- **Ashby** — job postings (`allAshbyJobPosting`)
- **External plugin repository** — `https://raw.githubusercontent.com/PostHog/plugin-repository/main/repository.json` fetched at build time for sitemap entries
- **PostHog's own API** — question pages for community forum, workflow templates

**File:** `gatsby/createPages.ts` lines 1–370

### How MDX renders inside a window

The `Handbook` template (used for `/docs/`, `/handbook/`, `/manual/`) is the canonical example:

```tsx
// src/templates/Handbook.tsx lines 77–81
const MDX = ({ body }) => (
    <MDXProvider components={{}}>
        <MDXRenderer>{body}</MDXRenderer>
    </MDXProvider>
)
```

The template receives `data.post` from the Gatsby GraphQL query (the MDX node), renders it
through `MDXProvider` + `MDXRenderer`, and wraps it in a `ReaderView` component for layout.

The `Router` sub-component inside `AppWindow/index.tsx` decides which template wraps the window
content:

```tsx
// src/components/AppWindow/index.tsx lines 100–123
if (/^\/questions/.test(path)) return <Inbox {...props} />
if (/^\/handbook|^\/docs\/(?!api)|^\/manual/.test(path) && props.data?.post) return <Handbook {...props} />
if ((props.pageContext?.post || /^posts/.test(path)) && props.data) return <BlogPost {...props} />
if (['/terms', '/privacy', '/dpa', '/baa', '/subprocessors'].includes(path)) return <Legal defaultTab={path}>{children}</Legal>
// fallback: modal or raw children
```

This dispatch happens inside the `AppWindow` chrome. The Gatsby-generated page component is always
`children` — the `Router` either passes it straight through or wraps it in a specialized reader
layout.

**Key insight:** Templates (`Handbook`, `BlogPost`) are NOT the window chrome. They're content
layouts rendered inside the chrome. The chrome (`AppWindow`) is always the same; only the inner
layout changes based on path regex.

### Frontmatter schema for MDX content

Each MDX file carries frontmatter. For apps (`/apps/` slug prefix):

```mdx
---
title: My Integration
thumbnail: ./images/icon.png
badge: Built-in
price: Free
filters:
  type:
    - Data-in
  maintainer: Official
---
```

For blog posts: `title`, `date`, `author`, `category`, `tags`, `featuredImage`, `description`.
For docs: `title`, `availability` (plan-level feature access matrix), `related` (linked articles).

**File:** `src/components/Apps/index.js` lines 127–150; `src/templates/Handbook.tsx` lines 112–170

---

## 4. Cross-App Interactions

### How links between apps work

There is no explicit "open app X from app Y" API. All inter-app navigation uses standard anchor tags
or Gatsby `<Link>` components pointing to internal URLs. Because every internal navigation fires
`wrapPageElement`, the target always opens as a window.

`<Link to="/docs/getting-started">` in a blog post → Gatsby navigates to `/docs/getting-started` →
`wrapPageElement` fires → new Handbook window opens.

The `state={{ newWindow: true }}` pattern seen on desktop icon links is a hint, but it's not
strictly required — the window creation logic in `App.tsx` handles the case regardless.

**File:** `src/components/Desktop/index.tsx` lines 426, 434, 443

### Taskbar menu links

The taskbar menu data (`src/components/TaskBarMenu/menuData.tsx`) contains internal links to docs
and blog sections:

```tsx
// menuData.tsx lines 967, 498
{ link: '/docs' }
{ link: '/blog' }
```

These are rendered as Gatsby `<Link>` elements, so clicking them opens a new window.

### AppWindow back/forward history

Each window maintains its own history stack (inside `AppWindow/index.tsx`). When you navigate
within a docs window (clicking internal links that stay within `/docs/*`), the window's internal
history stack grows. The back/forward buttons in the window chrome navigate within that stack
without opening new windows. Cross-path navigation (e.g., from `/docs` to `/blog`) would open a
new window.

### Terminal app

There is no terminal app in the PostHog site's OS metaphor. The "apps" are product pages, docs,
blog — not system utilities. The `/fm` (music player), `/ask-max` (AI chat), and `search` are
the closest equivalents to utility apps.

### Our portfolio cross-app wiring

Our `FileManager.jsx` reads from `portfolio.json` (a static config file) and displays project
cards. Those cards have links (presumably to GitHub or live URLs) but they navigate to external
sites, not to other OS apps. There is no internal routing between our apps.

---

## 5. SEO & Shareability

### React Helmet for per-page meta

Every content page calls the `SEO` component (`src/components/seo.tsx`) which uses `react-helmet`
to inject into `<head>`:

- `<title>` via `titleTemplate` (`%s – PostHog`)
- `<meta name="description">`
- `<meta property="og:title">`, `og:description`, `og:image`, `og:url`
- `<meta name="twitter:card" content="summary_large_image">`
- `<link rel="canonical">`
- `<link rel="alternate" type="text/markdown">` for markdown content paths (enables "view source
  as markdown" for developer tooling)

```tsx
// src/components/seo.tsx lines 48–52
useEffect(() => {
    if (updateWindowTitle && seo.title && appWindow) {
        setWindowTitle(appWindow, seo.title)
    }
}, [seo.title])
```

This `useEffect` syncs the window chrome's titlebar with the `<title>` content — so both the
browser tab and the OS window header show the correct page title.

**File:** `src/components/seo.tsx` lines 1–95

### Static HTML for crawlers

Gatsby is a static site generator — every page produces a full HTML file at build time. The
`<Provider>` + `<Wrapper>` shell is hydrated on the client, but the initial HTML served to crawlers
contains the rendered page content including all meta tags. This is the core SEO advantage of
Gatsby over a pure client-rendered SPA: search engines see real content, not a blank `<div id="root">`.

The `wrapPageElement` in `gatsby-ssr.js` mirrors `gatsby-browser.tsx` exactly, ensuring the SSR
output matches the client hydration:

```js
// gatsby-ssr.js lines 22–29
export const wrapPageElement = ({ element, props: { location } }) => {
    initKea(true, location)
    return (
        <Provider element={element} location={location}>
            <Wrapper />
        </Provider>
    )
}
```

Additionally, `onRenderBody` injects:
- `/scripts/theme-init.js` before body content (prevents flash of wrong theme on load)
- `/scripts/initial-loader.js` after body content (handles loading state)

**File:** `gatsby-ssr.js` lines 31–57

### Sitemap

Configured in `gatsby-config.js` via `gatsby-plugin-sitemap`:

- All static pages from `allSitePage` are included
- Plugin pages from the GitHub plugin repository JSON are fetched at build time and added
- Community question pages are fetched from the PostHog API at build time and added
- Priority weights: `/` = 1.0, `/docs/*` = 0.9, `/product/*` = 0.8, `/pricing` = 0.8,
  `/blog/*` = 0.7, `/handbook/*` = 0.6

**File:** `gatsby-config.js` lines 194–265

### OG images

The `SEO` component accepts an `image` prop. If `imageType='relative'`, it prepends
`GATSBY_DEPLOY_PRIME_URL || siteUrl`. Static OG images live at `src/images/og-images/` and are
referenced as paths like `/og-images/apps.jpeg` in individual page components.

There is no automated OG image generation (e.g., no Vercel OG or canvas-based generation). Each
section has a manually created JPEG.

### noindex support

The `SEO` component accepts a `noindex` prop that injects `<meta name="robots" content="noindex">`.
Used for internal/admin pages.

---

## 6. Scaling Patterns — Adding a New App or Content Page

### Recipe A: Add a new content section (MDX-driven)

This is the most common case — you want a new set of pages like `/case-studies/` or `/changelogs/`.

**Step 1 — Create MDX files**

Add `.mdx` files to `contents/case-studies/` with appropriate frontmatter:
```mdx
---
title: Acme Corp
date: 2024-01-15
description: How Acme used PostHog
featuredImage: ./images/acme.jpg
---
Content here...
```

**Step 2 — Register the content type in `gatsby/createPages.ts`**

Add a new GraphQL query section:
```ts
caseStudies: allMdx(filter: { fields: { slug: { regex: "/^/case-studies/" } } }) {
    nodes { id fields { slug } frontmatter { title } }
}
```

Then in the `createPages` function, iterate and call `createPage`:
```ts
data.caseStudies.nodes.forEach(({ id, fields: { slug } }) => {
    createPage({
        path: slug,
        component: path.resolve('./src/templates/CaseStudy.tsx'),
        context: { id }
    })
})
```

**Step 3 — Create a template**

`src/templates/CaseStudy.tsx` — exports a default component and a `pageQuery`:
```tsx
export const pageQuery = graphql`
    query($id: String!) {
        post: mdx(id: { eq: $id }) {
            body
            frontmatter { title description featuredImage { publicURL } }
        }
    }
`
export default function CaseStudy({ data }) {
    return (
        <>
            <SEO title={data.post.frontmatter.title} />
            <ReaderView>
                <MDXProvider><MDXRenderer>{data.post.body}</MDXRenderer></MDXProvider>
            </ReaderView>
        </>
    )
}
```

**Step 4 — Add `AppSetting` to the registry**

In `src/context/App.tsx`, add an entry for the new slug pattern. If all case study pages should
open at a standard readable size:
```ts
'/case-studies': {
    size: { min: { width: 800, height: 600 }, max: { width: 1200, height: 900 } }
},
```

A single prefix entry works for all sub-paths if the `getKey()` function falls through to it. For
exact-path matching you'd need one entry per URL or use the prefix-match fallback logic.

**Step 5 — Wire the `Router` dispatch**

In `src/components/AppWindow/index.tsx`, add a new branch to the `Router` component if the new
content type needs a specialized inner layout:
```tsx
if (/^\/case-studies/.test(path) && props.data?.post) {
    return <CaseStudy {...props} />
}
```

If the template handles its own layout and doesn't need special dispatch, the fallback
`children` path works and you can skip this step.

**Step 6 — Add nav/desktop entry (optional)**

Add to `src/navs/index.js` for taskbar visibility and/or to `Desktop/index.tsx` for a desktop icon.

**Total file touches:** 3 required (`createPages.ts`, a new template file, `context/App.tsx`) +
2 optional (nav and desktop icon).

---

### Recipe B: Add a utility app (no content, interactive UI)

For a standalone app like a calculator, calendar, or resume viewer:

**Step 1 — Create a Gatsby page**

Add `src/pages/resume.tsx`:
```tsx
export default function ResumePage({ location }) {
    return (
        <>
            <SEO title="Resume" updateWindowTitle={true} />
            <div>...resume UI...</div>
        </>
    )
}
```

Gatsby automatically creates a `/resume` route from files in `src/pages/`.

**Step 2 — Add to `appSettings`**

```ts
'/resume': {
    size: { min: { width: 800, height: 700 }, max: { width: 900, height: 800 }, fixed: true }
}
```

**Step 3 — Add desktop icon**

In `Desktop/index.tsx`:
```tsx
{ label: 'Resume', Icon: <DocumentIcon />, url: '/resume', source: 'desktop' }
```

**Total file touches:** 2 required (new page + `appSettings`) + 1 optional (desktop icon).

---

### Where scaling bottlenecks

**1. `appSettings` is a 965-line flat object.**  
Every new path requires a manual entry. There's no code generation, no schema validation, no
type-safe factory. At 50+ entries it's already verbose; at 200+ it becomes a maintenance burden.
Path typos produce silent fallbacks (default size behavior), not errors.

**2. `Router` dispatch is a regex chain.**  
Adding a new content template requires editing `AppWindow/index.tsx` — a shared, non-content file.
Each new content type adds a branch. No plugin or declarative approach exists.

**3. Desktop icon list is hardcoded.**  
`useProductLinks()` in `Desktop/index.tsx` is a static array. Adding a new icon requires editing
this file directly. There's no convention for auto-registering icons.

**4. Nav tree is a deeply nested static object.**  
`src/navs/index.js` is a multi-level object. New sections require inserting children in the right
spot. The `dynamicChildren` API hint is the only mechanism for external injection.

**5. No per-app MDX global components or providers.**  
`shortcodes` in `mdxGlobalComponents` are shared across all content. You can't give `/docs` a
different set of MDX components than `/blog` without per-template `MDXProvider` config.

---

## 7. Analytics & Feature Flags

### Pageview tracking

`gatsby-browser.tsx` fires PostHog pageview events on route changes:

```tsx
// gatsby-browser.tsx (inferred from onRouteUpdate pattern)
export const onRouteUpdate = ({ location }) => {
    posthog.capture('$pageleave')
    posthog.capture('$pageview')
}
```

Every URL navigation — whether user-initiated or window-open — fires these events. Because
every page is a window, pageview events map 1:1 to window opens.

**File:** `gatsby-browser.tsx`

### Animation performance event

`AppWindow/index.tsx` captures a custom event when animations are disabled:

```tsx
posthog.capture('animation_performance_reduced')
```

This is wired to the `performanceBoost` site setting — when users enable it, the event fires so
the team can track how many users hit performance issues.

**File:** `src/components/AppWindow/index.tsx`

### Feature flag experiment routing

The `appSettings` registry supports an `experiment` field that redirects a path to a different
window configuration based on a PostHog feature flag variant:

```typescript
// src/context/App.tsx lines 1691–1701
function getKey(key: string) {
    const experiment = appSettings[key]?.experiment
    if (!experiment?.flag) return key
    const assignedVariant = posthog?.getFeatureFlag?.(experiment?.flag)
    if (!assignedVariant) return key
    const keyToUse = Object.keys(appSettings).find(
        (key) =>
            appSettings[key]?.experiment?.flag === experiment?.flag &&
            appSettings[key]?.experiment?.variant === assignedVariant
    )
    return keyToUse || key
}
```

Example: `'/'` has `experiment: { flag: 'homepage-redesign', variant: 'control' }`. Users in the
`test` variant of `homepage-redesign` get a different `appSettings` key resolved, giving them a
different window size or position config for the homepage. The page content itself is controlled
separately by the feature flag — this only controls the window chrome behavior.

**File:** `src/context/App.tsx` lines 305–310, 337–340, 457–461, 1691–1701

### Kea state management

`gatsby-ssr.js` and `gatsby-browser.tsx` both call `initKea(true/false, location)` and
`wrapElement()` from a local `kea` module. Kea is a state management library that wraps React
context/Redux patterns. It's used for the user authentication state, community features
(Squeak), and potentially A/B test state. PostHog uses its own product to track behavior
on its own marketing site.

**File:** `gatsby-ssr.js` line 10; `gatsby-browser.tsx`

---

## 8. Comparison vs Our Portfolio

### What PostHog does that we don't

**A. URL-driven window state (most impactful)**  
Every PostHog page is a URL. This means deep-linking works, browser history works, and search
engines index every page. Our portfolio has no URL routing for windows — clicking "File Manager"
doesn't update the URL. This is a critical gap for SEO and shareability.

**B. Centralized app registry with metadata**  
`appSettings` is a single source of truth for every app's size/position/modal behavior. When you
change a window's default size you change one object. Our portfolio has sizing hardcoded in each
app component independently.

**C. `Router` dispatch for content types**  
A central switch decides whether a window shows a handbook, blog post, or modal. Content layout
is separated from window chrome. In our portfolio, each app component owns its own layout — there's
no shared content rendering infrastructure.

**D. SEO via Gatsby's static generation**  
PostHog's every page is pre-rendered HTML. Our Next.js App Router can do the same, but our apps
(FileManager, Gallery, About) are client-side components with no SSR page at `/file-manager`. A
crawler hitting `/file-manager` would see only the OS shell.

**E. Content-as-data (MDX + GraphQL)**  
PostHog's blog, docs, and tutorial content lives in `.mdx` files queried at build time. Adding a
blog post means adding a file — no code change, no deployment of new components. Our portfolio
has no content pipeline; project data lives in `portfolio.json` (a single JSON config read
client-side).

---

## 9. Scaling Recommendations for Our Portfolio

These are concrete, ordered by impact-to-effort ratio.

### Rec 1 — URL routing per app window (high impact, medium effort)

**Problem:** No deep-linking, no browser history, no SEO for individual apps.

**What to do:** Use Next.js App Router dynamic routes. Map each app to a URL:
- `/apps/file-manager` → FileManager component
- `/apps/about` → About component
- `/apps/browser` → Browser component

Create `src/app/apps/[appId]/page.jsx`. Read `appId` from params, look up the app in a registry,
render it inside the OS window shell as the page content. The window chrome becomes a layout
component (`src/app/apps/layout.jsx`).

This gives every app a shareable URL, browser back/forward, and SSR-able metadata.

**Files to touch:** `src/app/apps/[appId]/page.jsx` (new), `src/app/apps/layout.jsx` (new),
`src/components/apps/registry.js` (new — see Rec 2).

### Rec 2 — App registry object (medium impact, low effort)

**Problem:** App metadata (title, icon, default size, description) is scattered across
`Desktop.jsx`, `Taskbar.jsx`, and individual app components. Adding an app requires touching 3+
files.

**What to do:** Create `src/config/apps.js` (or `apps.ts`):

```js
export const APP_REGISTRY = {
    'file-manager': {
        id: 'file-manager',
        title: 'File Manager',
        icon: FolderIcon,
        defaultSize: { width: 900, height: 600 },
        minSize: { width: 600, height: 400 },
        component: () => import('@/components/apps/FileManager'),
        showOnDesktop: true,
        route: '/apps/file-manager',
    },
    about: {
        id: 'about',
        title: 'About',
        icon: UserIcon,
        defaultSize: { width: 700, height: 500 },
        minSize: { width: 500, height: 400 },
        component: () => import('@/components/apps/About'),
        showOnDesktop: true,
        route: '/apps/about',
    },
    // ...
}
```

Desktop icons, taskbar, and window chrome all derive from this single object. Adding a new app
is one entry in this file + creating the component.

**Files to touch:** New `src/config/apps.js`; refactor `Desktop.jsx` and taskbar to consume it.

### Rec 3 — Content pages as MDX with Next.js generateStaticParams (medium impact, medium effort)

**Problem:** Long-form content (blog posts, project write-ups, case studies) would require new
React components per piece. Not scalable for a growing portfolio/blog.

**What to do:** Use Next.js's MDX support (`@next/mdx` or `next-mdx-remote`):

1. Create a `content/blog/` directory for `.mdx` files
2. Add `src/app/blog/[slug]/page.jsx` with `generateStaticParams()` that reads the `content/blog/`
   directory at build time
3. Each blog post URL opens a reader-style window using a shared `BlogPost` layout component
4. The `appSettings`-equivalent for blog posts would be a single entry in the app registry for
   the `/blog/*` pattern

This mirrors PostHog's `Handbook` template pattern exactly.

**Files to touch:** `src/app/blog/[slug]/page.jsx` (new), `src/components/apps/BlogPost.jsx` (new),
`content/blog/*.mdx` (new content directory).

### Rec 4 — SEO metadata per app (low effort, moderate SEO impact)

**Problem:** Our apps have no `<title>` or OG tags — they're client-rendered and invisible to crawlers.

**What to do:** In Next.js App Router, `generateMetadata()` at the page level sets per-page
`<title>` and OG data. Once Rec 1 is done (URL routing), each app page can export:

```js
// src/app/apps/[appId]/page.jsx
export async function generateMetadata({ params }) {
    const app = APP_REGISTRY[params.appId]
    return {
        title: `${app.title} — Manish Singh`,
        description: app.description,
        openGraph: { title: app.title, description: app.description, images: [app.ogImage] }
    }
}
```

**Files to touch:** `src/app/apps/[appId]/page.jsx` (already being created in Rec 1).

### Rec 5 — Feature flag / experiment hook (low effort, optional)

**Problem:** No way to A/B test portfolio layouts or gate new apps for gradual rollout.

**What to do:** PostHog's pattern is instructive — the `appSettings` registry carries an
`experiment` field that the window-creation function reads at runtime. We can do the same in our
app registry:

```js
'file-manager': {
    // ...
    experiment: { flag: 'new-file-manager', variant: 'test', alternateId: 'file-manager-v2' }
}
```

At app open time, check `posthog.getFeatureFlag('new-file-manager')`. If the user is in the `test`
variant, render `file-manager-v2` instead. This requires adding the PostHog browser SDK (already
potentially in the project since we're researching PostHog).

**Files to touch:** `src/config/apps.js` (add `experiment` field); window-open logic.

---

## Summary of Key PostHog Patterns

| Pattern | PostHog implementation | Our portfolio gap |
|---|---|---|
| URL = window state | `wrapPageElement` hook in Gatsby | No URL routing for windows |
| App registry | `appSettings` flat map in `App.tsx` | Scattered across components |
| Content pipeline | MDX + `createPages.ts` + GraphQL | Static JSON only |
| Content → window dispatch | `Router` regex in `AppWindow` | No separation of chrome / layout |
| SSR for SEO | `gatsby-ssr.js` mirrors browser | Client-only app components |
| Sitemap | `gatsby-plugin-sitemap` + API fetch | Not checked / likely missing for app pages |
| Window title sync | `SEO` component calls `setWindowTitle` | No mechanism |
| Feature flag routing | `experiment` field in `appSettings` | None |

---

*Files referenced in this document (all under `D:/Projects/portfolio/Research/posthog.com/`):*

- `gatsby-browser.tsx`
- `gatsby-ssr.js`
- `gatsby-config.js`
- `gatsby/createPages.ts`
- `src/context/App.tsx`
- `src/context/Window.tsx`
- `src/components/AppWindow/index.tsx`
- `src/components/Desktop/index.tsx`
- `src/components/Wrapper/index.tsx`
- `src/components/seo.tsx`
- `src/components/Apps/index.js`
- `src/components/TaskBarMenu/menuData.tsx`
- `src/templates/Handbook.tsx`
- `src/navs/index.js`
