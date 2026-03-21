import { useMemo, useState } from 'react';
import { ResearchShell } from '../layouts/ResearchShell';
import { GlassCard } from '../components/GlassCard';
import { StatusChip, Button } from '../components/Atoms';
import { FileText, Download, TrendingUp, AlertCircle, LayoutGrid, Filter } from 'lucide-react';
import { AIEngines } from '../components/AIEngines';
import { StudyScopePanel } from '../components/StudyScopePanel';
import {
  STUDY_VARIABLES,
  getSelectedStudyCase,
  getSelectedTask,
  getSelectedTaskId,
  getStudyCaseVariableValue,
  useStudyScopeStore,
  type StudyVariableId,
} from '../state/studyScope';

const variableNotes: Record<StudyVariableId, string> = {
  assignment_views: 'How many times the student opened assignment modules in Moodle.',
  time_on_task: 'Active time inferred from logged activity gaps and task sessions.',
  revision_frequency: 'Revision and resubmission frequency recorded across the writing cycle.',
  feedback_views: 'Formal teacher feedback views captured by Moodle logs.',
  help_seeking_messages: 'Messages that match the study threshold for help-seeking behaviour.',
  word_count: 'Current text length for the selected task or the latest submission.',
  cohesion: 'Flow and linkage between ideas in the selected writing trace.',
  argumentation: 'Strength of the claim-evidence-explanation pattern in the current case.',
  grammar_accuracy: 'Approximate sentence-level control in the present writing profile.',
  ttr: 'Lexical variety indicator used in the analytic writing layer.',
  rubric: 'Rubric criteria available for the chosen task and assessment sheet.',
  private_messages: 'Teacher-student messages and the threshold interpretation layer.',
};

