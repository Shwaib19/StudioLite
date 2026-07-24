import { useRef, useEffect } from 'react';
import { useChat } from '../../hooks/useChat';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

export default function ChatView() {
  const { messages, isStreaming, error, streamingText, send, abort } = useChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, streamingText]);

  return (
    <div className="flex flex-col h-full">
      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-4 py-4">
        {messages.length === 0 && !isStreaming && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center max-w-md">
              <h2 className="font-heading text-xl font-semibold mb-2">Welcome to StudioLite</h2>
              <p className="text-neutral-600 dark:text-dark-text-secondary text-sm">
                Select a model from the header and start chatting. You can use text, code, and images.
              </p>
            </div>
          </div>
        )}

        <MessageList messages={messages} streamingText={streamingText} isStreaming={isStreaming} />
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      {error && (
        <div className="mx-4 mb-2 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => useChat().clear()} className="ml-2 text-red-500 hover:text-red-700 cursor-pointer">✕</button>
        </div>
      )}

      {/* Input area */}
      <MessageInput onSend={send} onAbort={abort} isStreaming={isStreaming} />
    </div>
  );
}