import { SlidersHorizontal, Upload, UserRoundSearch, BookMarked, Waypoints } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShallow } from 'zustand/react/shallow';
import clsx from 'clsx';
import { GlassCard } from './GlassCard';
import { Button, StatusChip } from './Atoms';
import {
  STUDY_STATIONS,
  STUDY_VARIABLES,
  getSelectedStudyCase,
  getSelectedTask,
  getSelectedTaskId,
  getTaskOptions,
  useStudyScopeStore,
  type StudyStationId,
  type StudyVariableId,
} from '../state/studyScope';

interface StudyScopePanelProps {
  title?: string;
  subtitle?: string;
}

const QUICK_PRESETS: Array<{
  id: string;
  label: string;
  helper: string;
  stations: StudyStationId[];
  variables: StudyVariableId[];
}> = [
    {
      id: 'classroom',
      label: 'Classroom view',
      helper: 'Fast reading of behaviour, diagnostic signals, feedback planning, and revision.',
      stations: [2, 3, 9, 10, 12],
      variables: ['assignment_views', 'feedback_views', 'help_seeking_messages', 'argumentation', 'grammar_accuracy'],
    },
    {
      id: 'writing',
      label: 'Writing focus',
      helper: 'Focus on the text, quality indicators, and revision evidence.',
      stations: [1, 4, 5, 12],
      variables: ['word_count', 'cohesion', 'argumentation', 'grammar_accuracy', 'ttr'],
    },
    {
      id: 'full',
      label: 'Full case',
      helper: 'Use all stations and the main indicators for the complete report.',
      stations: STUDY_STATIONS.map((station) => station.id),
      variables: ['assignment_views', 'time_on_task', 'revision_frequency', 'feedback_views', 'help_seeking_messages', 'word_count', 'cohesion', 'argumentation', 'grammar_accuracy', 'ttr'],
    },
  ];

