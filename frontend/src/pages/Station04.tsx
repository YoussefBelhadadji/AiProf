import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useParams } from 'react-router-dom';
import { RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, BarChart, Bar, CartesianGrid, XAxis, YAxis } from 'recharts';
import { Award, Loader, BarChart3, FileText } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { AdaptiveFeedbackSheet } from '../components/AdaptiveFeedbackSheet';

const API_BASE = 'http://localhost:5000/api';

/**
 * Station 04 - Competence Profiling
 * Competence Profile & Comparative Analysis against benchmarks
 */
export const Station04: React.FC = () => {
  const { studentId } = useParams();
  const token = useAuthStore(state => state.token);
  const [student, setStudent] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const id = studentId || '9263';
        const response = await fetch(`${API_BASE}/student/${id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setStudent(data.student);
        }
      } catch (err) {
        console.error('Failed to load student:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [studentId, token]);

  if (loading) return <div className="flex items-center justify-center h-screen"><Loader className="animate-spin" size={40} /></div>;
  if (!student) return <div className="p-8 text-center text-[var(--text-muted)]">No student data available</div>;

  // Scale all metrics to 0-100
  const scaleMetric = (value: number, max: number = 5) => Math.min(100, (value / max) * 100);

  const competenceBenchmark = {
    lexical: 86,
    cohesion: 82,
    academic_lexis: 80,
    grammar: 84,
    logic: 85,
  };

  const radarData = [
    { 
      name: 'Lexical Range', 
      student: scaleMetric(student.ttr || 0, 1),
      benchmark: competenceBenchmark.lexical
    },
    { 
      name: 'Cohesion', 
      student: scaleMetric(student.cohesion || 0),
      benchmark: competenceBenchmark.cohesion
    },
    { 
      name: 'Academic Lexis', 
      student: scaleMetric(student.lexical_resource || 0),
      benchmark: competenceBenchmark.academic_lexis
    },
    { 
      name: 'Grammar', 
      student: scaleMetric(student.grammar_accuracy || 0),
      benchmark: competenceBenchmark.grammar
    },
    { 
      name: 'Logic & Arg', 
      student: scaleMetric(student.argumentation || 0),
      benchmark: competenceBenchmark.logic
    },
  ];

  const dimensionBreakdown = [
    { dimension: 'Lexical', value: scaleMetric(student.ttr || 0, 1), color: 'var(--lav)' },
    { dimension: 'Cohesion', value: scaleMetric(student.cohesion || 0), color: 'var(--blue)' },
    { dimension: 'Lexical Res.', value: scaleMetric(student.lexical_resource || 0), color: 'var(--teal)' },
    { dimension: 'Grammar', value: scaleMetric(student.grammar_accuracy || 0), color: 'var(--violet)' },
    { dimension: 'Argumentation', value: scaleMetric(student.argumentation || 0), color: 'var(--color-danger-500)' },
  ];

  const averageScore = (radarData.reduce((sum, d) => sum + d.student, 0) / radarData.length).toFixed(1);
  const benchmarkAverage = (radarData.reduce((sum, d) => sum + d.benchmark, 0) / radarData.length).toFixed(1);

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <Award size={32} className="text-[var(--lav)]" />
          Station 04: Competence Profile & Comparative Analysis
        </h1>
        <p className="text-[var(--text-muted)]">Multi-dimensional competence assessment for <span className="text-[var(--lav)] font-semibold">{student.name || 'Student'}</span></p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Radar Chart - Student vs Benchmark */}
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Student vs Benchmark Comparison</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--text-muted)" />
                <Radar name="Student" dataKey="student" stroke="var(--lav)" fill="var(--lav)" fillOpacity={0.25} strokeWidth={2} />
                <Radar name="Benchmark" dataKey="benchmark" stroke="var(--blue)" fill="transparent" strokeWidth={2} strokeDasharray="5 5" />
                <Tooltip formatter={(value: any) => value.toFixed(1)} contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 flex gap-4 justify-center">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full" style={{ background: 'var(--lav)' }}></div>
              <span className="text-sm text-[var(--text-muted)]">Student Performance</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 border-2 border-[var(--blue)]" style={{ borderStyle: 'dashed' }}></div>
              <span className="text-sm text-[var(--text-muted)]">Benchmark Target</span>
            </div>
          </div>
        </GlassCard>

        {/* Competence Breakdown by Dimension */}
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <BarChart3 size={20} className="text-[var(--blue)]" />
            Competence Breakdown
          </h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dimensionBreakdown}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="dimension" stroke="var(--text-muted)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip formatter={(v: any) => v.toFixed(1)} contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                <Bar dataKey="value" fill="var(--lav)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Comparison Metrics */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-[var(--lav)]/20 bg-[var(--lav)]/5">
          <p className="text-sm text-[var(--text-muted)] uppercase mb-2">Student Average Score</p>
          <p className="text-4xl font-bold text-[var(--lav)]">{averageScore}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Across all competence dimensions</p>
        </GlassCard>
        <GlassCard className="p-6 border-[var(--blue)]/20 bg-[var(--blue)]/5">
          <p className="text-sm text-[var(--text-muted)] uppercase mb-2">Benchmark Target</p>
          <p className="text-4xl font-bold text-[var(--blue)]">{benchmarkAverage}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Expected performance level</p>
        </GlassCard>
        <GlassCard className="p-6 border-[var(--teal)]/20 bg-[var(--teal)]/5">
          <p className="text-sm text-[var(--text-muted)] uppercase mb-2">Gap Analysis</p>
          <p className="text-4xl font-bold text-[var(--teal)]">{(parseFloat(benchmarkAverage) - parseFloat(averageScore)).toFixed(1)}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">Points to benchmark</p>
        </GlassCard>
      </div>

      {/* Detailed Breakdown */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Strengths */}
        <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2">
            ? Competence Strengths
          </h3>
          <ul className="space-y-3">
            {radarData
              .sort((a, b) => b.student - a.student)
              .slice(0, 3)
              .map((item, idx) => (
                <li key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-raised)]">
                  <span className="text-sm text-[var(--text-primary)]">{item.name}</span>
                  <span className="text-sm font-bold text-emerald-400">{item.student.toFixed(1)}/100</span>
                </li>
              ))}
          </ul>
        </GlassCard>

        {/* Development Areas */}
        <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
          <h3 className="font-bold text-amber-400 mb-4 flex items-center gap-2">
            ? Development Areas
          </h3>
          <ul className="space-y-3">
            {radarData
              .sort((a, b) => a.student - b.student)
              .slice(0, 3)
              .map((item, idx) => (
                <li key={idx} className="flex justify-between items-center p-3 rounded-lg bg-[var(--bg-raised)]">
                  <span className="text-sm text-[var(--text-primary)]">{item.name}</span>
                  <span className="text-sm font-bold text-amber-400">{item.student.toFixed(1)}/100</span>
                </li>
              ))}
          </ul>
        </GlassCard>
      </div>

      {/* Insights */}
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-6 border-[var(--lav)]/20">
          <h3 className="font-bold text-[var(--lav)] mb-3">Key Insights</h3>
          <ul className="space-y-2 text-sm text-[var(--text-muted)]">
            <li>� Student shows strongest competence in {radarData.reduce((max, d) => d.student > max.student ? d : max).name}</li>
            <li>� Primary focus area: {radarData.reduce((min, d) => d.student < min.student ? d : min).name}</li>
            <li>� Overall performance is {parseFloat(averageScore) >= parseFloat(benchmarkAverage) ? 'meeting' : 'below'} benchmark standards</li>
            <li>� Recommended next steps: Focus on developing {radarData.find(d => d.student === Math.min(...radarData.map(r => r.student)))?.name} skills</li>
          </ul>
        </GlassCard>
      </div>

      {/* Adaptive Feedback Sheet Section */}
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)] overflow-hidden">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <FileText size={24} className="text-[var(--lav)]" />
            Adaptive Blended Assessment Feedback Sheet
          </h2>
          <p className="text-[var(--text-muted)] mb-8 text-sm">
            This sheet operationalizes the adaptive assessment mechanism, mapping analytics directly to targeted feedback exactly as specified in the framework.
          </p>
          <div className="bg-gray-100 rounded-lg overflow-x-auto p-4 md:p-8">
            <AdaptiveFeedbackSheet student={student} />
          </div>
        </GlassCard>
      </div>

    </div>
  );
};

export default Station04;


