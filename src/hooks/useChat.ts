import { useCallback } from 'react';
import { useChatStore } from '../stores/chatStore';
import type { MessageContent } from '../types/chat';

export function useChat() {
  const {
    messages,
    isStreaming,
    error,
    streamingText,
    sendMessage,
    abortResponse,
    clearConversation,
  } = useChatStore();

  const send = useCallback(
    (text: string) => {
      const content: MessageContent[] = [{ type: 'text', value: text }];
      sendMessage(content);
    },
    [sendMessage],
  );

  const sendWithImage = useCallback(
    (text: string, imageBase64: string, mimeType: string) => {
      const content: MessageContent[] = [
        { type: 'text', value: text },
        { type: 'image', value: imageBase64, mimeType },
      ];
      sendMessage(content);
    },
    [sendMessage],
  );

  return {
    messages,
    isStreaming,
    error,
    streamingText,
    send,
    sendWithImage,
    abort: abortResponse,
    clear: clearConversation,
  };
}