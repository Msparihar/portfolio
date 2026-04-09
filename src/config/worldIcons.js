// DEPRECATED — use worldContent.js instead
// src/config/worldIcons.js
// World-specific icon configurations
// Each world can override: label text and icon glyph.
// Icons remain emoji — styling is handled by the world CSS class on the canvas.

export const WORLD_ICON_OVERRIDES = {
  'elden-ring': {
    terminal:    { label: 'terminal.sh',   icon: '⚔️' },
    filemanager: { label: 'Grimoire',      icon: '📜' },
    logviewer:   { label: 'Chronicles',    icon: '📖' },
    mail:        { label: 'Raven Post',    icon: '🪶' },
    about:       { label: 'Tarnished',     icon: '👤' },
    browser:     { label: 'Portal',        icon: '🌀' },
    gallery:     { label: 'Relics',        icon: '🏺' },
    trash:       { label: 'Abyss',         icon: '🕳️' },
    resume:      { label: 'Scroll',        icon: '📜' },
  },
  'ghibli': {
    terminal:    { label: 'terminal.sh',   icon: '🌿' },
    filemanager: { label: 'Garden',        icon: '🌻' },
    logviewer:   { label: 'Journal',       icon: '📔' },
    mail:        { label: 'Letters',       icon: '✉️' },
    about:       { label: 'About Me',      icon: '🍃' },
    browser:     { label: 'Explorer',      icon: '🦋' },
    gallery:     { label: 'Gallery',       icon: '🎨' },
    trash:       { label: 'Compost',       icon: '🍂' },
    resume:      { label: 'Resume',        icon: '📄' },
  },
  'got': {
    terminal:    { label: 'terminal.sh',   icon: '⚒️' },
    filemanager: { label: 'Archives',      icon: '🗂️' },
    logviewer:   { label: 'Ravens',        icon: '🐦‍⬛' },
    mail:        { label: 'Scrolls',       icon: '📜' },
    about:       { label: 'Lord Info',     icon: '👑' },
    browser:     { label: 'Realm Map',     icon: '🗺️' },
    gallery:     { label: 'Tapestry',      icon: '🖼️' },
    trash:       { label: 'Dungeon',       icon: '⛓️' },
    resume:      { label: 'Decree',        icon: '📋' },
  },
};

/**
 * Get the icon config for a specific app in the current world.
 * Falls back to the default icon/label if no world override exists.
 *
 * @param {string|null} worldId  - Active world id (e.g. 'elden-ring')
 * @param {string}      appId   - App identifier (e.g. 'filemanager')
 * @param {string}      defaultIcon  - Fallback emoji
 * @param {string}      defaultLabel - Fallback label text
 * @returns {{ icon: string, label: string }}
 */
export function getWorldIcon(worldId, appId, defaultIcon, defaultLabel) {
  const overrides = WORLD_ICON_OVERRIDES[worldId];
  if (!overrides?.[appId]) return { icon: defaultIcon, label: defaultLabel };
  return {
    icon:  overrides[appId].icon  ?? defaultIcon,
    label: overrides[appId].label ?? defaultLabel,
  };
}
