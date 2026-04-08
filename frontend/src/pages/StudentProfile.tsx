import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
  ResponsiveContainer, XAxis, YAxis,
  Tooltip as RechartsTooltip, RadarChart,
  PolarGrid, PolarAngleAxis, Radar, BarChart, Bar, Cell
} from 'recharts';
import {
  ArrowLeft, BrainCircuit, Activity, FileText,
  CheckCircle2, AlertTriangle, TrendingUp,
  MessageSquare, Clock, BarChart3
} from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';
import { MetricCard } from '../components/MetricCard';

const API_BASE = 'http://localhost:5000/api';

export function StudentProfile() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'history'>('overview');

  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStudent = async () => {
      try {
        // Try to get token from store first, then from sessionStorage
        let token = useAuthStore.getState().token;
        if (!token && typeof window !== 'undefined') {
          token = sessionStorage.getItem('writelens-auth-token');
        }
        
        // Check if token exists
        if (!token) {
          setError('authentication-required');
          setLoading(false);
          return;
        }

        const studentId = id || '9263';
        const response = await fetch(`${API_BASE}/student/${studentId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          if (response.status === 401) {
            // Clear auth state and redirect to login
            useAuthStore.getState().logout();
            setError('session-expired');
            return;
          } else if (response.status === 404) {
            setError('student-not-found');
          } else {
            setError('api-error');
          }
          return;
        }

        const data = await response.json();
        setStudent(data.student);
        setError(null);
      } catch (err: any) {
        console.error('Failed to fetch student:', err);
        setError('network-error');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center space-y-3">
        <div className="w-8 h-8 border-2 border-[var(--lav)] border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-[var(--text-primary)] font-medium">Loading Student Profile</p>
        <p className="text-[var(--text-muted)] text-xs">Fetching analysis data...</p>
      </div>
    </div>
  );

  if (error) {
    const errorConfig: Record<string, { title: string; message: string; buttons: React.ReactNode }> = {
      'session-expired': {
        title: 'Session Expired',
        message: 'Your login session has expired. Please authenticate again to continue.',
        buttons: (
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-[var(--lav)] hover:bg-[var(--lav)]/80 text-white font-bold rounded-lg transition-colors"
          >
            Return to Login
          </button>
        )
      },
      'authentication-required': {
        title: 'Authentication Required',
        message: 'Please log in to access student profiles.',
        buttons: (
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-2 bg-[var(--lav)] hover:bg-[var(--lav)]/80 text-white font-bold rounded-lg transition-colors"
          >
            Go to Login
          </button>
        )
      },
      'student-not-found': {
        title: 'Student Not Found',
        message: 'The requested student profile could not be found. The student data may not have been imported yet.',
        buttons: (
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/students')}
              className="px-6 py-2 bg-[var(--lav)] hover:bg-[var(--lav)]/80 text-white font-bold rounded-lg transition-colors"
            >
              Back to Students
            </button>
            <button
              onClick={() => navigate('/import')}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Import Data
            </button>
          </div>
        )
      },
      'api-error': {
        title: 'Server Error',
        message: 'Failed to load student data from the server. Please ensure the backend API is running.',
        buttons: (
          <div className="flex gap-3">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
            >
              Dashboard
            </button>
          </div>
        )
      },
      'network-error': {
        title: 'Network Error',
        message: 'Unable to connect to the server. Check your internet connection and try again.',
        buttons: (
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-bold rounded-lg transition-colors"
          >
            Retry
          </button>
        )
      }
    };

    const config = errorConfig[error] || errorConfig['api-error'];

    return (
      <div className="p-8 max-w-lg mx-auto">
        <GlassCard className="p-8 border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-400 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-red-400 mb-2 text-lg">{config.title}</h3>
              <p className="text-red-300 text-sm mb-6">{config.message}</p>
              <div className="flex flex-wrap gap-3">
                {config.buttons}
                <button
                  onClick={() => navigate(-1)}
                  className="px-6 py-2 border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-raised)] font-bold rounded-lg transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="p-8 max-w-lg mx-auto">
        <GlassCard className="p-8 border-amber-500/30 bg-amber-500/10">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-amber-400 flex-shrink-0 mt-1" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-amber-400 mb-2">No Data Available</h3>
              <p className="text-amber-300 text-sm mb-6">Student profile data could not be loaded.</p>
              <button
                onClick={() => navigate('/students')}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors"
              >
                Back to Students
              </button>
            </div>
          </div>
        </GlassCard>
      </div>
    );
  }

  // Data transformations
  const srlRadarData = [
    { subject: 'Argumentation', value: (parseFloat(student.argumentation) || 0) * 20, fullMark: 100 },
    { subject: 'Cohesion', value: (parseFloat(student.cohesion) || 0) * 20, fullMark: 100 },
    { subject: 'Grammar', value: (parseFloat(student.grammar_accuracy) || 0) * 20, fullMark: 100 },
    { subject: 'Lexical', value: (parseFloat(student.lexical_resource) || 0) * 20, fullMark: 100 },
    { subject: 'Task Score', value: (parseFloat(student.total_score) || 0) * 3.125, fullMark: 100 },
  ];

  const activityLog: any[] = student.activity_type ? [{
    date: student.timestamp,
    action: student.activity_type,
    detail: student.message_text || "No details",
  }] : [];

  const assignments: any[] = [{
    id: student.task_id,
    title: "Essay Draft",
    grade: student.total_score,
    feedback: "Available"
  }];

  const barColors = ['#a78bfa', '#60a5fa', '#34d399'];

  return (
    <div className="max-w-[1200px] mx-auto p-4 md:p-8 pb-32">

        {/* CLEAN HEADER */}
        <div className="mb-8 pb-6 border-b border-[var(--border)]">
          <div className="flex items-start gap-4 mb-6">
            <button
              onClick={() => navigate('/students')}
              className="p-2 text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-full transition-all shrink-0"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
              <h1 className="font-editorial text-3xl md:text-4xl text-[var(--text-primary)]">
                Student {student?.student_id}
              </h1>
              <div className="flex flex-wrap items-center gap-2 mt-3">
                <span className="px-2.5 py-1 bg-[var(--lav)]/10 text-[var(--lav)] border border-[var(--lav)]/30 text-xs rounded uppercase tracking-wider font-bold">
                  {student?.cluster_archetype}
                </span>
                <span className={`px-2 py-0.5 text-xs font-bold rounded ${
                  student?.risk_level === 'HIGH'
                    ? 'bg-red-500/10 text-red-400'
                    : student?.risk_level === 'MEDIUM'
                    ? 'bg-amber-500/10 text-amber-400'
                    : 'bg-emerald-500/10 text-emerald-400'
                }`}>
                  {student?.risk_level} RISK
                </span>
              </div>
            </div>
            <Button className="text-xs h-9 px-3 flex items-center gap-2 bg-[var(--lav)] hover:bg-[var(--lav-glow)] text-white border-transparent whitespace-nowrap">
              <Activity size={13} /> Add Note
            </Button>
          </div>
        </div>

        {/* TAB NAVIGATION */}
        <div className="flex gap-0 border-b border-[var(--border)] mb-8 flex-wrap">
          {[
            { id: 'overview', label: 'Overview', icon: BrainCircuit },
            { id: 'analysis', label: 'Deep Analysis', icon: BarChart3 },
            { id: 'history', label: 'History & Feedback', icon: Clock }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-navigation uppercase tracking-wider transition-all border-b-2 ${
                activeTab === tab.id
                  ? 'text-[var(--lav)] border-[var(--lav)] font-bold'
                  : 'text-[var(--text-muted)] border-transparent hover:text-[var(--text-sec)]'
              }`}
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden text-xs">{tab.label.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        {/* OVERVIEW TAB - Clean summary view */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* MAIN METRICS - LESS CRAMPED */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <MetricCard
                label="Overall Score"
                value={`${student?.total_score}%`}
                interpretation="Performance"
                icon={TrendingUp}
                accent="lav"
              />
              <MetricCard
                label="Success Rate"
                value={`${student?.success_probability}%`}
                interpretation="Predicted"
                icon={CheckCircle2}
                accent="teal"
              />
              <MetricCard
                label="SRL Profile"
                value={`${student?.srl_overall}%`}
                interpretation="Self-Regulation"
                icon={BrainCircuit}
                accent="gold"
              />
            </div>

            {/* ENGAGEMENT & RESPONSIVENESS */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <MetricCard
                label="Engagement"
                value={String(student?.total_log_entries || 0)}
                interpretation="Moodle Entries"
                icon={Activity}
                accent="teal"
              />
              <MetricCard
                label="Responsiveness"
                value={`${student?.feedback_responsiveness}%`}
                interpretation="To Feedback"
                icon={MessageSquare}
                accent="lav"
              />
            </div>

            {/* SUBMISSION & ATTENDANCE STATS */}
            <div className="grid grid-cols-2 md:grid-cols-2 gap-4">
              <GlassCard className="p-5 border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-bold">Formal Grade</p>
                <p className="text-3xl font-bold text-amber-400">{student?.grade_received}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">Only graded assignment</p>
              </GlassCard>
              <GlassCard className="p-5 border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-bold">Early Submissions</p>
                <p className="text-3xl font-bold text-emerald-400">{student?.early_submissions}</p>
                <p className="text-xs text-[var(--text-muted)] mt-2">Out of 10 assignments</p>
              </GlassCard>
            </div>

            {/* ATTENDANCE STATS */}
            <div className="grid grid-cols-2 gap-4">
              <GlassCard className="p-5 border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-bold">Attendance Sem 1</p>
                <p className="text-2xl font-bold text-[var(--text-sec)]">{student?.attendance_sem1}</p>
              </GlassCard>
              <GlassCard className="p-5 border-[var(--border)]">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-bold">Attendance Sem 2</p>
                <p className="text-2xl font-bold text-red-400">{student?.attendance_sem2}</p>
                <p className="text-xs text-red-400/60 mt-1">⚠ Critical</p>
              </GlassCard>
            </div>

            {/* STRENGTHS & RISKS SIDE BY SIDE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
                <h3 className="font-navigation text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-emerald-400">
                  <CheckCircle2 size={16} /> Strengths
                </h3>
                <div className="space-y-3">
                  {(student?.strengths || []).map((s: string, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <CheckCircle2 size={13} className="text-emerald-500 shrink-0 mt-1" />
                      <p className="text-sm text-[var(--text-primary)] leading-relaxed">{s}</p>
                    </div>
                  ))}
                </div>
              </GlassCard>

              <GlassCard className="p-6 border-red-500/20 bg-red-500/5">
                <h3 className="font-navigation text-sm font-bold uppercase tracking-widest flex items-center gap-2 mb-4 text-red-400">
                  <AlertTriangle size={16} /> Areas for Support
                </h3>
                <div className="space-y-3">
                  {(student?.risk_factors || []).map((rf: any, i: number) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className={`text-xs px-1 py-0.5 rounded font-bold shrink-0 ${
                        rf.severity === 'HIGH' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'
                      }`}>{rf.severity}</span>
                      <div>
                        <p className="text-sm font-bold text-[var(--text-primary)]">{rf.factor}</p>
                        <p className="text-xs text-[var(--text-muted)] leading-relaxed">{rf.detail}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </GlassCard>
            </div>

            {/* AI RECOMMENDATION */}
            <GlassCard className="p-6 border-[var(--lav)]/30 bg-[var(--lav)]/5">
              <h3 className="font-navigation text-sm font-bold text-[var(--lav)] uppercase tracking-widest flex items-center gap-2 mb-3">
                <BrainCircuit size={16} /> System Recommendation
              </h3>
              <p className="text-sm leading-relaxed text-[var(--text-primary)]">
                {student?.recommendation || 'No recommendation available'}
              </p>
            </GlassCard>
          </div>
        )}

        {/* ANALYSIS TAB - Detailed charts and competence assessment */}
        {activeTab === 'analysis' && (
          <div className="space-y-6">
            {/* SRL RADAR CHART */}
            <GlassCard className="p-6 border-[var(--border)]">
              <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 mb-6">
                <BrainCircuit size={16} className="text-[var(--lav)]" /> Self-Regulated Learning Profile
              </h3>
              <div className="h-[280px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={srlRadarData}>
                    <PolarGrid stroke="var(--border)" />
                    <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: 'var(--text-sec)' }} />
                    <Radar name="Student" dataKey="value" stroke="var(--lav)" fill="var(--lav)" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            {/* BAYESIAN COMPETENCE */}
            <GlassCard className="p-6 border-[var(--border)]">
              <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 mb-5">
                <BrainCircuit size={16} className="text-purple-500" /> Competence Assessment
              </h3>
              <div className="space-y-5">
                {[
                  {
                    label: 'Argumentation',
                    pct: student?.bayesian_argumentation_pct || 0,
                    lbl: student?.bayesian_argumentation_label || 'Developing',
                    color: '#a78bfa'
                  },
                  {
                    label: 'Self-Regulation',
                    pct: student?.bayesian_srl_pct || 0,
                    lbl: student?.bayesian_srl_label || 'Adequate',
                    color: '#f59e0b'
                  },
                  {
                    label: 'Academic Language',
                    pct: student?.bayesian_linguistic_pct || 0,
                    lbl: student?.bayesian_linguistic_label || 'Adequate',
                    color: '#34d399'
                  },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-bold text-[var(--text-primary)]">{item.label}</span>
                      <span className="text-sm font-bold" style={{ color: item.color }}>
                        {item.pct}%
                      </span>
                    </div>
                    <div className="h-2.5 w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-full overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${item.pct}%`, background: item.color }} />
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{item.lbl}</p>
                  </div>
                ))}
              </div>
            </GlassCard>

            {/* SUCCESS PREDICTION */}
            <GlassCard className="p-6 border-[var(--border)]">
              <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 mb-5">
                <TrendingUp size={16} className="text-[var(--blue)]" /> Success Probability
              </h3>
              <div className="p-5 rounded-lg bg-[var(--bg-raised)] border border-[var(--border)] mb-6">
                <p className="text-xs text-[var(--text-muted)] mb-2 uppercase tracking-wider font-bold">Predicted Success Rate</p>
                <div className="text-4xl font-editorial font-bold text-[var(--blue)]">{student?.success_probability}%</div>
                <p className="text-xs text-[var(--text-muted)] mt-3">{student?.predicted_outcome}</p>
              </div>
              <p className="text-xs text-[var(--text-muted)] mb-4 uppercase tracking-wider font-bold">Key Predictive Factors:</p>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    layout="vertical"
                    data={[
                      { name: 'SRL Behavior', value: 30 },
                      { name: 'Feedback Response', value: 20 },
                      { name: 'Argumentation', value: 20 },
                      { name: 'Engagement', value: 15 },
                      { name: 'Submission Timing', value: 15 },
                    ]}
                    margin={{ left: 120, right: 20, top: 0, bottom: 0 }}
                  >
                    <XAxis type="number" tick={{ fontSize: 9, fill: 'var(--text-muted)' }} domain={[0, 35]} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: 'var(--text-sec)' }} width={120} />
                    <RechartsTooltip formatter={(v: any) => `${v}%`} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]}>
                      {[0,1,2,3,4].map(i => (
                        <Cell key={i} fill={barColors[i % barColors.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        )}

        {/* HISTORY TAB - Submissions, feedback, and activity */}
        {activeTab === 'history' && (
          <div className="space-y-6">
            {/* ASSIGNMENTS TABLE */}
            <GlassCard className="p-6 border-[var(--border)]">
              <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 mb-5">
                <FileText size={16} /> Assignments Submitted
              </h3>
              {assignments && assignments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] border-b border-[var(--border)]">
                        <th className="text-left py-3 px-4">Title</th>
                        <th className="text-left py-3 px-4">Score</th>
                        <th className="text-left py-3 px-4">Feedback</th>
                      </tr>
                    </thead>
                    <tbody>
                      {assignments.map((a: any) => (
                        <tr key={a.id} className="border-b border-[var(--border)]/50 hover:bg-[var(--bg-raised)] transition-colors">
                          <td className="py-3 px-4 text-[var(--text-primary)] font-bold">{a.title}</td>
                          <td className="py-3 px-4 text-amber-400 font-bold text-lg">{a.grade}%</td>
                          <td className="py-3 px-4">
                            <span className="text-xs px-2 py-1 rounded font-bold bg-emerald-500/10 text-emerald-400">
                              {a.feedback}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">No assignments recorded</p>
              )}
            </GlassCard>

            {/* FEEDBACK CYCLES */}
            <GlassCard className="p-6 border-[var(--border)]">
              <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 mb-5">
                <MessageSquare size={16} className="text-[var(--blue)]" /> Instructor Feedback
              </h3>
              {(student?.feedback_cycles && student.feedback_cycles.length > 0) ? (
                <div className="space-y-4">
                  {student.feedback_cycles.map((cycle: any) => (
                    <div key={cycle.round} className="p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-deep)]">
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold text-[var(--blue)] bg-[var(--blue)]/10 px-2 py-0.5 rounded uppercase">
                          Round {cycle.round}
                        </span>
                        <span className="text-xs text-[var(--text-muted)]">{cycle.feedbackDate}</span>
                      </div>
                      <p className="text-sm text-[var(--text-primary)] mb-2">
                        <span className="font-bold">Feedback:</span> "{cycle.instructorNote}"
                      </p>
                      <p className="text-sm text-emerald-400 font-medium">
                        <span className="font-bold">Response:</span> {cycle.studentResponse}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">No feedback cycles recorded yet</p>
              )}
            </GlassCard>

            {/* ACTIVITY LOG */}
            <GlassCard className="p-6 border-[var(--border)]">
              <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] uppercase tracking-widest flex items-center gap-2 mb-4">
                <Activity size={16} /> Recent Activity
              </h3>
              {activityLog.length > 0 ? (
                <div className="space-y-2 max-h-[400px] overflow-y-auto">
                  {activityLog.map((entry: any, i: number) => (
                    <div key={i} className="p-3 rounded border border-[var(--border)]/50 hover:bg-[var(--bg-raised)] transition-colors">
                      <div className="flex justify-between items-start">
                        <p className="text-sm font-medium text-[var(--text-primary)]">{entry.action}</p>
                        <span className="text-xs text-[var(--text-muted)]">{entry.date}</span>
                      </div>
                      {entry.detail && (
                        <p className="text-xs text-[var(--text-muted)] mt-1">{entry.detail}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-[var(--text-muted)]">No activity recorded</p>
              )}
            </GlassCard>
          </div>
        )}

      </div>
  );
}