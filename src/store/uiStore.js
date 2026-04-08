import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUiStore = create(
  persist(
    (set) => ({
      websiteMode: false,
      toggleWebsiteMode: () => set((s) => ({ websiteMode: !s.websiteMode })),
      setWebsiteMode: (val) => set({ websiteMode: val }),
    }),
    {
      name: 'portfolio_website_mode',
    }
  )
);
