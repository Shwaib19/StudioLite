import { useDownload } from '../../hooks/useDownload';

export default function ModelDownloader() {
  const { downloads, pauseDownload, cancelDownload } = useDownload();

  if (downloads.length === 0) return null;

  return (
    <div className="border-t border-neutral-200 dark:border-dark-border bg-white dark:bg-dark-card p-3">
      <h3 className="text-xs font-medium text-neutral-400 dark:text-dark-text-secondary mb-2 uppercase tracking-wider">
        Downloads
      </h3>
      <div className="space-y-2">
        {downloads.map((dl) => (
          <div key={dl.id} className="text-sm">
            <div className="flex items-center justify-between mb-1">
              <span className="truncate max-w-[200px]">{dl.filename}</span>
              <span className="text-xs text-neutral-400">{dl.status}</span>
            </div>
            <div className="w-full h-1.5 rounded-full bg-neutral-200 dark:bg-dark-border overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all"
                style={{
                  width: dl.totalBytes > 0
                    ? `${Math.min((dl.bytesDownloaded / dl.totalBytes) * 100, 100)}%`
                    : '0%',
                }}
              />
            </div>
            <div className="flex items-center justify-between mt-0.5">
              <span className="text-xs text-neutral-400">
                {(dl.bytesDownloaded / 1024 / 1024).toFixed(1)} MB / {(dl.totalBytes / 1024 / 1024).toFixed(1)} MB
              </span>
              <div className="flex gap-2">
                {dl.status === 'downloading' && (
                  <button
                    onClick={() => pauseDownload(dl.id)}
                    className="text-xs text-neutral-400 hover:text-white cursor-pointer"
                  >
                    Pause
                  </button>
                )}
                <button
                  onClick={() => cancelDownload(dl.id)}
                  className="text-xs text-error hover:text-red-400 cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}