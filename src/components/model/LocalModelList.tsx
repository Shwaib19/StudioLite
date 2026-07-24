import { useState, useEffect } from 'react';
import type { GgufModelInfo } from '../../types/model';

export default function LocalModelList() {
  const models: GgufModelInfo[] = [];
  const [loading] = useState(false);

  useEffect(() => {
    // Will be implemented when Tauri commands are available
  }, []);

  if (loading) {
    return <div className="text-sm text-neutral-400">Scanning for models...</div>;
  }

  if (models.length === 0) {
    return (
      <div className="text-sm text-neutral-400 dark:text-dark-text-secondary">
        No local GGUF models found. Add a model directory in Settings.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {models.map((model) => (
        <div
          key={model.path}
          className="p-3 rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card"
        >
          <div className="font-medium text-sm">{model.filename}</div>
          <div className="text-xs text-neutral-400 mt-1">
            {(model.size_bytes / 1024 / 1024 / 1024).toFixed(2)} GB
            {model.quantization && ` · ${model.quantization}`}
          </div>
        </div>
      ))}
    </div>
  );
}