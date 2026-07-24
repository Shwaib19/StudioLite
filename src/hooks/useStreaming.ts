import { useState, useRef, useCallback } from 'react';
import type { ChatConfig, ChatMessage } from '../providers/types';
import type { IProvider } from '../providers/types';

interface UseStreamingReturn {
  text: string;
  isStreaming: boolean;
  error: string | null;
  startStream: (provider: IProvider, messages: ChatMessage[], config: ChatConfig) => Promise<void>;
  abort: () => void;
}

export function useStreaming(): UseStreamingReturn {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<(() => void) | null>(null);

  const startStream = useCallback(
    async (provider: IProvider, messages: ChatMessage[], config: ChatConfig) => {
      setText('');
      setError(null);
      setIsStreaming(true);

      abortRef.current = () => provider.abort();

      try {
        const generator = provider.chat(messages, config);
        for await (const chunk of generator) {
          if (chunk.type === 'text') {
            setText((prev) => prev + chunk.content);
          } else if (chunk.type === 'error') {
            setError(chunk.content);
            setIsStreaming(false);
            return;
          } else if (chunk.type === 'done') {
            setIsStreaming(false);
            return;
          }
        }
      } catch (err) {
        setError(`Stream error: ${(err as Error).message}`);
        setIsStreaming(false);
      }
    },
    [],
  );

  const abort = useCallback(() => {
    abortRef.current?.();
    setIsStreaming(false);
  }, []);

  return { text, isStreaming, error, startStream, abort };
}