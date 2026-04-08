import { create } from 'zustand';

type SubmissionUIState = {
  selectedStudentId: string | null;
  selectedSubmissionId: string | null;
  selectedStationId: string | null;
  setSelectedStudentId: (id: string | null) => void;
  setSelectedSubmissionId: (id: string | null) => void;
  setSelectedStationId: (id: string | null) => void;
};

export const useSubmissionStore = create<SubmissionUIState>((set) => ({
  selectedStudentId: null,
  selectedSubmissionId: null,
  selectedStationId: null,
  setSelectedStudentId: (id) => set({ selectedStudentId: id }),
  setSelectedSubmissionId: (id) => set({ selectedSubmissionId: id, selectedStationId: null }),
  setSelectedStationId: (id) => set({ selectedStationId: id }),
}));

