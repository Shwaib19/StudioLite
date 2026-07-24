import { useState } from 'react';
import { useSettingsStore } from '../../stores/settingsStore';

export default function ModelPathConfig() {
  const { settings, updateSettings } = useSettingsStore();
  const [newPath, setNewPath] = useState('');

  const addPath = () => {
    const path = newPath.trim();
    if (path && !settings.modelDirectories.includes(path)) {
      updateSettings({
        modelDirectories: [...settings.modelDirectories, path],
      });
      setNewPath('');
    }
  };

  const removePath = (path: string) => {
    updateSettings({
      modelDirectories: settings.modelDirectories.filter((p) => p !== path),
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex gap-2">
        <input
          type="text"
          value={newPath}
          onChange={(e) => setNewPath(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addPath()}
          placeholder="C:\Models\GGUF"
          className="flex-1 px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-primary"
        />
        <button
          onClick={addPath}
          className="px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          Add
        </button>
      </div>

      <div className="space-y-1">
        {settings.modelDirectories.map((path) => (
          <div
            key={path}
            className="flex items-center justify-between px-3 py-2 rounded-md bg-neutral-50 dark:bg-dark-bg text-sm"
          >
            <span className="truncate">{path}</span>
            <button
              onClick={() => removePath(path)}
              className="text-xs text-error hover:underline cursor-pointer ml-2"
            >
              Remove
            </button>
          </div>
        ))}
      </div>

      {settings.modelDirectories.length === 0 && (
        <p className="text-xs text-neutral-400">
          No directories configured. Add a path to scan for GGUF model files.
        </p>
      )}
    </div>
  );
}