export function Reports() {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'AI Architecture', 'Export'];
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedVariableIds = useStudyScopeStore((state) => state.selectedVariableIds);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTask = getSelectedTask(
    selectedCase,
    getSelectedTaskId({ selectedCaseId, selectedTaskByCase })
  );

  const reportRows = useMemo(() => {
    return STUDY_VARIABLES
      .filter((variable) => selectedVariableIds.includes(variable.id))
      .map((variable) => ({
        label: variable.label,
        value: getStudyCaseVariableValue(selectedCase, variable.id),
        note: variableNotes[variable.id],
      }));
  }, [selectedCase, selectedVariableIds]);

  return (
    <ResearchShell>
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-32">
        <header className="mb-2">
          <h1 className="font-editorial italic text-3xl font-medium text-[var(--text-primary)]">
            Filtered Research Reports
          </h1>
          <p className="font-body text-[var(--text-sec)] text-sm mt-1">
            Export-ready outputs for the currently selected student, task, and variables.
          </p>
        </header>

        <StudyScopePanel
          title="Report Scope"
          subtitle="These controls determine which student, which exercise, and which indicators appear in the report tables below."
        />

        <div className="flex gap-6 border-b border-[var(--border)] overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`pb-3 px-1 text-sm font-navigation font-medium transition-colors border-b-2 whitespace-nowrap ${
                activeTab === tab
                  ? 'border-[var(--lav)] text-[var(--lav)]'
                  : 'border-transparent text-[var(--text-sec)] hover:text-[var(--text-primary)]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === 'Overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <GlassCard elevation="high" className="w-full p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                  <div className="flex items-center gap-4 mb-2">
                    <h2 className="font-editorial text-2xl text-[var(--text-primary)]">Scope-aware report</h2>
                    <StatusChip variant="teal" className="text-[10px]">READY</StatusChip>
                  </div>
                  <p className="font-body text-[var(--text-sec)] text-sm max-w-3xl">
                    Student: {selectedCase.meta.studentName}. Task: {selectedTask ? selectedTask.title : 'Full case overview'}. Variables: {selectedVariableIds.length} active.
                  </p>
                </div>
                <div className="flex justify-end gap-3 w-full md:w-auto mt-4 md:mt-0">
                  <Button variant="ghost"><LayoutGrid size={16} /> Preview dossier</Button>
                  <Button variant="secondary"><FileText size={16} /> Generate PDF</Button>
                  <Button><Download size={16} /> Export scoped notes</Button>
                </div>
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 text-[var(--lav)] mb-3">
                  <Filter size={16} />
                  <span className="font-navigation text-[10px] uppercase tracking-widest">Selected student</span>
                </div>
                <p className="font-editorial text-xl text-[var(--text-primary)]">{selectedCase.meta.studentName}</p>
                <p className="font-body text-xs text-[var(--text-sec)] mt-2">{selectedCase.meta.courseTitle}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 text-[var(--teal)] mb-3">
                  <TrendingUp size={16} />
                  <span className="font-navigation text-[10px] uppercase tracking-widest">Task focus</span>
                </div>
                <p className="font-editorial text-xl text-[var(--text-primary)]">{selectedTask ? selectedTask.title : 'Overview mode'}</p>
                <p className="font-body text-xs text-[var(--text-sec)] mt-2">{selectedTask ? selectedTask.date : selectedCase.meta.periodCovered}</p>
              </GlassCard>
              <GlassCard className="p-5">
                <div className="flex items-center gap-2 text-[var(--gold)] mb-3">
                  <AlertCircle size={16} />
                  <span className="font-navigation text-[10px] uppercase tracking-widest">Risk and cluster</span>
                </div>
                <p className="font-editorial text-xl text-[var(--text-primary)]">{selectedCase.clusterName}</p>
                <p className="font-body text-xs text-[var(--text-sec)] mt-2">Risk: {selectedCase.riskLevel}</p>
              </GlassCard>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp size={18} className="text-[var(--lav)]" />
                <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)]">Variable table</h3>
              </div>
              <p className="font-body text-[var(--text-sec)] text-sm mb-4">
                Only the variables currently active in the study scope appear here.
              </p>

              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-lg overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left font-body text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)] bg-[var(--bg-raised)] text-[var(--text-sec)] font-navigation text-xs uppercase tracking-wider">
                        <th className="px-6 py-3 font-medium">Indicator</th>
                        <th className="px-4 py-3 font-medium text-right">Value</th>
                        <th className="px-6 py-3 font-medium">Interpretation</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--border)] text-[var(--text-primary)]">
                      {reportRows.map((row) => (
                        <tr key={row.label} className="hover:bg-[var(--bg-raised)]">
                          <td className="px-6 py-3">{row.label}</td>
                          <td className="px-4 py-3 text-right font-forensic">{row.value}</td>
                          <td className="px-6 py-3 text-[var(--text-sec)]">{row.note}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="bg-[var(--bg-high)] rounded-xl border border-[var(--border-bright)] p-8 mt-12 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[var(--teal)] to-transparent opacity-10 blur-3xl rounded-bl-full" />
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                  <h2 className="font-editorial text-2xl text-[var(--text-primary)] mb-2 flex items-center gap-3">
                    <AlertCircle className="text-[var(--gold)]" /> Report interpretation cue
                  </h2>
                  <p className="font-body text-[var(--text-sec)] text-sm max-w-xl">
                    Dominant need: {selectedCase.meta.dominantNeed}. This summary remains aligned with the same student and exercise selected above.
                  </p>
                </div>
                <div className="w-full md:w-auto mt-4 md:mt-0">
                  <Button className="w-full md:w-auto" variant="primary">
                    <Download size={18} /> Download filtered summary
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'AI Architecture' && (
          <AIEngines />
        )}

        {activeTab === 'Export' && (
          <GlassCard className="p-6 md:p-8">
            <h2 className="font-editorial text-2xl text-[var(--text-primary)] mb-4">Export package</h2>
            <p className="font-body text-[var(--text-sec)] text-sm mb-6">
              Includes the current student selection, the chosen exercise, active variables, and the scoped report table.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Button><Download size={16} /> Export scoped markdown</Button>
              <Button variant="secondary"><FileText size={16} /> Export PDF memo</Button>
            </div>
          </GlassCard>
        )}
      </div>
    </ResearchShell>
  );
}
