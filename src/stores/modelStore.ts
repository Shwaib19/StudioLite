import { create } from 'zustand';
import type { ModelInfo } from '../providers/types';
import { ProviderRegistry } from '../providers/ProviderRegistry';

interface ModelState {
  models: ModelInfo[];
  selectedModelId: string | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchModels: () => Promise<void>;
  selectModel: (modelId: string) => void;
  refreshModels: () => Promise<void>;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  selectedModelId: null,
  isLoading: false,
  error: null,

  fetchModels: async () => {
    set({ isLoading: true, error: null });
    try {
      const models = await ProviderRegistry.getAllModels();
      set({ models, isLoading: false });

      // Auto-select first model if none selected
      if (!get().selectedModelId && models.length > 0) {
        set({ selectedModelId: models[0].id });
      }
    } catch (err) {
      set({
        error: `Failed to fetch models: ${(err as Error).message}`,
        isLoading: false,
      });
    }
  },

  selectModel: (modelId: string) => {
    set({ selectedModelId: modelId });
  },

  refreshModels: async () => {
    await get().fetchModels();
  },
}));