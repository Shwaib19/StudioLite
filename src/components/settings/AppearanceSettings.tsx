import { useSettingsStore } from '../../stores/settingsStore';
import { useTheme } from '../../hooks/useTheme';

export default function AppearanceSettings() {
  const { settings, updateSettings } = useSettingsStore();
  const { theme, setTheme } = useTheme();

  return (
    <div className="space-y-4">
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
        <div className="flex items-center gap-2">
          <input
            type="range"
            min={12}
            max={24}
            value={settings.fontSize}
            onChange={(e) => updateSettings({ fontSize: Number(e.target.value) })}
            className="w-24"
          />
          <span className="text-sm text-neutral-400 w-8">{settings.fontSize}px</span>
        </div>
      </div>
    </div>
  );
}