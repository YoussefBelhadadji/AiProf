/**
 * WriteLens – Learner Zustand Store
 *
 * Central state for the Learners feature:
 *  - Student index (list page)
 *  - Selected student + cached profiles
 *  - Selected station + cached station details
 */

import { create } from 'zustand';
import {
  fetchStudentIndex,
  fetchStudentProfile,
  fetchStationDetail,
  MOCK_STUDENTS,
} from './learnerLoader';
import type { LearnerStoreState, StudentProfile, StationDetail } from './types';

export const useLearnerStore = create<LearnerStoreState>((set, get) => ({
  // ── State ─────────────────────────────────────────────────────────────────
  studentIndex: [],
  isLoadingIndex: false,
  indexError: null,

  selectedStudentId: null,
  profileCache: {},
  isLoadingProfile: false,
  profileError: null,

  selectedStationId: null,
  stationDetailCache: {},
  isLoadingStation: false,
  stationError: null,

  // ── Actions ───────────────────────────────────────────────────────────────

  /** Load the flat student list; falls back to mock data on network error */
  loadIndex: async () => {
    if (get().studentIndex.length > 0) return; // already loaded
    set({ isLoadingIndex: true, indexError: null });
    try {
      const data = await fetchStudentIndex();
      set({ studentIndex: data, isLoadingIndex: false });
    } catch (err) {
      console.warn('[useLearnerStore] Could not fetch student index, using mock data:', err);
      set({ studentIndex: MOCK_STUDENTS, isLoadingIndex: false, indexError: null });
    }
  },

  /** Set selected student and pre-load their profile */
  selectStudent: (id: string) => {
    set({ selectedStudentId: id, selectedStationId: null });
  },

  /** Fetch and cache a student profile JSON */
  loadProfile: async (profilePath: string, studentId: string) => {
    // Return cached version if available
    if (get().profileCache[studentId]) return;

    set({ isLoadingProfile: true, profileError: null });
    try {
      const profile = await fetchStudentProfile(profilePath);
      set((state) => ({
        profileCache: { ...state.profileCache, [studentId]: profile as StudentProfile },
        isLoadingProfile: false,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load profile';
      console.error('[useLearnerStore] loadProfile error:', msg);
      set({ isLoadingProfile: false, profileError: msg });
    }
  },

  /** Set which station card is active in the detail panel */
  selectStation: (stationId: string | null) => {
    set({ selectedStationId: stationId, stationError: null });
  },

  /** Fetch and cache a station detail JSON */
  loadStationDetail: async (detailPath: string, cacheKey: string) => {
    if (get().stationDetailCache[cacheKey]) return;

    set({ isLoadingStation: true, stationError: null });
    try {
      const detail = await fetchStationDetail(detailPath);
      set((state) => ({
        stationDetailCache: {
          ...state.stationDetailCache,
          [cacheKey]: detail as StationDetail,
        },
        isLoadingStation: false,
      }));
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to load station';
      console.error('[useLearnerStore] loadStationDetail error:', msg);
      set({ isLoadingStation: false, stationError: msg });
    }
  },
}));
