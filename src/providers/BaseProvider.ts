import type { IProvider, ProviderType, ChatConfig, StreamChunk, ModelInfo, ChatMessage } from './types';

/**
 * Abstract base class for all providers.
 * Handles common AbortController management.
 */
export abstract class BaseProvider implements IProvider {
  public abstract readonly id: string;
  public abstract readonly type: ProviderType;
  public abstract readonly displayName: string;

  protected abortController: AbortController | null = null;
  protected baseUrl: string;
  protected apiKey: string | undefined;

  constructor(baseUrl: string, apiKey?: string) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.apiKey = apiKey;
  }

  abstract listModels(): Promise<ModelInfo[]>;

  abstract chat(
    messages: ChatMessage[],
    config: ChatConfig,
  ): AsyncGenerator<StreamChunk, void, undefined>;

  /** Abort the current streaming request. */
  abort(): void {
    this.abortController?.abort();
    this.abortController = null;
  }

  /** Validate that the provider is properly configured. */
  async validate(): Promise<boolean> {
    // Override in subclasses for provider-specific validation
    return !!this.apiKey;
  }

  /** Create an AbortController for streaming, aborting any previous one. */
  protected createAbortController(): AbortController {
    this.abort();
    this.abortController = new AbortController();
    return this.abortController;
  }

  /** Build standard headers for API requests. */
  protected getHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  /** Parse SSE stream from a fetch Response. */
  protected async *parseSSEStream(
    response: Response,
  ): AsyncGenerator<StreamChunk, void, undefined> {
    if (!response.body) {
      yield { type: 'error', content: 'Response body is empty' };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed || trimmed.startsWith(':')) continue;

          if (trimmed.startsWith('data: ')) {
            const data = trimmed.slice(6);
            if (data === '[DONE]') {
              yield { type: 'done', content: '' };
              return;
            }
            yield* this.parseStreamData(data);
          }
        }
      }

      // Process remaining buffer
      if (buffer.trim()) {
        if (buffer.trim().startsWith('data: ')) {
          const data = buffer.trim().slice(6);
          if (data !== '[DONE]') {
            yield* this.parseStreamData(data);
          }
        }
      }

      yield { type: 'done', content: '' };
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        yield { type: 'done', content: '', finishReason: 'abort' };
      } else {
        yield { type: 'error', content: (err as Error).message };
      }
    } finally {
      reader.releaseLock();
    }
  }

  /** Parse a single SSE data line — override in subclasses for provider-specific formats. */
  protected abstract parseStreamData(data: string): AsyncGenerator<StreamChunk, void, undefined>;
}