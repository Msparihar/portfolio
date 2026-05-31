# PostHog — How They Centralize Design for Consistency

Study of `Research/posthog.com`. Question: how does PostHog keep its design so consistent? Answer: **ruthless indirection** — nothing hardcodes a value; everything points at a central token, so consistency is *structural*, not a matter of discipline.

## The single source of truth (3 files)
1. **`src/styles/global.css`** — the master token file. Defines every color as a CSS variable (`--bg`, `--text-primary`, `--accent`, `--border`…), plus light/dark mappings, shadows, keyframes, prose/typography rules. **This is where all values live.**
2. **`tailwind.config.js`** — a *names → variables* bridge, NOT where values live: `backgroundColor.primary = 'rgb(var(--bg) / <alpha-value>)'`. Minimal by design.
3. **`src/constants/index.ts`** — reusable className strings (`PROSE_CORE`, `TABLE_CLASSES`, `getProseClasses(size)`). Components import these instead of re-writing class lists.

## The techniques that produce consistency
1. **CSS-variable indirection.** No component contains `#F54E00`. It writes `bg-primary`, which resolves through `--bg`. Changing the palette = one edit in `global.css`; thousands of components inherit automatically.
2. **RGB-triplet tokens** (`253 253 248`, no commas) so Tailwind's `<alpha-value>` works: `bg-primary/50` → `rgb(253 253 248 / 0.5)`. Every color is alpha-composable.
3. **Three-tier surface scheme via `data-scheme`** (`primary`/`secondary`/`tertiary`). Nest `<section data-scheme="secondary">` and everything inside shifts surface color — **no variant props**. This is how they get visual depth without prop-drilling.
4. **Pre-paint theme script** (`static/scripts/theme-init.js`) sets theme + scheme from `localStorage` *before first paint* → no flash of wrong theme (FOUC).
5. **MDX global component registry** (`src/mdxGlobalComponents.ts`) — 25+ pre-styled shortcodes (CalloutBox, Steps, OSQuote…) auto-available in every `.mdx`. All callouts look identical everywhere.
6. **Pre-commit enforcement** — `lint-staged` runs Prettier (normalizes formatting) + ESLint (catches anti-patterns) before every commit. Kills className/formatting drift.
7. **Storybook** auto-discovers `*.stories.tsx` → visually audit every component × every variant (light/dark/skin) without loading a full page.

Components always accept a `className` override and default to token-referencing Tailwind classes — **no component "owns" a color.**

## What this portfolio could adopt
Current state: `--dt-*` CSS vars in `src/app/globals.css`, overridden per world via `data-world`, `worldContent.ts` as content SSOT. Already the same *indirection* pattern — good foundation. Upgrades:
- **Multi-tier surface scheme:** add `--dt-surface-secondary/-tertiary` per world + use `data-scheme` to nest surfaces → depth without props.
- **RGB-triplet tokens:** store `--dt-accent: 255 107 0` (not hex) → alpha-composable opacities everywhere.
- **Pre-paint world script:** set `data-world` from `localStorage` before first paint → kill the world-switch flicker.
- **Component/MDX registry:** when lore content (codex/journal) grows, centralize its styled blocks in one file so all worlds' narrative looks consistent.
- **Storybook for worlds:** QA "all components × all 3 worlds" without visiting each.

**One-line takeaway:** consistency isn't enforced by reviewers remembering the rules — it's enforced by *architecture*: every value lives once, everything else references it, and tooling (lint + Storybook) catches drift mechanically.
