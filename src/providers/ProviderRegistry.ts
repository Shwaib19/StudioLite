import type { IProvider, ModelInfo } from './types';
import { OpenRouterProvider } from './OpenRouterProvider';
import { OpenAIProvider } from './OpenAIProvider';
import { HuggingFaceProvider } from './HuggingFaceProvider';
import { OllamaProvider } from './OllamaProvider';
import { GGUFProvider } from './GGUFProvider';

/**
 * Singleton registry that manages all provider instances.
 * Provides factory methods and model aggregation across providers.
 */
class ProviderRegistryClass {
  private providers: Map<string, IProvider> = new Map();
  private initialized = false;

  /** Initialize all providers. Call once at app startup. */
  init(apiKeys?: Record<string, string>): void {
    if (this.initialized) return;

    this.register(new OpenRouterProvider(apiKeys?.openrouter || ''));
    this.register(new OpenAIProvider(apiKeys?.openai || ''));
    this.register(new HuggingFaceProvider(apiKeys?.huggingface || ''));
    this.register(new OllamaProvider());
    this.register(new GGUFProvider());

    this.initialized = true;
  }

  /** Register a provider instance. */
  register(provider: IProvider): void {
    this.providers.set(provider.id, provider);
  }

  /** Get a provider by ID. */
  getProvider(id: string): IProvider | undefined {
    return this.providers.get(id);
  }

  /** Get all registered providers. */
  getAllProviders(): IProvider[] {
    return Array.from(this.providers.values());
  }

  /** Get all enabled provider IDs. */
  getAllProviderIds(): string[] {
    return Array.from(this.providers.keys());
  }

  /** Get models from all providers, optionally filtered by capability. */
  async getAllModels(capabilityFilter?: string): Promise<ModelInfo[]> {
    const allModels: ModelInfo[] = [];
    for (const provider of this.providers.values()) {
      try {
        const models = await provider.listModels();
        const filtered = capabilityFilter
          ? models.filter((m) => m.capabilities.includes(capabilityFilter as any))
          : models;
        allModels.push(...filtered);
      } catch {
        // Skip providers that fail to list models
      }
    }
    return allModels;
  }

  /** Get the default provider ID. */
  getDefaultProviderId(): string {
    return 'openrouter';
  }

  /** Reset all providers (useful for testing). */
  reset(): void {
    this.providers.clear();
    this.initialized = false;
  }
}

/** Singleton instance of the provider registry. */
export const ProviderRegistry = new ProviderRegistryClass();