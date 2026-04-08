import { useAuthStore } from '../store/authStore';

const _DEFAULT_EXPORT_BASE = import.meta.env.DEV ? 'http://127.0.0.1:5000' : '';
export const EXPORT_API_URL = `${(import.meta.env.VITE_API_URL ?? _DEFAULT_EXPORT_BASE).replace(/\/$/, '')}/api/reports/export`;

export async function downloadExportCsv() {
  const token = useAuthStore.getState().token;
  if (!token) throw new Error("Authentication required");

  const res = await fetch(EXPORT_API_URL, {
    method: 'GET',
    headers: { 'Authorization': `Bearer ${token}` }
  });

  if (!res.ok) {
    let errorMsg = res.statusText;
    try {
      const data = await res.json();
      if (data.error) errorMsg = data.error;
    } catch {}
    throw new Error(`Failed to export: ${errorMsg}`);
  }

  const blob = await res.blob();
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `writelens_export_${new Date().toISOString().split('T')[0]}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.URL.revokeObjectURL(url);
}
