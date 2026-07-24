import { create } from 'zustand';
import type { AppSettings } from '../types/settings';

interface SettingsState {
  settings: AppSettings;

  // Actions
  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
}

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  fontSize: 14,
  fontFamily: 'inter',
  sendOnEnter: true,
  showTokenCount: false,
  maxContextMessages: 50,
  modelDirectories: [],
  downloadConcurrency: 2,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  settings: DEFAULT_SETTINGS,

  updateSettings: (partial) => {
    set((state) => ({
      settings: { ...state.settings, ...partial },
    }));
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
  },
}));