import type { ChatMessage } from '../../types/chat';
import MessageBubble from './MessageBubble';

interface MessageListProps {
  messages: ChatMessage[];
  streamingText: string;
  isStreaming: boolean;
}

export default function MessageList({ messages, streamingText }: MessageListProps) {
  return (
    <div className="space-y-4">
      {messages.map((msg, index) => (
        <MessageBubble
          key={msg.id}
          message={msg}
          isStreaming={index === messages.length - 1 && !!streamingText}
          streamingText={index === messages.length - 1 ? streamingText : undefined}
        />
      ))}
    </div>
  );
}