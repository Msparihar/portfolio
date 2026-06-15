import { create } from 'zustand';

export const useAnimateStore = create((set) => ({
  isPlaying: true,
  setPlaying: (val) => set({ isPlaying: val }),
  loadError: null,
  setLoadError: (msg) => set({ loadError: msg }),
}));
