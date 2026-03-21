import { SlidersHorizontal, Upload, UserRoundSearch, BookMarked } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from './GlassCard';
import { Button, StatusChip } from './Atoms';
import {
  STUDY_VARIABLES,
  getSelectedStudyCase,
  getSelectedTask,
  getSelectedTaskId,
  getTaskOptions,
  useStudyScopeStore,
} from '../state/studyScope';

interface StudyScopePanelProps {
  title?: string;
  subtitle?: string;
}

export function StudyScopePanel({
  title = 'Teacher Study Scope',
  subtitle = 'Choose the student, the exercise, and the variables you want to inspect before reading the analytics.',
}: StudyScopePanelProps) {
  const navigate = useNavigate();
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedVariableIds = useStudyScopeStore((state) => state.selectedVariableIds);
  const selectCase = useStudyScopeStore((state) => state.selectCase);
  const selectTask = useStudyScopeStore((state) => state.selectTask);
  const toggleVariable = useStudyScopeStore((state) => state.toggleVariable);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const taskOptions = getTaskOptions(selectedCase);
  const selectedTaskId = getSelectedTaskId({ selectedCaseId, selectedTaskByCase });
  const selectedTask = getSelectedTask(selectedCase, selectedTaskId);

  return (
    <GlassCard elevation="high" accent="lav" className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--lav)] font-navigation text-xs uppercase tracking-widest">
            <SlidersHorizontal size={14} />
            Study Controls
          </div>
          <h2 className="font-editorial text-2xl text-[var(--text-primary)] mt-2">{title}</h2>
          <p className="font-body text-sm text-[var(--text-sec)] mt-2 max-w-3xl">{subtitle}</p>
        </div>
        <Button variant="secondary" onClick={() => navigate('/import')}>
          <Upload size={16} /> Import student workbooks
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <label className="space-y-2">
          <span className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <UserRoundSearch size={13} />
            Student
          </span>
          <select
            value={selectedCase.id}
            onChange={(event) => selectCase(event.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--lav)]"
          >
            {cases.map((studyCase) => (
              <option key={studyCase.id} value={studyCase.id}>
                {studyCase.meta.studentName} - {studyCase.meta.courseTitle}
              </option>
            ))}
          </select>
          <p className="font-body text-xs text-[var(--text-muted)]">
            Imported cases: {cases.length}. Current workbook: {selectedCase.workbookName}
          </p>
        </label>

        <label className="space-y-2">
          <span className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2">
            <BookMarked size={13} />
            Exercise
          </span>
          <select
            value={selectedTaskId}
            onChange={(event) => selectTask(event.target.value)}
            className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--lav)]"
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
              : `Overview mode across ${selectedCase.meta.periodCovered}`}
          </p>
        </label>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] p-4 flex flex-col justify-between">
          <div>
            <p className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Current Scope</p>
            <p className="font-navigation text-sm text-[var(--text-primary)] mt-3">{selectedCase.meta.studentName}</p>
            <p className="font-body text-xs text-[var(--text-sec)] mt-1">
              {selectedTask ? selectedTask.title : 'Full case overview'}
            </p>
          </div>
          <div className="mt-4 flex gap-2 flex-wrap">
            <StatusChip variant="teal">{selectedCase.clusterName}</StatusChip>
            <StatusChip variant={selectedCase.riskLevel === 'critical' ? 'red' : selectedCase.riskLevel === 'monitor' ? 'gold' : 'teal'}>
              {selectedCase.riskLevel}
            </StatusChip>
            <StatusChip variant="lav">{selectedVariableIds.length} variables</StatusChip>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <p className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Variables to study</p>
          <p className="font-body text-xs text-[var(--text-muted)]">Click to include or exclude a variable from the current view.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {STUDY_VARIABLES.map((variable) => {
            const isSelected = selectedVariableIds.includes(variable.id);

            return (
              <button
                key={variable.id}
                type="button"
                onClick={() => toggleVariable(variable.id)}
                className={`rounded-full border px-3 py-2 text-left transition-colors ${
                  isSelected
                    ? 'border-[var(--lav)] bg-[var(--lav-glow)] text-[var(--lav)]'
                    : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-sec)] hover:text-[var(--text-primary)]'
                }`}
                title={variable.description}
              >
                <span className="block font-navigation text-[10px] uppercase tracking-widest">{variable.category}</span>
                <span className="block font-body text-xs mt-1">{variable.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </GlassCard>
  );
}
