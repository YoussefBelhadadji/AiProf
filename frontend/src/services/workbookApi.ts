import type { ParsedWorkbookCaseResponse } from '../store/studyScope';
import { useAuthStore } from '../store/authStore';

const DEFAULT_API_BASE = import.meta.env.DEV ? 'http://127.0.0.1:5000' : '';
const API_BASE = (import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE).replace(/\/$/, '');

interface UploadDatasetResponse {
  message: string;
  workbookCount?: number;
  studentCount: number;
  cases?: ParsedWorkbookCaseResponse[];
}

function extractCases(payload: (UploadDatasetResponse & ParsedWorkbookCaseResponse)): ParsedWorkbookCaseResponse[] {
  if (Array.isArray(payload.cases) && payload.cases.length > 0) {
    return payload.cases;
  }

  if (payload.meta && Array.isArray(payload.data)) {
    return [payload];
  }

  throw new Error('The backend response did not include parsed workbook cases.');
}

export async function uploadWorkbooks(files: File[]): Promise<ParsedWorkbookCaseResponse[]> {
  const formData = new FormData();
  for (const file of files) {
    formData.append('files', file);
  }

  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_BASE}/api/upload-dataset`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Upload failed.' }));
    throw new Error(errorPayload.error ?? 'Upload failed.');
  }

  const payload = (await response.json()) as UploadDatasetResponse & ParsedWorkbookCaseResponse;
  return extractCases(payload);
}

export async function autoLoadWorkbook(): Promise<ParsedWorkbookCaseResponse[]> {
  const token = useAuthStore.getState().token;
  const response = await fetch(`${API_BASE}/api/auto-load`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Auto-load failed.' }));
    throw new Error(errorPayload.error ?? 'Auto-load failed.');
  }

  const payload = (await response.json()) as UploadDatasetResponse & ParsedWorkbookCaseResponse;
  return extractCases(payload);
}
