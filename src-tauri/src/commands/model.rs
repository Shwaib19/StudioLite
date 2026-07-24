use crate::config::load_config;
use serde::Serialize;
use std::fs;
use std::io::Read;
use std::path::Path;
use tauri::AppHandle;

/// Parsed information from a GGUF model file header.
#[derive(Debug, Clone, Serialize)]
pub struct GgufModelInfo {
    pub path: String,
    pub filename: String,
    pub size_bytes: u64,
    pub quantization: Option<String>,
    pub model_name: Option<String>,
    pub context_length: Option<u32>,
}

/// List all GGUF models from all configured directories.
#[tauri::command]
pub fn list_gguf_models(app: AppHandle) -> Result<Vec<GgufModelInfo>, String> {
    let config = load_config(app)?;
    let mut models = Vec::new();

    for dir_path in &config.model_directories {
        let dir = Path::new(dir_path);
        if !dir.exists() || !dir.is_dir() {
            continue;
        }

        let entries = scan_dir_for_gguf(dir)?;
        models.extend(entries);
    }

    Ok(models)
}

/// Get detailed info about a specific GGUF model file.
#[tauri::command]
pub fn get_model_info(path: String) -> Result<GgufModelInfo, String> {
    let file_path = Path::new(&path);
    if !file_path.exists() {
        return Err(format!("File not found: {}", path));
    }

    let metadata =
        fs::metadata(file_path).map_err(|e| format!("Failed to read metadata: {}", e))?;

    let filename = file_path
        .file_name()
        .map(|n| n.to_string_lossy().to_string())
        .unwrap_or_default();

    let quantization = detect_quantization(&filename);

    // Basic GGUF header parsing to extract model name and context length
    let (model_name, context_length) = parse_gguf_header(file_path).ok().unwrap_or_default();

    Ok(GgufModelInfo {
        path,
        filename,
        size_bytes: metadata.len(),
        quantization,
        model_name,
        context_length,
    })
}

fn scan_dir_for_gguf(dir: &Path) -> Result<Vec<GgufModelInfo>, String> {
    let mut models = Vec::new();

    if dir.is_dir() {
        for entry in fs::read_dir(dir).map_err(|e| format!("Read dir failed: {}", e))? {
            let entry = entry.map_err(|e| format!("Entry error: {}", e))?;
            let path = entry.path();

            if path.is_dir() {
                let sub_models = scan_dir_for_gguf(&path)?;
                models.extend(sub_models);
            } else if let Some(ext) = path.extension() {
                if ext == "gguf" {
                    let metadata =
                        fs::metadata(&path).map_err(|e| format!("Metadata error: {}", e))?;
                    let filename = path
                        .file_name()
                        .map(|n| n.to_string_lossy().to_string())
                        .unwrap_or_default();
                    let quantization = detect_quantization(&filename);

                    models.push(GgufModelInfo {
                        path: path.to_string_lossy().to_string(),
                        filename,
                        size_bytes: metadata.len(),
                        quantization,
                        model_name: None,
                        context_length: None,
                    });
                }
            }
        }
    }

    Ok(models)
}

/// Basic GGUF header parser.
/// GGUF format: magic (4 bytes) + version (u32) + tensor_count (u64) + metadata_kv_count (u64) + metadata
fn parse_gguf_header(path: &Path) -> Result<(Option<String>, Option<u32>), ()> {
    use std::io::BufReader;

    let file = fs::File::open(path).map_err(|_| ())?;
    let mut reader = BufReader::new(file);

    // Read magic bytes
    let mut magic = [0u8; 4];
    reader.read_exact(&mut magic).map_err(|_| ())?;

    // Validate GGUF magic (GGUF = 0x46554747 in little-endian)
    if magic != [0x47, 0x47, 0x55, 0x46] {
        return Err(());
    }

    // Read version (u32 LE)
    let mut version_bytes = [0u8; 4];
    reader.read_exact(&mut version_bytes).map_err(|_| ())?;
    let _version = u32::from_le_bytes(version_bytes);

    // Read tensor_count (u64 LE)
    let mut tensor_count_bytes = [0u8; 8];
    reader.read_exact(&mut tensor_count_bytes).map_err(|_| ())?;
    let _tensor_count = u64::from_le_bytes(tensor_count_bytes);

    // Read metadata_kv_count (u64 LE)
    let mut kv_count_bytes = [0u8; 8];
    reader.read_exact(&mut kv_count_bytes).map_err(|_| ())?;
    let kv_count = u64::from_le_bytes(kv_count_bytes);

    let mut model_name = None;
    let mut context_length = None;

    // Parse metadata key-value pairs
    for _ in 0..kv_count {
        // Read key string
        let key = read_gguf_string(&mut reader)?;

        // Read value type
        let mut value_type_bytes = [0u8; 4];
        reader.read_exact(&mut value_type_bytes).map_err(|_| ())?;
        let value_type = u32::from_le_bytes(value_type_bytes);

        // Read value based on type
        match key.as_str() {
            "general.name" => {
                if value_type == 8 {
                    // string type
                    model_name = Some(read_gguf_string(&mut reader)?);
                }
            }
            "llama.context_length" | "gpt2.n_positions" | "bert.max_position_embeddings" => {
                if value_type == 2 {
                    // uint32 type
                    let mut val_bytes = [0u8; 4];
                    reader.read_exact(&mut val_bytes).map_err(|_| ())?;
                    context_length = Some(u32::from_le_bytes(val_bytes));
                }
            }
            _ => {
                // Skip unknown values
                skip_gguf_value(&mut reader, value_type)?;
            }
        }
    }

    Ok((model_name, context_length))
}

fn read_gguf_string(reader: &mut impl Read) -> Result<String, ()> {
    let mut len_bytes = [0u8; 8];
    reader.read_exact(&mut len_bytes).map_err(|_| ())?;
    let len = u64::from_le_bytes(len_bytes) as usize;

    let mut buf = vec![0u8; len];
    reader.read_exact(&mut buf).map_err(|_| ())?;

    String::from_utf8(buf).map_err(|_| ())
}

fn skip_gguf_value(reader: &mut impl Read, value_type: u32) -> Result<(), ()> {
    match value_type {
        0 => {} // uint8 (0 bytes, stored in value_type field itself)
        1 => {
            let mut buf = [0u8; 1];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // int8
        2 => {
            let mut buf = [0u8; 4];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // uint16/uint32
        3 => {
            let mut buf = [0u8; 4];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // float32
        4 => {
            let mut buf = [0u8; 1];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // bool
        5 => {
            let mut buf = [0u8; 8];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // uint64
        6 => {
            let mut buf = [0u8; 8];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // float64
        7 => {
            let mut buf = [0u8; 8];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // int64
        8 => {
            read_gguf_string(reader)?;
        } // string
        9 => {
            // array
            let mut type_bytes = [0u8; 4];
            reader.read_exact(&mut type_bytes).map_err(|_| ())?;
            let arr_type = u32::from_le_bytes(type_bytes);
            let mut len_bytes = [0u8; 8];
            reader.read_exact(&mut len_bytes).map_err(|_| ())?;
            let arr_len = u64::from_le_bytes(len_bytes);
            for _ in 0..arr_len {
                skip_gguf_value(reader, arr_type)?;
            }
        }
        10 => {
            let mut buf = [0u8; 4];
            reader.read_exact(&mut buf).map_err(|_| ())?;
        } // uint32
        _ => return Err(()),
    }
    Ok(())
}

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
