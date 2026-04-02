import React from 'react';
import { Download, Printer, FileText, ShieldCheck, Zap } from 'lucide-react';
import { STUDY_STATIONS } from '../../state/studyScope';
import type { TeacherStudyCase } from '../../state/studyScope';
import type {
  ReportRow,
  ReportRuleMatch,
} from './reportTypes';

interface FinalReportPrintProps {
  selectedCase: TeacherStudyCase;
  visibleStationIds: number[];
  reportRows: ReportRow[];
  executiveSummary: string;
  ruleMatches: ReportRuleMatch[];
  downloadPdfReport: () => void;
  isExportingPdf: boolean;
  printReport: () => void;
  pdfError: string | null;
}

const REPORT_DOCUMENT_CSS = `
  @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;700&family=Newsreader:ital,wght@0,400;0,700;1,400;1,700&family=Space+Grotesk:wght@400;700&display=swap');

  :root {
    --bg-base: #050811;
    --bg-page: #fdfdfd;
    --lav: #c4b5fd;
    --blue: #3b82f6;
    --teal: #5eead4;
    --text-primary: #0a0f1e;
    --text-muted: #64748b;
    --border: rgba(10, 15, 30, 0.1);
    --border-bright: #c4b5fd;
  }

  body { margin: 0; background: #eaecf0; color: var(--text-primary); font-family: 'Space Grotesk', sans-serif; -webkit-print-color-adjust: exact; }
  
  .report-shell { max-width: 1120px; margin: 40px auto; padding: 0 40px 60px; }
  
  .report-print-stack { display: grid; gap: 40px; }
  
  .report-page { 
    background: var(--bg-page); 
    border: 1px solid var(--border); 
    box-shadow: 0 30px 60px rgba(0,0,0,0.1); 
    overflow: hidden; 
    position: relative;
  }

  @media (min-width: 1024px) { .report-print-page { min-height: 297mm; } }

  /* Cover Page Styling */
  .report-cover { 
    background: #0a0f1e; 
    padding: 80px 100px; 
    color: white; 
    display: flex; 
    flex-direction: column; 
    justify-content: space-between;
    min-height: 297mm;
  }

  .report-kicker { font-family: 'Space Grotesk'; text-transform: uppercase; letter-spacing: 0.4em; font-size: 10px; font-weight: 700; color: var(--lav); margin-bottom: 20px; }
  .report-title { font-family: 'Newsreader'; font-style: italic; font-size: 80px; line-height: 1.1; margin: 0; font-weight: 400; }
  .report-subtitle { font-family: 'Newsreader'; font-size: 24px; font-style: italic; margin-top: 40px; max-width: 700px; opacity: 0.8; line-height: 1.5; color: #cbd5e1; }

  .report-meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 40px; margin-top: 80px; }
  .report-meta-card { padding: 30px; border: 1px solid rgba(255,255,255,0.1); border-radius: 24px; background: rgba(255,255,255,0.03); }
  .report-meta-label { font-family: 'Space Grotesk'; text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em; font-weight: 700; color: var(--lav); margin-bottom: 15px; }
  .report-meta-value { font-family: 'Newsreader'; font-style: italic; font-size: 32px; color: white; }

  /* Interior Body Styling */
  .report-body { padding: 80px 100px; }
  .report-section { margin-bottom: 60px; }
  .report-section-title { font-family: 'Newsreader'; font-style: italic; font-size: 42px; margin-bottom: 30px; border-bottom: 2px solid var(--border); padding-bottom: 20px; }

  .report-text { font-family: 'Newsreader'; font-style: italic; font-size: 22px; line-height: 1.8; color: var(--text-primary); margin-bottom: 30px; }

  /* Stat Grid */
  .report-stat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 30px; }
  .report-card { padding: 40px; border: 1px solid var(--border); border-radius: 32px; background: #f8fafc; }
  .report-card-label { font-family: 'Space Grotesk'; text-transform: uppercase; font-size: 10px; letter-spacing: 0.2em; font-weight: 700; color: var(--text-muted); margin-bottom: 15px; }
  .report-card-value { font-family: 'Newsreader'; font-style: italic; font-size: 48px; color: var(--text-primary); margin-bottom: 10px; }
  .report-card-note { font-size: 12px; color: var(--text-muted); line-height: 1.6; }

  /* Table System */
  .report-table-wrap { margin-top: 20px; border-radius: 24px; overflow: hidden; border: 1px solid var(--border); }
  .report-table { width: 100%; border-collapse: collapse; background: white; }
  .report-table th { padding: 25px 30px; background: #0a0f1e; color: var(--lav); font-size: 10px; text-transform: uppercase; letter-spacing: 0.2em; font-weight: 700; text-align: left; }
  .report-table td { padding: 25px 30px; border-top: 1px solid var(--border); font-size: 14px; line-height: 1.6; vertical-align: top; }
  .report-value { font-family: 'IBM Plex Mono'; font-weight: 700; color: var(--blue); }

  /* Timeline System */
  .report-timeline { display: grid; gap: 30px; }
  .report-timeline-item { border-left: 3px solid var(--lav); padding-left: 30px; margin-left: 5px; position: relative; }
  .report-timeline-item::before { content: ''; position: absolute; left: -8px; top: 0; width: 13px; height: 13px; background: white; border: 3px solid var(--lav); border-radius: 50%; }
  .report-timeline-date { font-family: 'IBM Plex Mono'; font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 8px; }
  .report-timeline-title { font-family: 'Newsreader'; font-style: italic; font-size: 24px; color: var(--text-primary); margin-top: 0; margin-bottom: 10px; }

  .report-pill-row { display: flex; flex-wrap: wrap; gap: 12px; margin-top: 30px; }
  .report-pill { padding: 10px 20px; background: #ede9fe; border: 1px solid #c4b5fd; border-radius: 999px; font-size: 14px; font-weight: 700; color: #6d28d9; font-family: 'Space Grotesk'; text-transform: uppercase; letter-spacing: 0.1em; }

  .report-footer { margin-top: 100px; padding-top: 40px; border-top: 2px solid var(--border); font-size: 11px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.2em; text-align: center; font-weight: 700; }

  @media print {
    body { background: white; }
    .report-shell { max-width: none; margin: 0; padding: 0; }
    .report-page { border: none; box-shadow: none; border-radius: 0; }
    .report-print-page { page-break-after: always; break-after: page; }
    .report-card, .report-table-wrap, .report-timeline-item { break-inside: avoid; page-break-inside: avoid; }
    @page { size: A4; margin: 0mm; }
  }
`;

