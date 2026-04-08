import React from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { RefreshCw } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

export const Station10: React.FC = () => {

  const revisions = [
    { week: "W1", count: 2 },
    { week: "W2", count: 4 },
    { week: "W3", count: 5 },
    { week: "W4", count: 7 },
    { week: "W5", count: 6 },
    { week: "W6", count: 8 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <RefreshCw size={32} className="text-[var(--lav)]" />
          Station 10: Revision Patterns
        </h1>
      </div>
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Revision Frequency</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revisions}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="week" stroke="var(--text-muted)" />
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

export default Station10;

