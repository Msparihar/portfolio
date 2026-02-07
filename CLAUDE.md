# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

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