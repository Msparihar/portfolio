# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow (READ FIRST — critical)

This repo uses a lightweight three-file workflow. Claude MUST follow this.

### At session start
1. Read `STATUS.md` (repo root) — current shipped version, in-progress work, known issues, next on deck. **Gitignored**, may not exist on fresh clones; if missing, ask the user.
2. Read `docs/IDEAS.md` — future version ideas, backlog, rough thoughts. **Gitignored**, also personal.
3. Skim `docs/prd/` for any **active** (non-archived) PRD files — these are what we're building right now.

### Where things live
- **`STATUS.md`** (gitignored) — single source of truth for "what's happening right now." Update at end of every session. One file, ~50-100 lines max.
- **`docs/IDEAS.md`** (gitignored) — one big append-only markdown file with dated sections. All future version ideas, backlog notes, brainstorms. Newest on top. No per-idea files.
- **`docs/prd/`** — contains ONLY the PRD for work actively being planned or built. Shipped PRDs move to `docs/prd/archive/`. No "future version" PRDs live here.
- **`docs/prd/archive/`** — shipped/completed PRDs, kept for reference.
- **`docs/prd/design/`** + **`docs/design/worlds.pen`** — design source files.

### The flow
1. **Ideas phase** — new thought? Append a dated section to `docs/IDEAS.md`. Do NOT create a new PRD.
2. **Planning phase** — when an idea matures to "we're building this next," run `prd-writer` → `prd-reviewer` on it, creating `docs/prd/vX.Y.Z-name.md`.
3. **Build phase** — implement per PRD (subagents for multi-file work per global CLAUDE.md rules). Run `/simplify` after.
4. **Ship phase** — commit + push. Move the PRD to `docs/prd/archive/`. Update `STATUS.md`: bump "Current shipped version," clear "In progress," adjust "Next on deck."

### Do NOT
- Create per-idea markdown files. Everything goes into the single `docs/IDEAS.md`.
- Write full PRDs for "someday" ideas. PRDs are for work being actively built, not for backlog.
- Forget to update `STATUS.md` at end of session — that's the discipline that makes the whole system work.
- Commit `STATUS.md` or `docs/IDEAS.md`. They're gitignored on purpose (personal notes; repo is public).

### Version numbering
- Patch bumps (v0.6.2, v0.6.3) for bug fixes and small focused changes.
- Minor bumps (v0.7.0, v0.8.0) for new feature systems.
- Major bumps (v1.0.0, v2.0.0) for architecture-level shifts (landing page, 3D world).

---

## Package Manager

This project uses **bun** as the package manager. Always use `bun` commands instead of `npm` or `pnpm`.

## Development Commands

- **Development server**: `bun run dev` (with Turbopack for faster builds)
- **Build**: `bun run build`
- **Start production**: `bun start`
- **Lint**: `bun run lint`
- **Install dependencies**: `bun install`
- **Add dependency**: `bun add <package-name>`

## Project Architecture

This is a **Next.js 15** portfolio website using the **App Router** pattern with a terminal-themed UI design.

### Key Architecture Patterns

**Terminal UI System**: The site uses a custom terminal interface as the primary navigation and interaction paradigm:
- `TerminalContext.jsx` - Central context provider managing terminal state and commands
- `Terminal.jsx` - Main terminal component with command processing
- `CompactTerminal.jsx` - Condensed terminal for specific sections
- Terminal commands like `help`, `ls`, `cd`, `cat` navigate between sections

**Content Configuration**: Portfolio data is centralized in `src/config/portfolio.json` containing:
- Personal information, skills, experience
- Projects with GitHub/live links and tech stacks
- Blog posts with external URLs
- Social media links and contact information

**Component Structure**:
- `src/components/` - Reusable UI components
- `src/components/ui/` - Shadcn/ui components (button, etc.)
- `src/components/[section]/` - Section-specific components (projects, blog, contact)
- Page-specific interactive components use the "Interactive" suffix pattern

**Theme System**: Uses `next-themes` with custom theme provider:
- Dark theme as default (`defaultTheme: "dark"`)
- System theme detection disabled
- Custom CSS variables for terminal styling

**Performance Optimizations**:
- Dynamic imports for GitHub contributions (`ssr: false`)
- Preloading system via `PreloadLink.jsx` for navigation
- Caching system for GitHub API calls in `lib/githubCache.js`

### Key Technologies

- **Framework**: Next.js 15 with App Router
- **Styling**: Tailwind CSS with custom terminal theme
- **UI Components**: Shadcn/ui, Radix UI primitives
- **Icons**: FontAwesome (brands), Lucide React, React Icons
- **External APIs**: GitHub API for contributions display

### File Structure Notes

- All source code is in `src/` directory
- App Router pages are in `src/app/`
- Static content (images) should go in `public/`
- Configuration files use `.mjs` extension
- TypeScript config is minimal (`jsconfig.json` for JS project)

### Terminal Command System

The terminal supports navigation commands that mirror the portfolio structure:
- Commands are processed in `TerminalContext.jsx`
- Each section (projects, blog, contact) has corresponding terminal commands
- The UI updates to show different portfolio sections based on terminal navigation