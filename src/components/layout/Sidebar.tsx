interface SidebarProps {
  onNewChat: () => void;
  onClose: () => void;
}

export default function Sidebar({ onNewChat, onClose }: SidebarProps) {
  return (
    <aside className="w-64 border-r border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-neutral-200 dark:border-dark-border">
        <button
          onClick={onNewChat}
          className="flex items-center gap-2 px-3 py-1.5 text-sm rounded-md bg-primary text-white hover:bg-primary-hover transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
        <button
          onClick={onClose}
          className="p-1 rounded-md hover:bg-neutral-100 dark:hover:bg-dark-border transition-colors cursor-pointer"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
        </button>
      </div>

      {/* Conversation list placeholder */}
      <div className="flex-1 p-3 overflow-y-auto">
        <p className="text-xs text-neutral-400 dark:text-dark-text-secondary text-center mt-8">
          No conversations yet.
        </p>
      </div>
    </aside>
  );
}