import { useCallback } from 'react';
import { useDownloadStore } from '../stores/downloadStore';

export function useDownload() {
  const store = useDownloadStore();

  const startDownload = useCallback(
    (filename: string, totalBytes: number) => {
      return store.startDownload(filename, totalBytes);
    },
    [store.startDownload],
  );

  return {
    downloads: store.downloads,
    activeDownloadId: store.activeDownloadId,
    startDownload,
    pauseDownload: store.pauseDownload,
    cancelDownload: store.cancelDownload,
  };
}