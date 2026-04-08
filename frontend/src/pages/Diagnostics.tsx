import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Loader,
  BookOpen,
  MessageSquare,
  Activity,
  Target,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';

const API_BASE = 'http://localhost:5000/api';

interface DiagnosticStation {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  category: 'analysis' | 'competence' | 'feedback';
  readyState: 'ready' | 'loading' | 'unavailable';
  dataPoints: string[];
}

/**
 * Diagnostics Hub - Comprehensive Student Analysis
 * Provides access to all diagnostic stations with real data
 */
export function Diagnostics() {
  const navigate = useNavigate();
  const token = useAuthStore(state => state.token);
  const [studentId, setStudentId] = useState('9263');
  const [studentData, setStudentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load student data
  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!token) {
          setError('Authentication required');
          setLoading(false);
          return;
        }

        const response = await fetch(`${API_BASE}/student/${studentId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) throw new Error('Failed to load student');

        const data = await response.json();
        setStudentData(data.student);
        setError(null);
      } catch (err: any) {
        setError(err.message || 'Failed to load data');
        setStudentData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [token, studentId]);

  const stations: DiagnosticStation[] = [
    {
      id: 'writing-analysis',
      title: 'Writing Analysis',
      description: 'Detailed text feature analysis including argumentation, cohesion, grammar, and lexical resource',
      icon: <BookOpen size={24} />,
      category: 'analysis',
      readyState: studentData ? 'ready' : 'loading',
      dataPoints: ['Argumentation', 'Cohesion', 'Grammar', 'Lexical Resource'],
    },
    {
      id: 'self-regulated-learning',
      title: 'Self-Regulated Learning',
      description: 'Analysis of student planning, monitoring, and evaluation behaviors',
      icon: <Target size={24} />,
      category: 'analysis',
      readyState: studentData ? 'ready' : 'loading',
      dataPoints: ['Planning', 'Monitoring', 'Evaluation', 'Adaptation'],
    },
    {
      id: 'competence-assessment',
      title: 'Competence Assessment',
      description: 'Bayesian-based competence inference across multiple dimensions',
      icon: <TrendingUp size={24} />,
      category: 'competence',
      readyState: studentData ? 'ready' : 'loading',
      dataPoints: ['Argumentation Competence', 'SRL Competence', 'Linguistic Competence'],
    },
    {
      id: 'success-prediction',
      title: 'Success Prediction',
      description: 'Random Forest model predictions for student success probability',
      icon: <Zap size={24} />,
      category: 'competence',
      readyState: studentData ? 'ready' : 'loading',
      dataPoints: ['Success Probability', 'Risk Factors', 'Predictive Features'],
    },
    {
      id: 'feedback-analysis',
      title: 'Feedback Cycles',
      description: 'Analysis of feedback responsiveness and learning trajectory',
      icon: <MessageSquare size={24} />,
      category: 'feedback',
      readyState: studentData ? 'ready' : 'loading',
      dataPoints: ['Feedback Views', 'Response Rate', 'Improvement Trajectory'],
    },
    {
      id: 'engagement-tracking',
      title: 'Engagement Tracking',
      description: 'Activity log analysis and time-on-task metrics from Moodle',
      icon: <Activity size={24} />,
      category: 'feedback',
      readyState: studentData ? 'ready' : 'loading',
      dataPoints: ['Login Count', 'Time on Task', 'Resource Access'],
    },
  ];

  const handleStationClick = (stationId: string) => {
    if (!studentData) {
      setError('Student data not loaded. Please wait...');
      return;
    }
    // Map station IDs to pipeline IDs
    const stationMap: Record<string, string> = {
      'writing-analysis': 'S01',
      'self-regulated-learning': 'S02',
      'competence-assessment': 'S03',
      'success-prediction': 'S04',
      'feedback-analysis': 'S05',
      'engagement-tracking': 'S06',
    };
    
    const pipelineId = stationMap[stationId] || 'S01';
    navigate(`/pipeline/${pipelineId}`, { state: { studentData } });
  };

  const handleExportAnalysis = () => {
    if (!studentData) return;
    const text = `WriteLens Diagnostics Export\nStudent: ${studentData.name}\nID: ${studentData.student_id}\n\nAnalysis Date: ${new Date().toLocaleDateString()}\n\nKey Findings:\n- Success Probability: ${studentData.success_probability}%\n- Risk Level: ${studentData.risk_level}\n- SRL Profile: ${studentData.srl_overall}%\n\nFull diagnostic available in system.`;
    
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Diagnostics_${studentData.student_id}.txt`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Page Header */}
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-4xl lg:text-5xl font-bold font-navigation uppercase tracking-tight mb-3">
            Diagnostic Stations
          </h1>
          <p className="text-[var(--text-sec)] text-base">
            Comprehensive analysis suite for student learning profiles and competence assessment
          </p>
        </div>
        {studentData && (
          <Button
            onClick={handleExportAnalysis}
            className="text-xs h-10 px-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            Export Analysis
          </Button>
        )}
      </div>

      {/* Student Selection */}
      <GlassCard className="p-6 border-[var(--border)]">
        <label className="block">
          <span className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">Select Student</span>
          <div className="flex gap-3 mt-2">
            <input
              type="text"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              placeholder="Enter student ID"
              className="flex-1 px-4 py-2 rounded-lg bg-[var(--bg-raised)] border border-[var(--border)] text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--lav)]"
            />
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
              }}
              className="px-6 py-2 bg-[var(--lav)] hover:bg-[var(--lav)]/80 text-white font-bold rounded-lg transition-colors"
            >
              Load
            </button>
          </div>
          <p className="text-xs text-[var(--text-muted)] mt-2">Try "9263" for a sample student</p>
        </label>
      </GlassCard>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <Loader className="w-8 h-8 animate-spin text-[var(--lav)] mx-auto mb-3" />
            <p className="text-[var(--text-muted)]">Loading diagnostic data...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !loading && (
        <GlassCard className="p-8 border-red-500/30 bg-red-500/10">
          <div className="flex items-start gap-4">
            <AlertTriangle className="text-red-400 mt-1 flex-shrink-0" size={24} />
            <div className="flex-1">
              <h3 className="font-bold text-red-400 mb-2 text-lg">Unable to Load Student Data</h3>
              <p className="text-red-300 text-sm mb-4">{error}</p>
              <p className="text-red-300/70 text-xs mb-6">Troubleshooting tips:</p>
              <ul className="text-red-300/70 text-xs space-y-1 mb-6 list-disc list-inside">
                <li>Ensure the student ID is correct</li>
                <li>Verify the backend API is running on port 5000</li>
                <li>Check that the student data has been imported</li>
                <li>Try refreshing the page or selecting a different student</li>
              </ul>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={() => {
                    setLoading(true);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-bold text-sm rounded-lg transition-colors"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-lg transition-colors"
                >
                  Refresh Page
                </button>
                <button
                  onClick={() => {
                    setStudentId('9263');
                    setLoading(true);
                    setError(null);
                  }}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white font-bold text-sm rounded-lg transition-colors"
                >
                  Load Sample Student
                </button>
              </div>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Student Overview */}
      {!loading && studentData && (
        <GlassCard className="p-8 border-[var(--lav)]/30 bg-[var(--lav)]/5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2">Student Name</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{studentData.name}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2">Student ID</p>
              <p className="text-lg font-bold text-[var(--text-primary)]">{studentData.student_id}</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2">Overall Score</p>
              <p className="text-lg font-bold text-[var(--lav)]">{studentData.total_score}%</p>
            </div>
            <div>
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2">Risk Level</p>
              <p className={`text-lg font-bold ${
                studentData.risk_level === 'HIGH' ? 'text-red-500' :
                studentData.risk_level === 'MEDIUM' ? 'text-amber-500' :
                'text-emerald-500'
              }`}>
                {studentData.risk_level}
              </p>
            </div>
          </div>
        </GlassCard>
      )}

      {/* Diagnostic Stations Grid */}
      {!loading && studentData && (
        <div className="space-y-8">
          {/* Analysis Category */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <BarChart3 size={24} className="text-[var(--lav)]" />
              Writing & Learning Analysis
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {stations
                .filter(s => s.category === 'analysis')
                .map(station => (
                  <GlassCard key={station.id} className="p-6 border-[var(--border)] hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleStationClick(station.id)}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-[var(--lav)]/10 text-[var(--lav)] group-hover:bg-[var(--lav)]/20 transition-colors">
                        {station.icon}
                      </div>
                      <CheckCircle2 className="text-emerald-500 ml-auto" size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{station.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">{station.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {station.dataPoints.map(point => (
                        <span key={point} className="text-xs px-2 py-1 rounded bg-[var(--lav)]/10 text-[var(--lav)]">
                          {point}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                ))}
            </div>
          </div>

          {/* Competence Category */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <TrendingUp size={24} className="text-purple-500" />
              Competence & Success Prediction
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stations
                .filter(s => s.category === 'competence')
                .map(station => (
                  <GlassCard key={station.id} className="p-6 border-[var(--border)] hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleStationClick(station.id)}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500/20 transition-colors">
                        {station.icon}
                      </div>
                      <CheckCircle2 className="text-emerald-500 ml-auto" size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{station.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">{station.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {station.dataPoints.map(point => (
                        <span key={point} className="text-xs px-2 py-1 rounded bg-purple-500/10 text-purple-500">
                          {point}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                ))}
            </div>
          </div>

          {/* Feedback Category */}
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center gap-2">
              <MessageSquare size={24} className="text-blue-500" />
              Feedback & Engagement
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {stations
                .filter(s => s.category === 'feedback')
                .map(station => (
                  <GlassCard key={station.id} className="p-6 border-[var(--border)] hover:shadow-lg transition-all cursor-pointer group" onClick={() => handleStationClick(station.id)}>
                    <div className="flex items-start gap-3 mb-3">
                      <div className="p-2.5 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                        {station.icon}
                      </div>
                      <CheckCircle2 className="text-emerald-500 ml-auto" size={18} />
                    </div>
                    <h3 className="text-lg font-bold text-[var(--text-primary)] mb-2">{station.title}</h3>
                    <p className="text-sm text-[var(--text-muted)] mb-4">{station.description}</p>
                    <div className="flex flex-wrap gap-1">
                      {station.dataPoints.map(point => (
                        <span key={point} className="text-xs px-2 py-1 rounded bg-blue-500/10 text-blue-500">
                          {point}
                        </span>
                      ))}
                    </div>
                  </GlassCard>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions */}
      {!loading && studentData && (
        <div className="p-6 rounded-lg bg-[var(--lav)]/5 border border-[var(--lav)]/20 flex flex-wrap gap-3">
          <span className="text-sm font-bold text-[var(--text-primary)]">Quick Actions:</span>
          <Button onClick={() => navigate('/reports')} className="text-xs h-8 px-3 bg-blue-600 hover:bg-blue-700">
            Generate Full Report
          </Button>
          <Button onClick={() => navigate('/tasks')} className="text-xs h-8 px-3 bg-amber-600 hover:bg-amber-700">
            View Tasks
          </Button>
          <Button onClick={() => navigate(`/student-profile/${studentData.student_id}`)} className="text-xs h-8 px-3 bg-emerald-600 hover:bg-emerald-700">
            Student Profile
          </Button>
        </div>
      )}
    </div>
  );
}
