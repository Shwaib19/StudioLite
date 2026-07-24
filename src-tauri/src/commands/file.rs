use crate::config::load_config;
use serde::Serialize;
use std::fs;
use std::path::Path;
use tauri::AppHandle;

/// Represents a GGUF model file found during scanning.
#[derive(Debug, Clone, Serialize)]
pub struct ModelFileEntry {
    pub path: String,
    pub filename: String,
    pub size: u64,
    pub quantization: Option<String>,
}

/// List all configured model directories.
#[tauri::command]
pub fn list_model_directories(app: AppHandle) -> Result<Vec<String>, String> {
    let config = load_config(app)?;
    Ok(config.model_directories)
}

/// Add a new model directory to the configuration.
#[tauri::command]
pub fn add_model_directory(app: AppHandle, path: String) -> Result<Vec<String>, String> {
    let path_obj = Path::new(&path);
    if !path_obj.exists() {
        return Err(format!("Path does not exist: {}", path));
    }
    if !path_obj.is_dir() {
        return Err(format!("Path is not a directory: {}", path));
    }

    let mut config = load_config(app.clone())?;

    let canonical = fs::canonicalize(&path)
        .map_err(|e| format!("Failed to canonicalize path: {}", e))?
        .to_string_lossy()
        .to_string();

    if !config.model_directories.contains(&canonical) {
        config.model_directories.push(canonical);
    }

    let dirs = config.model_directories.clone();
    crate::config::save_config(app, config)?;
    Ok(dirs)
}

/// Remove a model directory from the configuration.
#[tauri::command]
pub fn remove_model_directory(app: AppHandle, path: String) -> Result<Vec<String>, String> {
    let mut config = load_config(app.clone())?;
    config.model_directories.retain(|d| d != &path);
    let dirs = config.model_directories.clone();
    crate::config::save_config(app, config)?;
    Ok(dirs)
}

/// Scan a directory recursively for GGUF files.
#[tauri::command]
pub fn scan_directory_for_gguf(path: String) -> Result<Vec<ModelFileEntry>, String> {
    let dir = Path::new(&path);
    if !dir.exists() || !dir.is_dir() {
        return Err(format!("Invalid directory: {}", path));
    }

    let mut entries = Vec::new();
    scan_dir_recursive(dir, &mut entries).map_err(|e| format!("Scan failed: {}", e))?;

    Ok(entries)
}

fn scan_dir_recursive(dir: &Path, entries: &mut Vec<ModelFileEntry>) -> Result<(), std::io::Error> {
    if dir.is_dir() {
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();

            if path.is_dir() {
                scan_dir_recursive(&path, entries)?;
            } else if let Some(ext) = path.extension() {
                if ext == "gguf" {
                    let metadata = fs::metadata(&path)?;
                    let filename = path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    let quantization = detect_quantization(&filename);
                    entries.push(ModelFileEntry {
                        path: path.to_string_lossy().to_string(),
                        filename,
                        size: metadata.len(),
                        quantization,
                    });
                }
            }
        }
    }
    Ok(())
}

/// Detect quantization from GGUF filename (e.g., "Q4_K_M", "Q5_K_M", "Q8_0").
fn detect_quantization(filename: &str) -> Option<String> {
    let patterns = [
        "Q2_K", "Q3_K_S", "Q3_K_M", "Q3_K_L", "Q4_0", "Q4_1", "Q4_K_S", "Q4_K_M", "Q5_0", "Q5_1",
        "Q5_K_S", "Q5_K_M", "Q6_K", "Q8_0", "BF16", "FP16", "FP32",
    ];

    for pattern in &patterns {
        if filename.contains(pattern) {
            return Some(pattern.to_string());
        }
    }
    None
}
