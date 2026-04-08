/**
 * localJourneyData.ts
 *
 * Smart data loader that works in both dev and prod environments:
 *
 * Dev Mode (Vite):
 *   - Tries to load from public/data folder first (works locally)
 *   - Falls back to @fs URLs if public path fails
 *
 * Prod Mode (Vercel/Static):
 *   - Loads from /data folder (public assets)
 *   - Must be deployed with data in frontend/public/data/
 */

const DATA_BASE_URL = `${import.meta.env.BASE_URL}data`;

// Fallback for dev: try direct filesystem access via Vite @fs
const DATA_ROOT_ABS_DEV =
  '/home/youcef-bl/Documents/Prof_English/Adaptive-Blended-Assessment-/submission_journey_latest';

function toFsUrl(absPath: string) {
  // Vite dev-only filesystem serving: requires server.fs.allow in vite config.
  return `/@fs${absPath}`;
}

export async function fetchLocalJourneyJson<T>(relPath: string): Promise<T> {
  const clean = relPath.replace(/^\/+/, '');

  // Strategy: Try public path first (works both dev and prod)
  const publicUrl = `${DATA_BASE_URL}/submission_journey_latest/${clean}`;
  try {
    const res = await fetch(publicUrl);
    if (res.ok) {
      return res.json() as Promise<T>;
    }
  } catch (err) {
    if (import.meta.env.DEV) {
      // Fall through to filesystem access
    } else {
      // In prod, if public path fails, we must report error
      throw new Error(
        `Data file not found: ${publicUrl}\n\nEnsure frontend/public/data/submission_journey_latest/ is deployed.`
      );
    }
  }

  // Dev fallback: try direct filesystem access via Vite @fs
  if (import.meta.env.DEV) {
    const abs = `${DATA_ROOT_ABS_DEV}/${clean}`;
    try {
      const res = await fetch(toFsUrl(abs));
      if (res.ok) {
        return res.json() as Promise<T>;
      }
    } catch (err) {
      // Fall through to error
    }
  }

  throw new Error(
    `Local journey data unavailable: ${clean}\n\n` +
    'Dev: Check Vite server.fs.allow config or ensure data is in public/data folder.\n' +
    'Prod: Ensure frontend/public/data/submission_journey_latest/ is deployed.'
  );
}

