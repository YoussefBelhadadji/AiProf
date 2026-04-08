import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../store/authStore';
import { useParams } from 'react-router-dom';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Brain, Loader, AlertCircle } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const API_BASE = 'http://localhost:5000/api';

/**
 * Station 02 - Self-Regulated Learning (SRL) Analysis
 * Comprehensive SRL behavior and planning analysis
 */
export const Station02: React.FC = () => {
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

  const srlProfile = [
    { name: 'Planning', value: Number(student.planning?.toFixed?.(1) || 0), domain: [0, 100] },
    { name: 'Monitoring', value: Number(student.monitoring?.toFixed?.(1) || 0), domain: [0, 100] },
    { name: 'Revising', value: Number(student.revising?.toFixed?.(1) || 0), domain: [0, 100] },
    { name: 'Goal Setting', value: Number(student.goal_setting?.toFixed?.(1) || 0), domain: [0, 100] },
    { name: 'Engagement', value: Number(student.engagement?.toFixed?.(1) || 0), domain: [0, 100] },
  ];

  const behaviorMetrics = [
    { behavior: 'Rubric Consultation', count: student.rubric_views || 3, rating: 'High Initiative' },
    { behavior: 'Planning Depth', count: Math.round((student.planning || 0) / 20) || 3, rating: 'Good Forethought' },
    { behavior: 'Task Monitoring', count: Math.round((student.monitoring || 0) / 20) || 3, rating: 'Active Tracking' },
    { behavior: 'Revision Cycles', count: Math.round((student.revising || 0) / 33) || 2, rating: 'Quality Focus' },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <Brain size={36} className="text-[var(--lav)]" />
          Station 02: Self-Regulated Learning Analysis
        </h1>
        <p className="text-[var(--text-muted)]">Monitoring <span className="text-[var(--lav)] font-semibold">{student.name}</span>'s metacognitive behaviors and SRL strategies</p>
      </div>

      {/* SRL Radar Chart */}
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">SRL Profile Radar</h2>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={srlProfile}>
                <PolarGrid stroke="var(--border)" />
                <PolarAngleAxis dataKey="name" stroke="var(--text-muted)" />
                <PolarRadiusAxis angle={90} domain={[0, 100]} stroke="var(--text-muted)" />
                <Radar name="SRL Score" dataKey="value" stroke="var(--lav)" fill="var(--lav)" fillOpacity={0.6} />
                <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Behavior Metrics */}
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Behavior Patterns & Ratings</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[var(--border)]">
                  <th className="text-left py-3 px-4 text-xs font-bold text-[var(--text-muted)] uppercase">Behavior</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-[var(--text-muted)] uppercase">Count</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-[var(--text-muted)] uppercase">Assessment</th>
                  <th className="text-left py-3 px-4 text-xs font-bold text-[var(--text-muted)] uppercase">Indicator</th>
                </tr>
              </thead>
              <tbody>
                {behaviorMetrics.map((item, idx) => (
                  <tr key={idx} className="border-b border-[var(--border)] hover:bg-[var(--bg-raised)] transition-colors">
                    <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{item.behavior}</td>
                    <td className="py-3 px-4">
                      <span className="px-3 py-1 rounded-full bg-[var(--lav)]/10 text-[var(--lav)] font-bold">{item.count}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-[var(--text-primary)]">{item.rating}</td>
                    <td className="py-3 px-4">
                      <div className="w-24 h-2 rounded-full bg-[var(--bg-raised)] overflow-hidden">
                        <div className="h-full w-3/4 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full"></div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      </div>

      {/* Detailed Insights Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="p-6 border-blue-500/20 bg-blue-500/5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-400"></div>
            <h3 className="font-bold text-blue-400">Planning Strategies</h3>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-primary)]">
            <p>� Pre-writes and outlines</p>
            <p>� Checks rubric first</p>
            <p>� Sets time allocations</p>
            <p>� Identifies key concepts</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-purple-500/20 bg-purple-500/5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-400"></div>
            <h3 className="font-bold text-purple-400">Monitoring Tactics</h3>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-primary)]">
            <p>� Tracks word count progress</p>
            <p>� Reviews against rubric</p>
            <p>� Checks deadline status</p>
            <p>� Adjusts approach mid-task</p>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-cyan-500/20 bg-cyan-500/5 space-y-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-cyan-400"></div>
            <h3 className="font-bold text-cyan-400">Revision Patterns</h3>
          </div>
          <div className="space-y-2 text-sm text-[var(--text-primary)]">
            <p>� Multiple draft cycles</p>
            <p>� Peer or self-review</p>
            <p>� Focus on clarity</p>
            <p>� Evidence integration</p>
          </div>
        </GlassCard>
      </div>

      {/* Meta-Awareness Insight */}
      <div className="max-w-7xl mx-auto p-6 rounded-lg border border-[var(--lav)]/30 bg-[var(--lav)]/5 flex items-start gap-4">
        <AlertCircle size={20} className="text-[var(--lav)] flex-shrink-0 mt-1" />
        <div>
          <h3 className="font-bold text-[var(--lav)] mb-2">Meta-Awareness Assessment</h3>
          <p className="text-sm text-[var(--text-primary)]">
            This student demonstrates <strong>high metacognitive awareness</strong> through consistent rubric consultation and task monitoring. Strong planning behaviors predict successful task completion and positive refinement cycles.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Station02;


