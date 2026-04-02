import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../state/authStore';
import { useParams } from 'react-router-dom';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Users, Loader, Target, Activity } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const API_BASE = 'http://localhost:5000/api';

/**
 * Station 06 - Cluster Profiling
 * Learner Archetype Mapping - shows where student fits in engagement/performance space
 */
export const Station06: React.FC = () => {
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

  // Calculate engagement and performance scores
  const engagementScore = Math.min(100, (student.engagement || 0) + (student.help_seeking_messages || 0) * 2);
  const performanceScore = Math.min(100, (student.total_score || 0));

  // Cluster centroids with zones
  const clusterCentroids = [
    { name: 'At-Risk', engagement: 20, performance: 30, color: 'var(--violet)' },
    { name: 'Struggling', engagement: 35, performance: 45, color: 'var(--blue)' },
    { name: 'Efficient', engagement: 65, performance: 75, color: 'var(--teal)' },
    { name: 'Engaged-Developing', engagement: 85, performance: 85, color: 'var(--lav)' },
  ];

  // Student position in cluster space
  const scatterData = [
    ...clusterCentroids.map(c => ({ ...c, isCentroid: true })),
    { name: 'Current Student', engagement: engagementScore, performance: performanceScore, color: 'var(--lav)', isCentroid: false }
  ];

  // Determine student's risk level
  const getRiskLevel = (engagement: number, performance: number): string => {
    if (engagement < 40 && performance < 50) return 'At-Risk';
    if (engagement < 55 && performance < 60) return 'Struggling';
    if (engagement >= 60 && performance >= 70) return 'Engaged-Developing';
    return 'Efficient';
  };

  const riskLevel = getRiskLevel(engagementScore, performanceScore);

  const clusterConfig: Record<string, { label: string; strategy: string; color: string }> = {
    'At-Risk': { label: 'Critical Intervention', strategy: 'Intensive support needed', color: 'var(--violet)' },
    'Struggling': { label: 'Targeted Support', strategy: 'Structured guidance required', color: 'var(--blue)' },
    'Efficient': { label: 'Optimized Workflow', strategy: 'Monitor for disengagement', color: 'var(--teal)' },
    'Engaged-Developing': { label: 'High Performance', strategy: 'Advanced challenges', color: 'var(--lav)' },
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <Users size={36} className="text-[var(--lav)]" />
          Station 06: Learner Archetype Mapping
        </h1>
        <p className="text-[var(--text-muted)]">Analyzing <span className="text-[var(--lav)] font-semibold">{student.name}</span>'s position within learner clusters</p>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Scatter Chart */}
        <div className="lg:col-span-2">
          <GlassCard className="p-8 border-[var(--border)]">
            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Engagement vs Performance Space</h2>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                  <CartesianGrid stroke="var(--border)" />
                  <XAxis type="number" dataKey="engagement" name="Engagement" domain={[0, 100]} stroke="var(--text-muted)" />
                  <YAxis type="number" dataKey="performance" name="Performance" domain={[0, 100]} stroke="var(--text-muted)" />
                  <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                  <Scatter data={scatterData}>
                    {scatterData.map((entry: any, index: number) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={entry.color}
                        r={entry.isCentroid ? 8 : 12}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </GlassCard>
        </div>

        {/* Student Profile */}
        <div className="space-y-6">
          <GlassCard className="p-6 border-[var(--lav)]/20 bg-[var(--lav)]/5">
            <div className="flex items-center gap-2 mb-4">
              <Target size={20} className="text-[var(--lav)]" />
              <h3 className="font-bold text-[var(--text-primary)]">Current Archetype</h3>
            </div>
            <div className="text-3xl font-bold text-[var(--lav)] mb-2">{riskLevel}</div>
            <p className="text-sm text-[var(--text-muted)]">{clusterConfig[riskLevel]?.label}</p>
          </GlassCard>

          <GlassCard className="p-6 border-[var(--border)]">
            <div className="flex items-center gap-2 mb-4">
              <Activity size={20} className="text-[var(--teal)]" />
              <h3 className="font-bold text-[var(--text-primary)]">Metrics</h3>
            </div>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-muted)]">Engagement</span>
                  <span className="font-bold">{engagementScore.toFixed(0)}%</span>
                </div>
                <div className="h-2 bg-[var(--bg-raised)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-blue-400 to-blue-600" style={{ width: `${engagementScore}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[var(--text-muted)]">Performance</span>
                  <span className="font-bold">{performanceScore.toFixed(0)}/100</span>
                </div>
                <div className="h-2 bg-[var(--bg-raised)] rounded-full overflow-hidden">
                  <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600" style={{ width: `${performanceScore}%` }}></div>
                </div>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>

      {/* Cluster Reference */}
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h3 className="text-lg font-bold text-[var(--text-primary)] mb-6">Cluster Archetypes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {Object.entries(clusterConfig).map(([key, cfg]) => (
              <div key={key} className="p-4 rounded-lg border border-[var(--border)] hover:border-[var(--lav)] transition-colors">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: cfg.color }}></div>
                  <span className="font-bold text-sm text-[var(--text-primary)]">{key}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{cfg.strategy}</p>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Station06;


