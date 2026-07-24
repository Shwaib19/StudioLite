import { BaseProvider } from './BaseProvider';
import type { ChatConfig, StreamChunk, ModelInfo, ChatMessage } from './types';

export class HuggingFaceProvider extends BaseProvider {
  public readonly id = 'huggingface';
  public readonly type = 'huggingface' as const;
  public readonly displayName = 'Hugging Face';

  constructor(apiKey: string) {
    super('https://api-inference.huggingface.co', apiKey);
  }

  async listModels(): Promise<ModelInfo[]> {
    // HF Inference API is model-specific; return a curated list of popular models
    return [
      { id: 'microsoft/Phi-3.5-mini-instruct', name: 'Phi-3.5 Mini Instruct', providerId: this.id, capabilities: ['text'], isLocal: false },
      { id: 'mistralai/Mistral-7B-Instruct-v0.3', name: 'Mistral 7B Instruct', providerId: this.id, capabilities: ['text'], isLocal: false },
      { id: 'meta-llama/Meta-Llama-3-8B-Instruct', name: 'Llama 3 8B Instruct', providerId: this.id, capabilities: ['text', 'code'], isLocal: false },
      { id: 'google/gemma-2-2b-it', name: 'Gemma 2 2B IT', providerId: this.id, capabilities: ['text'], isLocal: false },
    ];
  }

  async *chat(messages: ChatMessage[], config: ChatConfig): AsyncGenerator<StreamChunk, void, undefined> {
    const modelId = messages[0]?.modelId || 'microsoft/Phi-3.5-mini-instruct';
    const controller = this.createAbortController();

    const prompt = messages.map(m => {
      const role = m.role === 'assistant' ? 'assistant' : 'user';
      const text = m.content.filter(c => c.type === 'text').map(c => c.value).join('\n');
      return `<|${role}|>\n${text}`;
    }).join('\n') + '\n<|assistant|>\n';

    const response = await fetch(`${this.baseUrl}/models/${modelId}`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: config.maxTokens,
          temperature: config.temperature,
          top_p: config.topP,
          return_full_text: false,
        },
        options: { use_cache: false, wait_for_model: true },
      }),
      signal: controller.signal,
    });

    if (!response.ok) {
      yield { type: 'error', content: `HF Inference error (${response.status}): ${response.statusText}` };
      return;
    }

    // HF Inference API returns the full result at once (no streaming support for most models)
    const data = await response.json();
    const text = Array.isArray(data) ? (data[0]?.generated_text || '') : (data.generated_text || '');
    yield { type: 'text', content: text };
    yield { type: 'done', content: '' };
  }

  protected async *parseStreamData(_data: string): AsyncGenerator<StreamChunk, void, undefined> {
    // HF Inference API doesn't use standard SSE streaming
    yield { type: 'text', content: _data };
  }

  async validate(): Promise<boolean> {
    if (!this.apiKey) return false;
    try {
      const response = await fetch(`${this.baseUrl}/models/microsoft/Phi-3.5-mini-instruct`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000),
      });
      return response.ok || response.status === 503; // 503 = model loading, but key is valid
    } catch {
      return false;
    }
  }
}