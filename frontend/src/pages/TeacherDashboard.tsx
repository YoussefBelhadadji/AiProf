import { useState, useEffect } from 'react';
import { ResponsiveContainer, ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, Cell } from 'recharts';
import { Send, ShieldAlert, MessageSquare, ExternalLink, ShieldCheck } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';
import { ResearchShell } from '../layouts/ResearchShell';
import { useStudyScopeStore, type TeacherStudyCase } from '../state/studyScope';
import { useAuthStore } from '../state/authStore';
import { ExplainabilityPanel } from '../components/ExplainabilityPanel';
import { downloadExportCsv } from '../api/exportApi';

export function TeacherDashboard() {
  const cases = useStudyScopeStore((state) => state.cases);
  const [selectedCase, setSelectedCase] = useState<TeacherStudyCase | null>(null);
  const [editedFeedback, setEditedFeedback] = useState("");
  const [interventionNote, setInterventionNote] = useState("");
  const { token } = useAuthStore();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  useEffect(() => {
    if (cases.length > 0) {
      setSelectedCase(cases[0]);
      setEditedFeedback(cases[0].student.personalized_feedback || "");
    }
  }, [cases]);

  const handleStudentSelect = (studyCase: TeacherStudyCase) => {
    setSelectedCase(studyCase);
    setEditedFeedback(studyCase.student.personalized_feedback || "");
    setInterventionNote("");
  };

  const submitFeedback = async () => {
    if (!token) {
      setToastMessage({ message: "Authentication required. Please log in.", type: 'error' });
      navigate('/login');
      return;
    }
    setIsSubmitting(true);
    
    // Using WriteLens API (PORT 5000) - Real API
    const API_BASE = 'http://localhost:5000/api';
    
    try {
      // Update to use real WriteLens API
      const res = await fetch(`${API_BASE}/dashboard`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!res.ok) throw new Error("Failed to fetch updated data from WriteLens API");
      
      // Reload dashboard data
      setToastMessage({ message: "Dashboard updated with real data from WriteLens API", type: 'success' });
    } catch (e: any) {
      setToastMessage({ message: "Error: " + (e instanceof Error ? e.message : String(e)), type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleApprove = () => submitFeedback();
  const handleSaveDraft = () => submitFeedback();
  const handleOverride = () => submitFeedback();

  if (!cases.length || !selectedCase) return <div className="p-8 text-[var(--text-primary)]">Loading Diagnostic Engine...</div>;

  const s = selectedCase.student;

  // Formatting scatter data
  const scatterData = cases.map(c => ({
    x: c.student.time_on_task,
    y: c.student.total_score,
    z: c.student.word_count,
    name: c.student.name,
    studyCase: c
  }));

  return (
    <ResearchShell>
      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-6 pb-32 relative">
        
        {/* Toast Notification */}
        {toastMessage && (
          <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl font-navigation uppercase tracking-widest text-xs z-50 animate-fade-in flex items-center justify-between ${
            toastMessage.type === 'success' ? 'bg-[var(--lav)] text-white shadow-[var(--lav)]/20' : 'bg-[var(--red)] text-white shadow-[var(--red)]/20'
          }`}>
            <span>{toastMessage.message}</span>
            <button onClick={() => setToastMessage(null)} className="ml-4 hover:opacity-70">×</button>
          </div>
        )}

        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-[var(--border)] pb-6">
          <div>
            <h1 className="font-editorial text-4xl text-[var(--text-primary)] flex items-center gap-3">
              <ShieldAlert className="text-[var(--lav)]" size={32} />
              Pedagogical Intervention Board
            </h1>
            <p className="font-navigation text-xs tracking-widest uppercase text-[var(--text-muted)] mt-2">
              Human-in-the-Loop Diagnostic Triage
            </p>
            <p className="font-forensic text-xs text-[var(--text-sec)] mt-2">
              Loaded cases: {cases.length} | Workflow: Auto Analyze | Select Student | Override UI | Final Report
            </p>
          </div>
          <div className="flex gap-2 items-center">
             <Button
                variant="secondary"
                className="text-xs h-8 px-3"
                onClick={async () => {
                  try {
                    await downloadExportCsv();
                    setToastMessage({ message: 'Export successful', type: 'success' });
                  } catch (e: any) {
                    setToastMessage({ message: e.message, type: 'error' });
                  }
                }}
             >
                Export CSV
             </Button>
             <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-forensic text-xs rounded-full">
               Engine: Active
             </span>
          </div>
        </header>

        {/* TOP: Cohort Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <GlassCard className="col-span-1 lg:col-span-3 p-6 min-h-[300px] border-[var(--border)] bg-[var(--bg-base)]/40">
            <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest mb-4">
              Cohort Risk Triage (Process vs Product)
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <ScatterChart margin={{ top: 10, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="x" name="Time on Task (m)" tick={{ fill: 'var(--text-sec)', fontSize: 10 }} />
                <YAxis type="number" dataKey="y" name="Total Score" tick={{ fill: 'var(--text-sec)', fontSize: 10 }} />
                <Tooltip 
                   cursor={{strokeDasharray: '3 3'}}
                   contentStyle={{ backgroundColor: 'var(--bg-high)', borderColor: 'var(--border)', color: 'var(--text-primary)' }}
                />
                <Scatter name="Students" data={scatterData} fill="var(--lav)" onClick={(e: any) => handleStudentSelect(e.studyCase)}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.studyCase.student.student_id === selectedCase.student.student_id ? 'var(--blue)' : 'var(--lav)'} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard className="p-4 overflow-y-auto max-h-[300px]">
            <h3 className="font-navigation text-xs uppercase text-[var(--text-muted)] mb-3">Priority Interventions</h3>
            <div className="space-y-2">
              {cases.map((c) => {
                const s = c.student;
                return (
                <button 
                  key={s.student_id}
                  onClick={() => handleStudentSelect(c)}
                  className={`w-full text-left p-3 rounded-lg border text-sm flex justify-between items-center transition-colors ${
                    selectedCase.student.student_id === s.student_id 
                      ? 'bg-[var(--lav-dim)] border-[var(--lav-border)] text-[var(--text-primary)]' 
                      : 'bg-transparent border-[var(--border)] text-[var(--text-sec)] hover:bg-[var(--bg-raised)]'
                  }`}
                >
                  <span className="font-navigation font-bold">{s.student_id}</span>
                  <span className="font-forensic text-xs">{c.clusterName || 'Pending Archetype'}</span>
                </button>
              )})}
            </div>
          </GlassCard>
        </div>

        {/* BOTTOM: The 3-Column Diagnostic */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-[var(--border)]">
          
          {/* Col 1: Raw Evidence */}
          <GlassCard className="p-6 h-full border-[var(--border)] flex flex-col">
            <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] mb-4">Column 1: Raw Evidence</h3>
            <div className="flex justify-between items-start mb-2 text-[var(--text-primary)]">
               <h2 className="text-2xl font-editorial">{s.name}</h2>
               <Link 
                  to={`/student-profile/${s.student_id}`}
                  className="flex items-center gap-1.5 text-xs font-navigation uppercase tracking-widest text-[var(--lav)] hover:text-[var(--lav-glow)] transition-colors group"
               >
                  Full Profile <ExternalLink size={12} className="group-hover:translate-x-0.5 transition-transform" />
               </Link>
            </div>
            <div className="text-xs font-forensic text-[var(--text-sec)] mb-4">Score: {s.total_score.toFixed(1)}/25 | Error Density: {(s.error_density || 0).toFixed(2)}</div>
            
            <div className="flex-1 bg-[var(--bg-deep)] p-4 rounded-xl border border-[var(--border)] text-sm text-[var(--text-primary)] leading-relaxed overflow-y-auto">
              "{s.sample_text || "No preview available for task."}"
            </div>
          </GlassCard>

          {/* Col 2: AI Diagnostic */}
          <GlassCard className="p-6 h-full border-[var(--lav-border)] bg-[var(--lav-dim)] flex flex-col">
            <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--lav)] mb-4">Column 2: AI Synthesis</h3>
            
            <div className="space-y-6">
              <div>
                <p className="text-xs uppercase font-navigation tracking-wider text-[var(--lav)] mb-2">Triggered Rule Flags</p>
                <div className="flex gap-2 flex-wrap">
                  {(s.interpretations || "").split(';').map((t, i) => (
                    <span key={i} className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--lav-border)] rounded text-xs text-[var(--text-primary)] shadow-sm">
                      {t.trim() || "No issue detected"}
                    </span>
                  ))}
                  {(!s.interpretations) && (
                     <span className="px-2 py-1 bg-[var(--bg-base)] border border-[var(--lav-border)] rounded text-xs text-[var(--text-primary)] shadow-sm">
                       No flag
                     </span>
                  )}
                </div>
              </div>

              <div>
                <p className="text-xs uppercase font-navigation tracking-wider text-[var(--text-muted)] mb-2">Process Engagement Risk</p>
                <div className="h-2 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                   <div 
                     className={`h-full ${s.time_on_task < 60 ? 'bg-red-500' : 'bg-emerald-500'}`} 
                     style={{width: `${Math.min(100, Math.max(10, s.time_on_task / 3))}%`}} 
                   />
                </div>
                <div className="flex justify-between text-xs text-[var(--text-sec)] mt-1 font-forensic">
                  <span>{s.time_on_task} mins</span>
                  <span>{s.rubric_views} Rubric Views</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--lav-border)]/30">
                <ExplainabilityPanel 
                   evidence={{
                      words: s.word_count,
                      timeOnTask: s.time_on_task,
                      errorDensity: s.error_density || 0
                   }}
                   aiStates={{
                      forethought: (s as React.ComponentProps<any>).forethought_risk || 'Normal',
                      engagement: (s as React.ComponentProps<any>).engagement_risk || 'Normal',
                      predictedGain: s.predicted_score || 0
                   }}
                   rulesFired={(s.interpretations || "").split(";").map((t: string) => t.trim()).filter(Boolean)}
                   templates={Object.keys((s as React.ComponentProps<any>).feedback_templates || {})}
                />
              </div>
            </div>
          </GlassCard>

          {/* Col 3: Action Center */}
          <GlassCard className="p-6 h-full border-[var(--blue-glow)] bg-[var(--blue-dim)] flex flex-col">
            <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--blue)] mb-4 flex items-center gap-2">
              <MessageSquare size={14} /> Column 3: Action Center
            </h3>
            
            <div className="flex items-center gap-2 mb-3">
              <span className="text-xs font-navigation uppercase tracking-wider text-[var(--text-primary)] font-bold">Suggested Feedback</span>
              <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--blue)]/20 text-[var(--blue)] border border-[var(--blue)]/30 font-forensic uppercase tracking-widest">AI Draft â€¢ Not Final</span>
            </div>
            <div className="rounded-xl border border-[var(--blue)]/30 bg-[var(--bg-deep)] px-3 py-2 text-xs text-[var(--text-sec)] leading-relaxed flex items-start gap-2 mb-2 italic">
               <ShieldCheck size={14} className="text-[var(--blue)] shrink-0 mt-0.5" />
               <p>Suggested by system; final teacher review required.</p>
            </div>
            
            <textarea 
              className="w-full h-32 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-primary)]  focus:border-[var(--blue)] transition-colors resize-none leading-relaxed mb-4 shadow-inner"
              value={editedFeedback}
              disabled={isSubmitting}
              onChange={(e) => setEditedFeedback(e.target.value)}
            />

            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-navigation uppercase tracking-wider text-[var(--text-primary)] font-bold">Onsite Intervention Note</span>
            </div>
            <textarea 
              className="w-full flex-1 bg-[var(--bg-base)] border border-[var(--border)] rounded-xl p-3 text-sm text-[var(--text-primary)]  focus:border-[var(--blue)] transition-colors resize-none leading-relaxed shadow-inner"
              placeholder="Add private note for face-to-face intervention..."
              value={interventionNote}
              disabled={isSubmitting}
              onChange={(e) => setInterventionNote(e.target.value)}
            />

            <div className="mt-4 flex flex-col gap-3">
              <Button onClick={handleApprove} disabled={isSubmitting} className="w-full flex justify-center items-center gap-2 h-10 text-sm shadow-[0_0_15px_var(--blue-glow)] bg-[var(--blue)] hover:bg-[var(--blue-dim)] hover:text-white border-transparent text-white">
                <Send size={16} /> {isSubmitting ? "Processing..." : "Approve System Output"}
              </Button>
              <div className="flex gap-3">
                 <Button variant="secondary" onClick={handleSaveDraft} disabled={isSubmitting} className="flex-1 text-xs h-9">Save Draft</Button>
                 <Button variant="ghost" onClick={handleOverride} disabled={isSubmitting} className="flex-1 text-xs h-9 text-rose-400 hover:bg-rose-400/10">Override AI</Button>
              </div>
            </div>
          </GlassCard>

        </div>
      </div>
    </ResearchShell>
  );
}

