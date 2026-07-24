import { useState } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import StatusBar from './StatusBar';
import ChatView from '../chat/ChatView';
import ModelBrowser from '../model/ModelBrowser';
import SettingsPanel from '../settings/SettingsPanel';
import ToastContainer from '../shared/Toast';

type ActiveView = 'chat' | 'models' | 'settings';

export default function AppShell() {
  const [activeView, setActiveView] = useState<ActiveView>('chat');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="h-screen flex flex-col bg-neutral-50 dark:bg-dark-bg text-neutral-900 dark:text-dark-text">
      <Header
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        onOpenSettings={() => setActiveView('settings')}
        onOpenModels={() => setActiveView('models')}
      />

      <div className="flex flex-1 overflow-hidden">
        {sidebarOpen && (
          <Sidebar
            onNewChat={() => setActiveView('chat')}
            onClose={() => setSidebarOpen(false)}
          />
        )}

        <main className="flex-1 overflow-hidden">
          {activeView === 'chat' && <ChatView />}
          {activeView === 'models' && <ModelBrowser />}
          {activeView === 'settings' && <SettingsPanel onClose={() => setActiveView('chat')} />}
        </main>
      </div>

      <StatusBar />
      <ToastContainer />
    </div>
  );
}