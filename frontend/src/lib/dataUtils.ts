/**
 * dataUtils.ts
 *
 * Centralized helpers for loading WriteLens data from public/data folder.
 * Works in both development (Vite) and production (Vercel/static).
 *
 * Data is served from:
 *   - Dev/Prod (public assets): /data/submission_journey_latest/
 *   - Dev/Prod (public assets): /data/RUN_20260408_020438/
 */

/**
 * Dynamically compute the data base URL based on environment and BASE_URL.
 * In production on Vercel, BASE_URL might have a path prefix (e.g., /my-app/).
 * We append /data to that.
 */
export const getDataBaseUrl = (): string => `${import.meta.env.BASE_URL}data`;

/**
 * Get the full URL for a file in the submission_journey_latest folder.
 * @param relativePath - Path relative to submission_journey_latest, e.g. "students/index.json"
 * @returns Full URL to the file
 */
export const getJourneyPath = (relativePath: string): string => {
  const base = getDataBaseUrl();
  const clean = relativePath.replace(/^\/+/, '');
  return `${base}/submission_journey_latest/${clean}`;
};

/**
 * Get the full URL for a file in the RUN_20260408_020438 folder.
 * @param relativePath - Path relative to RUN_20260408_020438, e.g. "groups/index.json"
 * @returns Full URL to the file
 */
export const getRunPath = (relativePath: string): string => {
  const base = getDataBaseUrl();
  const clean = relativePath.replace(/^\/+/, '');
  return `${base}/RUN_20260408_020438/${clean}`;
};

/**
 * Fetch JSON from the submission_journey_latest folder.
 * Includes error handling with deployment-friendly messages.
 * @param relativePath - Path relative to submission_journey_latest
 * @returns Parsed JSON object
 * @throws Error with helpful message if fetch fails
 */
export async function fetchJourneyJson<T>(relativePath: string): Promise<T> {
  const url = getJourneyPath(relativePath);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to load journey data: ${relativePath}\n` +
      `URL: ${url}\n` +
      `Reason: ${errorMsg}\n\n` +
      'Deployment Check:\n' +
      '✓ Is frontend/public/data/submission_journey_latest/ deployed?\n' +
      '✓ Does the file exist at the correct path?\n' +
      '✓ Check Vercel deployment logs for static file serving.'
    );
  }
}

/**
 * Fetch JSON from the RUN_20260408_020438 folder.
 * Includes error handling with deployment-friendly messages.
 * @param relativePath - Path relative to RUN_20260408_020438
 * @returns Parsed JSON object
 * @throws Error with helpful message if fetch fails
 */
export async function fetchRunJson<T>(relativePath: string): Promise<T> {
  const url = getRunPath(relativePath);
  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }
    return res.json() as Promise<T>;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    throw new Error(
      `Failed to load run data: ${relativePath}\n` +
      `URL: ${url}\n` +
      `Reason: ${errorMsg}\n\n` +
      'Deployment Check:\n' +
      '✓ Is frontend/public/data/RUN_20260408_020438/ deployed?\n' +
      '✓ Does the file exist at the correct path?\n' +
      '✓ Check Vercel deployment logs for static file serving.'
    );
  }
}

/**
 * Interface for a student index entry.
 */
export interface StudentIndexEntry {
  student_id: string;
  student_name: string;
  journey_path: string;
  ai_analysis_path: string;
  submissions_total: number;
  lessons_covered: number;
  progress_trend: string;
  ai_data_confidence: number;
}

/**
 * Load all students from the index.
 * @returns Array of student entries
 */
export async function loadAllStudents(): Promise<StudentIndexEntry[]> {
  return fetchJourneyJson<StudentIndexEntry[]>('students/index.json');
}

/**
 * Load a single student's AI analysis.
 * @param slugName - Directory slug name of the student, e.g. "john_doe" or "JOHN_DOE"
 * @returns AI analysis data
 */
export async function loadStudentAiAnalysis<T>(slugName: string): Promise<T> {
  return fetchJourneyJson<T>(`students/${slugName}/ai_analysis.json`);
}

/**
 * Load a single student's journey/portfolio data.
 * @param slugName - Directory slug name of the student
 * @returns Journey data with portfolio scores and progress
 */
export async function loadStudentJourney<T>(slugName: string): Promise<T> {
  return fetchJourneyJson<T>(`students/${slugName}/journey_full.json`);
}

/**
 * Load a single student's timeline (submissions).
 * @param slugName - Directory slug name of the student
 * @returns Timeline with submission history
 */
export async function loadStudentTimeline<T>(slugName: string): Promise<T> {
  return fetchJourneyJson<T>(`students/${slugName}/timeline.json`);
}

/**
 * Load the global summary stats.
 * @returns Summary with total students, submissions, trends, etc.
 */
export async function loadSummary<T>(): Promise<T> {
  return fetchJourneyJson<T>('shared/summary.json');
}

/**
 * Load a run's manifest or index.
 * @returns Run manifest data
 */
export async function loadRunManifest<T>(): Promise<T> {
  return fetchRunJson<T>('manifest.json');
}

/**
 * Load run groups data.
 * @returns Groups data from the run
 */
export async function loadRunGroups<T>(): Promise<T> {
  return fetchRunJson<T>('groups/index.json');
}

/**
 * Load run students data.
 * @returns Students data from the run
 */
export async function loadRunStudents<T>(): Promise<T> {
  return fetchRunJson<T>('students/index.json');
}

/**
 * Human-readable environment info for debugging deployment issues.
 */
export function getDataEnvironmentInfo(): Record<string, string> {
  return {
    'BASE_URL': import.meta.env.BASE_URL || '(not set)',
    'DEV': import.meta.env.DEV ? 'true' : 'false',
    'PROD': import.meta.env.PROD ? 'true' : 'false',
    'DATA_BASE_URL': getDataBaseUrl(),
    'JOURNEY_PATH_EXAMPLE': getJourneyPath('students/index.json'),
    'RUN_PATH_EXAMPLE': getRunPath('manifest.json'),
  };
}

/**
 * Log environment info to console (useful for debugging Vercel issues).
 * Only logs in dev mode to avoid console spam in production.
 */
export function debugDataEnvironment(): void {
  if (import.meta.env.DEV) {
    const info = getDataEnvironmentInfo();
    console.group('[WriteLens] Data Environment Info');
    Object.entries(info).forEach(([key, value]) => {
      console.log(`${key}: ${value}`);
    });
    console.groupEnd();
  }
}
