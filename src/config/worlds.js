// src/config/worlds.js
// Worlds system — complete aesthetic transformations beyond simple color themes.
// Each World includes color vars (same --dt-* tokens), fonts, CSS class, and boot customization.
// applyWorld() works like applyTheme() but also manages the world CSS class on the canvas.

import { BASE_THEME_VARS } from './themes';

export const WORLD_STORAGE_KEY = 'portfolio_world';

export const WORLDS = [
  {
    id: 'dark-fantasy',
    name: 'Dark Fantasy',
    description: 'Elden Ring / Souls-inspired',
    swatch: '#c9a84c',
    worldClass: 'world-dark-fantasy',
    fonts: {
      heading: 'var(--font-cinzel)',
      body: 'var(--font-crimson-text)',
    },
    bootAccentColor: { text: '#c9a84c', ok: '#f9c043' },
    bootLines: [
      'DARK FANTASY OS v1.0',
      'Copyright (C) unknown — The Age of Fire',
      '',
      'Communing with ancient runes.......OK',
      'Mounting the Erdtree...............OK',
      'Binding fog of war.................OK',
      'Summoning portfolio spirits........OK',
      'Igniting the bonfire...............OK',
      '',
      'Tarnished, your journey begins.',
      'May the grace guide thee...',
    ],
    vars: {
      '--dt-bg':                   '#0d0b07',
      '--dt-surface':              'rgba(26, 21, 16, 0.97)',
      '--dt-surface-deep':         'rgba(13, 11, 7, 0.98)',
      '--dt-surface-input':        'rgba(201, 168, 76, 0.06)',
      '--dt-text':                 '#e8d5a3',
      '--dt-text-muted':           '#b2a66c',
      '--dt-accent':               '#c9a84c',
      '--dt-accent-hover':         '#f9c043',
      '--dt-accent-dim':           'rgba(201, 168, 76, 0.5)',
      '--dt-accent-soft':          'rgba(201, 168, 76, 0.08)',
      '--dt-accent-soft-2':        'rgba(201, 168, 76, 0.12)',
      '--dt-accent-border':        'rgba(75, 61, 42, 0.8)',
      '--dt-accent-border-strong': 'rgba(201, 168, 76, 0.25)',
      '--dt-accent-border-dim':    'rgba(75, 61, 42, 0.4)',
      '--dt-accent-glow':          'rgba(201, 168, 76, 0.4)',
      '--dt-accent-glow-soft':     'rgba(201, 168, 76, 0.12)',
      '--dt-accent-70':            'rgba(201, 168, 76, 0.7)',
      '--dt-accent-45':            'rgba(201, 168, 76, 0.45)',
      '--dt-accent-30':            'rgba(201, 168, 76, 0.3)',
      '--dt-accent-20':            'rgba(201, 168, 76, 0.2)',
      '--dt-accent-03':            'rgba(201, 168, 76, 0.03)',
      '--dt-titlebar-bg':          'linear-gradient(180deg, rgba(30, 24, 16, 0.98) 0%, rgba(20, 16, 10, 0.98) 50%, rgba(13, 11, 7, 0.99) 100%)',
      '--dt-titlebar-shadow':      'inset 0 1px 0 rgba(201,168,76,0.12), inset 0 0 12px rgba(0,0,0,0.4)',
      '--dt-titlebar-border':      'rgba(75, 61, 42, 0.8)',
      '--dt-taskbar-bg':           'linear-gradient(180deg, rgba(18, 14, 8, 0.95) 0%, rgba(10, 8, 4, 0.98) 100%)',
      '--dt-taskbar-border':       'rgba(201, 168, 76, 0.2)',
      '--dt-scrollbar-thumb':      'rgba(201, 168, 76, 0.3)',
      '--dt-scrollbar-thumb-hover':'rgba(201, 168, 76, 0.5)',
      '--dt-scrollbar-track':      'rgba(201, 168, 76, 0.04)',
      '--dt-wallpaper-dot':        'rgba(201, 168, 76, 0.08)',
      '--dt-scanline-color':       'rgba(201, 168, 76, 0.015)',
      '--dt-context-bg':           'rgba(20, 16, 10, 0.97)',
      '--dt-shadow-focused':       '0 2px 4px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.8), 0 24px 48px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.3), 0 0 40px rgba(201,168,76,0.08), inset 0 0 0 1px rgba(201,168,76,0.05)',
      '--dt-shadow-unfocused':     '0 2px 4px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(75,61,42,0.6)',
      '--dt-window-blur':          'blur(8px) saturate(1.0)',
      '--dt-wallpaper-gradient':   'radial-gradient(ellipse at 30% 60%, rgba(238, 138, 5, 0.15) 0%, transparent 45%), radial-gradient(ellipse at 75% 25%, rgba(201, 168, 76, 0.10) 0%, transparent 40%), radial-gradient(ellipse at 50% 90%, rgba(139, 105, 20, 0.12) 0%, transparent 35%), radial-gradient(ellipse at 15% 20%, rgba(201, 168, 76, 0.06) 0%, transparent 30%), radial-gradient(rgba(201,168,76,0.04) 1px, transparent 1px)',
      '--dt-wallpaper-gradient-size': '100% 100%, 100% 100%, 100% 100%, 100% 100%, 32px 32px',
    },
  },
];

/**
 * Apply a world to the desktop canvas element.
 * Merges BASE_THEME_VARS with the world's delta vars, sets CSS properties,
 * and manages the world CSS class on the canvas.
 *
 * @param {HTMLElement} canvasEl - The .desktop-canvas DOM element
 * @param {string|null} worldId - The world id to apply, or null to clear
 */
export function applyWorld(canvasEl, worldId) {
  // Remove any existing world-* classes
  const toRemove = [...canvasEl.classList].filter(c => c.startsWith('world-'));
  toRemove.forEach(c => canvasEl.classList.remove(c));

  if (!worldId) return;

  const world = WORLDS.find(w => w.id === worldId);
  if (!world) return;

  // Apply color vars (same merge pattern as applyTheme)
  const merged = { ...BASE_THEME_VARS, ...world.vars };
  Object.entries(merged).forEach(([prop, value]) => {
    canvasEl.style.setProperty(prop, value);
  });

  // Apply world CSS class for structural effects
  if (world.worldClass) {
    canvasEl.classList.add(world.worldClass);
  }
}
