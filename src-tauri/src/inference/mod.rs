// Inference engine module - will be fully implemented in Phase 5
// Stub module for dependency resolution during compilation

use serde::Serialize;

/// Payload for inference token streaming events.
#[derive(Debug, Clone, Serialize)]
pub struct InferencePayload {
    pub token: String,
    pub is_final: bool,
    pub finish_reason: Option<String>,
}
