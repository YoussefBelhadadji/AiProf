import React from "react";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Target } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

export const Station11: React.FC = () => {

  const taskScores = [
    { task: "Task 1", score: 68 },
    { task: "Task 2", score: 74 },
    { task: "Task 3", score: 81 },
    { task: "Task 4", score: 87 },
    { task: "Task 5", score: 92 },
  ];

  const skills = [
    { skill: "Grammar", pct: 82 },
    { skill: "Argumentation", pct: 75 },
    { skill: "Cohesion", pct: 78 },
    { skill: "Lexical", pct: 72 },
    { skill: "Organization", pct: 85 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <Target size={32} className="text-[var(--lav)]" />
          Station 11: Task Performance
        </h1>
      </div>
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Task Scores</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taskScores}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="task" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
                <Legend />
                <Line type="monotone" dataKey="score" stroke="var(--lav)" strokeWidth={2} dot={{ fill: "var(--lav)", r: 5 }} name="Score" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Skills Mastery</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={skills}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="skill" stroke="var(--text-muted)" angle={-45} textAnchor="end" height={80} fontSize={12} />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip formatter={(v: any) => `${v}%`} contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
                <Bar dataKey="pct" fill="var(--teal)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Station11;

