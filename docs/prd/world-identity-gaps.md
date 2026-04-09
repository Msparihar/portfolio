# World Identity Gaps — Things That Should Be Global But Aren't

Everything on this list is set once in a config/store and used in multiple places.
Only SOME places were updated to be world-aware. The rest still show default/generic content.

## Icons (partially fixed)
- [x] Desktop icon grid — reads worldIcons.js
- [x] Sidebar — reads worldIcons.js  
- [ ] Taskbar icons — still reads windowStore.icon (hardcoded emoji)
- [ ] Window title icons — not shown, but if added should be world-aware
- [ ] Inside apps (Trash items show 📁, FileManager shows generic icons)

## App Titles (not fixed)
- [ ] windowStore.title is hardcoded: "File Manager", "Terminal", etc.
- [ ] Should be world-themed: "Grimoire" (Elden Ring), "Garden" (Ghibli), "Archives" (GoT)
- [ ] titleFormat wraps title but base title doesn't change per world

## Terminal Content (not fixed)
- [ ] Boot sequence shows "Manish Singh Parihar", "Full Stack & AI Engineer", skills list — generic
- [ ] Should show world-themed intro (Elden Ring: lore-style, Ghibli: nature-style)
- [ ] Prompt text `$ manish@portfolio` hardcoded — should be `$ tarnished@lands-between` etc.
- [ ] `whoami` command output is generic — should be world-themed
- [ ] `help` command descriptions are generic

## Context Menu (not fixed)
- [ ] Menu item prefix `$ ` is hardcoded — should be `✦ ` (Elden Ring), `✿ ` (Ghibli)
- [ ] Menu item text is generic ("About", "Display Options") — could be world-themed

## Taskbar Content (partially fixed)
- [x] Brand text — reads world.brandText
- [ ] Wifi/battery/clock text style is generic
- [ ] No seasonal indicator for GoT (snowflake/sun/moon/flame icon)

## Browser Identity (not fixed)
- [ ] Favicon doesn't change per world
- [ ] Page `<title>` doesn't reflect current world
- [ ] Meta theme-color doesn't change per world

## Boot Overlay (partially fixed)
- [x] Boot lines come from world config
- [x] Accent colors come from world config
- [ ] Font should use --dt-font-heading for dramatic effect (uses --dt-font-mono)
- [ ] Background should use --dt-bg (partially fixed)
