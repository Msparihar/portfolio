import { create } from 'zustand';

export const useSeasonStore = create((set, get) => ({
  currentRegion: null,
  intervalId: null,
  isPinned: false,

  startCycle: (world) => {
    if (!world?.seasonalCycle?.enabled) return;
    const { order, intervalMs } = world.seasonalCycle;
    set({ currentRegion: world.defaultRegion || order[0] });

    const id = setInterval(() => {
      if (get().isPinned) return;
      const current = get().currentRegion;
      const idx = order.indexOf(current);
      const next = order[(idx + 1) % order.length];
      set({ currentRegion: next });
    }, intervalMs);

    set({ intervalId: id });
  },

  stopCycle: () => {
    const { intervalId } = get();
    if (intervalId) clearInterval(intervalId);
    set({ intervalId: null, currentRegion: null, isPinned: false });
  },

  setRegion: (regionId) => set({ currentRegion: regionId }),
  togglePin: () => set((s) => ({ isPinned: !s.isPinned })),
}));
