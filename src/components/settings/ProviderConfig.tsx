import { useProviderStore } from '../../stores/providerStore';

export default function ProviderConfig() {
  const { providers, activeProviderId, setActiveProvider, removeProvider } = useProviderStore();

  return (
    <div className="space-y-3">
      {providers.map((provider) => (
        <div
          key={provider.id}
          className={`p-4 rounded-lg border transition-colors cursor-pointer ${
            activeProviderId === provider.id
              ? 'border-primary bg-primary-light dark:bg-primary/10'
              : 'border-neutral-200 dark:border-dark-border bg-neutral-50 dark:bg-dark-bg'
          }`}
          onClick={() => setActiveProvider(provider.id)}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm">{provider.name}</div>
              <div className="text-xs text-neutral-400 dark:text-dark-text-secondary mt-0.5">
                {provider.type}
                {provider.apiKey ? ' · API key configured' : ' · No API key'}
              </div>
            </div>
            <div className="flex gap-2 ml-3 shrink-0">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                }}
                className="px-2.5 py-1 text-xs rounded-md bg-primary/10 text-primary hover:bg-primary hover:text-white transition-colors cursor-pointer"
              >
                Configure
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeProvider(provider.id);
                }}
                className="px-2.5 py-1 text-xs rounded-md bg-error/10 text-error hover:bg-error hover:text-white transition-colors cursor-pointer"
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