import { useProviderStore } from '../../stores/providerStore';
import { useModelStore } from '../../stores/modelStore';

export default function StatusBar() {
  const activeProviderId = useProviderStore((s) => s.activeProviderId);
  const selectedModelId = useModelStore((s) => s.selectedModelId);
  const models = useModelStore((s) => s.models);

  const selectedModel = models.find((m) => m.id === selectedModelId);

  return (
    <footer className="flex items-center justify-between px-4 py-1 text-xs border-t border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card text-neutral-400 dark:text-dark-text-secondary">
      <div className="flex items-center gap-4">
        {/* Provider indicator */}
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-success inline-block" />
          {activeProviderId || 'No provider'}
        </span>

        {/* Model indicator */}
        {selectedModel && (
          <span>
            Model: {selectedModel.name}
            {selectedModel.quantization && ` (${selectedModel.quantization})`}
          </span>
        )}
      </div>

      <div>
        StudioLite v0.1.0
      </div>
    </footer>
  );
}