import { useAuthStore } from '../store/authStore';

const DEFAULT_API_BASE = import.meta.env.DEV ? 'http://127.0.0.1:5000' : '';
const API_BASE = (import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE).replace(/\/$/, '');

export interface PipelineResponse {
  result_csv: string;
  stdout: string;
}

export async function runPipeline(files: File[]): Promise<PipelineResponse> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file, file.name);
  }

  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_BASE}/api/run-pipeline`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Pipeline execution failed.' }));
    const missingFiles = Array.isArray(errorPayload.missing_files) ? errorPayload.missing_files.join(', ') : '';
    const details = typeof errorPayload.details === 'string' ? errorPayload.details : '';
    const message =
      missingFiles
        ? `${errorPayload.error ?? 'Pipeline execution failed.'} Missing: ${missingFiles}.`
        : details
          ? `${errorPayload.error ?? 'Pipeline execution failed.'} ${details}`
          : errorPayload.error ?? 'Pipeline execution failed.';
    throw new Error(message);
  }

  return response.json();
}
