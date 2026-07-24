// ── Hugging Face Hub API Client ──

const HF_API_BASE = 'https://huggingface.co/api';

export interface HfModel {
  id: string;
  modelId: string;
  author: string;
  downloads: number;
  likes: number;
  pipeline_tag: string | null;
  description: string | null;
}

export interface HfFile {
  path: string;
  size: number;
  type: 'file' | 'directory';
}

/** Search models on Hugging Face Hub, filtered for GGUF format. */
export async function searchModels(query: string, limit = 20): Promise<HfModel[]> {
  const url = `${HF_API_BASE}/models?search=${encodeURIComponent(query)}&filter=gguf&limit=${limit}&sort=downloads`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HF Hub search failed: ${response.status}`);
  }

  const data = await response.json();
  return (data || []).map((model: any) => ({
    id: model.id,
    modelId: model.modelId || model.id,
    author: model.author || 'unknown',
    downloads: model.downloads || 0,
    likes: model.likes || 0,
    pipeline_tag: model.pipeline_tag || null,
    description: model.description || null,
  }));
}

/** List files for a specific model on the Hub. */
export async function listModelFiles(modelId: string): Promise<HfFile[]> {
  const url = `${HF_API_BASE}/models/${modelId}/tree/main`;

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to list model files: ${response.status}`);
  }

  const data = await response.json();
  return (data || []).map((file: any) => ({
    path: file.path,
    size: file.size || 0,
    type: file.type || 'file',
  }));
}

/** Get GGUF quantization files for a model. */
export async function getGgufFiles(modelId: string): Promise<HfFile[]> {
  const files = await listModelFiles(modelId);
  return files.filter((f) => f.path.endsWith('.gguf') && f.type === 'file')
    .sort((a, b) => b.size - a.size);
}

/** Build a download URL for a model file from Hugging Face. */
export function getDownloadUrl(modelId: string, filePath: string): string {
  return `https://huggingface.co/${modelId}/resolve/main/${filePath}`;
}