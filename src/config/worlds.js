// src/config/worlds.js
// Worlds system — complete aesthetic transformations beyond simple color themes.
// Each World includes color vars (same --dt-* tokens), fonts, CSS class, and boot customization.
// applyWorld() works like applyTheme() but also manages the world CSS class on the canvas.

import { BASE_THEME_VARS } from './themes';

export const WORLD_STORAGE_KEY = 'portfolio_world';

export const WORLDS = [
  {
    id: 'elden-ring',
    name: 'Elden Ring',
    description: 'Arise, Tarnished — Souls-inspired dark fantasy',
    swatch: '#c9a84c',
    worldClass: 'world-elden-ring',
    wallpaper: '/images/worlds/elden-ring/wallpaper.webp',
    fonts: {
      heading: 'var(--font-cinzel)',
      body: 'var(--font-crimson-text)',
    },
    brandText: 'ELDEN RING OS',
    desktopWatermark: 'TARNISHED',
    titleFormat: (title) => `「 ${title} 」`,
    bootAccentColor: { text: '#c9a84c', ok: '#f9c043' },
    bootLines: [
      'ELDEN RING OS v1.0',
      'Copyright (C) — The Lands Between',
      '',
      'Communing with the Erdtree.........OK',
      'Forging Sites of Grace.............OK',
      'Binding fog of war.................OK',
      'Summoning Tarnished spirits........OK',
      'Igniting the bonfire...............OK',
      '',
      'Arise, Tarnished.',
      'Put these foolish ambitions to rest...',
    ],
    vars: {
      // Font vars
      '--dt-font-heading':         'Cinzel, serif',
      '--dt-font-body':            'Crimson Text, serif',
      '--dt-font-mono':            'Geist Mono, monospace',
      // Window structural vars
      '--dt-window-radius':        '2px',
      '--dt-window-border':        '1px solid rgba(201, 168, 76, 0.6)',
      // Overlay vars
      '--dt-overlay-vignette':     'radial-gradient(ellipse at 50% 50%, transparent 40%, rgba(0,0,0,0.7) 100%)',
      '--dt-overlay-grain':        '0.03',
      // Colors
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
      '--dt-icon-text-shadow':     '0 1px 4px rgba(0,0,0,0.9)',
    },
  },
  {
    id: 'ghibli',
    name: 'Studio Ghibli',
    description: 'Warm, nature-inspired, Miyazaki aesthetic',
    swatch: '#4a7c59',
    worldClass: 'world-ghibli',
    wallpaper: '/images/worlds/ghibli/wallpaper.webp',
    fonts: {
      heading: 'var(--font-newsreader)',
      body: 'var(--font-geist)',
    },
    brandText: 'ghibli@portfolio',
    desktopWatermark: null,
    titleFormat: (title) => `✿ ${title}`,
    bootAccentColor: { text: '#4a7c59', ok: '#8bc49e' },
    bootLines: [
      'GHIBLI OS v1.0',
      'Copyright (C) — The Spirit\'s Garden',
      '',
      'Planting seeds of creation.........OK',
      'Growing the forest canopy..........OK',
      'Awakening forest spirits...........OK',
      'Warming the hearth.................OK',
      'Opening the garden gate............OK',
      '',
      'Welcome to the forest.',
      'Every pixel grows with care...',
    ],
    vars: {
      // Font vars
      '--dt-font-heading':         'Newsreader, serif',
      '--dt-font-body':            'Geist, sans-serif',
      '--dt-font-mono':            'Geist Mono, monospace',
      // Window structural vars
      '--dt-window-radius':        '16px',
      '--dt-window-border':        '1px solid rgba(224, 212, 192, 0.6)',
      // Overlay vars
      '--dt-overlay-vignette':     'none',
      '--dt-overlay-grain':        '0',
      // Colors
      '--dt-bg':                   '#f5f0e8',
      '--dt-surface':              'rgba(250, 246, 237, 0.80)',
      '--dt-surface-deep':         'rgba(240, 232, 216, 0.90)',
      '--dt-surface-input':        'rgba(74, 124, 89, 0.06)',
      '--dt-text':                 '#4a6b52',
      '--dt-text-muted':           '#636e72',
      '--dt-accent':               '#4a7c59',
      '--dt-accent-hover':         '#3a6a49',
      '--dt-accent-dim':           'rgba(74, 124, 89, 0.5)',
      '--dt-accent-soft':          'rgba(74, 124, 89, 0.08)',
      '--dt-accent-soft-2':        'rgba(74, 124, 89, 0.12)',
      '--dt-accent-border':        'rgba(224, 212, 192, 0.8)',
      '--dt-accent-border-strong': 'rgba(224, 212, 192, 1.0)',
      '--dt-accent-border-dim':    'rgba(224, 212, 192, 0.4)',
      '--dt-accent-glow':          'rgba(74, 124, 89, 0.3)',
      '--dt-accent-glow-soft':     'rgba(74, 124, 89, 0.08)',
      '--dt-accent-70':            'rgba(74, 124, 89, 0.7)',
      '--dt-accent-45':            'rgba(74, 124, 89, 0.45)',
      '--dt-accent-30':            'rgba(74, 124, 89, 0.3)',
      '--dt-accent-20':            'rgba(74, 124, 89, 0.2)',
      '--dt-accent-03':            'rgba(74, 124, 89, 0.03)',
      '--dt-titlebar-bg':          'linear-gradient(180deg, rgba(240, 232, 216, 0.95) 0%, rgba(250, 246, 237, 0.95) 100%)',
      '--dt-titlebar-shadow':      'inset 0 -1px 0 rgba(224, 212, 192, 0.6)',
      '--dt-titlebar-border':      'rgba(224, 212, 192, 0.8)',
      '--dt-taskbar-bg':           'linear-gradient(180deg, rgba(255, 255, 255, 0.75) 0%, rgba(255, 255, 255, 0.65) 100%)',
      '--dt-taskbar-border':       'rgba(200, 191, 176, 0.8)',
      '--dt-scrollbar-thumb':      'rgba(74, 124, 89, 0.25)',
      '--dt-scrollbar-thumb-hover':'rgba(74, 124, 89, 0.4)',
      '--dt-scrollbar-track':      'rgba(74, 124, 89, 0.04)',
      '--dt-wallpaper-dot':        'rgba(74, 124, 89, 0.0)',
      '--dt-scanline-color':       'rgba(0, 0, 0, 0.0)',
      '--dt-context-bg':           'rgba(250, 246, 237, 0.95)',
      '--dt-shadow-focused':       '0 2px 4px rgba(45, 52, 54, 0.08), 0 8px 32px rgba(45, 52, 54, 0.12), 0 0 0 1px rgba(224, 212, 192, 0.6)',
      '--dt-shadow-unfocused':     '0 2px 4px rgba(45, 52, 54, 0.05), 0 4px 16px rgba(45, 52, 54, 0.08), 0 0 0 1px rgba(224, 212, 192, 0.4)',
      '--dt-window-blur':          'blur(16px) saturate(1.1)',
      '--dt-wallpaper-gradient':   'radial-gradient(ellipse at 30% 40%, rgba(74, 124, 89, 0.12) 0%, transparent 55%), radial-gradient(ellipse at 75% 70%, rgba(240, 232, 216, 0.18) 0%, transparent 50%), radial-gradient(ellipse at 50% 100%, rgba(212, 232, 208, 0.10) 0%, transparent 45%), linear-gradient(160deg, rgba(212, 232, 208, 0.15) 0%, rgba(250, 246, 237, 0.10) 100%)',
      '--dt-wallpaper-gradient-size': '100% 100%, 100% 100%, 100% 100%, 100% 100%',
      '--dt-icon-text-shadow':     '0 1px 2px rgba(0,0,0,0.15)',
    },
  },
  {
    id: 'got',
    name: 'Game of Thrones',
    description: 'Westeros — Four houses, one realm',
    swatch: '#1a3a5c',
    worldClass: 'world-got',
    fonts: { heading: 'var(--font-im-fell-english)', body: 'var(--font-geist)' },
    wallpaper: '/images/worlds/got/north/wallpaper.webp',
    brandText: 'WinterfellOS',
    desktopWatermark: null,
    titleFormat: null,
    defaultRegion: 'north',
    seasonalCycle: {
      enabled: true,
      intervalMs: 5 * 60 * 1000,
      order: ['north', 'kings-landing', 'nights-watch', 'dragonstone'],
    },
    bootAccentColor: { text: '#4a9eda', ok: '#6bb8e8' },
    bootLines: [
      'WINTERFELL OS v1.0',
      'House Stark — Winter Is Coming',
      '',
      'Forging Valyrian steel...........OK',
      'Rallying the bannermen...........OK',
      'Scouting beyond the Wall.........OK',
      'Feeding the direwolves...........OK',
      'Lighting the heart tree..........OK',
      '',
      'The North remembers.',
      'Winter is coming...',
    ],
    regions: {
      'north': {
        name: 'The North',
        house: 'Stark',
        swatch: '#4a9eda',
        wallpaper: '/images/worlds/got/north/wallpaper.webp',
        bootAccentColor: { text: '#4a9eda', ok: '#6bb8e8' },
        vars: {
          '--dt-bg': '#0d1b2a',
          '--dt-surface': 'rgba(26, 58, 92, 0.85)',
          '--dt-surface-deep': 'rgba(13, 27, 42, 0.95)',
          '--dt-surface-input': 'rgba(74, 158, 218, 0.08)',
          '--dt-text': '#e8edf2',
          '--dt-text-muted': '#8ba4b8',
          '--dt-accent': '#4a9eda',
          '--dt-accent-hover': '#6bb8e8',
          '--dt-accent-dim': 'rgba(74, 158, 218, 0.5)',
          '--dt-accent-soft': 'rgba(74, 158, 218, 0.08)',
          '--dt-accent-soft-2': 'rgba(74, 158, 218, 0.12)',
          '--dt-accent-border': 'rgba(74, 158, 218, 0.2)',
          '--dt-accent-border-strong': 'rgba(74, 158, 218, 0.35)',
          '--dt-accent-border-dim': 'rgba(74, 158, 218, 0.1)',
          '--dt-accent-glow': 'rgba(74, 158, 218, 0.3)',
          '--dt-accent-glow-soft': 'rgba(74, 158, 218, 0.08)',
          '--dt-accent-70': 'rgba(74, 158, 218, 0.7)',
          '--dt-accent-45': 'rgba(74, 158, 218, 0.45)',
          '--dt-accent-30': 'rgba(74, 158, 218, 0.3)',
          '--dt-accent-20': 'rgba(74, 158, 218, 0.2)',
          '--dt-accent-03': 'rgba(74, 158, 218, 0.03)',
          '--dt-titlebar-bg': 'linear-gradient(180deg, rgba(26, 58, 92, 0.95) 0%, rgba(13, 27, 42, 0.97) 100%)',
          '--dt-titlebar-shadow': 'inset 0 1px 0 rgba(74, 158, 218, 0.1)',
          '--dt-titlebar-border': 'rgba(74, 158, 218, 0.2)',
          '--dt-taskbar-bg': 'linear-gradient(180deg, rgba(13, 27, 42, 0.92) 0%, rgba(8, 16, 28, 0.96) 100%)',
          '--dt-taskbar-border': 'rgba(74, 158, 218, 0.15)',
          '--dt-scrollbar-thumb': 'rgba(74, 158, 218, 0.25)',
          '--dt-scrollbar-thumb-hover': 'rgba(74, 158, 218, 0.4)',
          '--dt-scrollbar-track': 'rgba(74, 158, 218, 0.04)',
          '--dt-wallpaper-dot': 'rgba(74, 158, 218, 0.04)',
          '--dt-scanline-color': 'rgba(74, 158, 218, 0.01)',
          '--dt-context-bg': 'rgba(13, 27, 42, 0.97)',
          '--dt-shadow-focused': '0 2px 4px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,158,218,0.2)',
          '--dt-shadow-unfocused': '0 2px 4px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,158,218,0.1)',
          '--dt-window-blur': 'blur(12px) saturate(1.1)',
          '--dt-wallpaper-gradient': 'radial-gradient(ellipse at 30% 40%, rgba(74, 158, 218, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(168, 196, 216, 0.08) 0%, transparent 40%)',
          '--dt-wallpaper-gradient-size': '100% 100%, 100% 100%',
          '--dt-icon-text-shadow': '0 1px 3px rgba(0,0,0,0.8)',
        },
      },
      'kings-landing': {
        name: "King's Landing",
        house: 'Lannister',
        swatch: '#c9a84c',
        wallpaper: '/images/worlds/got/kings-landing/wallpaper.webp',
        bootAccentColor: { text: '#c9a84c', ok: '#d4a574' },
        vars: {
          '--dt-bg': '#2a1008',
          '--dt-surface': 'rgba(60, 30, 15, 0.88)',
          '--dt-surface-deep': 'rgba(42, 16, 8, 0.95)',
          '--dt-surface-input': 'rgba(201, 168, 76, 0.08)',
          '--dt-text': '#f5e6c8',
          '--dt-text-muted': '#b8956a',
          '--dt-accent': '#c9a84c',
          '--dt-accent-hover': '#d4b85c',
          '--dt-accent-dim': 'rgba(201, 168, 76, 0.5)',
          '--dt-accent-soft': 'rgba(201, 168, 76, 0.08)',
          '--dt-accent-soft-2': 'rgba(201, 168, 76, 0.12)',
          '--dt-accent-border': 'rgba(139, 37, 0, 0.4)',
          '--dt-accent-border-strong': 'rgba(201, 168, 76, 0.3)',
          '--dt-accent-border-dim': 'rgba(139, 37, 0, 0.2)',
          '--dt-accent-glow': 'rgba(201, 168, 76, 0.3)',
          '--dt-accent-glow-soft': 'rgba(201, 168, 76, 0.08)',
          '--dt-accent-70': 'rgba(201, 168, 76, 0.7)',
          '--dt-accent-45': 'rgba(201, 168, 76, 0.45)',
          '--dt-accent-30': 'rgba(201, 168, 76, 0.3)',
          '--dt-accent-20': 'rgba(201, 168, 76, 0.2)',
          '--dt-accent-03': 'rgba(201, 168, 76, 0.03)',
          '--dt-titlebar-bg': 'linear-gradient(180deg, rgba(60, 30, 15, 0.95) 0%, rgba(42, 16, 8, 0.97) 100%)',
          '--dt-titlebar-shadow': 'inset 0 1px 0 rgba(201, 168, 76, 0.1)',
          '--dt-titlebar-border': 'rgba(201, 168, 76, 0.2)',
          '--dt-taskbar-bg': 'linear-gradient(180deg, rgba(42, 16, 8, 0.92) 0%, rgba(30, 10, 5, 0.96) 100%)',
          '--dt-taskbar-border': 'rgba(201, 168, 76, 0.15)',
          '--dt-scrollbar-thumb': 'rgba(201, 168, 76, 0.25)',
          '--dt-scrollbar-thumb-hover': 'rgba(201, 168, 76, 0.4)',
          '--dt-scrollbar-track': 'rgba(201, 168, 76, 0.04)',
          '--dt-wallpaper-dot': 'rgba(201, 168, 76, 0.04)',
          '--dt-scanline-color': 'rgba(201, 168, 76, 0.01)',
          '--dt-context-bg': 'rgba(42, 16, 8, 0.97)',
          '--dt-shadow-focused': '0 2px 4px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(201,168,76,0.2)',
          '--dt-shadow-unfocused': '0 2px 4px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(201,168,76,0.1)',
          '--dt-window-blur': 'blur(10px) saturate(1.0)',
          '--dt-wallpaper-gradient': 'radial-gradient(ellipse at 40% 50%, rgba(201, 168, 76, 0.12) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(212, 165, 116, 0.08) 0%, transparent 40%)',
          '--dt-wallpaper-gradient-size': '100% 100%, 100% 100%',
          '--dt-icon-text-shadow': '0 1px 3px rgba(0,0,0,0.8)',
        },
      },
      'nights-watch': {
        name: "The Night's Watch",
        house: 'The Watch',
        swatch: '#4a9eda',
        wallpaper: '/images/worlds/got/nights-watch/wallpaper.webp',
        bootAccentColor: { text: '#4a9eda', ok: '#c8dce8' },
        vars: {
          '--dt-bg': '#0a0a0a',
          '--dt-surface': 'rgba(26, 26, 46, 0.88)',
          '--dt-surface-deep': 'rgba(13, 13, 26, 0.95)',
          '--dt-surface-input': 'rgba(74, 158, 218, 0.06)',
          '--dt-text': '#c8dce8',
          '--dt-text-muted': '#6a7a88',
          '--dt-accent': '#4a9eda',
          '--dt-accent-hover': '#68b4e8',
          '--dt-accent-dim': 'rgba(74, 158, 218, 0.5)',
          '--dt-accent-soft': 'rgba(74, 158, 218, 0.06)',
          '--dt-accent-soft-2': 'rgba(74, 158, 218, 0.10)',
          '--dt-accent-border': 'rgba(74, 158, 218, 0.12)',
          '--dt-accent-border-strong': 'rgba(74, 158, 218, 0.25)',
          '--dt-accent-border-dim': 'rgba(74, 158, 218, 0.06)',
          '--dt-accent-glow': 'rgba(74, 158, 218, 0.2)',
          '--dt-accent-glow-soft': 'rgba(74, 158, 218, 0.05)',
          '--dt-accent-70': 'rgba(74, 158, 218, 0.7)',
          '--dt-accent-45': 'rgba(74, 158, 218, 0.45)',
          '--dt-accent-30': 'rgba(74, 158, 218, 0.3)',
          '--dt-accent-20': 'rgba(74, 158, 218, 0.2)',
          '--dt-accent-03': 'rgba(74, 158, 218, 0.03)',
          '--dt-titlebar-bg': 'linear-gradient(180deg, rgba(15, 15, 25, 0.97) 0%, rgba(10, 10, 18, 0.98) 100%)',
          '--dt-titlebar-shadow': 'inset 0 1px 0 rgba(74, 158, 218, 0.05)',
          '--dt-titlebar-border': 'rgba(74, 158, 218, 0.12)',
          '--dt-taskbar-bg': 'linear-gradient(180deg, rgba(10, 10, 15, 0.95) 0%, rgba(5, 5, 10, 0.98) 100%)',
          '--dt-taskbar-border': 'rgba(74, 158, 218, 0.10)',
          '--dt-scrollbar-thumb': 'rgba(74, 158, 218, 0.20)',
          '--dt-scrollbar-thumb-hover': 'rgba(74, 158, 218, 0.35)',
          '--dt-scrollbar-track': 'rgba(74, 158, 218, 0.03)',
          '--dt-wallpaper-dot': 'rgba(74, 158, 218, 0.02)',
          '--dt-scanline-color': 'rgba(74, 158, 218, 0.005)',
          '--dt-context-bg': 'rgba(10, 10, 18, 0.97)',
          '--dt-shadow-focused': '0 2px 4px rgba(0,0,0,0.6), 0 8px 24px rgba(0,0,0,0.8), 0 0 0 1px rgba(74,158,218,0.15)',
          '--dt-shadow-unfocused': '0 2px 4px rgba(0,0,0,0.5), 0 8px 16px rgba(0,0,0,0.6), 0 0 0 1px rgba(74,158,218,0.08)',
          '--dt-window-blur': 'blur(8px) saturate(1.0)',
          '--dt-wallpaper-gradient': 'radial-gradient(ellipse at 50% 30%, rgba(74, 158, 218, 0.06) 0%, transparent 60%)',
          '--dt-wallpaper-gradient-size': '100% 100%',
          '--dt-icon-text-shadow': '0 1px 3px rgba(0,0,0,0.8)',
        },
      },
      'dragonstone': {
        name: 'Dragonstone',
        house: 'Targaryen',
        swatch: '#c43c2c',
        wallpaper: '/images/worlds/got/dragonstone/wallpaper.webp',
        bootAccentColor: { text: '#c43c2c', ok: '#e8651a' },
        vars: {
          '--dt-bg': '#1a1012',
          '--dt-surface': 'rgba(40, 20, 25, 0.88)',
          '--dt-surface-deep': 'rgba(26, 16, 18, 0.95)',
          '--dt-surface-input': 'rgba(196, 60, 44, 0.08)',
          '--dt-text': '#f0d0c0',
          '--dt-text-muted': '#8a6a5a',
          '--dt-accent': '#c43c2c',
          '--dt-accent-hover': '#e8651a',
          '--dt-accent-dim': 'rgba(196, 60, 44, 0.5)',
          '--dt-accent-soft': 'rgba(196, 60, 44, 0.08)',
          '--dt-accent-soft-2': 'rgba(196, 60, 44, 0.12)',
          '--dt-accent-border': 'rgba(196, 60, 44, 0.25)',
          '--dt-accent-border-strong': 'rgba(196, 60, 44, 0.4)',
          '--dt-accent-border-dim': 'rgba(196, 60, 44, 0.12)',
          '--dt-accent-glow': 'rgba(196, 60, 44, 0.3)',
          '--dt-accent-glow-soft': 'rgba(196, 60, 44, 0.08)',
          '--dt-accent-70': 'rgba(196, 60, 44, 0.7)',
          '--dt-accent-45': 'rgba(196, 60, 44, 0.45)',
          '--dt-accent-30': 'rgba(196, 60, 44, 0.3)',
          '--dt-accent-20': 'rgba(196, 60, 44, 0.2)',
          '--dt-accent-03': 'rgba(196, 60, 44, 0.03)',
          '--dt-titlebar-bg': 'linear-gradient(180deg, rgba(40, 20, 25, 0.95) 0%, rgba(26, 16, 18, 0.97) 100%)',
          '--dt-titlebar-shadow': 'inset 0 1px 0 rgba(196, 60, 44, 0.1)',
          '--dt-titlebar-border': 'rgba(196, 60, 44, 0.25)',
          '--dt-taskbar-bg': 'linear-gradient(180deg, rgba(26, 16, 18, 0.92) 0%, rgba(15, 10, 12, 0.96) 100%)',
          '--dt-taskbar-border': 'rgba(196, 60, 44, 0.15)',
          '--dt-scrollbar-thumb': 'rgba(196, 60, 44, 0.25)',
          '--dt-scrollbar-thumb-hover': 'rgba(196, 60, 44, 0.4)',
          '--dt-scrollbar-track': 'rgba(196, 60, 44, 0.04)',
          '--dt-wallpaper-dot': 'rgba(196, 60, 44, 0.03)',
          '--dt-scanline-color': 'rgba(196, 60, 44, 0.01)',
          '--dt-context-bg': 'rgba(26, 16, 18, 0.97)',
          '--dt-shadow-focused': '0 2px 4px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(196,60,44,0.25)',
          '--dt-shadow-unfocused': '0 2px 4px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(196,60,44,0.12)',
          '--dt-window-blur': 'blur(10px) saturate(1.0)',
          '--dt-wallpaper-gradient': 'radial-gradient(ellipse at 30% 70%, rgba(196, 60, 44, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 30%, rgba(232, 101, 26, 0.08) 0%, transparent 40%)',
          '--dt-wallpaper-gradient-size': '100% 100%, 100% 100%',
          '--dt-icon-text-shadow': '0 1px 3px rgba(0,0,0,0.8)',
        },
      },
    },
    // Top-level vars = north region vars for initial load before seasonal cycle kicks in
    vars: {
      '--dt-bg': '#0d1b2a',
      '--dt-surface': 'rgba(26, 58, 92, 0.85)',
      '--dt-surface-deep': 'rgba(13, 27, 42, 0.95)',
      '--dt-surface-input': 'rgba(74, 158, 218, 0.08)',
      '--dt-text': '#e8edf2',
      '--dt-text-muted': '#8ba4b8',
      '--dt-accent': '#4a9eda',
      '--dt-accent-hover': '#6bb8e8',
      '--dt-accent-dim': 'rgba(74, 158, 218, 0.5)',
      '--dt-accent-soft': 'rgba(74, 158, 218, 0.08)',
      '--dt-accent-soft-2': 'rgba(74, 158, 218, 0.12)',
      '--dt-accent-border': 'rgba(74, 158, 218, 0.2)',
      '--dt-accent-border-strong': 'rgba(74, 158, 218, 0.35)',
      '--dt-accent-border-dim': 'rgba(74, 158, 218, 0.1)',
      '--dt-accent-glow': 'rgba(74, 158, 218, 0.3)',
      '--dt-accent-glow-soft': 'rgba(74, 158, 218, 0.08)',
      '--dt-accent-70': 'rgba(74, 158, 218, 0.7)',
      '--dt-accent-45': 'rgba(74, 158, 218, 0.45)',
      '--dt-accent-30': 'rgba(74, 158, 218, 0.3)',
      '--dt-accent-20': 'rgba(74, 158, 218, 0.2)',
      '--dt-accent-03': 'rgba(74, 158, 218, 0.03)',
      '--dt-titlebar-bg': 'linear-gradient(180deg, rgba(26, 58, 92, 0.95) 0%, rgba(13, 27, 42, 0.97) 100%)',
      '--dt-titlebar-shadow': 'inset 0 1px 0 rgba(74, 158, 218, 0.1)',
      '--dt-titlebar-border': 'rgba(74, 158, 218, 0.2)',
      '--dt-taskbar-bg': 'linear-gradient(180deg, rgba(13, 27, 42, 0.92) 0%, rgba(8, 16, 28, 0.96) 100%)',
      '--dt-taskbar-border': 'rgba(74, 158, 218, 0.15)',
      '--dt-scrollbar-thumb': 'rgba(74, 158, 218, 0.25)',
      '--dt-scrollbar-thumb-hover': 'rgba(74, 158, 218, 0.4)',
      '--dt-scrollbar-track': 'rgba(74, 158, 218, 0.04)',
      '--dt-wallpaper-dot': 'rgba(74, 158, 218, 0.04)',
      '--dt-scanline-color': 'rgba(74, 158, 218, 0.01)',
      '--dt-context-bg': 'rgba(13, 27, 42, 0.97)',
      '--dt-shadow-focused': '0 2px 4px rgba(0,0,0,0.5), 0 8px 24px rgba(0,0,0,0.7), 0 0 0 1px rgba(74,158,218,0.2)',
      '--dt-shadow-unfocused': '0 2px 4px rgba(0,0,0,0.4), 0 8px 16px rgba(0,0,0,0.5), 0 0 0 1px rgba(74,158,218,0.1)',
      '--dt-window-blur': 'blur(12px) saturate(1.1)',
      '--dt-wallpaper-gradient': 'radial-gradient(ellipse at 30% 40%, rgba(74, 158, 218, 0.15) 0%, transparent 50%), radial-gradient(ellipse at 70% 70%, rgba(168, 196, 216, 0.08) 0%, transparent 40%)',
      '--dt-wallpaper-gradient-size': '100% 100%, 100% 100%',
      '--dt-icon-text-shadow': '0 1px 3px rgba(0,0,0,0.8)',
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
 * @param {string|null} regionId - Optional region id for worlds with regions (e.g. 'got')
 */
export function applyWorld(canvasEl, worldId, regionId = null) {
  // Remove any existing world-* classes
  const toRemove = [...canvasEl.classList].filter(c => c.startsWith('world-'));
  toRemove.forEach(c => canvasEl.classList.remove(c));

  if (!worldId) return;

  const world = WORLDS.find(w => w.id === worldId);
  if (!world) return;

  // Determine which vars to use
  let vars = world.vars;
  if (world.regions && regionId) {
    const region = world.regions[regionId];
    if (region) vars = region.vars;
  } else if (world.regions && world.defaultRegion) {
    const region = world.regions[world.defaultRegion];
    if (region) vars = region.vars;
  }

  // Apply color vars (same merge pattern as applyTheme)
  const merged = { ...BASE_THEME_VARS, ...vars };
  Object.entries(merged).forEach(([prop, value]) => {
    canvasEl.style.setProperty(prop, value);
  });

  // Apply world CSS class for structural effects
  if (world.worldClass) {
    canvasEl.classList.add(world.worldClass);
  }
}

/**
 * Apply a world with a fade transition on the desktop canvas.
 * Shared utility used by WorldPicker and WorldSwitcherPopup.
 *
 * @param {string} worldId - The world id to apply
 * @param {Function|null} onComplete - Optional callback after transition completes
 */
export function applyWorldWithTransition(worldId, onComplete = null) {
  const canvas = document.querySelector('.desktop-canvas');
  if (!canvas) return;

  canvas.style.transition = 'opacity 200ms ease';
  canvas.style.opacity = '0';

  setTimeout(() => {
    if (worldId) {
      applyWorld(canvas, worldId);
      localStorage.setItem(WORLD_STORAGE_KEY, worldId);
      localStorage.removeItem('portfolio_theme');
    } else {
      applyWorld(canvas, null);
      localStorage.removeItem(WORLD_STORAGE_KEY);
    }
    canvas.style.opacity = '1';
    window.dispatchEvent(new CustomEvent('worldchange', { detail: { worldId } }));
    if (onComplete) onComplete();
  }, 200);
}
