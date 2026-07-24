use serde::Serialize;
use std::collections::HashMap;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter};
use uuid::Uuid;

/// Represents the status of a download operation.
#[derive(Debug, Clone, Serialize)]
pub struct DownloadProgress {
    pub download_id: String,
    pub filename: String,
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

/// Internal state for a running download.
struct DownloadTask {
    url: String,
    destination: String,
    client: reqwest::Client,
    abort_flag: bool,
    paused: bool,
    bytes_downloaded: u64,
    total_bytes: u64,
}

impl DownloadTask {
    fn new(url: String, destination: String) -> Self {
        Self {
            url,
            destination,
            client: reqwest::Client::new(),
            abort_flag: false,
            paused: false,
            bytes_downloaded: 0,
            total_bytes: 0,
        }
    }
}

lazy_static::lazy_static! {
    static ref DOWNLOADS: Mutex<HashMap<String, DownloadTask>> = Mutex::new(HashMap::new());
}

/// Start downloading a model from Hugging Face Hub.
#[tauri::command]
pub async fn download_model(
    app: AppHandle,
    url: String,
    destination: String,
    filename: String,
) -> Result<String, String> {
    let download_id = Uuid::new_v4().to_string();
    let task = DownloadTask::new(url.clone(), destination.clone());
    DOWNLOADS
        .lock()
        .map_err(|e| e.to_string())?
        .insert(download_id.clone(), task);

    let id_for_spawn = download_id.clone();
    let url_for_spawn = url.clone();
    let dest_for_spawn = destination.clone();
    let filename_for_spawn = filename.clone();

    tauri::async_runtime::spawn(async move {
        if let Err(e) = run_download(
            &app,
            &id_for_spawn,
            &url_for_spawn,
            &dest_for_spawn,
            &filename_for_spawn,
        )
        .await
        {
            emit_progress(
                &app,
                &id_for_spawn,
                &filename_for_spawn,
                0,
                0,
                0,
                DownloadStatus::Error,
                Some(e.to_string()),
            );
        }
    });

    Ok(download_id)
}

async fn run_download(
    app: &AppHandle,
    download_id: &str,
    url: &str,
    destination: &str,
    filename: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    use std::path::Path;
    use tokio::io::AsyncWriteExt;

    let path = Path::new(destination).join(filename);
    let existing_size = if path.exists() {
        std::fs::metadata(&path).map(|m| m.len()).unwrap_or(0)
    } else {
        0
    };

    let client = reqwest::Client::new();
    let mut headers = reqwest::header::HeaderMap::new();

    if existing_size > 0 {
        headers.insert(
            reqwest::header::RANGE,
            format!("bytes={}-", existing_size).parse().unwrap(),
        );
    }

    let response = client.get(url).headers(headers).send().await?;
    let total_size = response
        .content_length()
        .unwrap_or(0)
        .saturating_add(existing_size);

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }

    let file = tokio::fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(&path)
        .await?;

    let mut file = file;
    let mut downloaded: u64 = existing_size;
    let mut stream = response.bytes_stream();
    let mut last_emit_time = std::time::Instant::now();
    let start_time = std::time::Instant::now();

    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        {
            let downloads = DOWNLOADS.lock().map_err(|e| e.to_string())?;
            if let Some(task) = downloads.get(download_id) {
                if task.abort_flag {
                    return Ok(());
                }
            }
        }

        let chunk = chunk?;
        file.write_all(&chunk).await?;
        downloaded += chunk.len() as u64;

        if last_emit_time.elapsed() >= std::time::Duration::from_millis(250) {
            let elapsed = start_time.elapsed().as_secs_f64();
            let speed = if elapsed > 0.0 {
                (downloaded as f64 / elapsed) as u64
            } else {
                0
            };

            emit_progress(
                app,
                download_id,
                filename,
                downloaded,
                total_size,
                speed,
                DownloadStatus::Downloading,
                None,
            );
            last_emit_time = std::time::Instant::now();
        }

        {
            let downloads = DOWNLOADS.lock().map_err(|e| e.to_string())?;
            if let Some(task) = downloads.get(download_id) {
                if task.paused {
                    return Ok(());
                }
            }
        }
    }

    emit_progress(
        app,
        download_id,
        filename,
        downloaded,
        total_size,
        0,
        DownloadStatus::Completed,
        None,
    );

    DOWNLOADS
        .lock()
        .map_err(|e| e.to_string())?
        .remove(download_id);

    Ok(())
}

#[tauri::command]
pub fn pause_download(download_id: String) -> Result<(), String> {
    let mut downloads = DOWNLOADS.lock().map_err(|e| e.to_string())?;
    if let Some(task) = downloads.get_mut(&download_id) {
        task.paused = true;
        Ok(())
    } else {
        Err("Download not found".to_string())
    }
}

#[tauri::command]
pub fn cancel_download(download_id: String) -> Result<(), String> {
    let mut downloads = DOWNLOADS.lock().map_err(|e| e.to_string())?;
    if let Some(task) = downloads.get_mut(&download_id) {
        task.abort_flag = true;
        Ok(())
    } else {
        Err("Download not found".to_string())
    }
}

#[tauri::command]
pub fn get_download_status(_download_id: String) -> Result<Option<DownloadProgress>, String> {
    let _downloads = DOWNLOADS.lock().map_err(|e| e.to_string())?;
    Ok(None)
}

fn emit_progress(
    app: &AppHandle,
    download_id: &str,
    filename: &str,
    bytes_downloaded: u64,
    total_bytes: u64,
    speed: u64,
    status: DownloadStatus,
    error: Option<String>,
) {
    let _ = app.emit(
        "download-progress",
        DownloadProgress {
            download_id: download_id.to_string(),
            filename: filename.to_string(),
            bytes_downloaded,
            total_bytes,
            speed_bytes_per_sec: speed,
            status,
            error,
        },
    );
}
