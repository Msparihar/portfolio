// src/config/worldContent.ts
// Single source of truth for ALL world-specific content and identity.
// Every component that renders world-aware text, icons, labels, or prompts
// should import from here — NEVER hardcode world-specific content in components.
//
// TypeScript enforces completeness: adding a new AppId or WorldId will cause
// compile errors until you define content for ALL combinations.

import { WORLD_STORAGE_KEY, WORLDS } from './worlds';

// ─── Type definitions ──────────────────────────────────────────────────────
// Add new apps here → TS will force you to add entries for ALL worlds.
// Add new worlds here → TS will force you to add entries for ALL apps.

export type AppId =
  | 'terminal'
  | 'filemanager'
  | 'logviewer'
  | 'mail'
  | 'about'
  | 'browser'
  | 'gallery'
  | 'trash'
  | 'resume';

export type WorldId = 'elden-ring' | 'ghibli' | 'got';

interface IconLabel {
  icon: string;
  label: string;
}

interface TerminalContent {
  promptUser: string;
  promptHost: string;
  bootName: string;
  bootTitle: string;
  bootSkillsLabel: string;
  whoamiName: string;
  whoamiTitle: string;
}

interface TaskbarContent {
  wifiLabel: string;
  batteryLabel: string;
}

// ─── Enforced type maps ────────────────────────────────────────────────────
// Record<WorldId, Record<AppId, T>> ensures every world has every app defined.
// Missing an entry → TypeScript compile error.

type WorldIconMap = Record<WorldId, Record<AppId, IconLabel>>;
type WorldTitleMap = Record<WorldId, Record<AppId, string>>;
type WorldTerminalMap = Record<WorldId, TerminalContent>;
type WorldPrefixMap = Record<WorldId, string>;
type WorldTaskbarMap = Record<WorldId, TaskbarContent>;

// ─── Icon & Label overrides per world ──────────────────────────────────────

const WORLD_ICONS: WorldIconMap = {
  'elden-ring': {
    terminal:    { icon: '⚔️', label: 'Terminal' },
    filemanager: { icon: '📜', label: 'Grimoire' },
    logviewer:   { icon: '📖', label: 'Chronicles' },
    mail:        { icon: '🪶', label: 'Raven Post' },
    about:       { icon: '👤', label: 'Tarnished' },
    browser:     { icon: '🌀', label: 'Portal' },
    gallery:     { icon: '🏺', label: 'Relics' },
    trash:       { icon: '🕳️', label: 'Abyss' },
    resume:      { icon: '📜', label: 'Scroll' },
  },
  'ghibli': {
    terminal:    { icon: '🌿', label: 'Terminal' },
    filemanager: { icon: '🌻', label: 'Garden' },
    logviewer:   { icon: '📔', label: 'Journal' },
    mail:        { icon: '✉️', label: 'Letters' },
    about:       { icon: '🍃', label: 'About Me' },
    browser:     { icon: '🦋', label: 'Explorer' },
    gallery:     { icon: '🎨', label: 'Gallery' },
    trash:       { icon: '🍂', label: 'Compost' },
    resume:      { icon: '📄', label: 'Resume' },
  },
  'got': {
    terminal:    { icon: '⚒️', label: 'Terminal' },
    filemanager: { icon: '🗂️', label: 'Archives' },
    logviewer:   { icon: '🐦‍⬛', label: 'Ravens' },
    mail:        { icon: '📜', label: 'Scrolls' },
    about:       { icon: '👑', label: 'Lord Info' },
    browser:     { icon: '🗺️', label: 'Realm Map' },
    gallery:     { icon: '🖼️', label: 'Tapestry' },
    trash:       { icon: '⛓️', label: 'Dungeon' },
    resume:      { icon: '📋', label: 'Decree' },
  },
};

// ─── App titles per world (used in window headers) ─────────────────────────

const WORLD_APP_TITLES: WorldTitleMap = {
  'elden-ring': {
    terminal: 'Terminal',
    filemanager: 'Grimoire',
    logviewer: 'Chronicles',
    mail: 'Raven Post',
    about: 'Tarnished',
    browser: 'Portal',
    gallery: 'Relics',
    trash: 'Abyss',
    resume: 'Scroll',
  },
  'ghibli': {
    terminal: 'Terminal',
    filemanager: 'Garden',
    logviewer: 'Journal',
    mail: 'Letters',
    about: 'About Me',
    browser: 'Explorer',
    gallery: 'Gallery',
    trash: 'Compost',
    resume: 'Resume',
  },
  'got': {
    terminal: 'Terminal',
    filemanager: 'Archives',
    logviewer: 'Ravens',
    mail: 'Scrolls',
    about: 'Lord Info',
    browser: 'Realm Map',
    gallery: 'Tapestry',
    trash: 'Dungeon',
    resume: 'Decree',
  },
};