export function StudyScopePanel({
  title = 'Build Your Teaching View',
  subtitle = 'Follow these steps to choose the student, the exercise, the stations, and the indicators you want to read.',
}: StudyScopePanelProps) {
  const navigate = useNavigate();
  const cases = useStudyScopeStore(useShallow((state) => state.cases));
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore(useShallow((state) => state.selectedTaskByCase));
  const selectedVariableIds = useStudyScopeStore(useShallow((state) => state.selectedVariableIds));
  const selectedStationIds = useStudyScopeStore(useShallow((state) => state.selectedStationIds));
  const selectCase = useStudyScopeStore((state) => state.selectCase);
  const selectTask = useStudyScopeStore((state) => state.selectTask);
  const toggleVariable = useStudyScopeStore((state) => state.toggleVariable);
  const toggleStation = useStudyScopeStore((state) => state.toggleStation);
  const setVariableSelection = useStudyScopeStore((state) => state.setVariableSelection);
  const setStationSelection = useStudyScopeStore((state) => state.setStationSelection);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const taskOptions = getTaskOptions(selectedCase);
  const selectedTaskId = getSelectedTaskId({ selectedCaseId, selectedTaskByCase });
  const selectedTask = getSelectedTask(selectedCase, selectedTaskId);
  const uniqueLearnerCount = new Set(cases.map((studyCase) => studyCase.meta.userId)).size;
  const isSingleStudentMode = uniqueLearnerCount <= 1;
  const visibleSelectedStationIds = selectedStationIds;

  if (!selectedCase) {
    return (
      <GlassCard elevation="high" accent="lav" className="p-6 md:p-8">
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[var(--lav)] font-navigation text-xs uppercase tracking-widest">
              <SlidersHorizontal size={14} />
              Guided Selection
            </div>
            <h2 className="font-editorial text-2xl text-[var(--text-primary)] mt-2">{title}</h2>
            <p className="font-body text-sm text-[var(--text-sec)] mt-2 max-w-3xl">
              Import at least one workbook before choosing a student, task, sections, or indicators. Until then, the platform hides all unverified case values.
            </p>
          </div>
          <Button variant="secondary" onClick={() => navigate('/import')}>
            <Upload size={16} /> Import verified workbook
          </Button>
        </div>
      </GlassCard>
    );
  }

  return (
    <GlassCard elevation="high" accent="lav" className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--lav)] font-navigation text-xs uppercase tracking-widest">
            <SlidersHorizontal size={14} />
            Guided Selection
          </div>
          <h2 className="font-editorial text-2xl text-[var(--text-primary)] mt-2">{title}</h2>
          <p className="font-body text-sm text-[var(--text-sec)] mt-2 max-w-3xl">{subtitle}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/import')}>
          <Upload size={16} /> Import student workbooks
        </Button>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)]">
            Quick Presets
          </p>
          <p className="font-body text-xs text-[var(--text-muted)]">Use one of these ready-made combinations when you want a faster setup.</p>
        </div>
        {isSingleStudentMode && (
          <div className="rounded-lg border border-[var(--violet)]/20 bg-[var(--violet-dim)] px-4 py-3 font-body text-xs text-[var(--text-sec)]">
            Single-student study mode is active. S06-S08 now remain available in case-level mode. They switch automatically to cohort-backed analytics after you import enough verified workbooks.
          </div>
        )}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {QUICK_PRESETS.map((preset) => {
            const visiblePresetStations = preset.stations;

            return (
              <button
                key={preset.id}
                type="button"
                onClick={() => {
                  setStationSelection(visiblePresetStations);
                  setVariableSelection(preset.variables);
                }}
                className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-4 text-left hover:border-[var(--border-bright)] hover:bg-[var(--bg-card)] transition-colors"
              >
                <p className="font-navigation text-xs uppercase tracking-widest text-[var(--lav)]">{preset.label}</p>
                <p className="mt-2 font-body text-xs text-[var(--text-sec)] leading-relaxed">{preset.helper}</p>
                <p className="mt-3 font-forensic text-xs text-[var(--text-muted)]">
                  {visiblePresetStations.length} stations Â· {preset.variables.length} indicators
                </p>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <label className="space-y-2">
          <span className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-xs">1</span>
            <UserRoundSearch size={13} />
            Student
          </span>
          <select
            value={selectedCase.id}
            onChange={(event) => selectCase(event.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-[var(--text-primary)]  focus:border-[var(--lav)] focus:bg-[var(--lav-dim)]"
          >
            {cases.map((studyCase) => (
              <option
                key={studyCase.id}
                value={studyCase.id}
                className={clsx(
                  'text-[var(--text-sec)] bg-[var(--bg-card)] hover:bg-[var(--bg-raised)]',
                  selectedCase.id === studyCase.id && 'text-[var(--lav)] font-bold'
                )}
              >
                {studyCase.meta.studentName} - {studyCase.meta.courseTitle}
              </option>
            ))}
          </select>
          <p className="font-body text-xs text-[var(--text-muted)]">
            Choose the student case first. Imported cases: {cases.length}. Current workbook: {selectedCase.workbookName}
          </p>
        </label>

        <label htmlFor="task-select" className="space-y-2">
          <span className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-xs">2</span>
            <BookMarked size={13} />
            Exercise
          </span>
          <select
            id="task-select"
            value={selectedTaskId}
            onChange={(event) => selectTask(event.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-[var(--text-primary)]  focus:border-[var(--lav)]"
          >
            {taskOptions.map((task) => (
              <option key={task.id} value={task.id}>
                {task.label}
              </option>
            ))}
          </select>
          <p className="font-body text-xs text-[var(--text-muted)]">
            {selectedTask
              ? `${selectedTask.status} - ${selectedTask.wordCount} words - ${selectedTask.date}`
              : `If you do not choose one exercise, the system keeps the full case overview across ${selectedCase.meta.periodCovered}`}
          </p>
        </label>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] p-4 flex flex-col justify-between">
          <div>
            <p className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)]">Current Teaching View</p>
            <p className="font-navigation text-sm text-[var(--text-primary)] mt-3">{selectedCase.meta.studentName}</p>
            <p className="font-body text-xs text-[var(--text-sec)] mt-1">
              {selectedTask ? selectedTask.title : 'Full case overview'}
            </p>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <StatusChip variant="gold">{visibleSelectedStationIds.length} stations</StatusChip>
            <StatusChip variant="lav">{selectedVariableIds.length} variables</StatusChip>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-xs">3</span>
            <Waypoints size={13} />
            Analysis Sections
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
          {STUDY_STATIONS.map((station) => {
            const isActive = selectedStationIds.includes(station.id);
            return (
              <button
                key={station.id}
                onClick={() => toggleStation(station.id)}
                aria-pressed={isActive}
                className={clsx(
                  'text-left flex flex-col gap-1.5 p-3 rounded-lg border transition-all duration-200',
                  {
                    'bg-[var(--blue-dim)] border-[var(--blue-border)] shadow-[0_0_12px_var(--blue-dim)] saturate-150': isActive,
                    'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-raised)]': !isActive,
                  }
                )}
              >
                <span className={clsx("font-navigation text-xs uppercase tracking-widest", isActive ? "text-[var(--blue)] font-bold" : "text-[var(--text-muted)]")}>
                  S{String(station.id).padStart(2, '0')}
                </span>
                <span className={clsx("font-body text-xs", isActive ? "text-[var(--text-primary)]" : "text-[var(--text-sec)]")}>
                  {station.label}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-[var(--border)] text-xs">4</span>
            Indicators to show
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2">
          {STUDY_VARIABLES.map((variable) => {
            const isActive = selectedVariableIds.includes(variable.id);
            return (
              <button
                key={variable.id}
                onClick={() => toggleVariable(variable.id)}
                aria-pressed={isActive}
                className={clsx(
                  'p-3 rounded-lg border text-left transition-all duration-200 relative overflow-hidden group',
                  {
                    'bg-[var(--violet-dim)] border-[var(--violet-border)] shadow-[0_0_12px_var(--violet-dim)] saturate-150': isActive,
                    'bg-[var(--bg-card)] border-[var(--border)] hover:border-[var(--text-muted)] hover:bg-[var(--bg-raised)]': !isActive,
                  }
                )}
              >
                <div className="font-body text-xs text-[var(--text-primary)] relative z-10 mb-1 leading-snug break-words pr-4">{variable.label}</div>
                <div className={clsx(
                  "font-navigation text-xs uppercase tracking-widest relative z-10 leading-tight truncate",
                  isActive ? "text-[var(--violet)] font-bold" : "text-[var(--text-muted)]"
                )}>
                  {variable.category}
                </div>
                {isActive && (
                  <div className="absolute right-2 top-2 w-1.5 h-1.5 rounded-full bg-[var(--violet)] shadow-[0_0_4px_var(--violet)]" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}



