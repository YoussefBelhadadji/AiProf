// LEGACY - Moved during architecture refactor on 2026-04-08
// This was a duplicate of frontend/src/state/ — store/ was unused scaffolding.
// The real stores were in state/; they now live in store/ after consolidation.
/**
 * Frontend Store Index
 * Central export for all Zustand stores
 */

export { useAuthStore } from './authStore'
export { useStudyScope } from './studyScope'

// Student store (if exists)
// export { useStudentStore } from './studentStore'

// Pipeline store (if exists)
// export { usePipelineStore } from './pipelineStore'
