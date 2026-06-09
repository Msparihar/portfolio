# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Workflow (READ FIRST — critical)

### Single source of truth
- **`docs/IDEAS.md`** (gitignored, private) is the ONE tracker — every idea with its **status** (and worktree, if one's in use), organized into pillars (OS Shell, Worlds, 3D, Mascot/Kitsune, Atmosphere, Eggs, Lore, Infra). **Read it first.** Statuses: ⚪ idea · 🔵 in-progress · 🟢 shipped · ⏸️ parked.
- **No PRDs.** We do not write PRDs anymore — capture an idea as a **row in `docs/IDEAS.md`** and build directly from there. There is also **no `STATUS.md`** (retired — folded into the "Now" section of `docs/IDEAS.md`). Do not recreate either.
- **`docs/prd/archive/`** is kept only as historical record — **do not add to it**. **`docs/research/`** — reference docs (PostHog mining etc.). **`docs/design/worlds.pen`** — Pencil design source (stale; see Design work).

### No versioning — one canonical implementation per idea
- Do NOT create `-v2`/`-v3` folders or stray `vN` branches that orphan ideas. ONE canonical implementation per idea; its history lives in git + `CHANGELOG.md`. A new idea = a new **row** in `docs/IDEAS.md`, never a new folder.

### How we build — directly on `main`
- **The main thread NEVER writes code.** It is for ideation, diagnosis, and **orchestrating agents** — the pipeline is **Explore → Plan → Implement**. ALL code-writing is delegated to implementation subagents (`frontend-implementer`, `backend-implementer`, or general implementation agents). The main thread may still read files, run diagnostics, edit instruction/config docs like this one (that's orchestration, not code), commit/push, and verify — but it does not author or edit application source itself.
- **Default: build directly on `main` from the root folder, commit, and push.** Push auto-deploys (see Deploy). No PRD, no mandatory worktree — this is how the 2026-05-31 batch and the 2026-06-04 hotfix shipped. (Branch strategy ≠ who writes the code: subagents do the editing, in the root working tree by default.)
- **Worktrees are optional** — reach for one only when you genuinely want isolation or parallel agents on **disjoint files**: `git worktree add ../portfolio-wt/<slug> -b feat/<slug>`, brief a subagent, then **merge → push → delete the worktree + branch** (`git worktree remove ... && git branch -d ...`). Don't spin one up for routine single-task work.
- Either way: after pushing, **wait for the Dokploy build and verify live** (see Deploy) before calling it shipped.

### Deploy
- **Ship finished work immediately — never wait for the user to approve a push/deploy.** Once a change is implemented and verified, commit and push the same turn. Do NOT park completed work asking "push now or also do X first?" — push what's done, then offer the follow-up. The user blocks the whole day; a finished diff sitting unpushed waiting on a confirmation is the failure. (Pushing is auto-authorized; only live-browser verification still waits for the user to ask.)
- Production is **Dokploy on the Hostinger VM (72.60.96.109)**, built from the repo **`Dockerfile`** — **NOT Vercel** (there is no `vercel.json` / no CI). Push to `main` **auto-deploys** via a GitHub-App webhook (Dokploy rebuilds the Docker image, Docker Swarm rolls the service). There are **NO branch/preview deploys** — do not invent them. Repo: `github.com/Msparihar/portfolio` (personal `Msparihar` account).
- The Docker build takes **a few minutes** — the new bundle is NOT live the instant you push. After pushing a fix, **wait for the build, then verify live** (use `agent-browser` against manishsingh.tech: check `errors --json` + the served chunk hashes) before calling it shipped. Don't assume push == live.

### Design work
- **`docs/design/worlds.pen` is STALE** — it's the old Elden Ring dark-fantasy mockup system and has drifted far from the shipped app. Do NOT treat it as the source of truth. **The CODE is the design source of truth now** — design directly against the live `--dt-*` world tokens (`src/app/globals.css`, overridden per world) so it matches the running app and themes everywhere. (FileManager card grid was done this way and matches; a Pencil mockup would not.)
- Only open Pencil if the task is explicitly to re-sync `worlds.pen` to the current app.
- **NEVER use the Pencil CLI `--prompt` mode to generate designs** — that delegates the design to another AI model. Author Pencil designs ONLY by hand via the MCP `batch_design` tools (place every element yourself). If the MCP is disconnected, ask the user to reopen the Pencil app so it reconnects, or design in code — do NOT reach for `pencil --prompt`.

### Do NOT
- Recreate `STATUS.md` or per-idea files. Everything is in `docs/IDEAS.md`.
- Commit `docs/IDEAS.md` (gitignored — personal; repo is public).
- Invent infrastructure (preview deploys, CI, branch builds) without verifying it exists.

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