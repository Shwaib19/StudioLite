// ── App-wide Constants ──

export const APP_NAME = 'StudioLite';
export const APP_VERSION = '0.1.0';

// Default provider endpoints
export const ENDPOINTS = {
  OPENROUTER: 'https://openrouter.ai/api/v1',
  OPENAI: 'https://api.openai.com/v1',
  OLLAMA: 'http://localhost:11434',
} as const;

// Default model IDs
export const DEFAULT_MODELS = {
  OPENROUTER: 'openai/gpt-4o-mini',
  OPENAI: 'gpt-4o-mini',
  OLLAMA: 'llama3.2:latest',
} as const;

// Chat defaults
export const CHAT_DEFAULTS = {
  temperature: 0.7,
  maxTokens: 4096,
  topP: 0.9,
  frequencyPenalty: 0.0,
  presencePenalty: 0.0,
} as const;

// Limits
export const MAX_IMAGE_SIZE = 20 * 1024 * 1024; // 20 MB
export const MAX_CONTEXT_MESSAGES = 100;
export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 24;
export const DOWNLOAD_CONCURRENCY_DEFAULT = 2;