// ─── Terminal content per world ────────────────────────────────────────────

const WORLD_TERMINAL: WorldTerminalMap = {
  'elden-ring': {
    promptUser: 'tarnished',
    promptHost: 'lands-between',
    bootName: 'The Tarnished',
    bootTitle: 'Seeker of the Elden Ring',
    bootSkillsLabel: 'Loading ancient runes',
    whoamiName: 'The Tarnished',
    whoamiTitle: 'Seeker of Grace & Elden Ring',
  },
  'ghibli': {
    promptUser: 'ghibli',
    promptHost: 'forest',
    bootName: 'Forest Spirit',
    bootTitle: 'Keeper of the Garden',
    bootSkillsLabel: 'Growing seeds of knowledge',
    whoamiName: 'Forest Keeper',
    whoamiTitle: 'Tender of the Spirit Garden',
  },
  'got': {
    promptUser: 'lord',
    promptHost: 'westeros',
    bootName: 'The Lord Commander',
    bootTitle: 'Ruler of the Seven Kingdoms',
    bootSkillsLabel: 'Forging alliances',
    whoamiName: 'Lord Commander',
    whoamiTitle: 'Warden of the Digital Realm',
  },
};

// ─── File-type icons per world ──────────────────────────────────────────────
// Used inside apps (Trash, FileManager, etc.) for file/folder representations.

export type FileType = 'folder' | 'document' | 'image' | 'code' | 'archive' | 'unknown';

type WorldFileIconMap = Record<WorldId, Record<FileType, string>>;

const WORLD_FILE_ICONS: WorldFileIconMap = {
  'elden-ring': {
    folder:   '📦',
    document: '📜',
    image:    '🏺',
    code:     '⚙️',
    archive:  '🗃️',
    unknown:  '❓',
  },
  'ghibli': {
    folder:   '🌿',
    document: '🍃',
    image:    '🎨',
    code:     '🌱',
    archive:  '📦',
    unknown:  '❓',
  },
  'got': {
    folder:   '🏰',
    document: '📜',
    image:    '🛡️',
    code:     '⚒️',
    archive:  '🗃️',
    unknown:  '❓',
  },
};

const DEFAULT_FILE_ICONS: Record<FileType, string> = {
  folder:   '📁',
  document: '📄',
  image:    '🖼️',
  code:     '📝',
  archive:  '🗃️',
  unknown:  '❓',
};

// ─── Context menu prefix per world ─────────────────────────────────────────

const WORLD_MENU_PREFIX: WorldPrefixMap = {
  'elden-ring': '✦',
  'ghibli': '✿',
  'got': '⚔',
};

const DEFAULT_MENU_PREFIX = '$';

// ─── Taskbar content per world ─────────────────────────────────────────────

const WORLD_TASKBAR: WorldTaskbarMap = {
  'elden-ring': {
    wifiLabel: '⚜ bonfire',
    batteryLabel: '[▮▮▮▮▯] souls',
  },
  'ghibli': {
    wifiLabel: '🍃 breeze',
    batteryLabel: '[▮▮▮▮▯] spirit',
  },
  'got': {
    wifiLabel: '🐦‍⬛ ravens',
    batteryLabel: '[▮▮▮▮▯] realm',
  },
};

// ─── World switcher CTA labels ────────────────────────────────────────────

const WORLD_CTA: Record<WorldId, string> = {
  'elden-ring': 'Arise, Tarnished →',
  'ghibli': 'Enter the Forest →',
  'got': 'Claim the Throne →',
};

const DEFAULT_CTA = 'Switch World →';

// ─── World switcher emoji icons ───────────────────────────────────────────

const WORLD_EMOJI: Record<WorldId, string> = {
  'elden-ring': '🌑',
  'ghibli': '🌿',
  'got': '⚔️',
};

const DEFAULT_EMOJI = '🌍';

// ─── Default terminal content (when no world is active) ────────────────────

const DEFAULT_TERMINAL: TerminalContent = {
  promptUser: 'manish',
  promptHost: 'portfolio',
  bootName: '',       // empty = use real name from portfolio.json
  bootTitle: '',      // empty = use real title from portfolio.json
  bootSkillsLabel: 'Loading skills',
  whoamiName: '',
  whoamiTitle: '',
};

