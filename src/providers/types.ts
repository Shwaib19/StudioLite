import type { ChatMessage, MessageContent } from '../types/chat';

// ── Provider Core Types ──

export type ProviderType = 'openrouter' | 'openai' | 'huggingface' | 'ollama' | 'gguf';

export type ModelCapability = 'text' | 'vision' | 'image-generation' | 'code';

export interface ProviderConfig {
  id: string;
  name: string;
  type: ProviderType;
  baseUrl?: string;
  apiKey?: string;
  modelPath?: string; // For GGUF local models
  isEnabled: boolean;
  createdAt: number;
}

export interface ChatConfig {
  temperature: number;       // 0.0 - 2.0
  maxTokens: number;
  topP: number;              // 0.0 - 1.0
  frequencyPenalty: number;
  presencePenalty: number;
  stop?: string[];
}

export interface StreamChunk {
  type: 'text' | 'error' | 'done';
  content: string;
  finishReason?: 'stop' | 'length' | 'error' | 'abort';
}

export interface IProvider {
  readonly id: string;
  readonly type: ProviderType;
  readonly displayName: string;

  listModels(): Promise<ModelInfo[]>;
  chat(
    messages: ChatMessage[],
    config: ChatConfig,
  ): AsyncGenerator<StreamChunk, void, undefined>;
  abort(): void;
  validate(): Promise<boolean>;
}

export type { ChatMessage, MessageContent };

// ── Error Types ──

export type ProviderErrorCode =
  | 'AUTH_FAILED'
  | 'RATE_LIMITED'
  | 'MODEL_NOT_FOUND'
  | 'CONTEXT_OVERFLOW'
  | 'NETWORK_ERROR'
  | 'TIMEOUT'
  | 'INVALID_RESPONSE'
  | 'MODEL_LOAD_FAILED'
  | 'OUT_OF_MEMORY'
  | 'UNKNOWN';

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly code: ProviderErrorCode,
    public readonly providerId: string,
    public readonly retryable: boolean,
    public readonly originalError?: unknown,
  ) {
    super(message);
    this.name = 'ProviderError';
  }
}

// ── Model Info ──

export interface ModelInfo {
  id: string;
  name: string;
  providerId: string;
  capabilities: ModelCapability[];
  size?: number;            // File size in bytes (for local models)
  quantization?: string;    // e.g., "Q4_K_M"
  isLocal: boolean;
  description?: string;
}