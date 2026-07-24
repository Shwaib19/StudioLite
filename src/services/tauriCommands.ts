import { invoke } from '@tauri-apps/api/core';
import type { SystemInfo, ModelListEntry } from '../types/tauri';

// ── Config Commands ──

export interface AppConfig {
  theme: string;
  font_size: number;
  model_directories: string[];
  download_concurrency: number;
}

export async function loadConfig(): Promise<AppConfig> {
  try {
    return await invoke<AppConfig>('load_config');
  } catch {
    return {
      theme: 'system',
      font_size: 14,
      model_directories: [],
      download_concurrency: 2,
    };
  }
}

export async function saveConfig(config: AppConfig): Promise<void> {
  await invoke('save_config', { config });
}

// ── Filesystem Commands ──

export async function listModelDirectories(): Promise<string[]> {
  return invoke<string[]>('list_model_directories');
}

export async function addModelDirectory(path: string): Promise<string[]> {
  return invoke<string[]>('add_model_directory', { path });
}

export async function removeModelDirectory(path: string): Promise<string[]> {
  return invoke<string[]>('remove_model_directory', { path });
}

export async function scanDirectoryForGguf(path: string): Promise<ModelListEntry[]> {
  return invoke<ModelListEntry[]>('scan_directory_for_gguf', { path });
}

// ── Model Commands ──

export async function listGgufModels(): Promise<ModelListEntry[]> {
  return invoke<ModelListEntry[]>('list_gguf_models');
}

export async function getModelInfo(path: string): Promise<ModelListEntry> {
  return invoke<ModelListEntry>('get_model_info', { path });
}

// ── System Commands ──

export async function getSystemInfo(): Promise<SystemInfo> {
  return invoke<SystemInfo>('get_system_info');
}

// ── Download Commands ──

export interface DownloadResult {
  download_id: string;
}

export async function downloadModel(
  url: string,
  destination: string,
  filename: string,
): Promise<string> {
  return invoke<string>('download_model', { url, destination, filename });
}

export async function pauseDownload(downloadId: string): Promise<void> {
  await invoke('pause_download', { downloadId });
}

export async function cancelDownload(downloadId: string): Promise<void> {
  await invoke('cancel_download', { downloadId });
}