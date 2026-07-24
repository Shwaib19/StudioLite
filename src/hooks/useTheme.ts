import { useEffect } from 'react';
import { useSettingsStore } from '../stores/settingsStore';

export function useTheme() {
  const { settings, updateSettings } = useSettingsStore();

  useEffect(() => {
    const root = document.documentElement;

    if (settings.theme === 'dark') {
      root.classList.add('dark');
    } else if (settings.theme === 'light') {
      root.classList.remove('dark');
    } else {
      // system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [settings.theme]);

  const toggleTheme = () => {
    const next = settings.theme === 'light' ? 'dark' : 'light';
    updateSettings({ theme: next });
  };

  return {
    theme: settings.theme,
    setTheme: (theme: 'light' | 'dark' | 'system') => updateSettings({ theme }),
    toggleTheme,
  };
}