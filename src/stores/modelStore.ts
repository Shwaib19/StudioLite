import { create } from 'zustand';
import type { ModelInfo } from '../providers/types';
import { ProviderRegistry } from '../providers/ProviderRegistry';

interface ModelState {
  models: ModelInfo[];
  selectedModelId: string | null;
  selectedModelDetail: ModelInfo | null;
  isLoading: boolean;
  error: string | null;

  // Pagination
  page: number;
  pageSize: number;
  totalCount: number;

  // Filters
  searchQuery: string;
  providerFilter: string;
  capabilityFilter: string;

  // Actions
  fetchModels: () => Promise<void>;
  selectModel: (modelId: string) => void;
  setSelectedDetail: (model: ModelInfo | null) => void;
  refreshModels: () => Promise<void>;

  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;

  // Filter actions
  setSearchQuery: (query: string) => void;
  setProviderFilter: (provider: string) => void;
  setCapabilityFilter: (capability: string) => void;

  // Derived
  getFilteredModels: () => ModelInfo[];
  getPaginatedModels: () => ModelInfo[];
  getTotalPages: () => number;
}

export const useModelStore = create<ModelState>((set, get) => ({
  models: [],
  selectedModelId: null,
  selectedModelDetail: null,
  isLoading: false,
  error: null,

  page: 1,
  pageSize: 12,
  totalCount: 0,

  searchQuery: '',
  providerFilter: '',
  capabilityFilter: '',

  fetchModels: async () => {
    set({ isLoading: true, error: null });
    try {
      const models = await ProviderRegistry.getAllModels();
      set({ models, isLoading: false, totalCount: models.length, page: 1 });

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

  setSelectedDetail: (model) => {
    set({ selectedModelDetail: model });
  },

  refreshModels: async () => {
    await get().fetchModels();
  },

  setPage: (page) => set({ page }),
  setPageSize: (pageSize) => set({ pageSize, page: 1 }),

  setSearchQuery: (query) => set({ searchQuery: query, page: 1 }),
  setProviderFilter: (provider) => set({ providerFilter: provider, page: 1 }),
  setCapabilityFilter: (capability) => set({ capabilityFilter: capability, page: 1 }),

  getFilteredModels: () => {
    const { models, searchQuery, providerFilter, capabilityFilter } = get();
    return models.filter((m) => {
      if (searchQuery && !m.name.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      if (providerFilter && m.providerId !== providerFilter) return false;
      if (capabilityFilter && !m.capabilities.includes(capabilityFilter as any)) return false;
      return true;
    });
  },

  getPaginatedModels: () => {
    const { page, pageSize } = get();
    const filtered = get().getFilteredModels();
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  },

  getTotalPages: () => {
    const { pageSize } = get();
    const filtered = get().getFilteredModels();
    return Math.max(1, Math.ceil(filtered.length / pageSize));
  },
}));