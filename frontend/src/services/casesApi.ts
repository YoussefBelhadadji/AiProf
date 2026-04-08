import type { ParsedWorkbookCaseResponse } from '../store/studyScope';

const DEFAULT_API_BASE = import.meta.env.DEV ? 'http://127.0.0.1:5000' : '';
const API_BASE = (import.meta.env.VITE_API_URL ?? DEFAULT_API_BASE).replace(/\/$/, '');

interface CasesResponse {
  count: number;
  cases: ParsedWorkbookCaseResponse[];
  message?: string;
}

export async function fetchCases(token: string): Promise<ParsedWorkbookCaseResponse[]> {
  const response = await fetch(`${API_BASE}/api/cases`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Failed to fetch cases.' }));
    throw new Error(errorPayload.error ?? 'Failed to fetch cases.');
  }

  const payload = (await response.json()) as CasesResponse;
  return Array.isArray(payload.cases) ? payload.cases : [];
}

export async function autoLoadCases(token: string): Promise<ParsedWorkbookCaseResponse[]> {
  const response = await fetch(`${API_BASE}/api/auto-load`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorPayload = await response.json().catch(() => ({ error: 'Auto-load failed.' }));
    throw new Error(errorPayload.error ?? 'Auto-load failed.');
  }

  const payload = (await response.json()) as { cases?: ParsedWorkbookCaseResponse[] } & ParsedWorkbookCaseResponse;
  if (Array.isArray(payload.cases)) {
    return payload.cases;
  }

  if ((payload as ParsedWorkbookCaseResponse).meta && Array.isArray((payload as ParsedWorkbookCaseResponse).data)) {
    return [payload as ParsedWorkbookCaseResponse];
  }

  return [];
}
