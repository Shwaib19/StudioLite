// ── Settings Types ──

export interface AppSettings {
  theme: 'light' | 'dark' | 'system';
  fontSize: number; // 12-24px
  fontFamily: 'inter' | 'system';
  sendOnEnter: boolean;
  showTokenCount: boolean;
  maxContextMessages: number;
  modelDirectories: string[];
  downloadConcurrency: number;
  defaultModelId?: string;
  defaultProviderId?: string;
}