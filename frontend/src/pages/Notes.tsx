import { useMemo, useState } from 'react';
import { BookOpenText, FileEdit, Save, Trash2, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { GlassCard } from '../components/GlassCard';
import { Button, StatusChip } from '../components/Atoms';
import { getSelectedStudyCase, getSelectedTask, getSelectedTaskId, useStudyScopeStore } from '../state/studyScope';

function buildNoteKey(caseId: string, taskId: string) {
  return `writelens-note:${caseId}:${taskId}`;
}

function getStoredNoteState(storageKey: string) {
  if (typeof window === 'undefined') {
    return { note: '', savedAt: null as string | null };
  }

  return {
    note: localStorage.getItem(storageKey) ?? '',
    savedAt: localStorage.getItem(`${storageKey}:savedAt`),
  };
}

export function Notes() {
  const navigate = useNavigate();
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTaskId = getSelectedTaskId({ selectedCaseId, selectedTaskByCase });
  const selectedTask = selectedCase ? getSelectedTask(selectedCase, selectedTaskId) : null;
  const storageKey = useMemo(() => buildNoteKey(selectedCase?.id ?? 'no-case', selectedTaskId), [selectedCase?.id, selectedTaskId]);

  if (!selectedCase) {
    return (
      <div className="max-w-5xl mx-auto p-6 md:p-8 pb-32">
        <GlassCard className="p-8 md:p-10 border-l-4" style={{ borderLeftColor: 'var(--teal)' }}>
          <div className="flex items-start gap-4">
            <BookOpenText className="w-6 h-6 text-[var(--teal)] shrink-0 mt-1" />
            <div className="flex-1">
              <h1 className="font-editorial italic text-4xl text-[var(--text-primary)] mb-2">Teaching Notes</h1>
              <p className="font-body text-sm text-[var(--text-sec)] mb-6 max-w-3xl">
                Teaching notes are available once you select a student case from the workspace. The system automatically loads all imported student writing data—simply choose a case and exercise to begin writing your notes.
              </p>
              
              <div className="bg-[var(--bg-high)] rounded-lg p-4 mb-6 border border-[var(--border)]">
                <p className="text-xs font-bold text-[var(--text-sec)] mb-3 uppercase tracking-wider">To Start Writing Notes:</p>
                <ol className="space-y-2 text-xs text-[var(--text-muted)]">
                  <li>1. Use the workspace selector to choose a student case</li>
                  <li>2. Select a specific writing exercise (or view full case overview)</li>
                  <li>3. Your teaching notes editor will appear below</li>
                  <li>4. Write your observations and save them to local storage</li>
                </ol>
              </div>

              <div className="bg-[var(--bg-sidebar)] rounded-lg p-4 mb-6 border border-[var(--border)] border-dashed">
                <p className="text-xs font-bold text-[var(--text-sec)] mb-2 uppercase tracking-wider">No Student Data Available?</p>
                <p className="text-xs text-[var(--text-muted)]">If no student cases are showing in the workspace selector, data may not have been imported yet to the system. Check the Dashboard to verify student data is available.</p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
                <button
                  onClick={() => window.location.reload()}
                  className="btn-primary flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  Refresh Page
                </button>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="btn-ghost flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold"
                >
                  <BookOpenText className="w-3.5 h-3.5" />
                  Check Dashboard
                </button>
              </div>
            </div>
          </div>
        </GlassCard>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-[var(--blue)] font-navigation text-xs uppercase tracking-widest mb-4">
              <FileEdit size={14} />
              What to Write
            </div>
            <div className="space-y-3 font-body text-xs text-[var(--text-sec)] leading-relaxed">
              <p><strong className="text-[var(--text-primary)]">Strengths:</strong> Notable skill demonstrations in the selected task or case.</p>
              <p><strong className="text-[var(--text-primary)]">Needs:</strong> The main difficulty that deserves classroom follow-up or intervention.</p>
              <p><strong className="text-[var(--text-primary)]">Next Action:</strong> A feedback sentence or the next instructional move you plan.</p>
              <p><strong className="text-[var(--text-primary)]">Report Reminder:</strong> Key observations to include in the printed teacher report.</p>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-[var(--violet)] font-navigation text-xs uppercase tracking-widest mb-4">
              <FileEdit size={14} />
              How It Works
            </div>
            <div className="space-y-3 font-body text-xs text-[var(--text-sec)] leading-relaxed">
              <p>Notes are stored locally on your device and linked to a specific <strong>student + exercise</strong> combination.</p>
              <p>Each note is independent, so you can maintain separate teaching notes for every student and every writing task they complete.</p>
              <p>Your notes persist when you return to the same student/exercise, making it easy to build cumulative observations over time.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <NotesEditor
      key={storageKey}
      selectedCase={selectedCase}
      selectedTask={selectedTask}
      storageKey={storageKey}
    />
  );
}

function NotesEditor({
  selectedCase,
  selectedTask,
  storageKey,
}: {
  selectedCase: NonNullable<ReturnType<typeof getSelectedStudyCase>>;
  selectedTask: ReturnType<typeof getSelectedTask>;
  storageKey: string;
}) {
  const initialState = getStoredNoteState(storageKey);
  const [note, setNote] = useState(initialState.note);
  const [savedAt, setSavedAt] = useState<string | null>(initialState.savedAt);

  const handleSave = () => {
    localStorage.setItem(storageKey, note);
    const timestamp = new Date().toLocaleString();
    localStorage.setItem(`${storageKey}:savedAt`, timestamp);
    setSavedAt(timestamp);
  };

  const handleClear = () => {
    localStorage.removeItem(storageKey);
    localStorage.removeItem(`${storageKey}:savedAt`);
    setNote('');
    setSavedAt(null);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 md:p-8 space-y-8 pb-32">
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <h1 className="font-editorial italic text-4xl text-[var(--text-primary)]">Teaching Notes</h1>
          <p className="mt-2 font-body text-sm text-[var(--text-sec)] max-w-3xl">
            Write short teaching notes for the current student and exercise. These notes stay linked to the active scope and remain available when you return later on the same device.
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="ghost" onClick={handleClear}><Trash2 size={16} /> Clear note</Button>
          <Button onClick={handleSave}><Save size={16} /> Save note</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 lg:col-span-2">
          <div className="flex items-center gap-2 text-[var(--lav)] font-navigation text-xs uppercase tracking-widest">
            <FileEdit size={14} />
            Active Note
          </div>
          <h2 className="mt-3 font-navigation text-lg text-[var(--text-primary)]">
            {selectedTask ? selectedTask.title : 'Full case overview'}
          </h2>
          <p className="mt-2 font-body text-xs text-[var(--text-sec)]">
            Student: {selectedCase.meta.studentName} | Course: {selectedCase.meta.courseTitle}
          </p>

          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Write a concise teaching note here: strengths, concerns, next action, or a reminder for the final report."
            className="mt-5 min-h-[360px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-5 py-4 text-sm text-[var(--text-primary)]  focus:border-[var(--lav)] resize-y"
          />

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <p className="font-body text-xs text-[var(--text-sec)]">
              Suggested use: write one short note for strengths, one for needs, and one next teaching action.
            </p>
            {savedAt && (
              <span className="font-forensic text-xs text-[var(--text-muted)]">
                Last saved: {savedAt}
              </span>
            )}
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-6">
            <div className="flex items-center gap-2 text-[var(--blue)] font-navigation text-xs uppercase tracking-widest">
              <BookOpenText size={14} />
              Current Scope
            </div>
            <div className="mt-4 space-y-3">
              <div>
                <p className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)]">Student</p>
                <p className="mt-1 font-body text-sm text-[var(--text-primary)]">{selectedCase.meta.studentName}</p>
              </div>
              <div>
                <p className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)]">Exercise</p>
                <p className="mt-1 font-body text-sm text-[var(--text-primary)]">{selectedTask ? selectedTask.title : 'Full case overview'}</p>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                <StatusChip variant="teal">{selectedCase.workbookName}</StatusChip>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6">
            <h3 className="font-navigation text-xs uppercase tracking-widest text-[var(--violet)]">What to write here</h3>
            <div className="mt-4 space-y-3 font-body text-xs text-[var(--text-sec)] leading-relaxed">
              <p>Strengths you noticed in the selected task or case.</p>
              <p>The main difficulty that deserves classroom follow-up.</p>
              <p>A feedback sentence or a next instructional move.</p>
              <p>A reminder to include later in the printed teacher report.</p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

