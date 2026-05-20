import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// ─── Font enums (frozen arrays are the source of truth) ────────────────────
// TODO: When adding fonts here, also add the corresponding next/font entry in
// src/app/layout.jsx and expose a CSS variable (--font-<name>).

export const HEADING_FONTS = Object.freeze([
  'Newsreader',
  'Fraunces',
  'EB Garamond',
  'Inter',
  'Geist',
]);

export const BODY_FONTS = Object.freeze([
  'Geist',
  'Inter',
  'Newsreader',
  'Fraunces',
]);

export const MONO_FONTS = Object.freeze([
  'Geist Mono',
  'JetBrains Mono',
]);

// ─── Defaults ───────────────────────────────────────────────────────────────
const DEFAULTS = {
  headingFont: 'Newsreader',
  bodyFont: 'Geist',
  monoFont: 'Geist Mono',
  iconBlur: 6,
  iconBg: 0.55,
  pinnedWallpaperId: 'auto',
  animateWallpaper: true,
  // v0.8 ContextMenu additions
  mascotVisible: true,
  kitsuneModeEnabled: false,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────
function applyFonts(heading, body, mono) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--dt-font-heading', `${heading}, serif`);
  root.style.setProperty('--dt-font-body', `${body}, sans-serif`);
  root.style.setProperty('--dt-font-mono', `${mono}, monospace`);
}

function applyIconVars(blur, bg) {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--dt-icon-blur', `${blur}px`);
  root.style.setProperty('--dt-icon-bg', String(bg));
}

// ─── Store ───────────────────────────────────────────────────────────────────
export const usePrefsStore = create(
  persist(
    (set, get) => ({
      headingFont: DEFAULTS.headingFont,
      bodyFont: DEFAULTS.bodyFont,
      monoFont: DEFAULTS.monoFont,
      iconBlur: DEFAULTS.iconBlur,
      iconBg: DEFAULTS.iconBg,
      pinnedWallpaperId: DEFAULTS.pinnedWallpaperId,
      animateWallpaper: DEFAULTS.animateWallpaper,
      mascotVisible: DEFAULTS.mascotVisible,
      kitsuneModeEnabled: DEFAULTS.kitsuneModeEnabled,

      setHeadingFont: (font) => {
        if (!HEADING_FONTS.includes(font)) return;
        set({ headingFont: font });
        applyFonts(font, get().bodyFont, get().monoFont);
      },

      setBodyFont: (font) => {
        if (!BODY_FONTS.includes(font)) return;
        set({ bodyFont: font });
        applyFonts(get().headingFont, font, get().monoFont);
      },

      setMonoFont: (font) => {
        if (!MONO_FONTS.includes(font)) return;
        set({ monoFont: font });
        applyFonts(get().headingFont, get().bodyFont, font);
      },

      setIconBlur: (blur) => {
        const clamped = Math.max(0, Math.min(24, Number(blur)));
        set({ iconBlur: clamped });
        applyIconVars(clamped, get().iconBg);
      },

      setIconBg: (bg) => {
        const clamped = Math.max(0, Math.min(1, Number(bg)));
        set({ iconBg: clamped });
        applyIconVars(get().iconBlur, clamped);
      },

      setPinnedWallpaper: (id) => {
        set({ pinnedWallpaperId: id });
      },

      setAnimateWallpaper: (enabled) => {
        set({ animateWallpaper: Boolean(enabled) });
      },

      toggleMascotVisible: () => {
        set((state) => ({ mascotVisible: !state.mascotVisible }));
      },

      toggleKitsuneMode: () => {
        set((state) => ({ kitsuneModeEnabled: !state.kitsuneModeEnabled }));
      },

      // Call once on mount to rehydrate CSS vars from persisted state.
      hydrate: () => {
        const { headingFont, bodyFont, monoFont, iconBlur, iconBg } = get();
        applyFonts(headingFont, bodyFont, monoFont);
        applyIconVars(iconBlur, iconBg);
      },
    }),
    {
      name: 'portfolio-os:prefs:v1',
    }
  )
);
