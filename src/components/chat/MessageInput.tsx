import { useState, useRef, KeyboardEvent } from 'react';

interface MessageInputProps {
  onSend: (text: string) => void;
  onAbort: () => void;
  isStreaming: boolean;
}

export default function MessageInput({ onSend, onAbort, isStreaming }: MessageInputProps) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    onSend(text);
    setInput('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  };

  return (
    <div className="border-t border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card px-4 py-3">
      <div className="flex items-end gap-2 max-w-4xl mx-auto">
        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          placeholder="Type a message... (Shift+Enter for new line)"
          rows={1}
          className="flex-1 px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-bg focus:outline-none focus:ring-2 focus:ring-primary resize-none max-h-[200px]"
          disabled={isStreaming}
        />

        {/* Send / Abort button */}
        {isStreaming ? (
          <button
            onClick={onAbort}
            className="px-4 py-2 text-sm rounded-md bg-error text-white hover:bg-red-600 transition-colors cursor-pointer whitespace-nowrap"
          >
            Stop
          </button>
        ) : (
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer whitespace-nowrap"
          >
            Send
          </button>
        )}
      </div>
    </div>
  );
}