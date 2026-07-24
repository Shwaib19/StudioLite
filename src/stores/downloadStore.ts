import { create } from 'zustand';
import { generateId } from '../utils/idGenerator';

interface DownloadItem {
  id: string;
  filename: string;
  bytesDownloaded: number;
  totalBytes: number;
  speed: number; // bytes per second
  status: 'queued' | 'downloading' | 'paused' | 'completed' | 'error';
  error?: string;
}

interface DownloadState {
  downloads: DownloadItem[];
  activeDownloadId: string | null;

  // Actions
  startDownload: (filename: string, totalBytes: number) => string;
  updateProgress: (id: string, bytesDownloaded: number, speed: number) => void;
  pauseDownload: (id: string) => void;
  cancelDownload: (id: string) => void;
  completeDownload: (id: string) => void;
  failDownload: (id: string, error: string) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  downloads: [],
  activeDownloadId: null,

  startDownload: (filename, totalBytes) => {
    const id = generateId();
    const download: DownloadItem = {
      id,
      filename,
      bytesDownloaded: 0,
      totalBytes,
      speed: 0,
      status: 'queued',
    };
    set((state) => ({
      downloads: [...state.downloads, download],
      activeDownloadId: id,
    }));
    return id;
  },

  updateProgress: (id, bytesDownloaded, speed) => {
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, bytesDownloaded, speed, status: 'downloading' as const } : d,
      ),
    }));
  },

  pauseDownload: (id) => {
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, status: 'paused' as const } : d,
      ),
    }));
  },

  cancelDownload: (id) => {
    set((state) => ({
      downloads: state.downloads.filter((d) => d.id !== id),
      activeDownloadId:
        state.activeDownloadId === id ? null : state.activeDownloadId,
    }));
  },

  completeDownload: (id) => {
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, status: 'completed' as const, bytesDownloaded: d.totalBytes } : d,
      ),
      activeDownloadId: null,
    }));
  },

  failDownload: (id, error) => {
    set((state) => ({
      downloads: state.downloads.map((d) =>
        d.id === id ? { ...d, status: 'error' as const, error } : d,
      ),
      activeDownloadId: null,
    }));
  },
}));