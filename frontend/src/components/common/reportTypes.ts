import type { TeacherStudyCase, StudyVariableId } from '../../state/studyScope';

export type ReportSelectedTask = TeacherStudyCase['writing']['artifacts'][number] | null;
export type ReportRuleMatch = NonNullable<TeacherStudyCase['student']['rule_matches']>[number];

export interface ReportRow {
  label: string;
  value: string;
  note: string;
}

export interface AiDiagnosticRow {
  label: string;
  value: string;
  note: string;
}

export type ReportStationAvailability = Map<number, { available: boolean; note?: string }>;

export type ReportVariableIdList = StudyVariableId[];
