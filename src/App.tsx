import { useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import { ProviderRegistry } from './providers/ProviderRegistry';
import { useSettingsStore } from './stores/settingsStore';
import './index.css';

function App() {
  const loadSettingsFromDisk = useSettingsStore((s) => s.loadSettingsFromDisk);

  useEffect(() => {
    // Initialize providers on app startup
    ProviderRegistry.init();

    // Load persisted settings
    loadSettingsFromDisk();
  }, [loadSettingsFromDisk]);

  return <AppShell />;
}

export default App;
