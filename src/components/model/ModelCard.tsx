import type { ModelInfo } from '../../providers/types';

interface ModelCardProps {
  model: ModelInfo;
  onSelect: (id: string) => void;
}

export default function ModelCard({ model, onSelect }: ModelCardProps) {
  return (
    <div className="p-4 rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card">
      <h3 className="font-heading font-semibold text-sm mb-1">{model.name}</h3>
      <p className="text-xs text-neutral-400 dark:text-dark-text-secondary mb-2">
        Provider: {model.providerId}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {model.capabilities.map((cap) => (
          <span
            key={cap}
            className="px-1.5 py-0.5 text-xs rounded bg-neutral-100 dark:bg-dark-border text-neutral-600 dark:text-dark-text-secondary"
          >
            {cap}
          </span>
        ))}
        {model.isLocal && (
          <span className="px-1.5 py-0.5 text-xs rounded bg-secondary-light dark:bg-secondary/20 text-secondary">
            local
          </span>
        )}
      </div>

      {model.size && (
        <p className="text-xs text-neutral-400 mb-1">
          Size: {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
        </p>
      )}
      {model.quantization && (
        <p className="text-xs text-neutral-400 mb-3">Quantization: {model.quantization}</p>
      )}

      <button
        onClick={() => onSelect(model.id)}
        className="w-full px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
      >
        Select Model
      </button>
    </div>
  );
}