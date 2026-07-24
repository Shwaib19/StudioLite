import { BaseProvider } from './BaseProvider';
import type { ChatConfig, StreamChunk, ModelInfo, ChatMessage } from './types';
import { ENDPOINTS, DEFAULT_MODELS } from '../utils/constants';

export class OpenRouterProvider extends BaseProvider {
  public readonly id = 'openrouter';
  public readonly type = 'openrouter' as const;
  public readonly displayName = 'OpenRouter';

  constructor(apiKey: string) {
    super(ENDPOINTS.OPENROUTER, apiKey);
  }

  async listModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return (data.data || []).map((model: any) => ({
      id: model.id,
      name: model.name || model.id,
      providerId: this.id,
      capabilities: this.inferCapabilities(model),
      isLocal: false,
      description: model.description,
    }));
  }

  async *chat(messages: ChatMessage[], config: ChatConfig): AsyncGenerator<StreamChunk, void, undefined> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: messages[0]?.modelId || DEFAULT_MODELS.OPENROUTER,
        messages: messages.map(m => ({
          role: m.role,
          content: m.content.map(c => c.type === 'text' ? c.value : '').join(''),
        })),
        stream: true,
        temperature: config.temperature,
        max_tokens: config.maxTokens,
        top_p: config.topP,
        frequency_penalty: config.frequencyPenalty,
        presence_penalty: config.presencePenalty,
        stop: config.stop,
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorBody = await response.text().catch(() => '');
      yield { type: 'error', content: `OpenRouter error (${response.status}): ${errorBody}` };
      return;
    }

    yield* this.parseSSEStream(response);
  }

  protected async *parseStreamData(data: string): AsyncGenerator<StreamChunk, void, undefined> {
    try {
      const parsed = JSON.parse(data);
      const choice = parsed.choices?.[0];
      if (choice?.delta?.content) {
        yield { type: 'text', content: choice.delta.content };
      }
      if (choice?.finish_reason) {
        yield { type: 'done', content: '', finishReason: choice.finish_reason };
      }
    } catch {
      // Skip malformed JSON
    }
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(`${this.baseUrl}/models`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return response.ok;
    } catch {
      return false;
    }
  }

  private inferCapabilities(model: any): Array<'text' | 'vision' | 'code' | 'image-generation'> {
    const caps: Array<'text' | 'vision' | 'code' | 'image-generation'> = ['text'];
    const id = (model.id || '').toLowerCase();

    if (id.includes('vision') || id.includes('vl')) caps.push('vision');
    if (id.includes('code') || id.includes('instruct')) caps.push('code');
    if (model.id?.includes('dall-e') || model.id?.includes('stable-diffusion')) {
      caps.push('image-generation');
    }

    return caps;
  }
}