import { useState } from 'react';

interface CodeBlockProps {
  code: string;
  language?: string;
}

export default function CodeBlock({ code, language }: CodeBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  return (
    <div className="relative group rounded-md overflow-hidden bg-neutral-900 dark:bg-black my-2">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-neutral-800 dark:bg-neutral-900">
        <span className="text-xs text-neutral-400">{language || 'code'}</span>
        <button
          onClick={handleCopy}
          className="text-xs text-neutral-400 hover:text-white transition-colors cursor-pointer"
        >
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>

      {/* Code content */}
      <pre className="p-3 overflow-x-auto">
        <code className="text-sm text-neutral-100 font-mono leading-relaxed whitespace-pre">
          {code}
        </code>
      </pre>
    </div>
  );
}