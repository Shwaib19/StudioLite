// ── Tauri IPC Types ──

export interface InferencePayload {
  token: string;
  is_final: boolean;
  finish_reason?: 'stop' | 'length' | 'error';
}

export interface DownloadProgressPayload {
  downloadId: string;
  bytesDownloaded: number;
  totalBytes: number;
  speed: number; // bytes per second
  status: 'downloading' | 'paused' | 'completed' | 'error';
  error?: string;
}

export interface ModelListEntry {
  path: string;
  filename: string;
  size: number;
  quantization?: string;
  modelName?: string;
}

export interface SystemInfo {
  total_ram_gb: number;
  available_ram_gb: number;
  cpu_cores: number;
  cpu_brand: string;
  os_name: string;
  os_version: string;
}