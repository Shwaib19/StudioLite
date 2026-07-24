import Logo from '../shared/Logo';
import { useModelStore } from '../../stores/modelStore';

interface HeaderProps {
  onToggleSidebar: () => void;
  onOpenSettings: () => void;
  onOpenModels: () => void;
}

export default function Header({ onToggleSidebar, onOpenSettings, onOpenModels }: HeaderProps) {
  const models = useModelStore((s) => s.models);
  const selectedModelId = useModelStore((s) => s.selectedModelId);
  const selectModel = useModelStore((s) => s.selectModel);

  return (
    <header className="flex items-center gap-3 px-4 py-2 border-b border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card">
      {/* Sidebar toggle */}
      <button
        onClick={onToggleSidebar}
        className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
        title="Toggle sidebar"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      {/* Logo + Title */}
      <Logo className="w-7 h-7" />
      <h1 className="font-heading text-base font-semibold">StudioLite</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Model selector */}
      <select
        value={selectedModelId || ''}
        onChange={(e) => selectModel(e.target.value)}
        className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-primary max-w-[240px]"
      >
        <option value="">Select a model...</option>
        {models.map((model) => (
          <option key={model.id} value={model.id}>
            {model.name}
          </option>
        ))}
      </select>

      {/* Model browser button */}
      <button
        onClick={onOpenModels}
        className="px-3 py-1.5 text-sm rounded-md hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
        title="Browse models"
      >
        Models
      </button>

      {/* Settings button */}
      <button
        onClick={onOpenSettings}
        className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
        title="Settings"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      </button>
    </header>
  );
}