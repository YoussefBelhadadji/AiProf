import type { ParsedWorkbookCaseResponse } from '../state/studyScope';

const DEFAULT_API_BASE = import.meta.env.DEV ? 'http://127.0.0.1:3001' : '';
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

async function uploadSingleWorkbook(file: File): Promise<ParsedWorkbookCaseResponse[]> {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/api/upload-dataset`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Upload failed.' }));
    throw new Error(errorPayload.error ?? 'Upload failed.');
  }

  const payload = (await response.json()) as UploadDatasetResponse & ParsedWorkbookCaseResponse;
  return extractCases(payload);
}

export async function uploadWorkbooks(files: File[]): Promise<ParsedWorkbookCaseResponse[]> {
  const parsedCases: ParsedWorkbookCaseResponse[] = [];

  for (const file of files) {
    const cases = await uploadSingleWorkbook(file);
    parsedCases.push(...cases);
  }

  if (parsedCases.length > 0) {
    return parsedCases;
  }

  throw new Error('No workbook cases were returned by the backend.');
}
