import { useProviderStore } from '../../stores/providerStore';

export default function ProviderConfig() {
  const { providers, activeProviderId, setActiveProvider, removeProvider } = useProviderStore();

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`p-3 rounded-md border cursor-pointer transition-colors ${
            activeProviderId === provider.id
              ? 'border-primary bg-primary-light dark:bg-primary/10'
              : 'border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card'
          }`}
          onClick={() => setActiveProvider(provider.id)}
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium text-sm">{provider.name}</div>
              <div className="text-xs text-neutral-400">{provider.type}</div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="text-xs text-primary hover:underline cursor-pointer"
              >
                Configure
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeProvider(provider.id);
                }}
                className="text-xs text-error hover:underline cursor-pointer"
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}