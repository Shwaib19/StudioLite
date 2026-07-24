import { create } from 'zustand';
import type { AppSettings } from '../types/settings';
import { loadConfig, saveConfig } from '../services/tauriCommands';

interface SettingsState {
  settings: AppSettings;
  isLoaded: boolean;

  updateSettings: (partial: Partial<AppSettings>) => void;
  resetSettings: () => void;
  loadSettingsFromDisk: () => Promise<void>;
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

export const useSettingsStore = create<SettingsState>((set, get) => ({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,

  loadSettingsFromDisk: async () => {
    try {
      const config = await loadConfig();
      set({
        settings: {
          theme: (config.theme as 'light' | 'dark' | 'system') || DEFAULT_SETTINGS.theme,
          fontSize: config.font_size || DEFAULT_SETTINGS.fontSize,
          fontFamily: DEFAULT_SETTINGS.fontFamily,
          sendOnEnter: DEFAULT_SETTINGS.sendOnEnter,
          showTokenCount: DEFAULT_SETTINGS.showTokenCount,
          maxContextMessages: DEFAULT_SETTINGS.maxContextMessages,
          modelDirectories: config.model_directories || [],
          downloadConcurrency: config.download_concurrency || 2,
        },
        isLoaded: true,
      });
    } catch {
      set({ isLoaded: true });
    }
  },

  updateSettings: (partial) => {
    const updated = { ...get().settings, ...partial };
    set({ settings: updated });

    // Persist to disk (debounced via Tauri store)
    saveConfig({
      theme: updated.theme,
      font_size: updated.fontSize,
      model_directories: updated.modelDirectories,
      download_concurrency: updated.downloadConcurrency,
    }).catch(() => {
      // Silently fail persistence — settings still work in-memory
    });
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    saveConfig({
      theme: DEFAULT_SETTINGS.theme,
      font_size: DEFAULT_SETTINGS.fontSize,
      model_directories: DEFAULT_SETTINGS.modelDirectories,
      download_concurrency: DEFAULT_SETTINGS.downloadConcurrency,
    }).catch(() => {});
  },
}));