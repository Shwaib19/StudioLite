import { useEffect } from 'react';
import AppShell from './components/layout/AppShell';
import { ProviderRegistry } from './providers/ProviderRegistry';
import './index.css';

function App() {
  useEffect(() => {
    // Initialize providers on app startup
    ProviderRegistry.init();
  }, []);

  return <AppShell />;
}

export default App;
