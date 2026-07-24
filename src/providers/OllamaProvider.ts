import { BaseProvider } from './BaseProvider';
import type { ChatConfig, StreamChunk, ModelInfo, ChatMessage } from './types';
import { ENDPOINTS } from '../utils/constants';

export class OllamaProvider extends BaseProvider {
  public readonly id = 'ollama';
  public readonly type = 'ollama' as const;
  public readonly displayName = 'Ollama';

  constructor(baseUrl?: string) {
    super(baseUrl || ENDPOINTS.OLLAMA);
  }

  async listModels(): Promise<ModelInfo[]> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });

      if (!response.ok) return [];

      const data = await response.json();
      return (data.models || []).map((model: any) => ({
        id: model.name,
        name: model.name,
        providerId: this.id,
        capabilities: this.inferCapabilities(model.name),
        size: model.size,
        isLocal: true,
      }));
    } catch {
      return []; // Ollama not running
    }
  }

  async *chat(messages: ChatMessage[], config: ChatConfig): AsyncGenerator<StreamChunk, void, undefined> {
    const controller = this.createAbortController();

    try {
      const response = await fetch(`${this.baseUrl}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: messages[0]?.modelId || 'llama3.2:latest',
          messages: messages.map(m => ({
            role: m.role,
            content: m.content.filter(c => c.type === 'text').map(c => c.value).join(''),
          })),
          stream: true,
          options: {
            temperature: config.temperature,
            num_predict: config.maxTokens,
            top_p: config.topP,
            frequency_penalty: config.frequencyPenalty,
            presence_penalty: config.presencePenalty,
            stop: config.stop,
          },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        yield { type: 'error', content: `Ollama error (${response.status}): ${response.statusText}` };
        return;
      }

      yield* this.parseSSEStream(response);
    } catch (err) {
      if ((err as Error).name === 'AbortError') {
        yield { type: 'done', content: '', finishReason: 'abort' };
      } else {
        yield { type: 'error', content: `Ollama connection failed: ${(err as Error).message}. Is Ollama running?` };
      }
    }
  }

  protected async *parseStreamData(data: string): AsyncGenerator<StreamChunk, void, undefined> {
    try {
      const parsed = JSON.parse(data);
      if (parsed.message?.content) {
        yield { type: 'text', content: parsed.message.content };
      }
      if (parsed.done) {
        yield { type: 'done', content: '', finishReason: 'stop' };
      }
    } catch {
      // Skip malformed JSON
    }
  }

  async validate(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/api/tags`, {
        signal: AbortSignal.timeout(3000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private inferCapabilities(modelName: string): Array<'text' | 'vision' | 'code'> {
    const caps: Array<'text' | 'vision' | 'code'> = ['text'];
    const name = modelName.toLowerCase();

    if (name.includes('vision') || name.includes('llava') || name.includes('bakllava')) {
      caps.push('vision');
    }
    if (name.includes('code') || name.includes('codellama') || name.includes('deepseek')) {
      caps.push('code');
    }

    return caps;
  }
}