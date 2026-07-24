// Download manager module - will be fully implemented in Phase 6
// Stub module for dependency resolution during compilation

use serde::Serialize;

/// Represents the status of a download operation.
#[derive(Debug, Clone, Serialize)]
pub struct DownloadProgress {
    pub download_id: String,
    pub bytes_downloaded: u64,
    pub total_bytes: u64,
    pub speed_bytes_per_sec: u64,
    pub status: DownloadStatus,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub enum DownloadStatus {
    Downloading,
    Paused,
    Completed,
    Error,
}
