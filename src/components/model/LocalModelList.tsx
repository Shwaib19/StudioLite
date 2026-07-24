import { useState, useEffect } from 'react';
import type { GgufModelInfo } from '../../types/model';
import { listGgufModels } from '../../services/tauriCommands';

export default function LocalModelList() {
  const [models, setModels] = useState<GgufModelInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadModels();
  }, []);

  async function loadModels() {
    setLoading(true);
    setError(null);
    try {
      const result = await listGgufModels();
      setModels(result as unknown as GgufModelInfo[]);
    } catch (err) {
      setError(`Failed to list models: ${(err as Error).message}`);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className="text-sm text-neutral-400">Scanning for models...</div>;
  }

  if (error) {
    return (
      <div className="text-sm text-error">
        {error}
        <button onClick={loadModels} className="ml-2 underline cursor-pointer">Retry</button>
      </div>
    );
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
            {model.model_name && ` · ${model.model_name}`}
          </div>
        </div>
      ))}
    </div>
  );
}