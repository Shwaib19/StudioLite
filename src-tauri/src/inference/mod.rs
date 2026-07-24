// Inference engine module — will be fully implemented in a future phase
// Stub module for dependency resolution during compilation

use serde::Serialize;

/// Payload for inference token streaming events.
#[derive(Debug, Clone, Serialize)]
#[allow(dead_code)]
pub struct InferencePayload {
    pub token: String,
    pub is_final: bool,
    pub finish_reason: Option<String>,
}
