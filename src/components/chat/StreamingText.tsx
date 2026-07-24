interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
}

export default function StreamingText({ text, isStreaming }: StreamingTextProps) {
  return (
    <span>
      {text}
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-primary dark:bg-primary ml-0.5 animate-pulse" />
      )}
    </span>
  );
}