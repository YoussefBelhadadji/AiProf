import { useMemo, useState } from 'react';
import {
  Activity,
  BarChart3,
  Brain,
  MessageSquare,
  ArrowRight,
  BookOpenText,
  Clock3,
} from 'lucide-react';
import { ResearchShell } from '../layouts/ResearchShell';
import { GlassCard } from '../components/GlassCard';
import { StatusChip, Button } from '../components/Atoms';
import { StudyScopePanel } from '../components/StudyScopePanel';
import { CommunicationTrace } from '../components/CommunicationTrace';
import {
  STUDY_VARIABLES,
  getSelectedStudyCase,
  getSelectedTask,
  getSelectedTaskId,
  getStudyCaseVariableValue,
  useStudyScopeStore,
} from '../state/studyScope';

export function Students() {
  const [activeTab, setActiveTab] = useState<'behaviour' | 'writing' | 'communication'>('behaviour');
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedVariableIds = useStudyScopeStore((state) => state.selectedVariableIds);
  const selectCase = useStudyScopeStore((state) => state.selectCase);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTask = getSelectedTask(
    selectedCase,
    getSelectedTaskId({ selectedCaseId, selectedTaskByCase })
  );

  const activeVariables = useMemo(
    () => STUDY_VARIABLES.filter((variable) => selectedVariableIds.includes(variable.id)),
    [selectedVariableIds]
  );

  return (
    <ResearchShell>
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-32">
        <div>
          <h1 className="font-editorial italic text-3xl text-[var(--text-primary)]">Student Cases</h1>
          <p className="text-[var(--text-sec)] text-sm font-body mt-1">
            Select a student case here. The selected exercise, sections, and indicators will stay the same across the rest of the interface.
          </p>
        </div>

        <StudyScopePanel
          title="Choose Student, Exercise, and Focus"
          subtitle="Use the same scope everywhere: student, exercise, analysis sections, and indicators."
        />

        <GlassCard className="overflow-hidden border-[var(--border)] p-0">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left whitespace-nowrap min-w-[920px]">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--bg-raised)]/50 text-[var(--text-sec)] font-navigation text-[9px] uppercase tracking-widest font-bold">
                  <th className="px-6 py-4">Student</th>
                  <th className="px-6 py-4">Course</th>
                  <th className="px-6 py-4">Profile</th>
                  <th className="px-6 py-4">Support Priority</th>
                  <th className="px-6 py-4">Exercises</th>
                  <th className="px-6 py-4">Feedback Views</th>
                  <th className="px-6 py-4">Help Requests</th>
                  <th className="px-6 py-4">Active</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {cases.map((studyCase) => {
                  const isActive = studyCase.id === selectedCase.id;

                  return (
                    <tr
                      key={studyCase.id}
                      className={`transition-all cursor-pointer ${isActive ? 'bg-[var(--lav-glow)]/20' : 'hover:bg-[var(--bg-raised)]/40'}`}
                      onClick={() => selectCase(studyCase.id)}
                    >
                      <td className="px-6 py-5">
                        <div>
                          <div className="font-navigation font-bold text-xs text-[var(--text-primary)]">{studyCase.meta.studentName}</div>
                          <div className="font-forensic text-[10px] text-[var(--text-muted)]">User {studyCase.meta.userId}</div>
                        </div>
                      </td>
                      <td className="px-6 py-5 font-body text-xs text-[var(--text-sec)]">{studyCase.meta.courseTitle}</td>
                      <td className="px-6 py-5">
                        <StatusChip variant="lav">{studyCase.clusterName}</StatusChip>
                      </td>
                      <td className="px-6 py-5">
                        <StatusChip variant={studyCase.riskLevel === 'critical' ? 'red' : studyCase.riskLevel === 'monitor' ? 'gold' : 'teal'}>
                          {studyCase.riskLevel}
                        </StatusChip>
                      </td>
                      <td className="px-6 py-5 font-forensic text-xs text-[var(--text-sec)]">{studyCase.writing.artifacts.length}</td>
                      <td className="px-6 py-5 font-forensic text-xs text-[var(--text-sec)]">{studyCase.student.feedback_views}</td>
                      <td className="px-6 py-5 font-forensic text-xs text-[var(--text-sec)]">{studyCase.student.help_seeking_messages}</td>
                      <td className="px-6 py-5">
                        {isActive ? <StatusChip variant="teal">SELECTED</StatusChip> : <span className="text-[var(--text-muted)] font-forensic text-[10px]">Click to activate</span>}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-[var(--lav)] mb-3">
              <BarChart3 size={16} />
              <span className="font-navigation text-[10px] uppercase tracking-widest">Selected student</span>
            </div>
            <p className="font-editorial text-xl text-[var(--text-primary)]">{selectedCase.meta.studentName}</p>
            <p className="font-body text-xs text-[var(--text-sec)] mt-2">{selectedCase.meta.courseTitle}</p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-[var(--teal)] mb-3">
              <BookOpenText size={16} />
              <span className="font-navigation text-[10px] uppercase tracking-widest">Selected exercise</span>
            </div>
            <p className="font-editorial text-xl text-[var(--text-primary)]">
              {selectedTask ? selectedTask.title : 'Full case overview'}
            </p>
            <p className="font-body text-xs text-[var(--text-sec)] mt-2">
              {selectedTask ? `${selectedTask.wordCount} words - ${selectedTask.date}` : selectedCase.meta.periodCovered}
            </p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center gap-2 text-[var(--gold)] mb-3">
              <Brain size={16} />
              <span className="font-navigation text-[10px] uppercase tracking-widest">Selected indicators</span>
            </div>
            <p className="font-editorial text-xl text-[var(--text-primary)]">{activeVariables.length} active variables</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {activeVariables.slice(0, 3).map((variable) => (
                <StatusChip key={variable.id} variant="gold">{variable.label}</StatusChip>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="flex gap-6 border-b border-[var(--border)] overflow-x-auto">
          {[
            { id: 'behaviour', label: 'Behaviour', icon: Activity },
            { id: 'writing', label: 'Writing Task', icon: BarChart3 },
            { id: 'communication', label: 'Communication', icon: MessageSquare },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`pb-3 px-1 text-sm font-navigation font-medium transition-colors border-b-2 whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'border-[var(--lav)] text-[var(--lav)]'
                  : 'border-transparent text-[var(--text-sec)] hover:text-[var(--text-primary)]'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === 'behaviour' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
            <GlassCard className="p-6">
              <h3 className="font-navigation text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border)] pb-2 mb-5">Behaviour indicators</h3>
              <div className="grid grid-cols-1 gap-5">
                {(Object.entries(selectedCase.workspace.moodle) as Array<[string, number]>).map(([key, value]) => (
                  <div key={key}>
                    <div className="flex justify-between text-[10px] font-navigation uppercase text-[var(--text-sec)] mb-1.5">
                      <span>{key.replace(/([A-Z])/g, ' $1')}</span>
                      <span className="font-forensic">{(value * 100).toFixed(0)}%</span>
                    </div>
                    <div className="h-1.5 bg-[var(--bg-deep)] rounded-full overflow-hidden">
                      <div className={`h-full ${value > 0.6 ? 'bg-[var(--teal)]' : value > 0.3 ? 'bg-[var(--lav)]' : 'bg-[var(--gold)]'}`} style={{ width: `${value * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-navigation text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border)] pb-2 mb-5">Indicators currently shown</h3>
              <div className="space-y-4">
                {activeVariables.map((variable) => (
                  <div key={variable.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-navigation text-[11px] uppercase tracking-widest text-[var(--text-primary)]">{variable.label}</p>
                      <span className="font-forensic text-xs text-[var(--lav)]">{getStudyCaseVariableValue(selectedCase, variable.id)}</span>
                    </div>
                    <p className="mt-2 font-body text-xs text-[var(--text-sec)] leading-relaxed">{variable.description}</p>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'writing' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-6">
            <GlassCard className="p-6">
              <h3 className="font-navigation text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border)] pb-2 mb-5">Selected writing exercise</h3>
              <p className="font-editorial text-2xl text-[var(--text-primary)]">
                {selectedTask ? selectedTask.title : 'Case-level overview'}
              </p>
              <p className="font-body text-xs text-[var(--text-sec)] mt-3">
                {selectedTask
                  ? `${selectedTask.status} - ${selectedTask.wordCount} words - ${selectedTask.date}`
                  : 'Select a specific exercise from the scope panel to inspect one text directly.'}
              </p>
              <div className="mt-6 rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] p-5">
                <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed whitespace-pre-line">
                  {selectedTask
                    ? selectedTask.text
                    : selectedCase.student.sample_text}
                </p>
              </div>
              {selectedTask?.teacherComment && (
                <div className="mt-4 rounded-lg border border-[var(--gold)]/20 bg-[var(--gold-dim)] px-4 py-3">
                  <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--gold)] mb-1">Teacher focus</div>
                  <p className="font-body text-sm text-[var(--text-sec)]">{selectedTask.teacherComment}</p>
                </div>
              )}
            </GlassCard>

            <GlassCard className="p-6">
              <h3 className="font-navigation text-xs uppercase tracking-[0.2em] text-[var(--text-muted)] border-b border-[var(--border)] pb-2 mb-5">Comparison and revision trace</h3>
              <div className="space-y-3">
                {selectedCase.writing.comparison.metrics.map((metric) => (
                  <div key={metric.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="font-navigation text-[11px] uppercase tracking-widest text-[var(--text-primary)]">{metric.label}</p>
                      <span className={`font-forensic text-xs ${metric.delta.startsWith('-') ? 'text-[var(--red)]' : 'text-[var(--teal)]'}`}>{metric.delta}</span>
                    </div>
                    <p className="font-forensic text-xs text-[var(--text-sec)] mt-2">Before: {metric.before} | After: {metric.after}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-3">
                {selectedCase.writing.sequence.slice(0, 4).map((step, index) => (
                  <div key={`${step.timestamp}-${index}`} className="flex gap-3">
                    <div className="w-7 h-7 rounded-full border border-[var(--border)] bg-[var(--bg-deep)] flex items-center justify-center text-[10px] font-forensic text-[var(--lav)] shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-navigation text-sm text-[var(--text-primary)]">{step.phase}</p>
                      <p className="font-body text-xs text-[var(--text-sec)] mt-1 leading-relaxed">{step.detail}</p>
                      <div className="flex items-center gap-1 mt-1 text-[var(--text-muted)] font-forensic text-[10px]">
                        <Clock3 size={10} />
                        {step.timestamp}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'communication' && (
          <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6">
            <CommunicationTrace
              messages={selectedCase.communication.dialogue}
              comments={selectedCase.communication.instructorComments}
              subtitle="Teacher-student messages and the formal instructor comment extracted from the active student case."
            />

            <GlassCard className="p-5 space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h4 className="font-navigation text-xs uppercase tracking-[0.2em] text-[var(--text-muted)]">Private message thresholds</h4>
                  <p className="font-body text-xs text-[var(--text-sec)] mt-2 leading-relaxed">
                    {selectedCase.thresholds.privateMessages.compositeThreshold}
                  </p>
                </div>
                <StatusChip variant="lav">{selectedCase.thresholds.privateMessages.matchedCount} matched</StatusChip>
              </div>
              <div className="space-y-3">
                {selectedCase.thresholds.privateMessages.thresholds.map((threshold) => (
                  <div key={threshold.id} className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)]/60 p-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <p className="font-navigation text-[11px] uppercase tracking-widest text-[var(--text-primary)]">{threshold.label}</p>
                      <StatusChip variant="gold">{threshold.matched} hit{threshold.matched !== 1 ? 's' : ''}</StatusChip>
                    </div>
                    <p className="mt-3 font-body text-xs text-[var(--text-sec)] leading-relaxed">{threshold.threshold}</p>
                    <p className="mt-3 font-body text-xs text-[var(--lav)] leading-relaxed">Evidence: {threshold.evidence}</p>
                    <p className="mt-2 font-body text-xs text-[var(--text-muted)] leading-relaxed">{threshold.interpretation}</p>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-2" onClick={() => setActiveTab('writing')}>
                Read selected exercise <ArrowRight size={16} />
              </Button>
            </GlassCard>
          </div>
        )}
      </div>
    </ResearchShell>
  );
}
