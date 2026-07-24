import { useState, useEffect, useMemo } from 'react';
import { useModels } from '../../hooks/useModels';
import { useModelStore } from '../../stores/modelStore';
import { useDownload } from '../../hooks/useDownload';
import { getDownloadUrl, getGgufFiles } from '../../services/huggingface';
import { downloadModel } from '../../services/tauriCommands';
import { showToast } from '../shared/Toast';
import type { ModelInfo } from '../../providers/types';

export default function ModelBrowser() {
  const { models, isLoading, error, selectModel, refreshModels } = useModels();
  const store = useModelStore();
  const { startDownload } = useDownload();

  const [selectedDetail, setSelectedDetail] = useState<ModelInfo | null>(null);
  const [searchInput, setSearchInput] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  // Derived: unique providers and capabilities for filter dropdowns
  const providers = useMemo(() => {
    const set = new Set(models.map((m) => m.providerId));
    return Array.from(set);
  }, [models]);

  const capabilities = useMemo(() => {
    const set = new Set<string>();
    models.forEach((m) => m.capabilities.forEach((c) => set.add(c)));
    return Array.from(set);
  }, [models]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => store.setSearchQuery(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Apply filters
  const filtered = useMemo(() => store.getFilteredModels(), [models, store.searchQuery, store.providerFilter, store.capabilityFilter]);
  const paginated = useMemo(() => store.getPaginatedModels(), [filtered, store.page, store.pageSize]);
  const totalPages = useMemo(() => store.getTotalPages(), [filtered, store.pageSize]);

  const handleDownload = async (model: ModelInfo) => {
    setDownloading(model.id);
    try {
      const ggufFiles = await getGgufFiles(model.id);
      if (ggufFiles.length === 0) {
        showToast('error', 'No GGUF files found for this model');
        setDownloading(null);
        return;
      }

      const file = ggufFiles[0]; // Download the first/largest GGUF file
      const url = getDownloadUrl(model.id, file.path);
      const dest = await import('@tauri-apps/plugin-dialog').then((m) =>
        m.open({ directory: true, multiple: false, title: 'Choose download folder' }),
      );

      if (dest) {
        startDownload(file.path.split('/').pop() || file.path, file.size);
        await downloadModel(url, dest, file.path.split('/').pop() || file.path);
        showToast('success', `Download started: ${file.path.split('/').pop()}`);
      }
    } catch (err) {
      showToast('error', `Download failed: ${(err as Error).message}`);
    } finally {
      setDownloading(null);
    }
  };

  const handleRunLocal = (model: ModelInfo) => {
    selectModel(model.id);
    showToast('success', `Selected model: ${model.name}`);
  };

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-xl font-semibold">Available Models</h2>
        <button
          onClick={refreshModels}
          disabled={isLoading}
          className="px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover disabled:opacity-50 transition-colors cursor-pointer"
        >
          {isLoading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search models..."
          className="flex-1 min-w-[200px] px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <select
          value={store.providerFilter}
          onChange={(e) => store.setProviderFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card"
        >
          <option value="">All Providers</option>
          {providers.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <select
          value={store.capabilityFilter}
          onChange={(e) => store.setCapabilityFilter(e.target.value)}
          className="px-3 py-2 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card"
        >
          <option value="">All Capabilities</option>
          {capabilities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 px-4 py-2 rounded-md bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="text-center py-12 text-neutral-400">Loading models...</div>
      )}

      {/* Empty state */}
      {!isLoading && filtered.length === 0 && (
        <div className="text-center py-12 text-neutral-400">
          {searchInput || store.providerFilter || store.capabilityFilter
            ? 'No models match your filters. Try adjusting your search criteria.'
            : 'No models found. Configure a provider in Settings or add a GGUF directory.'}
        </div>
      )}

      {/* Model grid */}
      {!isLoading && filtered.length > 0 && (
        <>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {paginated.map((model) => (
              <ModelCard
                key={model.id}
                model={model}
                onSelect={() => selectModel(model.id)}
                onDetail={() => setSelectedDetail(model)}
                onDownload={model.providerId === 'huggingface' ? () => handleDownload(model) : undefined}
                onRunLocal={model.isLocal ? () => handleRunLocal(model) : undefined}
                isDownloading={downloading === model.id}
              />
            ))}
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-center gap-4 mt-6">
            <button
              onClick={() => store.setPage(store.page - 1)}
              disabled={store.page <= 1}
              className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-dark-border disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
            >
              Previous
            </button>
            <span className="text-sm text-neutral-400">
              Page {store.page} of {totalPages}
            </span>
            <button
              onClick={() => store.setPage(store.page + 1)}
              disabled={store.page >= totalPages}
              className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-dark-border disabled:opacity-30 hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
            >
              Next
            </button>
          </div>
        </>
      )}

      {/* Detail panel */}
      {selectedDetail && (
        <ModelDetail
          model={selectedDetail}
          onClose={() => setSelectedDetail(null)}
          onSelect={() => {
            selectModel(selectedDetail.id);
            setSelectedDetail(null);
          }}
          onDownload={selectedDetail.providerId === 'huggingface' ? () => handleDownload(selectedDetail) : undefined}
          onRunLocal={selectedDetail.isLocal ? () => handleRunLocal(selectedDetail) : undefined}
          isDownloading={downloading === selectedDetail.id}
        />
      )}
    </div>
  );
}

// ── Model Card (in-grid) ──

interface ModelCardProps {
  model: ModelInfo;
  onSelect: () => void;
  onDetail: () => void;
  onDownload?: () => void;
  onRunLocal?: () => void;
  isDownloading?: boolean;
}

function ModelCard({ model, onSelect, onDetail, onDownload, onRunLocal, isDownloading }: ModelCardProps) {
  return (
    <div className="p-4 rounded-lg border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-2">
        <h3 className="font-heading font-semibold text-sm truncate flex-1">{model.name}</h3>
        <button
          onClick={(e) => { e.stopPropagation(); onDetail(); }}
          className="ml-2 text-xs text-primary hover:underline cursor-pointer shrink-0"
        >
          Details
        </button>
      </div>

      <p className="text-xs text-neutral-400 dark:text-dark-text-secondary mb-2">
        {model.providerId}
        {model.quantization && ` · ${model.quantization}`}
        {model.size && ` · ${(model.size / 1024 / 1024 / 1024).toFixed(1)} GB`}
      </p>

      <div className="flex flex-wrap gap-1 mb-3">
        {model.capabilities.map((cap) => (
          <span key={cap} className="px-1.5 py-0.5 text-xs rounded bg-neutral-100 dark:bg-dark-border text-neutral-600 dark:text-dark-text-secondary">
            {cap}
          </span>
        ))}
        {model.isLocal && (
          <span className="px-1.5 py-0.5 text-xs rounded bg-secondary-light dark:bg-secondary/20 text-secondary">local</span>
        )}
      </div>

      <div className="flex gap-2">
        <button
          onClick={onSelect}
          className="flex-1 px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Select
        </button>
        {onDownload && (
          <button
            onClick={onDownload}
            disabled={isDownloading}
            className="px-3 py-1.5 text-sm rounded-md border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
          >
            {isDownloading ? '...' : 'Download'}
          </button>
        )}
        {onRunLocal && (
          <button
            onClick={onRunLocal}
            className="px-3 py-1.5 text-sm rounded-md bg-secondary text-white hover:bg-secondary-hover transition-colors cursor-pointer"
          >
            Run
          </button>
        )}
      </div>
    </div>
  );
}

// ── Model Detail Panel (overlay) ──

interface ModelDetailProps {
  model: ModelInfo;
  onClose: () => void;
  onSelect: () => void;
  onDownload?: () => void;
  onRunLocal?: () => void;
  isDownloading?: boolean;
}

function ModelDetail({ model, onClose, onSelect, onDownload, onRunLocal, isDownloading }: ModelDetailProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-white dark:bg-dark-card rounded-xl border border-neutral-200 dark:border-dark-border shadow-lg w-full max-w-lg p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-heading text-lg font-semibold">{model.name}</h3>
            <p className="text-sm text-neutral-400 dark:text-dark-text-secondary mt-1">
              {model.providerId}
            </p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-border cursor-pointer">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex flex-wrap gap-1">
            {model.capabilities.map((cap) => (
              <span key={cap} className="px-2 py-0.5 text-xs rounded bg-neutral-100 dark:bg-dark-border text-neutral-600 dark:text-dark-text-secondary">
                {cap}
              </span>
            ))}
            {model.isLocal && (
              <span className="px-2 py-0.5 text-xs rounded bg-secondary-light dark:bg-secondary/20 text-secondary">local</span>
            )}
          </div>

          {model.size && (
            <p className="text-sm text-neutral-600 dark:text-dark-text-secondary">
              <span className="font-medium">Size:</span> {(model.size / 1024 / 1024 / 1024).toFixed(2)} GB
            </p>
          )}
          {model.quantization && (
            <p className="text-sm text-neutral-600 dark:text-dark-text-secondary">
              <span className="font-medium">Quantization:</span> {model.quantization}
            </p>
          )}
          {model.description && (
            <p className="text-sm text-neutral-600 dark:text-dark-text-secondary">
              <span className="font-medium">Description:</span> {model.description}
            </p>
          )}
          {!model.description && (
            <p className="text-sm text-neutral-400 italic">No description available.</p>
          )}
        </div>

        <div className="flex gap-3">
          <button
            onClick={onSelect}
            className="flex-1 px-4 py-2 text-sm rounded-md bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
          >
            Select Model
          </button>
          {onDownload && (
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="px-4 py-2 text-sm rounded-md border border-primary text-primary hover:bg-primary hover:text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              {isDownloading ? 'Downloading...' : 'Download'}
            </button>
          )}
          {onRunLocal && (
            <button
              onClick={onRunLocal}
              className="px-4 py-2 text-sm rounded-md bg-secondary text-white hover:bg-secondary-hover transition-colors cursor-pointer"
            >
              Run Local
            </button>
          )}
        </div>
      </div>
    </div>
  );
}