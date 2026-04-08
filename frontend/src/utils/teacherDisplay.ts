/**
 * Professor workspace only: strip demo/student/admin placeholder names from persisted or API data.
 */
export function normalizeTeacherDisplayName(
  displayName: string | undefined,
  username: string | undefined,
  role: string | undefined
): string {
  const u = (username || '').trim().toLowerCase();
  const d = (displayName || '').trim();
  const dl = d.toLowerCase();

  if (role === 'student') {
    return 'Professor';
  }

  if (u === 'student' || u === 'admin' || u === 'demo' || u.includes('student_demo') || u.includes('admin_demo')) {
    return 'Professor';
  }

  if (
    dl === 'student demo' ||
    dl === 'teacher demo' ||
    dl === 'admin demo' ||
    dl === 'admin' ||
    dl === 'student' ||
    dl.includes('student demo') ||
    dl.includes('admin demo')
  ) {
    return 'Professor';
  }

  if (dl.endsWith(' demo')) {
    const stripped = d.replace(/\s+demo\s*$/i, '').trim();
    return stripped || 'Professor';
  }

  return d || (username || '').trim() || 'Professor';
}
