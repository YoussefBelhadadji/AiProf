import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Loader, TrendingUp } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const API_BASE = 'http://localhost:5000/api';

/**
 * Station 01 - Writing Features & Text Analysis
 * Comprehensive text feature extraction and analysis
 */
export const Station01: React.FC = () => {
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

  const textMetrics = [
    { name: 'Argumentation', value: Number((student.argumentation * 20).toFixed(1)), target: 100 },
    { name: 'Cohesion', value: Number((student.cohesion * 20).toFixed(1)), target: 100 },
    { name: 'Grammar', value: Number((student.grammar_accuracy * 20).toFixed(1)), target: 100 },
    { name: 'Lexical', value: Number((student.lexical_resource * 20).toFixed(1)), target: 100 },
    { name: 'Task Score', value: student.total_score, target: 100 },
  ];

  const wordAnalysis = [
    { feature: 'Total Words', value: student.word_count || 450 },
    { feature: 'Type-Token Ratio', value: (student.ttr * 100).toFixed(1) + '%' },
    { feature: 'Avg Sentence Length', value: Math.round((student.word_count / 25)) + ' words' },
    { feature: 'Complexity Score', value: Math.round(student.grammar_accuracy * 100) + '/100' },
  ];

  const performanceTrend = [
    { task: 'Task 1', score: 65 },
    { task: 'Task 2', score: 72 },
    { task: 'Task 3', score: 78 },
    { task: 'Task 4', score: 82 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2">Station 01: Writing Features & Text Analysis</h1>
        <p className="text-[var(--text-muted)]">Comprehensive analysis of <span className="text-[var(--lav)] font-semibold">{student.name}</span>'s writing characteristics</p>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Text Features Chart */}
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Writing Metrics (Scale: 0-100)</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={textMetrics}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" angle={-45} textAnchor="end" height={80} />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip formatter={(v: any) => parseFloat(v).toFixed(1)} contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                <Bar dataKey="value" fill="var(--lav)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Word Analysis */}
        <GlassCard className="p-8 border-[var(--border)] space-y-6">
          <h2 className="text-xl font-bold text-[var(--text-primary)]">Word Analysis Metrics</h2>
          {wordAnalysis.map((item, idx) => (
            <div key={idx} className="p-4 rounded-lg bg-[var(--bg-raised)] border border-[var(--border)]">
              <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2">{item.feature}</p>
              <p className="text-2xl font-bold text-[var(--lav)]">{item.value}</p>
            </div>
          ))}
        </GlassCard>
      </div>

      {/* Performance Trend */}
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-400" />
            Writing Performance Trend
          </h2>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={performanceTrend}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="task" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="var(--lav)" strokeWidth={3} dot={{ fill: 'var(--lav)', r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Detailed Analysis */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5">
          <h3 className="font-bold text-emerald-400 mb-3">✓ Strengths</h3>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li>• Strong argumentation structure</li>
            <li>• Good vocabulary variety</li>
            <li>• Clear thesis development</li>
            <li>• Improving trend noted</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5">
          <h3 className="font-bold text-amber-400 mb-3">⚠ Areas for Improvement</h3>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li>• Sentence variety needed</li>
            <li>• Transitional phrases</li>
            <li>• Evidence integration</li>
            <li>• Coherence refinement</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6 border-[var(--lav)]/20 bg-[var(--lav)]/5">
          <h3 className="font-bold text-[var(--lav)] mb-3">→ Recommendations</h3>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li>• Practice complex sentences</li>
            <li>• Use academic connectors</li>
            <li>• Expand lexical range</li>
            <li>• Study exemplars</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
};

export default Station01;

