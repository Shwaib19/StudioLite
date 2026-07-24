import type { ChatMessage } from '../../types/chat';
import MarkdownRenderer from '../shared/MarkdownRenderer';

interface MessageBubbleProps {
  message: ChatMessage;
  isStreaming?: boolean;
  streamingText?: string;
}

export default function MessageBubble({ message, isStreaming, streamingText }: MessageBubbleProps) {
  const isUser = message.role === 'user';
  const isAssistant = message.role === 'assistant';

  // Use streaming text if available
  const displayContent = streamingText || message.content.map(c => c.value).join('');

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-lg px-4 py-2 ${
          isUser
            ? 'bg-primary text-white rounded-br-sm'
            : 'bg-neutral-100 dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-bl-sm'
        }`}
      >
        {/* Role label */}
        {isAssistant && (
          <div className="text-xs font-medium text-neutral-400 dark:text-dark-text-secondary mb-1">
            Assistant
          </div>
        )}
        {isUser && (
          <div className="text-xs font-medium text-white/70 mb-1">You</div>
        )}

        {/* Message content */}
        {isAssistant ? (
          <MarkdownRenderer content={displayContent} />
        ) : (
          <p className="text-sm whitespace-pre-wrap">{displayContent}</p>
        )}

        {/* Streaming cursor */}
        {isStreaming && (
          <span className="inline-block w-2 h-4 bg-primary dark:bg-primary ml-0.5 animate-pulse" />
        )}
      </div>
    </div>
  );
}