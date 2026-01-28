import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DarkModeState {
  isDarkMode: boolean;
  toggle: () => void;
}

export const useDarkModeStore = create<DarkModeState>()(
  persist(
    (set) => ({
      isDarkMode: false,
      toggle: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
    }),
    {
      name: 'dark-mode-storage',
    }
  )
);