import { create } from 'zustand';
import type { ProviderConfig, ProviderType } from '../providers/types';
import { generateId } from '../utils/idGenerator';

interface ProviderState {
  providers: ProviderConfig[];
  activeProviderId: string | null;

  configureProvider: (config: Omit<ProviderConfig, 'id' | 'createdAt'>) => void;
  removeProvider: (id: string) => void;
  setActiveProvider: (id: string) => void;
  validateProvider: (id: string) => Promise<boolean>;
}

export const useProviderStore = create<ProviderState>((set) => ({
  providers: [
    {
      id: 'openrouter',
      name: 'OpenRouter',
      type: 'openrouter' as ProviderType,
      isEnabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'openai',
      name: 'OpenAI',
      type: 'openai' as ProviderType,
      isEnabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'huggingface',
      name: 'Hugging Face',
      type: 'huggingface' as ProviderType,
      isEnabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'ollama',
      name: 'Ollama',
      type: 'ollama' as ProviderType,
      isEnabled: true,
      createdAt: Date.now(),
    },
    {
      id: 'gguf',
      name: 'Local GGUF',
      type: 'gguf' as ProviderType,
      isEnabled: true,
      createdAt: Date.now(),
    },
  ],
  activeProviderId: 'openrouter',

  configureProvider: (config) => {
    const newProvider: ProviderConfig = {
      ...config,
      id: generateId(),
      createdAt: Date.now(),
    };
    set((state) => ({
      providers: [...state.providers, newProvider],
    }));
  },

  removeProvider: (id) => {
    set((state) => ({
      providers: state.providers.filter((p) => p.id !== id),
      activeProviderId:
        state.activeProviderId === id ? null : state.activeProviderId,
    }));
  },

  setActiveProvider: (id) => {
    set({ activeProviderId: id });
  },

  validateProvider: async (_id: string) => {
    return true;
  },
}));