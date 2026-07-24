use serde::Serialize;
use sysinfo::System;

/// System resource information for model selection guidance.
#[derive(Debug, Clone, Serialize)]
pub struct SystemInfo {
    pub total_ram_gb: u64,
    pub available_ram_gb: u64,
    pub cpu_cores: usize,
    pub cpu_brand: String,
    pub os_name: String,
    pub os_version: String,
}

/// Get system information (RAM, CPU, OS).
#[tauri::command]
pub fn get_system_info() -> Result<SystemInfo, String> {
    let mut sys = System::new_all();
    sys.refresh_all();

    let total_ram = sys.total_memory() / 1024; // MB
    let available_ram = sys.available_memory() / 1024; // MB
    let cpu_cores = sys.physical_core_count().unwrap_or(0);
    let cpu_brand = sys.global_cpu_info().brand().to_string();

    let os_name = std::env::consts::OS.to_string();
    let os_version = System::long_os_version().unwrap_or_else(|| "Unknown".to_string());

    Ok(SystemInfo {
        total_ram_gb: total_ram / 1024,         // Convert to GB
        available_ram_gb: available_ram / 1024, // Convert to GB
        cpu_cores,
        cpu_brand,
        os_name,
        os_version,
    })
}
