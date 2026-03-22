import { useEffect, useMemo, useState } from 'react';
import { BookOpenText, FileEdit, Save, Trash2 } from 'lucide-react';
import { ResearchShell } from '../layouts/ResearchShell';
import { GlassCard } from '../components/GlassCard';
import { Button, StatusChip } from '../components/Atoms';
import { getSelectedStudyCase, getSelectedTask, getSelectedTaskId, useStudyScopeStore } from '../state/studyScope';

function buildNoteKey(caseId: string, taskId: string) {
  return `writelens-note:${caseId}:${taskId}`;
}

export function Notes() {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTaskId = getSelectedTaskId({ selectedCaseId, selectedTaskByCase });
  const selectedTask = getSelectedTask(selectedCase, selectedTaskId);
  const storageKey = useMemo(() => buildNoteKey(selectedCase.id, selectedTaskId), [selectedCase.id, selectedTaskId]);

  const [note, setNote] = useState('');
  const [savedAt, setSavedAt] = useState<string | null>(null);

  useEffect(() => {
    const savedNote = localStorage.getItem(storageKey) ?? '';
    const savedTimestamp = localStorage.getItem(`${storageKey}:savedAt`);
    setNote(savedNote);
    setSavedAt(savedTimestamp);
  }, [storageKey]);

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
    <ResearchShell>
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
              className="mt-5 min-h-[360px] w-full rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-5 py-4 text-sm text-[var(--text-primary)] focus:outline-none focus:border-[var(--lav)] resize-y"
            />

            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <p className="font-body text-xs text-[var(--text-sec)]">
                Suggested use: write one short note for strengths, one for needs, and one next teaching action.
              </p>
              {savedAt && (
                <span className="font-forensic text-[10px] text-[var(--text-muted)]">
                  Last saved: {savedAt}
                </span>
              )}
            </div>
          </GlassCard>

          <div className="space-y-6">
            <GlassCard className="p-6">
              <div className="flex items-center gap-2 text-[var(--teal)] font-navigation text-xs uppercase tracking-widest">
                <BookOpenText size={14} />
                Current Scope
              </div>
              <div className="mt-4 space-y-3">
                <div>
                  <p className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Student</p>
                  <p className="mt-1 font-body text-sm text-[var(--text-primary)]">{selectedCase.meta.studentName}</p>
                </div>
                <div>
                  <p className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">Exercise</p>
                  <p className="mt-1 font-body text-sm text-[var(--text-primary)]">{selectedTask ? selectedTask.title : 'Full case overview'}</p>
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <StatusChip variant="lav">{selectedCase.clusterName}</StatusChip>
                  <StatusChip variant={selectedCase.riskLevel === 'critical' ? 'red' : selectedCase.riskLevel === 'monitor' ? 'gold' : 'teal'}>
                    {selectedCase.riskLevel}
                  </StatusChip>
                </div>
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-navigation text-xs uppercase tracking-widest text-[var(--gold)]">What to write here</h3>
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
    </ResearchShell>
  );
}
