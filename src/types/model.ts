// ── Model Types ──

export interface GgufModelInfo {
  path: string;
  filename: string;
  size_bytes: number;
  quantization: string | null;
  model_name: string | null;
  context_length: number | null;
}