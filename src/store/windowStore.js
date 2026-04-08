import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const APP_DEFAULTS = {
  terminal: {
    title: 'Terminal',
    icon: '🖥️',
    defaultPos: { x: 80, y: 60 },
    defaultSize: { width: 700, height: 480 },
  },
  filemanager: {
    title: 'File Manager',
    icon: '📁',
    defaultPos: { x: 120, y: 80 },
    defaultSize: { width: 860, height: 580 },
  },
  logviewer: {
    title: 'Log Viewer',
    icon: '📰',
    defaultPos: { x: 160, y: 100 },
    defaultSize: { width: 800, height: 520 },
  },
  mail: {
    title: 'Mail',
    icon: '✉️',
    defaultPos: { x: 200, y: 80 },
    defaultSize: { width: 760, height: 560 },
  },
  about: {
    title: 'About',
    icon: '👤',
    defaultPos: { x: 240, y: 100 },
    defaultSize: { width: 680, height: 500 },
  },
  browser: {
    title: 'Browser',
    icon: '🌐',
    defaultPos: { x: 100, y: 60 },
    defaultSize: { width: 900, height: 600 },
  },
  trash: {
    title: 'Trash',
    icon: '🗑️',
    defaultPos: { x: 200, y: 120 },
    defaultSize: { width: 640, height: 440 },
  },
  gallery: {
    title: 'Gallery',
    icon: '🖼️',
    defaultPos: { x: 160, y: 80 },
    defaultSize: { width: 860, height: 580 },
  },
};

export { APP_DEFAULTS };

export const useWindowStore = create(
  persist(
    (set, get) => ({
  windows: [],
  nextZIndex: 20,
  savedPositions: {},

  openWindow: (appId, opts = {}) => {
    const { windows, nextZIndex } = get();

    // If a window with this appId already exists, focus it (and restore if minimized)
    const existing = windows.find((w) => w.appId === appId);
    if (existing) {
      set((state) => ({
        nextZIndex: state.nextZIndex + 1,
        windows: state.windows.map((w) =>
          w.id === existing.id
            ? { ...w, isMinimized: false, zIndex: state.nextZIndex + 1 }
            : w
        ),
      }));
      return;
    }

    const defaults = APP_DEFAULTS[appId] ?? {
      title: appId,
      icon: '🪟',
      defaultPos: { x: 100, y: 100 },
      defaultSize: { width: 700, height: 480 },
    };

    const saved = get().savedPositions[appId];
    const newWindow = {
      id: `${appId}-${Date.now()}`,
      appId,
      title: opts.title ?? defaults.title,
      isMinimized: false,
      isMaximized: false,
      position: opts.position ?? saved?.position ?? { ...defaults.defaultPos },
      size: opts.size ?? saved?.size ?? { ...defaults.defaultSize },
      zIndex: nextZIndex + 1,
      prevPosition: null,
      prevSize: null,
    };

    set((state) => ({
      nextZIndex: state.nextZIndex + 1,
      windows: [...state.windows, newWindow],
    }));
  },

  closeWindow: (id) => {
    set((state) => ({
      windows: state.windows.filter((w) => w.id !== id),
    }));
  },

  minimizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, isMinimized: true } : w
      ),
    }));
  },

  restoreWindow: (id) => {
    set((state) => ({
      nextZIndex: state.nextZIndex + 1,
      windows: state.windows.map((w) =>
        w.id === id
          ? { ...w, isMinimized: false, zIndex: state.nextZIndex + 1 }
          : w
      ),
    }));
  },

  maximizeWindow: (id) => {
    set((state) => ({
      windows: state.windows.map((w) => {
        if (w.id !== id) return w;

        if (w.isMaximized) {
          // Restore to previous size/position
          return {
            ...w,
            isMaximized: false,
            position: w.prevPosition ?? w.position,
            size: w.prevSize ?? w.size,
            prevPosition: null,
            prevSize: null,
          };
        } else {
          // Save current and maximize
          return {
            ...w,
            isMaximized: true,
            prevPosition: { ...w.position },
            prevSize: { ...w.size },
          };
        }
      }),
    }));
  },

  focusWindow: (id) => {
    set((state) => ({
      nextZIndex: state.nextZIndex + 1,
      windows: state.windows.map((w) =>
        w.id === id ? { ...w, zIndex: state.nextZIndex + 1 } : w
      ),
    }));
  },

  setPosition: (id, pos) => {
    const win = get().windows.find((w) => w.id === id);
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, position: pos } : w)),
      savedPositions: win
        ? { ...state.savedPositions, [win.appId]: { ...state.savedPositions[win.appId], position: pos } }
        : state.savedPositions,
    }));
  },

  setSize: (id, size) => {
    const win = get().windows.find((w) => w.id === id);
    set((state) => ({
      windows: state.windows.map((w) => (w.id === id ? { ...w, size } : w)),
      savedPositions: win
        ? { ...state.savedPositions, [win.appId]: { ...state.savedPositions[win.appId], size } }
        : state.savedPositions,
    }));
  },
    }),
    {
      name: 'portfolio_window_positions',
      partialize: (state) => ({ savedPositions: state.savedPositions }),
    }
  )
);