const DEFAULT_TASKBAR: TaskbarContent = {
  wifiLabel: '●●● wifi',
  batteryLabel: '[▮▮▮▮▯] 87%',
};

// ─── Public API ────────────────────────────────────────────────────────────

/**
 * Get the current world ID from localStorage.
 * Returns null if no world is active (using color theme instead).
 */
export function getCurrentWorldId(): WorldId | null {
  if (typeof window === 'undefined') return null;
  const id = localStorage.getItem(WORLD_STORAGE_KEY);
  if (id && isWorldId(id)) return id;
  return null;
}

/**
 * Type guard for WorldId.
 */
export function isWorldId(id: string): id is WorldId {
  return id === 'elden-ring' || id === 'ghibli' || id === 'got';
}

/**
 * Type guard for AppId.
 */
export function isAppId(id: string): id is AppId {
  return ['terminal', 'filemanager', 'logviewer', 'mail', 'about', 'browser', 'gallery', 'trash', 'resume'].includes(id);
}

/**
 * Get the current world config object from worlds.js.
 */
export function getCurrentWorld() {
  const id = getCurrentWorldId();
  if (!id) return null;
  return WORLDS.find((w: { id: string }) => w.id === id) ?? null;
}

/**
 * Get world-specific icon and label for an app.
 * Falls back to provided defaults if no world override exists.
 */
export function getWorldIcon(worldId: string | null, appId: string, defaultIcon: string, defaultLabel: string): IconLabel {
  if (!worldId || !isWorldId(worldId)) return { icon: defaultIcon, label: defaultLabel };
  const appOverrides = WORLD_ICONS[worldId];
  if (isAppId(appId) && appOverrides[appId]) {
    return {
      icon: appOverrides[appId].icon ?? defaultIcon,
      label: appOverrides[appId].label ?? defaultLabel,
    };
  }
  return { icon: defaultIcon, label: defaultLabel };
}

/**
 * Get world-specific app title for window headers.
 * Falls back to default title if no world override exists.
 */
export function getWorldAppTitle(worldId: string | null, appId: string, defaultTitle: string): string {
  if (!worldId || !isWorldId(worldId)) return defaultTitle;
  if (isAppId(appId)) return WORLD_APP_TITLES[worldId][appId] ?? defaultTitle;
  return defaultTitle;
}

/**
 * Get world-specific terminal content.
 * Returns defaults for the standard terminal if no world is active.
 */
export function getWorldTerminal(worldId: string | null): TerminalContent {
  if (worldId && isWorldId(worldId)) return WORLD_TERMINAL[worldId];
  return DEFAULT_TERMINAL;
}

/**
 * Get world-specific context menu prefix character.
 */
export function getWorldMenuPrefix(worldId: string | null): string {
  if (worldId && isWorldId(worldId)) return WORLD_MENU_PREFIX[worldId];
  return DEFAULT_MENU_PREFIX;
}

/**
 * Get world-specific taskbar content.
 */
export function getWorldTaskbar(worldId: string | null): TaskbarContent {
  if (worldId && isWorldId(worldId)) return WORLD_TASKBAR[worldId];
  return DEFAULT_TASKBAR;
}

/**
 * Get world-specific file-type icon.
 * Used inside apps (Trash, FileManager, etc.) for file/folder representations.
 */
export function getWorldFileIcon(worldId: string | null, fileType: FileType): string {
  if (worldId && isWorldId(worldId)) return WORLD_FILE_ICONS[worldId][fileType];
  return DEFAULT_FILE_ICONS[fileType];
}

/**
 * React hook helper — listens for worldchange events and returns current world ID.
 * Usage in useEffect: return createWorldChangeListener(setWorldId);
 */
export function createWorldChangeListener(callback: (worldId: WorldId | null) => void): () => void {
  const handler = (e: Event) => {
    const worldId = (e as CustomEvent).detail?.worldId ?? getCurrentWorldId();
    callback(worldId);
  };
  window.addEventListener('worldchange', handler);
  return () => window.removeEventListener('worldchange', handler);
}

/**
 * Get world-specific CTA button label for world switcher.
 */
export function getWorldCta(worldId: string | null): string {
  if (worldId && isWorldId(worldId)) return WORLD_CTA[worldId];
  return DEFAULT_CTA;
}

/**
 * Get world-specific emoji icon for world switcher cards.
 */
export function getWorldEmoji(worldId: string | null): string {
  if (worldId && isWorldId(worldId)) return WORLD_EMOJI[worldId];
  return DEFAULT_EMOJI;
}