export const FinalReportPrint: React.FC<FinalReportPrintProps> = ({
  selectedCase,
  visibleStationIds,
  reportRows,
  executiveSummary,
  ruleMatches,
  downloadPdfReport,
  isExportingPdf,
  printReport,
  pdfError,
}) => {
  const selectedStations = STUDY_STATIONS.filter((station) => visibleStationIds.includes(station.id));
  const intents = selectedCase.communication.dialogue.map(m => m.intent).filter(Boolean) as string[];
  const dominantIntent = intents.length > 0 ? Object.keys(intents.reduce((acc, val) => { acc[val] = (acc[val] || 0) + 1; return acc; }, {} as Record<string, number>)).reduce((a, b) => intents.filter(v => v === a).length > intents.filter(v => v === b).length ? a : b) : 'None Recorded';

  return (
    <div className="space-y-10">
      
      {/* Dashboard Controls */}
      <div className="glass-card p-10 flex flex-wrap gap-8 items-center justify-between border-[var(--border)] bg-[rgba(255,255,255,0.02)] print:hidden">
         <div className="flex items-center gap-6">
            <div className="p-4 rounded-2xl bg-[var(--lav-dim)] border border-[var(--lav-border)] text-[var(--lav)] shadow-[0_0_20px_var(--lav-glow)]">
               <FileText className="w-8 h-8" />
            </div>
            <div>
               <h2 className="font-editorial text-3xl italic text-[var(--text-primary)]">Verified Academic Dossier</h2>
               <p className="font-body text-xs text-[var(--text-muted)] mt-1 italic">
                  Academic research generation for formal instructor validation and external audit.
               </p>
            </div>
         </div>
         <div className="flex gap-4">
            <button 
              onClick={downloadPdfReport} 
              disabled={isExportingPdf}
              className="px-6 py-3 rounded-xl bg-[var(--bg-high)] border border-[var(--border)] text-xs font-navigation font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors"
            >
               <Download className="w-4 h-4" />
               {isExportingPdf ? 'Exporting...' : 'Download PDF'}
            </button>
            <button 
               onClick={printReport}
               className="px-8 py-3 rounded-xl bg-[var(--lav)] text-white text-xs font-navigation font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_var(--lav-glow)] flex items-center gap-2 hover:scale-[1.02] transition-all"
            >
               <Printer className="w-4 h-4" />
               Print Dossier
            </button>
         </div>
      </div>

      {pdfError && (
        <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-forensic flex items-center gap-3">
           <Zap className="w-4 h-4" /> {pdfError}
        </div>
      )}

      {/* Styled Report Shell */}
      <style dangerouslySetInnerHTML={{ __html: REPORT_DOCUMENT_CSS }} />
      <div className="report-shell">
        <article id="final-report" className="report-print-stack">
           
           {/* PAGE 1: Cover Page */}
           <section className="report-page report-print-page report-cover">
              <div>
                  <div className="report-kicker">WriteLens: Blended Assessment Research Protocol</div>
                  <h1 className="report-title">{selectedCase.meta.courseTitle || 'Adaptive Blended Assessment'}</h1>
                  <p className="report-subtitle">
                    Adaptive Blended Assessment Through Learning Analytics and Artificial Intelligence to Enhance Academic Writing: A Case Study of Third-Year EFL Students.
                  </p>
                 
                 <div className="mt-16 p-10 rounded-[40px] border border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] backdrop-blur-xl">
                    <div className="flex items-center gap-4 mb-4">
                       <ShieldCheck className="w-6 h-6 text-[var(--lav)]" />
                       <span className="font-navigation text-xs uppercase font-bold tracking-[0.3em] text-[var(--lav)]">Forensic Verification Status: High</span>
                    </div>
                    <p className="font-editorial text-lg italic text-[#94a3b8] leading-relaxed">
                       This dossier translates automated indicators into transparent pedagogical evidence. The system organizes decision-support layers (Clustering, Random Forest, Bayesian Inference) to ensure final teacher judgment is theoretically grounded and data-informed.
                    </p>
                 </div>
              </div>

               <div className="report-meta-grid">
                  <div className="report-meta-card">
                     <div className="report-meta-label">Student ID (Internal)</div>
                     <div className="report-meta-value">{selectedCase.meta.studentName}</div>
                  </div>
                  <div className="report-meta-card">
                     <div className="report-meta-label">Research Institution</div>
                     <div className="report-meta-value">Belhadj Bouchaib University</div>
                  </div>
                  <div className="report-meta-card">
                     <div className="report-meta-label">Analytical Phase</div>
                     <div className="report-meta-value" style={{ fontFamily: 'monospace', fontSize: '20px' }}>Tier 3: Adaptive Feedback</div>
                  </div>
                  <div className="report-meta-card">
                     <div className="report-meta-label">Generation Date</div>
                     <div className="report-meta-value">{new Date().toLocaleDateString()}</div>
                  </div>
               </div>
           </section>

           {/* PAGE 2: Summary & Stats */}
           <section className="report-page report-print-page">
              <div className="report-body">
                 <section className="report-section">
                    <h2 className="report-section-title">Executive Forensic Summary</h2>
                    <p className="report-text">&quot;{executiveSummary}&quot;</p>
                    <div className="report-pill-row">
                       {selectedStations.map(s => (
                         <span key={s.id} className="report-pill">S{String(s.id).padStart(2, '0')} {s.label}</span>
                       ))}
                    </div>
                 </section>

                  <section className="report-section">
                     <h2 className="report-section-title">Phase 1 â€” Writing Performance Diagnosis</h2>
                     <p className="report-text">Evaluation of the essay using the doctoral analytical rubric (Weigle, 2002). Scores represent normalized faculty ratings across key linguistic/rhetorical dimensions.</p>
                     <div className="report-stat-grid">
                        <div className="report-card">
                           <div className="report-card-label">Overall Writing Quality</div>
                           <div className="report-card-value">{(reportRows.filter(r => ['argumentation', 'cohesion', 'grammar_accuracy'].includes(r.label.toLowerCase())).reduce((acc, r) => acc + (parseFloat(String(r.value)) || 0), 0) / 3).toFixed(1)}</div>
                           <div className="report-card-note">Mean score across primary analytical categories.</div>
                        </div>
                        <div className="report-card">
                           <div className="report-card-label">Writing Artifacts</div>
                           <div className="report-card-value font-mono">{selectedCase.writing.artifacts.length}</div>
                           <div className="report-card-note">Verified submissions extracted from the intervention trace.</div>
                        </div>
                     </div>
                  </section>

                 <section className="report-section">
                     <h2 className="report-section-title">Phase 2 â€” Behavioral Indicator Mapping</h2>
                     <p className="report-text">Extraction of cognitive and productive engagement metrics from the Moodle platform (Siemens, 2013).</p>
                     <div className="report-table-wrap">
                        <table className="report-table">
                           <thead>
                              <tr>
                                 <th>Indicator</th>
                                 <th>Observed Value</th>
                                 <th>Pedagogical Interpretation</th>
                              </tr>
                           </thead>
                           <tbody>
                              {reportRows.map(row => (
                                <tr key={row.label}>
                                   <td style={{ fontWeight: 700 }}>{row.label}</td>
                                   <td className="report-value">{row.value}</td>
                                   <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>{row.note}</td>
                                </tr>
                              ))}
                              {dominantIntent !== 'None Recorded' && (
                                <tr>
                                   <td style={{ fontWeight: 700 }}>Help-Seeking Trace</td>
                                   <td className="report-value" style={{ color: 'var(--lav)' }}>{dominantIntent}</td>
                                   <td style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>Dominant qualitative categorization of student requests (Zimmerman, 2008).</td>
                                </tr>
                              )}
                           </tbody>
                        </table>
                     </div>
                  </section>
              </div>
           </section>

           {/* PAGE 3: Timeline & Behavior */}
           <section className="report-page report-print-page">
              <div className="report-body">
                 <section className="report-section">
                    <h2 className="report-section-title">Forensic Timeline Trace</h2>
                    <div className="report-timeline">
                       {selectedCase.activity.trace.slice(0, 6).map((entry, i) => (
                         <div key={i} className="report-timeline-item">
                            <div className="report-timeline-date">{entry.timestamp}</div>
                            <h3 className="report-timeline-title">{entry.event}</h3>
                            <div className="report-card-note">{entry.context} Â· {entry.detail}</div>
                         </div>
                       ))}
                    </div>
                 </section>

                 <section className="report-section">
                    <h2 className="report-section-title">Writing Development Evidence</h2>
                    <div className="report-table-wrap">
                       <table className="report-table">
                          <thead>
                             <tr>
                                <th>Metric</th>
                                <th>Prior Baseline</th>
                                <th>Current State</th>
                                <th>Observed Delta</th>
                             </tr>
                          </thead>
                          <tbody>
                             {selectedCase.writing.comparison.metrics.map((metric, i) => (
                               <tr key={i}>
                                  <td style={{ fontWeight: 700 }}>{metric.label}</td>
                                  <td className="report-value" style={{ color: 'var(--text-muted)' }}>{metric.before}</td>
                                  <td className="report-value">{metric.after}</td>
                                  <td className="report-value" style={{ color: metric.delta.includes('+') ? 'var(--teal)' : 'var(--blue)' }}>{metric.delta}</td>
                               </tr>
                             ))}
                          </tbody>
                       </table>
                    </div>
                 </section>
              </div>
           </section>

           {/* PAGE 4: Concluding Synthesis */}
           <section className="report-page report-print-page">
              <div className="report-body">
                 <section className="report-section">
                     <h2 className="report-section-title">Phase 3 â€” Adaptive Feedback Generation</h2>
                     <p className="report-text">Operationalization of the adaptive assessment mechanism. Rule-based triggers provide the bridge between analytics and intervention.</p>
                     <div className="report-table-wrap">
                        <table className="report-table">
                           <thead>
                              <tr>
                                 <th>Rule</th>
                                 <th>AI State Diagnosis</th>
                                 <th>Interpretation (Theoretical Justification)</th>
                                 <th>Intervention Strategy</th>
                              </tr>
                           </thead>
                           <tbody>
                              {ruleMatches.map(m => (
                                <tr key={m.rule_id}>
                                   <td className="report-value">{m.rule_id}</td>
                                   <td style={{ fontStyle: 'italic' }}>{m.ai_learner_state_output}</td>
                                   <td>{m.pedagogical_interpretation} <br/><span style={{fontSize: '10px', color: 'var(--text-muted)'}}>{m.theoretical_justification}</span></td>
                                   <td style={{ fontWeight: 700 }}>{m.onsite_interventions[0]?.replace(/_/g, ' ')}</td>
                                </tr>
                              ))}
                           </tbody>
                        </table>
                     </div>
                  </section>

                 <section className="report-section">
                     <h2 className="report-section-title">Final Adaptive Delivery Checklist</h2>
                     <div className="report-card" style={{ background: '#0a0f1e', color: 'white', border: 'none' }}>
                        <div className="flex items-center gap-3 mb-6">
                           <Zap className="w-5 h-5 text-[var(--lav)]" />
                           <span className="font-navigation text-xs uppercase font-bold tracking-widest text-[var(--lav)]">Instructional Protocol for Defensibility</span>
                        </div>
                        <ul className="space-y-4 font-editorial text-lg italic text-[#cbd5e1] leading-relaxed p-0 list-none">
                           <li className="flex gap-4"><ShieldCheck className="w-5 h-5 shrink-0 text-[var(--teal)]" /> <b>Strengths Identified:</b> Baseline writing stability and active behavioral logins.</li>
                           <li className="flex gap-4"><ShieldCheck className="w-5 h-5 shrink-0 text-[var(--teal)]" /> <b>Areas for Improvement:</b> Latent argumentative logic and self-regulated revision frequency.</li>
                           <li className="flex gap-4"><ShieldCheck className="w-5 h-5 shrink-0 text-[var(--teal)]" /> <b>Methodological Note:</b> These sheets serve as qualitative evidence of the adaptive intervention, complementing the pre/post statistical analysis.</li>
                        </ul>
                     </div>
                 </section>

                 <footer className="report-footer">
                    End of Analytical Dossier Â· Generated via WriteLens Research Platform Â· {selectedCase.meta.institution}
                 </footer>
              </div>
           </section>

        </article>
      </div>
    </div>
  );
};

