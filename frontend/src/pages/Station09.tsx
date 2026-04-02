import React, { useState, useEffect } from "react";
import { useAuthStore } from "../state/authStore";
import { useParams } from "react-router-dom";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { CheckCircle, Loader } from "lucide-react";
import { GlassCard } from "../components/GlassCard";

const API_BASE = "http://localhost:5000/api";

export const Station09: React.FC = () => {
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

  const feedbackCycles = [
    { cycle: "C1", implemented: 72 },
    { cycle: "C2", implemented: 85 },
    { cycle: "C3", implemented: 91 },
    { cycle: "C4", implemented: 95 },
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
          <CheckCircle size={32} className="text-[var(--lav)]" />
          Station 09: Feedback Response
        </h1>
      </div>
      <div className="max-w-7xl mx-auto">
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-xl font-bold text-[var(--text-primary)] mb-6">Feedback Implementation</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={feedbackCycles}>
                <CartesianGrid stroke="var(--border)" />
                <XAxis dataKey="cycle" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" domain={[0, 100]} />
                <Tooltip contentStyle={{ background: "var(--bg-raised)", border: "1px solid var(--border)" }} />
                <Legend />
                <Line type="monotone" dataKey="implemented" stroke="var(--lav)" strokeWidth={2} dot={{ fill: "var(--lav)", r: 5 }} name="Implemented" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};

export default Station09;

