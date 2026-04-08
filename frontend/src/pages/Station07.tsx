import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useParams } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Zap, Loader } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

const API_BASE = "http://localhost:5000/api";

export const Station07: React.FC = () => {
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

  const featureData = [
    { feature: "Grammar", importance: Math.round((student.grammar_accuracy || 0) * 20 * 1.2) },
    { feature: "Revision", importance: Math.round((student.revision_frequency || 0) * 20) },
    { feature: "Engagement", importance: Math.round(student.engagement || 0) },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <Zap size={32} className="text-[var(--lav)]" />
          Station 07: Feature Importance
        </h1>
      </div>
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Top Predictive Features</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="feature" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
                <Bar dataKey="importance" fill="var(--lav)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Station07;

