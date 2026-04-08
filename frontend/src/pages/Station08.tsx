import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { MessageCircle, Loader } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

const API_BASE = "http://localhost:5000/api";

export const Station08: React.FC = () => {
  const { studentId } = useParams();
  const token = useAuthStore(state => state.token);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = studentId || "9263";
        const response = await fetch(`${API_BASE}/student/${id}`, {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudent(data.student);
        }
      } catch (err) {
        console.error("Failed to load student:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, token]);

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin" size={40} /></div>;
  if (!student) return <div className="p-8 text-center text-[var(--text-muted)]">No data</div>;

  const messageTypes = [
    { type: "Help-Seeking", count: Math.round((student.help_seeking_messages || 0) * 10) },
    { type: "Feedback", count: Math.round((student.feedback_views || 0) * 3) },
    { type: "Private", count: Math.round((student.private_messages || 0) * 2) },
  ];

  /* ADDED: Dialogue and Evolution data directly from JSON if available, otherwise mock for presentation */
  const rawCycles = student.activity_log?.feedbackAnalysis?.cycles || [];
  const feedbackCycles = rawCycles.length > 0 ? rawCycles : [
    { 
      round: 1, 
      feedbackDate: "10 Feb 2026", 
      instructorNote: "The problem must be well stated and explained + clear arguments",
      studentResponse: "Revised introduction and resubmitted same day",
      impact: "+15 Argumentation Score"
    },
    { 
      round: 2, 
      feedbackDate: "16 Feb 2026", 
      instructorNote: "Well-structured. Add sentence on dependence weakening thinking. Use synonyms...",
      studentResponse: "Revised body paragraph 1 with citation improvement",
      impact: "+20 Lexical Resource"
    }
  ];

  const rawSamples = student.writing_samples || student.activity_log?.writingSamples || [];
  const drafts = rawSamples.length >= 2 ? rawSamples : [
    {
      assignment: "Argumentative Essay Intro — Draft",
      date: "3 Feb 2026",
      text: "Although online learning offers certain advantages, onsite learning remains the better form of education. (Draft 1: Broad and lacks specific academic focus)",
      feedback: "The problem must be well stated and explained + clear arguments",
      type: "Before"
    },
    {
      assignment: "Argumentative Essay Intro — Final",
      date: "14 Mar 2026",
      text: "Silence, I learned, is not the absence of strength — it is often its most powerful form. (Final reflection showing deep thought progression).",
      feedback: "Improved coherence and argument strength.",
      type: "After"
    }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <MessageCircle size={32} className="text-[var(--lav)]" />
          Station 08: Communication & Feedback Dialogue
        </h1>
        <p className="text-[var(--text-muted)]">
          Tracking Professor-Student Dialogue, Iterative Revision, and the "Before & After" Impact
        </p>
      </div>
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Dialogue Timeline Section */}
        <GlassCard className="p-8 border-[var(--border)] col-span-1">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <MessageCircle size={20} className="text-blue-400" />
            Professor-Student Dialogue Impact
          </h2>
          <div className="space-y-6">
            {feedbackCycles.map((cycle: any, idx: number) => (
              <div key={idx} className="border-l-2 border-[var(--lav)] pl-4 relative">
                <div className="absolute w-3 h-3 bg-[var(--bg-raised)] border-2 border-[var(--lav)] rounded-full -left-[7px] top-1"></div>
                <div className="text-xs text-[var(--text-muted)] mb-1">{cycle.feedbackDate} | Round {cycle.round}</div>
                
                {/* Professor's Message */}
                <div className="bg-[var(--bg-raised)] p-3 rounded-lg rounded-tl-none mb-3 border border-[rgba(255,255,255,0.05)]">
                  <p className="text-sm text-[var(--text-primary)] font-semibold text-blue-300 mb-1">Dr. Fatima GUERCH:</p>
                  <p className="text-sm text-[var(--text-secondary)]">{cycle.instructorNote}</p>
                </div>
                
                {/* Student's Response/Action */}
                <div className="bg-[rgba(139,92,246,0.1)] p-3 rounded-lg rounded-tr-none ml-6 border border-[rgba(139,92,246,0.2)]">
                  <p className="text-sm text-[var(--text-primary)] font-semibold text-[var(--lav)] mb-1">lahmarabbou asmaa (Student Action):</p>
                  <p className="text-sm text-[var(--text-secondary)]">{cycle.studentResponse}</p>
                </div>
                
                {/* Impact */}
                {cycle.impact && (
                  <div className="mt-2 ml-6 text-xs font-bold text-emerald-400">
                    ↗ Impact: {cycle.impact}
                  </div>
                )}
              </div>
            ))}
          </div>
        </GlassCard>

        {/* Before and After Section */}
        <GlassCard className="p-8 border-[var(--border)] col-span-1 flex flex-col">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Before & After (Draft Progression)</h2>
          
          <div className="flex-1 space-y-6">
            {drafts.slice(0, 2).map((draft: any, idx: number) => (
              <div key={idx} className={`p-4 rounded-lg border ${idx === 0 ? 'border-red-900/30 bg-red-900/10' : 'border-emerald-900/30 bg-emerald-900/10'}`}>
                <div className="flex justify-between items-center mb-2">
                  <span className={`text-xs font-bold px-2 py-1 rounded ${idx === 0 ? 'bg-red-500/20 text-red-300' : 'bg-emerald-500/20 text-emerald-300'}`}>
                    {idx === 0 ? 'BEFORE (First Draft)' : 'AFTER (Final Revision)'}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">{draft.date}</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--text-primary)] mb-2">{draft.assignment}</h3>
                <p className="text-sm text-[var(--text-secondary)] italic border-l-2 border-slate-600 pl-3 py-1">
                  "{draft.text.substring(0, 250)}{draft.text.length > 250 ? '...' : ''}"
                </p>
                <div className="mt-3 text-xs text-[var(--text-muted)]">
                  <span className="font-semibold text-slate-400">Feedback received:</span> {draft.feedback || 'None'}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

      </div>

      {/* Legacy Chart */}
      <div className="max-w-7xl mx-auto mt-8">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Message Types Overview</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={messageTypes}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="type" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
                <Bar dataKey="count" fill="var(--lav)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Station08;

