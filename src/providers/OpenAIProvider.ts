import { BaseProvider } from './BaseProvider';
import type { ChatConfig, StreamChunk, ModelInfo, ChatMessage } from './types';
import { ENDPOINTS, DEFAULT_MODELS } from '../utils/constants';

export class OpenAIProvider extends BaseProvider {
  public readonly id = 'openai';
  public readonly type = 'openai' as const;
  public readonly displayName = 'OpenAI';

  constructor(apiKey: string, baseUrl?: string) {
    super(baseUrl || ENDPOINTS.OPENAI, apiKey);
  }

  async listModels(): Promise<ModelInfo[]> {
    const response = await fetch(`${this.baseUrl}/models`, {
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return (data.data || [])
      .filter((m: any) => m.id?.startsWith('gpt') || m.id?.startsWith('dall-e'))
      .map((model: any) => ({
        id: model.id,
        name: model.id,
        providerId: this.id,
        capabilities: this.inferCapabilities(model.id),
        isLocal: false,
      }));
  }

  async *chat(messages: ChatMessage[], config: ChatConfig): AsyncGenerator<StreamChunk, void, undefined> {
    const controller = this.createAbortController();

    const response = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: messages[0]?.modelId || DEFAULT_MODELS.OPENAI,
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
      yield { type: 'error', content: `OpenAI error (${response.status}): ${errorBody}` };
      return;
    }

    yield* this.parseSSEStream(response);
  }

  /** Generate image using DALL-E. */
  async generateImage(prompt: string, n: number = 1, size: string = '1024x1024'): Promise<string[]> {
    const response = await fetch(`${this.baseUrl}/images/generations`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        model: 'dall-e-3',
        prompt,
        n,
        size,
      }),
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.status}`);
    }

    const data = await response.json();
    return (data.data || []).map((img: any) => img.url || img.b64_json);
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

  private inferCapabilities(modelId: string): Array<'text' | 'vision' | 'code' | 'image-generation'> {
    const caps: Array<'text' | 'vision' | 'code' | 'image-generation'> = ['text'];
    const id = modelId.toLowerCase();

    if (id.includes('vision') || id.includes('gpt-4')) caps.push('vision');
    if (id.includes('dall-e')) caps.push('image-generation');

    return caps;
  }
}