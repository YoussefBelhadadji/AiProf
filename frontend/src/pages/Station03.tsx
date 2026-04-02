import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../state/authStore';
import { useParams } from 'react-router-dom';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Loader, MessageSquare } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

const API_BASE = 'http://localhost:5000/api';

/**
 * Station 03 - Argumentation & Logic Analysis
 * Deep analysis of argumentative structure and logical reasoning
 */
export const Station03: React.FC = () => {
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

  const argumentationStructure = [
    { element: 'Thesis Clarity', score: Number((student.argumentation * 20).toFixed(1)), benchmark: 85 },
    { element: 'Evidence Quality', score: Number((student.cohesion * 20).toFixed(1)), benchmark: 80 },
    { element: 'Logic Flow', score: Number((student.grammar_accuracy * 20).toFixed(1)), benchmark: 82 },
    { element: 'Counterargument', score: Number((student.lexical_resource * 20).toFixed(1)), benchmark: 75 },
    { element: 'Conclusion Strength', score: Number((student.total_score * 0.8).toFixed(1)), benchmark: 80 },
  ];

  const logicalPatterns = [
    { name: 'Deductive', count: 12 },
    { name: 'Inductive', count: 8 },
    { name: 'Abductive', count: 5 },
  ];

  const reasoningChain = [
    { step: 'Premise 1', strength: 85 },
    { step: 'Premise 2', strength: 78 },
    { step: 'Intermediate', strength: 82 },
    { step: 'Conclusion', strength: 80 },
  ];

  const COLORS = ['var(--lav)', 'var(--blue)', 'var(--teal)'];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <MessageSquare size={36} className="text-[var(--lav)]" />
          Station 03: Argumentation & Logic Analysis
        </h1>
        <p className="text-[var(--text-muted)]">Comprehensive argumentative structure and reasoning patterns for <span className="text-[var(--lav)] font-semibold">{student.name}</span></p>
      </div>

      {/* Argumentation Structure */}
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Argumentative Structure Evaluation</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={argumentationStructure}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="element" stroke="var(--text-muted)" angle={-45} textAnchor="end" height={100} />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                <Legend />
                <Bar dataKey="score" fill="var(--lav)" radius={[8, 8, 0, 0]} name="Student Score" />
                <Bar dataKey="benchmark" fill="var(--border)" opacity={0.5} radius={[8, 8, 0, 0]} name="Benchmark" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Main Grid */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Logical Patterns */}
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Reasoning Patterns Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={logicalPatterns} cx="50%" cy="50%" labelLine={false} label={({ name, value }) => `${name}: ${value}`} outerRadius={100} fill="var(--lav)" dataKey="count">
                  {logicalPatterns.map((_item, idx) => (
                    <Cell key={idx} fill={COLORS[idx % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        {/* Reasoning Chain Strength */}
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-lg font-bold text-[var(--text-primary)] mb-6">Reasoning Chain Strength</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={reasoningChain} layout="vertical">
                <CartesianGrid stroke="var(--border)" />
                <XAxis type="number" stroke="var(--text-muted)" domain={[0, 100]} />
                <YAxis dataKey="step" type="category" stroke="var(--text-muted)" />
                <Tooltip contentStyle={{ background: 'var(--bg-raised)', border: '1px solid var(--border)' }} />
                <Bar dataKey="strength" fill="var(--lav)" radius={[0, 8, 8, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>

      {/* Detailed Analysis */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
        <GlassCard className="p-6 border-emerald-500/20 bg-emerald-500/5 space-y-4">
          <h3 className="font-bold text-emerald-400">Argumentative Strengths</h3>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li>� Clear thesis statement</li>
            <li>� Well-organized structure</li>
            <li>� Strong topic sentences</li>
            <li>� Logical progression evident</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6 border-amber-500/20 bg-amber-500/5 space-y-4">
          <h3 className="font-bold text-amber-400">Areas for Enhancement</h3>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li>� Counterargument depth</li>
            <li>� Evidence integration</li>
            <li>� Logical connectors</li>
            <li>� Analysis depth</li>
          </ul>
        </GlassCard>

        <GlassCard className="p-6 border-[var(--lav)]/20 bg-[var(--lav)]/5 space-y-4">
          <h3 className="font-bold text-[var(--lav)]">Development Strategies</h3>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li>� Study model essays</li>
            <li>� Practice rebuttals</li>
            <li>� Analyze logical fallacies</li>
            <li>� Debate formats</li>
          </ul>
        </GlassCard>
      </div>
    </div>
  );
};

export default Station03;


