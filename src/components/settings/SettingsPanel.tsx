import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../../hooks/useTheme';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings } = useSettingsStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-4 h-full overflow-y-auto">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-heading text-lg font-semibold">Settings</h2>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="space-y-6 max-w-lg">
        {/* Appearance */}
        <section>
          <h3 className="font-heading font-semibold text-sm mb-3">Appearance</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Font Size</label>
              <input
                type="range"
                min={12}
                max={24}
                value={settings.fontSize}
                onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                className="w-32"
              />
            </div>
          </div>
        </section>

        {/* Chat */}
        <section>
          <h3 className="font-heading font-semibold text-sm mb-3">Chat</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm">Send on Enter</label>
              <input
                type="checkbox"
                checked={settings.sendOnEnter}
                onChange={(e) => updateSettings({ sendOnEnter: e.target.checked })}
                className="rounded"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm">Show Token Count</label>
              <input
                type="checkbox"
                checked={settings.showTokenCount}
                onChange={(e) => updateSettings({ showTokenCount: e.target.checked })}
                className="rounded"
              />
            </div>
          </div>
        </section>

        {/* About */}
        <section>
          <h3 className="font-heading font-semibold text-sm mb-3">About</h3>
          <p className="text-sm text-neutral-400">StudioLite v0.1.0</p>
          <p className="text-sm text-neutral-400">Built with Tauri v2 + React + TypeScript</p>
        </section>
      </div>
    </div>
  );
}