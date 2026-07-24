import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../../hooks/useTheme';
import ProviderConfig from './ProviderConfig';
import ModelPathConfig from './ModelPathConfig';

interface SettingsPanelProps {
  onClose: () => void;
}

export default function SettingsPanel({ onClose }: SettingsPanelProps) {
  const { settings, updateSettings, resetSettings } = useSettingsStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="p-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <h2 className="font-heading text-xl font-semibold">Settings</h2>
        <button
          onClick={onClose}
          className="p-2 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
          title="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <div className="w-full max-w-3xl space-y-6">
        {/* ── Appearance ── */}
        <section className="bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 text-neutral-600 dark:text-dark-text-secondary uppercase tracking-wider">
            Appearance
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Theme</label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value as 'light' | 'dark' | 'system')}
                className="px-3 py-1.5 text-sm rounded-md border border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card focus:outline-none focus:ring-2 focus:ring-primary w-40"
              >
                <option value="system">System</option>
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Font Size</label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={12}
                  max={24}
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
                  className="w-28"
                />
                <span className="text-sm text-neutral-400 w-8 text-right">{settings.fontSize}px</span>
              </div>
            </div>
          </div>
        </section>

        {/* ── Providers ── */}
        <section className="bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 text-neutral-600 dark:text-dark-text-secondary uppercase tracking-wider">
            Providers
          </h3>
          <ProviderConfig />
        </section>

        {/* ── Model Directories ── */}
        <section className="bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 text-neutral-600 dark:text-dark-text-secondary uppercase tracking-wider">
            Model Directories
          </h3>
          <ModelPathConfig />
        </section>

        {/* ── Chat ── */}
        <section className="bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 text-neutral-600 dark:text-dark-text-secondary uppercase tracking-wider">
            Chat
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Send on Enter</label>
              <input
                type="checkbox"
                checked={settings.sendOnEnter}
                onChange={(e) => updateSettings({ sendOnEnter: e.target.checked })}
                className="rounded w-5 h-5 accent-primary"
              />
            </div>

            <div className="flex items-center justify-between">
              <label className="text-sm font-medium">Show Token Count</label>
              <input
                type="checkbox"
                checked={settings.showTokenCount}
                onChange={(e) => updateSettings({ showTokenCount: e.target.checked })}
                className="rounded w-5 h-5 accent-primary"
              />
            </div>
          </div>
        </section>

        {/* ── Reset ── */}
        <section className="bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg p-5">
          <button
            onClick={resetSettings}
            className="px-4 py-2 text-sm rounded-md border border-error text-error hover:bg-error hover:text-white transition-colors cursor-pointer"
          >
            Reset to Defaults
          </button>
        </section>

        {/* ── About ── */}
        <section className="bg-white dark:bg-dark-card border border-neutral-200 dark:border-dark-border rounded-lg p-5">
          <h3 className="font-heading font-semibold text-sm mb-4 text-neutral-600 dark:text-dark-text-secondary uppercase tracking-wider">
            About
          </h3>
          <p className="text-sm text-neutral-400">StudioLite v0.1.0</p>
          <p className="text-sm text-neutral-400">Built with Tauri v2 + React + TypeScript</p>
        </section>
      </div>
    </div>
  );
}