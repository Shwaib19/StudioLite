// ── Chat Message Types ──

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: MessageContent[];
  createdAt: number;
  modelId?: string;
  providerId?: string;
  tokensUsed?: number;
  tokensPerSecond?: number;
}

export interface MessageContent {
  type: 'text' | 'image' | 'code' | 'image-generation';
  value: string;
  language?: string;  // For code blocks (e.g., "typescript")
  mimeType?: string;  // For images (e.g., "image/png")
}

export interface Conversation {
  id: string;
  title: string;
  messages: ChatMessage[];
  createdAt: number;
  updatedAt: number;
  modelId: string;
  providerId: string;
  systemPrompt?: string;
}