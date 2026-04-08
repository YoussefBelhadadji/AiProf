import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ReportStatus } from '../../../shared/types';

export interface TeacherEdit {
  comments: string;
  conclusion: string;
  status: ReportStatus;
  savedAt: string; // ISO
}

interface ReportStore {
  isEditMode: boolean;
  teacherEdits: Record<string, TeacherEdit>;

  setEditMode: (mode: boolean) => void;
  saveEdits: (studentId: string, comments: string, conclusion: string) => void;
  getEdits: (studentId: string) => TeacherEdit | null;
  discardEdits: (studentId: string) => void;
}

export const useReportStore = create<ReportStore>()(
  persist(
    (set, get) => ({
      isEditMode: false,
      teacherEdits: {},

      setEditMode: (mode) => set({ isEditMode: mode }),

      saveEdits: (studentId, comments, conclusion) =>
        set((state) => ({
          isEditMode: false,
          teacherEdits: {
            ...state.teacherEdits,
            [studentId]: {
              comments,
              conclusion,
              status: 'ready' as ReportStatus,
              savedAt: new Date().toISOString(),
            },
          },
        })),

      getEdits: (studentId) => get().teacherEdits[studentId] ?? null,

      discardEdits: (studentId) =>
        set((state) => {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { [studentId]: _removed, ...rest } = state.teacherEdits;
          return { teacherEdits: rest };
        }),
    }),
    { name: 'writelens-report-store' }
  )
);
