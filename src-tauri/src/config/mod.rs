use serde::{Deserialize, Serialize};
use tauri::AppHandle;
use tauri_plugin_store::StoreExt;

/// Application configuration persisted to disk via tauri-plugin-store.
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AppConfig {
    /// Theme preference
    pub theme: String,
    /// Font size in pixels
    pub font_size: u32,
    /// Directories to scan for GGUF model files
    pub model_directories: Vec<String>,
    /// Maximum concurrent downloads
    pub download_concurrency: u32,
}

impl Default for AppConfig {
    fn default() -> Self {
        Self {
            theme: "system".to_string(),
            font_size: 14,
            model_directories: Vec::new(),
            download_concurrency: 2,
        }
    }
}

/// Load the application configuration from the Tauri store.
#[tauri::command]
pub fn load_config(app: AppHandle) -> Result<AppConfig, String> {
    let store = app
        .store("settings.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let config: AppConfig = store
        .get("app_config")
        .map(|v| serde_json::from_value(v.clone()).unwrap_or_default())
        .unwrap_or_default();

    Ok(config)
}

/// Save the application configuration to the Tauri store.
#[tauri::command]
pub fn save_config(app: AppHandle, config: AppConfig) -> Result<(), String> {
    let store = app
        .store("settings.json")
        .map_err(|e| format!("Failed to open store: {}", e))?;

    let value = serde_json::to_value(&config).map_err(|e| format!("Serialization error: {}", e))?;
    store.set("app_config", value);
    store
        .save()
        .map_err(|e| format!("Failed to save store: {}", e))?;

    Ok(())
}
