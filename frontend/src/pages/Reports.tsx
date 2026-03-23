import { useMemo, useState } from 'react';
import { ResearchShell } from '../layouts/ResearchShell';
import { GlassCard } from '../components/GlassCard';
import { StatusChip, Button } from '../components/Atoms';
import { FileText, Download, TrendingUp, AlertCircle, LayoutGrid, Filter, Printer } from 'lucide-react';
import { AIEngines } from '../components/AIEngines';
import { StudyScopePanel } from '../components/StudyScopePanel';
import {
  STUDY_STATIONS,
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

const REPORT_DOCUMENT_CSS = `
  body { margin: 0; background: #edf1f7; color: #162033; font-family: Georgia, "Times New Roman", serif; }
  .report-shell { max-width: 1120px; margin: 0 auto; padding: 40px 28px 64px; }
  .report-print-stack { display: grid; gap: 28px; }
  .report-page { background: #ffffff; border-radius: 28px; border: 1px solid rgba(27, 39, 76, 0.12); box-shadow: 0 20px 70px rgba(9, 15, 35, 0.12); overflow: hidden; }
  .report-print-page { min-height: 297mm; }
  .report-print-cover { display: flex; align-items: stretch; }
  .report-cover { background: linear-gradient(135deg, #152346 0%, #1d3c7d 52%, #f1e1c4 100%); color: #f9fbff; padding: 44px 46px 36px; width: 100%; }
  .report-kicker { text-transform: uppercase; letter-spacing: 0.18em; font: 600 11px/1.4 Arial, sans-serif; opacity: 0.88; }
  .report-title { font-size: 42px; line-height: 1.05; margin: 18px 0 12px; font-style: italic; }
  .report-subtitle { font: 15px/1.8 Arial, sans-serif; max-width: 760px; opacity: 0.95; }
  .report-meta-grid, .report-stat-grid, .report-dual-grid { display: grid; gap: 18px; }
  .report-meta-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); margin-top: 28px; }
  .report-stat-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); }
  .report-dual-grid { grid-template-columns: 1.2fr 0.8fr; }
  .report-meta-card, .report-card { background: #ffffff; border: 1px solid rgba(22, 32, 51, 0.1); border-radius: 20px; padding: 18px 20px; }
  .report-meta-card { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.18); }
  .report-meta-label, .report-card-label { font: 600 11px/1.4 Arial, sans-serif; letter-spacing: 0.12em; text-transform: uppercase; color: #6b7691; }
  .report-meta-value { margin-top: 8px; font-size: 18px; line-height: 1.35; color: #ffffff; }
  .report-card-value { margin-top: 10px; font-size: 26px; line-height: 1.1; color: #162033; }
  .report-card-note { margin-top: 10px; color: #4d5770; font: 13px/1.7 Arial, sans-serif; }
  .report-body { padding: 34px 38px 42px; }
  .report-section { margin-top: 22px; }
  .report-section:first-child { margin-top: 0; }
  .report-section-title { font-size: 24px; margin: 0 0 14px; color: #14203b; font-style: italic; }
  .report-text, .report-list, .report-table { font: 14px/1.75 Arial, sans-serif; color: #33405e; }
  .report-list { margin: 0; padding-left: 18px; }
  .report-table-wrap { border: 1px solid rgba(22, 32, 51, 0.1); border-radius: 18px; overflow: hidden; }
  .report-table { width: 100%; border-collapse: collapse; }
  .report-table th, .report-table td { padding: 14px 16px; vertical-align: top; border-bottom: 1px solid rgba(22, 32, 51, 0.08); }
  .report-table th { background: #eef3fb; text-align: left; color: #213054; font: 700 11px/1.4 Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.12em; }
  .report-table tr:last-child td { border-bottom: none; }
  .report-value { white-space: nowrap; color: #18233f; font-family: "Courier New", monospace; }
  .report-timeline { display: grid; gap: 14px; }
  .report-timeline-item { border-left: 3px solid #2b5cab; padding-left: 16px; }
  .report-timeline-date { font: 700 11px/1.4 Arial, sans-serif; text-transform: uppercase; letter-spacing: 0.12em; color: #2b5cab; }
  .report-timeline-title { margin: 4px 0 2px; color: #18233f; font-size: 16px; }
  .report-pill-row { display: flex; flex-wrap: wrap; gap: 10px; }
  .report-pill { border-radius: 999px; padding: 8px 12px; background: #eef3fb; color: #213054; font: 600 12px/1.4 Arial, sans-serif; }
  .report-footer { margin-top: 30px; padding-top: 18px; border-top: 1px solid rgba(22, 32, 51, 0.12); color: #5b6784; font: 12px/1.8 Arial, sans-serif; }
  @media print {
    body { background: #ffffff; }
    .report-shell { max-width: none; padding: 0; }
    .report-print-stack { display: block; }
    .report-page { box-shadow: none; border: none; border-radius: 0; }
    .report-print-page { min-height: auto; page-break-after: always; break-after: page; }
    .report-print-page:last-child { page-break-after: auto; break-after: auto; }
    .report-card, .report-table-wrap, .report-timeline-item { break-inside: avoid; page-break-inside: avoid; }
    @page { size: A4; margin: 12mm; }
  }
`;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function Reports() {
  const [activeTab, setActiveTab] = useState('Overview');
  const tabs = ['Overview', 'Assessment Architecture', 'Final Report'];
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedVariableIds = useStudyScopeStore((state) => state.selectedVariableIds);
  const selectedStationIds = useStudyScopeStore((state) => state.selectedStationIds);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTask = selectedCase
    ? getSelectedTask(selectedCase, getSelectedTaskId({ selectedCaseId, selectedTaskByCase }))
    : null;
  const visibleStationIds = selectedStationIds;

  if (!selectedCase) {
    return (
      <ResearchShell>
        <div className="max-w-5xl mx-auto p-6 md:p-8 pb-32">
          <GlassCard accent="lav" glow className="p-8 md:p-10">
            <h1 className="font-editorial italic text-4xl text-[var(--text-primary)]">Verified Reports</h1>
            <p className="mt-3 font-body text-sm text-[var(--text-sec)] max-w-3xl">
              No verified workbook is loaded. Import a workbook first to generate a report based only on extracted evidence.
            </p>
          </GlassCard>
        </div>
      </ResearchShell>
    );
  }

  const reportRows = useMemo(() => {
    return STUDY_VARIABLES
      .filter((variable) => selectedVariableIds.includes(variable.id))
      .map((variable) => ({
        label: variable.label,
        value: getStudyCaseVariableValue(selectedCase, variable.id),
        note: variableNotes[variable.id],
      }));
  }, [selectedCase, selectedVariableIds]);

  const executiveSummary = useMemo(() => {
    const taskLabel = selectedTask ? selectedTask.title : 'the full workbook-backed case';
    const stationCount = visibleStationIds.length;
    return `This report compiles verified workbook evidence for ${selectedCase.meta.studentName} across ${taskLabel}. It covers ${stationCount} selected station${stationCount > 1 ? 's' : ''}, ${selectedCase.writing.artifacts.length} writing sample${selectedCase.writing.artifacts.length !== 1 ? 's' : ''}, ${selectedCase.meta.activityLogEntries} activity log entries, and ${selectedCase.meta.chatMessages} teacher-student messages. The system organises evidence and calculated indicators; the instructor remains responsible for the final pedagogical interpretation, scoring judgment, and feedback delivery.`;
  }, [selectedCase, selectedTask, visibleStationIds]);

  const selectedStations = useMemo(
    () => STUDY_STATIONS.filter((station) => visibleStationIds.includes(station.id)),
    [visibleStationIds]
  );
  const stationAvailability = useMemo(() => {
    const clusteringCaseLevel = typeof selectedCase.student.cluster_label === 'number' && selectedCase.student.cluster_label >= 0;
    const predictionCaseLevel =
      typeof selectedCase.student.predicted_score === 'number' ||
      Boolean(selectedCase.student.random_forest_output);
    const bayesianCaseLevel =
      Boolean(selectedCase.analytics?.bayesian.available) ||
      Boolean(selectedCase.student.bayesian_output) ||
      Boolean(selectedCase.student.ai_argument_state);

    return new Map<number, { available: boolean; note?: string }>([
      [6, {
        available: Boolean(selectedCase.analytics?.clustering.available) || clusteringCaseLevel,
        note: selectedCase.analytics?.clustering.available
          ? 'Cohort-backed clustering is active for this report.'
          : clusteringCaseLevel
            ? 'Case-level clustering view is active because the learner profile is available even though the cohort is still small.'
            : selectedCase.analytics?.clustering.reason ?? 'No clustering output is available for the current imported case.',
      }],
      [7, {
        available: Boolean(selectedCase.analytics?.prediction.available) || predictionCaseLevel,
        note: selectedCase.analytics?.prediction.available
          ? 'Cohort-backed prediction is active for this report.'
          : predictionCaseLevel
            ? 'Case-level predictive output is active because the selected learner already has a stored score estimate and improvement label.'
            : selectedCase.analytics?.prediction.reason ?? 'No predictive output is available for the current imported case.',
      }],
      [8, {
        available: bayesianCaseLevel,
        note: bayesianCaseLevel
          ? 'Bayesian competence-state synthesis is active for this report.'
          : selectedCase.analytics?.bayesian.reason ?? 'No Bayesian competence signals were returned for the current case.',
      }],
    ]);
  }, [selectedCase]);

  const includeSection = (stationIds: number[]) => stationIds.some((stationId) => visibleStationIds.includes(stationId as typeof visibleStationIds[number]));

  const downloadHtmlReport = () => {
    const reportNode = document.getElementById('final-report');
    if (!reportNode) return;

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Final Research Report - ${escapeHtml(selectedCase.meta.studentName)}</title>
    <style>${REPORT_DOCUMENT_CSS}</style>
  </head>
  <body>
    <div class="report-shell">${reportNode.outerHTML}</div>
  </body>
</html>`;

    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const safeName = selectedCase.meta.studentName.toLowerCase().replace(/\s+/g, '-');
    link.href = url;
    link.download = `final-report-${safeName}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  return (
    <ResearchShell>
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-32">
        <header className="mb-2">
          <h1 className="font-editorial italic text-3xl font-medium text-[var(--text-primary)]">
            Final Research Reports
          </h1>
          <p className="font-body text-[var(--text-sec)] text-sm mt-1">
            A polished HTML report for academic review, printing, and PDF export.
          </p>
        </header>

        <StudyScopePanel
          title="Report Scope"
          subtitle="These controls determine which student, which exercise, and which indicators appear in the final report."
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
                    <h2 className="font-editorial text-2xl text-[var(--text-primary)]">Final report package</h2>
                    <StatusChip variant="teal" className="text-[10px]">VERIFIED</StatusChip>
                  </div>
                  <p className="font-body text-[var(--text-sec)] text-sm max-w-3xl">
                    Student: {selectedCase.meta.studentName}. Task: {selectedTask ? selectedTask.title : 'Full case overview'}. Stations: {visibleStationIds.length} active. Variables: {selectedVariableIds.length} active.
                  </p>
                </div>
                <div className="flex justify-end gap-3 w-full md:w-auto mt-4 md:mt-0 flex-wrap">
                  <Button variant="ghost" onClick={() => setActiveTab('Final Report')}><LayoutGrid size={16} /> Open final dossier</Button>
                  <Button variant="secondary" onClick={printReport}><Printer size={16} /> Save as PDF</Button>
                  <Button onClick={downloadHtmlReport}><Download size={16} /> Download HTML</Button>
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
                  <span className="font-navigation text-[10px] uppercase tracking-widest">Evidence totals</span>
                </div>
                <p className="font-editorial text-xl text-[var(--text-primary)]">{selectedCase.meta.activityLogEntries} log entries</p>
                <p className="font-body text-xs text-[var(--text-sec)] mt-2">{selectedCase.meta.chatMessages} teacher-student messages</p>
              </GlassCard>
            </div>

            <GlassCard className="p-6 md:p-8">
              <h3 className="font-editorial text-2xl text-[var(--text-primary)] mb-3">Executive preview</h3>
              <p className="font-body text-[var(--text-sec)] leading-7">{executiveSummary}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {selectedStations.map((station) => (
                  <div key={station.id} className="flex flex-col gap-1">
                    <StatusChip variant={(stationAvailability.get(station.id)?.available ?? true) ? 'teal' : 'gold'}>
                      S{String(station.id).padStart(2, '0')} {station.label}
                    </StatusChip>
                    {stationAvailability.get(station.id)?.available === false && (
                      <span className="font-body text-[10px] text-[var(--text-muted)] max-w-[220px]">
                        {stationAvailability.get(station.id)?.note}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {activeTab === 'Assessment Architecture' && <AIEngines />}

        {activeTab === 'Final Report' && (
          <div className="space-y-6">
            <GlassCard className="p-5 flex flex-wrap gap-3 items-center justify-between print-hidden">
              <div>
                <h2 className="font-editorial text-2xl text-[var(--text-primary)]">Printable Academic Report</h2>
                <p className="font-body text-sm text-[var(--text-sec)] mt-1">
                  Designed for formal review by the instructor and direct export to PDF.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap">
                <Button variant="secondary" onClick={printReport}><Printer size={16} /> Print / Save PDF</Button>
                <Button onClick={downloadHtmlReport}><FileText size={16} /> Download HTML</Button>
              </div>
            </GlassCard>

            <div className="report-shell">
              <article id="final-report" className="report-print-stack">
                <section className="report-page report-print-page report-print-cover">
                  <header className="report-cover">
                    <div className="report-kicker">Adaptive Blended Assessment Research Dossier</div>
                    <h1 className="report-title">Final Analytical Report for Instructor Review</h1>
                    <p className="report-subtitle">
                      A structured synthesis of the verified workbook evidence, writing development indicators, feedback uptake, and instructional implications for the selected student case.
                    </p>

                    <div className="report-meta-grid">
                      <div className="report-meta-card">
                        <div className="report-meta-label">Student</div>
                        <div className="report-meta-value">{selectedCase.meta.studentName}</div>
                      </div>
                      <div className="report-meta-card">
                        <div className="report-meta-label">Course</div>
                        <div className="report-meta-value">{selectedCase.meta.courseTitle}</div>
                      </div>
                      <div className="report-meta-card">
                        <div className="report-meta-label">Instructor</div>
                        <div className="report-meta-value">{selectedCase.meta.instructor}</div>
                      </div>
                      <div className="report-meta-card">
                        <div className="report-meta-label">Report Date</div>
                        <div className="report-meta-value">{selectedCase.meta.reportGenerated}</div>
                      </div>
                    </div>
                  </header>
                </section>

                <section className="report-page report-print-page">
                  <div className="report-body">
                    <section className="report-section">
                      <h2 className="report-section-title">Executive Summary</h2>
                      <p className="report-text">{executiveSummary}</p>
                      <div className="report-pill-row" style={{ marginTop: '16px' }}>
                        {selectedStations.map((station) => (
                          <span key={station.id} className="report-pill">
                            S{String(station.id).padStart(2, '0')} {station.label}
                          </span>
                        ))}
                      </div>
                      <div className="report-card" style={{ marginTop: '18px' }}>
                        <div className="report-card-label">Method Use In This Report</div>
                        <div className="report-card-note"><strong>System role:</strong> extract workbook evidence, calculate indicators, and surface model outputs only when verified.</div>
                        <div className="report-card-note"><strong>Instructor role:</strong> interpret the evidence, validate writing quality, and decide the actual feedback and classroom intervention.</div>
                      </div>
                    </section>

                    {includeSection([2, 3]) && (
                      <section className="report-section">
                      <div className="report-stat-grid">
                        <div className="report-card">
                          <div className="report-card-label">Assignments Submitted</div>
                          <div className="report-card-value">{selectedCase.meta.totalAssignmentsSubmitted}</div>
                          <div className="report-card-note">Workbook-backed task count recorded in the imported file.</div>
                        </div>
                        <div className="report-card">
                          <div className="report-card-label">Writing Samples</div>
                          <div className="report-card-value">{selectedCase.writing.artifacts.length}</div>
                          <div className="report-card-note">Writing artefacts extracted directly from the workbook sheets.</div>
                        </div>
                        <div className="report-card">
                          <div className="report-card-label">Feedback Views</div>
                          <div className="report-card-value">{selectedCase.student.feedback_views}</div>
                          <div className="report-card-note">Feedback opening count detected in the workbook evidence.</div>
                        </div>
                        <div className="report-card">
                          <div className="report-card-label">Activity Log Entries</div>
                          <div className="report-card-value">{selectedCase.meta.activityLogEntries}</div>
                          <div className="report-card-note">Timestamped Moodle interaction evidence extracted from the workbook export.</div>
                        </div>
                      </div>
                      </section>
                    )}

                    {includeSection([1, 9, 10, 11]) && (
                      <section className="report-section report-dual-grid">
                        <div className="report-card">
                        <div className="report-card-label">Case Profile</div>
                        <div className="report-card-note">
                          <strong>Task scope:</strong> {selectedTask ? `${selectedTask.title} (${selectedTask.date})` : `Full case overview (${selectedCase.meta.periodCovered})`}
                        </div>
                        <div className="report-card-note">
                          <strong>Workbook:</strong> {selectedCase.workbookName}
                        </div>
                        <div className="report-card-note">
                          <strong>Introduction grade field:</strong> {selectedCase.meta.introGrade}
                        </div>
                        <div className="report-card-note">
                          <strong>Feedback viewed at:</strong> {selectedCase.meta.feedbackViewedAt}
                        </div>
                      </div>

                      <div className="report-card">
                        <div className="report-card-label">Instructor Signal</div>
                        <div className="report-card-note">Only direct teacher comments from the imported workbook are reported here.</div>
                        {selectedCase.communication.instructorComments[0] && (
                          <div className="report-card-note">
                            <strong>Most explicit teacher note:</strong> {selectedCase.communication.instructorComments[0].note ?? selectedCase.communication.instructorComments[0].comment}
                          </div>
                        )}
                      </div>
                      </section>
                    )}

                    {selectedVariableIds.length > 0 && (
                      <section className="report-section">
                      <h2 className="report-section-title">Scoped Analytical Table</h2>
                      <div className="report-table-wrap">
                        <table className="report-table">
                          <thead>
                            <tr>
                              <th>Indicator</th>
                              <th>Value</th>
                              <th>Interpretation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {reportRows.map((row) => (
                              <tr key={row.label}>
                                <td>{row.label}</td>
                                <td className="report-value">{row.value}</td>
                                <td>{row.note}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      </section>
                    )}
                  </div>
                </section>

                <section className="report-page report-print-page">
                  <div className="report-body">
                    {includeSection([2, 3]) && (
                      <section className="report-section report-dual-grid">
                      <div className="report-card">
                        <h2 className="report-section-title">Evidence Timeline</h2>
                        <div className="report-timeline">
                          {selectedCase.activity.trace.slice(0, 6).map((entry) => (
                            <div key={`${entry.timestamp}-${entry.event}`} className="report-timeline-item">
                              <div className="report-timeline-date">{entry.timestamp}</div>
                              <h3 className="report-timeline-title">{entry.event}</h3>
                              <div className="report-text">{entry.context}</div>
                              <div className="report-text">{entry.detail}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="report-card">
                        <h2 className="report-section-title">Revision Highlights</h2>
                        <div className="report-timeline">
                          {selectedCase.activity.highlightedSessions.map((session) => (
                            <div key={`${session.start}-${session.end}`} className="report-timeline-item">
                              <div className="report-timeline-date">{session.minutes} minutes · {session.events} events</div>
                              <h3 className="report-timeline-title">{session.start}</h3>
                              <div className="report-text">{session.focus}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      </section>
                    )}

                    {includeSection([4, 5, 12]) && (
                      <section className="report-section report-dual-grid">
                      <div className="report-card">
                        <h2 className="report-section-title">Writing Development Evidence</h2>
                        <div className="report-table-wrap">
                          <table className="report-table">
                            <thead>
                              <tr>
                                <th>Metric</th>
                                <th>Before</th>
                                <th>After</th>
                                <th>Delta</th>
                              </tr>
                            </thead>
                            <tbody>
                              {selectedCase.writing.comparison.metrics.map((metric) => (
                                <tr key={metric.label}>
                                  <td>{metric.label}</td>
                                  <td className="report-value">{metric.before}</td>
                                  <td className="report-value">{metric.after}</td>
                                  <td className="report-value">{metric.delta}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>

                      <div className="report-card">
                        <h2 className="report-section-title">Interpretive Notes</h2>
                        <ul className="report-list">
                          {selectedCase.writing.comparison.commentary.map((item) => (
                            <li key={item}>{item}</li>
                          ))}
                        </ul>
                      </div>
                      </section>
                    )}
                  </div>
                </section>

                <section className="report-page report-print-page">
                  <div className="report-body">
                    {includeSection([2, 9, 10]) && (
                      <section className="report-section report-dual-grid">
                      <div className="report-card">
                        <h2 className="report-section-title">Help-Seeking and Threshold Evidence</h2>
                        <div className="report-card-note">
                          {selectedCase.thresholds.privateMessages.compositeThreshold}
                        </div>
                        <div className="report-timeline">
                          {selectedCase.thresholds.privateMessages.thresholds.map((threshold) => (
                            <div key={threshold.id} className="report-timeline-item">
                              <div className="report-timeline-date">{threshold.matched} matched instance(s)</div>
                              <h3 className="report-timeline-title">{threshold.label}</h3>
                              <div className="report-text"><strong>Rule:</strong> {threshold.threshold}</div>
                              <div className="report-text"><strong>Evidence:</strong> {threshold.evidence}</div>
                              <div className="report-text"><strong>Interpretation:</strong> {threshold.interpretation}</div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="report-card">
                        <h2 className="report-section-title">Teacher Action Planning Notes</h2>
                        <div className="report-card-note">
                          These items are planning prompts generated from verified evidence. They are not automatic feedback delivered to the student.
                        </div>
                        <div className="report-pill-row">
                          <span className="report-pill">Preserve short feedback cycles</span>
                          <span className="report-pill">Expand claim-evidence reasoning</span>
                          <span className="report-pill">Target academic phrasing</span>
                          <span className="report-pill">Use rubric before submission</span>
                        </div>
                        <ul className="report-list" style={{ marginTop: '16px' }}>
                          <li>Ask for one extra explanatory sentence after each example so evidence is interpreted, not only inserted.</li>
                          <li>Require one model-based vocabulary upgrade per revision to improve academic tone without overloading the student.</li>
                          <li>Keep teacher comments narrow and actionable, with one structural target and one language target per round.</li>
                          <li>Use the existing help-seeking tendency productively by linking each question to a concrete revision task.</li>
                        </ul>
                      </div>
                      </section>
                    )}

                    {includeSection([9, 10, 11, 12]) && (
                      <section className="report-section">
                      <div className="report-card">
                        <h2 className="report-section-title">Concluding Judgment</h2>
                        <p className="report-text">
                          This concluding section is limited to verified workbook evidence. It shows a learner who submitted multiple drafts, returned to teacher feedback, and asked clarification questions during the writing cycle. Any higher-level pedagogical classification remains the instructor&apos;s responsibility, while advanced modelling can appear either in case-level mode or in cohort-backed mode depending on the available imported data.
                        </p>
                      </div>
                      </section>
                    )}

                    <footer className="report-footer">
                      Prepared from the verified workbook case for {selectedCase.meta.studentName}. Selected scope: {selectedStations.map((station) => `S${String(station.id).padStart(2, '0')}`).join(', ')}. This HTML report is formatted for direct browser printing and PDF export.
                    </footer>
                  </div>
                </section>
              </article>
            </div>
          </div>
        )}
      </div>
    </ResearchShell>
  );
}
