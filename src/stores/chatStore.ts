import { create } from 'zustand';
import type { ChatMessage, MessageContent } from '../types/chat';
import { ProviderRegistry } from '../providers/ProviderRegistry';
import type { ChatConfig } from '../providers/types';
import { CHAT_DEFAULTS } from '../utils/constants';
import { generateId } from '../utils/idGenerator';

interface ChatState {
  messages: ChatMessage[];
  activeConversationId: string | null;
  isStreaming: boolean;
  error: string | null;
  streamingText: string;

  sendMessage: (content: MessageContent[]) => Promise<void>;
  appendChunk: (chunk: string) => void;
  finishStreaming: () => void;
  abortResponse: () => void;
  clearConversation: () => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  messages: [],
  activeConversationId: null,
  isStreaming: false,
  error: null,
  streamingText: '',

  sendMessage: async (content: MessageContent[]) => {
    const providerId = 'openrouter';
    const provider = ProviderRegistry.getProvider(providerId);

    if (!provider) {
      set({ error: 'No provider configured' });
      return;
    }

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      createdAt: Date.now(),
      providerId,
    };

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: [{ type: 'text', value: '' }],
      createdAt: Date.now(),
      providerId,
    };

    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
      isStreaming: true,
      error: null,
      streamingText: '',
    }));

    const config: ChatConfig = {
      temperature: CHAT_DEFAULTS.temperature,
      maxTokens: CHAT_DEFAULTS.maxTokens,
      topP: CHAT_DEFAULTS.topP,
      frequencyPenalty: CHAT_DEFAULTS.frequencyPenalty,
      presencePenalty: CHAT_DEFAULTS.presencePenalty,
    };

    try {
      const allMessages = [...get().messages];
      const generator = provider.chat(allMessages.slice(0, -1), config);

      for await (const chunk of generator) {
        if (chunk.type === 'text') {
          get().appendChunk(chunk.content);
        } else if (chunk.type === 'error') {
          set({ error: chunk.content, isStreaming: false });
          return;
        } else if (chunk.type === 'done') {
          get().finishStreaming();
          return;
        }
      }
    } catch (err) {
      set({
        error: `Chat error: ${(err as Error).message}`,
        isStreaming: false,
      });
    }
  },

  appendChunk: (chunk: string) => {
    const { messages, streamingText } = get();
    const newText = streamingText + chunk;
    const updatedMessages = [...messages];
    const lastMsg = updatedMessages[updatedMessages.length - 1];

    if (lastMsg && lastMsg.role === 'assistant') {
      lastMsg.content = [{ type: 'text', value: newText }];
    }

    set({ messages: updatedMessages, streamingText: newText });
  },

  finishStreaming: () => {
    set({ isStreaming: false, streamingText: '' });
  },

  abortResponse: () => {
    const providerId = 'openrouter';
    const provider = ProviderRegistry.getProvider(providerId);
    provider?.abort();
    set({ isStreaming: false, streamingText: '' });
  },

  clearConversation: () => {
    set({
      messages: [],
      activeConversationId: null,
      error: null,
      streamingText: '',
    });
  },

  setError: (error: string | null) => {
    set({ error });
  },
}));