import { useModels } from '../../hooks/useModels';

export default function ModelBrowser() {
  const { models, isLoading, error, selectModel, refreshModels } = useModels();

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-heading text-lg font-semibold">Available Models</h2>
        <button
          onClick={refreshModels}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-3 py-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="text-center py-8 text-neutral-400">Loading models...</div>
      )}

      {!isLoading && models.length === 0 && (
        <div className="text-center py-8 text-neutral-400">
          No models found. Configure a provider in Settings or add a GGUF directory.
        </div>
      )}

      <div className="grid gap-3 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {models.map((model) => (
          <div
            key={model.id}
            onClick={() => selectModel(model.id)}
            className="p-3 rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card hover:border-primary dark:hover:border-primary transition-colors cursor-pointer"
          >
            <div className="font-medium text-sm mb-1">{model.name}</div>
            <div className="text-xs text-neutral-400 dark:text-dark-text-secondary">
              {model.providerId}
              {model.quantization && ` · ${model.quantization}`}
              {model.size && ` · ${(model.size / 1024 / 1024 / 1024).toFixed(1)} GB`}
            </div>
            <div className="flex gap-1 mt-2">
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
          </div>
        ))}
      </div>
    </div>
  );
}