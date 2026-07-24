mod commands;
mod config;
mod download;
mod inference;

use commands::file::{
    add_model_directory, list_model_directories, remove_model_directory, scan_directory_for_gguf,
};
use commands::model::{get_model_info, list_gguf_models};
use commands::system::get_system_info;
use config::{load_config, save_config};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        // Tauri plugins
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_http::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        // Config commands
        .invoke_handler(tauri::generate_handler![
            load_config,
            save_config,
            // Filesystem commands
            list_model_directories,
            add_model_directory,
            remove_model_directory,
            scan_directory_for_gguf,
            // Model commands
            list_gguf_models,
            get_model_info,
            // System commands
            get_system_info,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
