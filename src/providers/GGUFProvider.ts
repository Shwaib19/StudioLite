import { invoke } from '@tauri-apps/api/core';
import { listen } from '@tauri-apps/api/event';
import type { UnlistenFn } from '@tauri-apps/api/event';
import { BaseProvider } from './BaseProvider';
import type { ChatConfig, StreamChunk, ModelInfo, ChatMessage } from './types';
import type { InferencePayload, ModelListEntry } from '../types/tauri';

export class GGUFProvider extends BaseProvider {
  public readonly id = 'gguf';
  public readonly type = 'gguf' as const;
  public readonly displayName = 'Local GGUF';

  private eventUnlisten: UnlistenFn | null = null;

  constructor() {
    super(''); // No base URL for local GGUF
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const models: ModelListEntry[] = await invoke('list_gguf_models');
      return models.map((m) => ({
        id: m.path,
        name: m.filename,
        providerId: this.id,
        capabilities: ['text' as const],
        size: m.size,
        quantization: m.quantization || undefined,
        isLocal: true,
      }));
    } catch {
      return [];
    }
  }

  async *chat(messages: ChatMessage[], config: ChatConfig): AsyncGenerator<StreamChunk, void, undefined> {
    const modelPath = messages[0]?.modelId;
    if (!modelPath) {
      yield { type: 'error', content: 'No model selected. Please select a GGUF model first.' };
      return;
    }

    // Start inference via Tauri command
    try {
      await invoke('start_gguf_inference', {
        modelPath,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content.filter((c) => c.type === 'text').map((c) => c.value).join(''),
        })),
        temperature: config.temperature,
        maxTokens: config.maxTokens,
        topP: config.topP,
      });
    } catch (err) {
      yield { type: 'error', content: `Failed to start inference: ${err}` };
      return;
    }

    // Listen for token events from Rust backend
    const tokenQueue: string[] = [];
    let isDone = false;
    let errorMsg: string | null = null;

    this.eventUnlisten = await listen<InferencePayload>('inference-token', (event) => {
      if (event.payload.is_final) {
        isDone = true;
      } else {
        tokenQueue.push(event.payload.token);
      }
    });

    // Poll the token queue
    while (!isDone && !errorMsg) {
      while (tokenQueue.length > 0) {
        yield { type: 'text', content: tokenQueue.shift()! };
      }
      await new Promise((resolve) => setTimeout(resolve, 10)); // Small delay
    }

    // Flush remaining tokens
    while (tokenQueue.length > 0) {
      yield { type: 'text', content: tokenQueue.shift()! };
    }

    if (errorMsg) {
      yield { type: 'error', content: errorMsg };
    } else {
      yield { type: 'done', content: '' };
    }
  }

  protected async *parseStreamData(_data: string): AsyncGenerator<StreamChunk, void, undefined> {
    // Not used — GGUF uses Tauri events instead of SSE
    yield { type: 'text', content: _data };
  }

  abort(): void {
    super.abort();
    invoke('abort_inference').catch(() => {});
    this.cleanup();
  }

  async validate(): Promise<boolean> {
    try {
      const models = await this.listModels();
      return models.length > 0;
    } catch {
      return false;
    }
  }

  private cleanup(): void {
    if (this.eventUnlisten) {
      this.eventUnlisten();
      this.eventUnlisten = null;
    }
  }
}