import React, { useState, useEffect } from "react";
import { useAuthStore } from "../store/authStore";
import { useParams } from "react-router-dom";
import { CheckCircle2, XCircle, AlertCircle, Edit2, X, Loader, Printer } from "lucide-react";
import { GlassCard } from "../components/GlassCard";
import { Button } from "../components/Button";

const API_BASE = "http://localhost:5000/api";

type DecisionStatus = "pending" | "approved" | "rejected" | "modified";

interface DecisionRecord {
  id?: string;
  studentId: string;
  studentName: string;
  timestamp: string;
  adaptiveDecision: {
    learner_profile: string;
    cluster_profile: string;
    predicted_improvement: string;
    predicted_score: number;
    triggered_rules: string;
    personalized_feedback: string;
    final_feedback_focus: string;
    teacher_validation_prompt: string;
    rule_matches: any[];
  };
  status: DecisionStatus;
  teacherApprovalNotes?: string;
  modifiedFeedback?: string;
  approvedAt?: string;
  approvedBy?: string;
}

export const TeacherDecisionPanel: React.FC = () => {
  const { studentId } = useParams();
  const user = useAuthStore(state => state.user);
  const userRole = user?.role || 'student';
  const token = useAuthStore(state => state.token);
  const [student, setStudent] = useState<any>(null);
  const [decisionRecord, setDecisionRecord] = useState<DecisionRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedFeedback, setEditedFeedback] = useState("");
  const [approvalNotes, setApprovalNotes] = useState("");
  const [status, setStatus] = useState<DecisionStatus>("pending");
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

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

          // Initialize decision record
          const decision: DecisionRecord = {
            id: `decision_${id}_${Date.now()}`,
            studentId: id,
            studentName: data.student.name,
            timestamp: new Date().toISOString(),
            adaptiveDecision: data.student.adaptive_decision_result || {},      
            status: "pending",
            approvedBy: userRole,
          };

          setDecisionRecord(decision);
          setEditedFeedback(data.student.adaptive_decision_result?.personalized_feedback || "");
        }
      } catch (err) {
        console.error("Failed to load student:", err);
      } finally {
        setLoading(false);
      }
    };
    if (userRole === "teacher" || userRole === "admin" || userRole === "researcher") {
      fetchData();
    }
  }, [studentId, token, userRole]);

  // Check authorization
  if (userRole !== "teacher" && userRole !== "admin" && userRole !== "researcher") {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] p-6 flex items-center justify-center">
        <GlassCard className="p-8 text-center border-red-500">
          <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />       
          <h1 className="text-2xl font-bold text-red-500 mb-2">Access Denied</h1>
          <p className="text-[var(--text-muted)]">This panel is for instructors only (teachers and researchers).</p>
        </GlassCard>
      </div>
    );
  }

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/student/submit-draft`, {
        method: "POST",
        headers: {          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },        body: JSON.stringify({
          studentId: decisionRecord?.studentId,
          taskId: "adaptive_decision",
          draftNo: 1,
          approvalNotes,
          decisionRecord: {
            ...decisionRecord,
            status: "approved",
            approvedAt: new Date().toISOString(),
            approvedBy: userRole,
            modifiedFeedback: isEditing ? editedFeedback : undefined
          }
        })
      });

      if (response.ok) {
        setStatus("approved");
        setDecisionRecord(prev => prev ? { ...prev, status: "approved" } : null);
        setToastMessage({message: "Decision approved successfully!", type: "success"});
      } else {
        setToastMessage({message: "Failed to approve decision", type: "error"});
      }
    } catch (err) {
      console.error("Failed to approve:", err);
      setToastMessage({message: "Error approving decision", type: "error"});
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    setSubmitting(true);
    try {
      const response = await fetch(`${API_BASE}/feedback/override`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          studentId: decisionRecord?.studentId,
          taskId: "adaptive_decision",
          draftNo: 1,
          overrideReason: approvalNotes,
          decisionRecord: {
            ...decisionRecord,
            status: "rejected",
            approvedAt: new Date().toISOString(),
            approvedBy: userRole
          }
        })
      });

      if (response.ok) {
        setStatus("rejected");
        setDecisionRecord(prev => prev ? { ...prev, status: "rejected" } : null);
        setToastMessage({message: "Decision rejected. Alternative feedback requested.", type: "success"});
      } else {
        setToastMessage({message: "Failed to reject decision", type: "error"});
      }
    } catch (err) {
      console.error("Failed to reject:", err);
      setToastMessage({message: "Error rejecting decision", type: "error"});
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] p-6 flex items-center justify-center">
        <Loader className="animate-spin text-[var(--lav)]" size={40} />
      </div>
    );
  }

  if (!student || !decisionRecord) {
    return (
      <div className="min-h-screen bg-[var(--bg-deep)] p-6 flex items-center justify-center">
        <GlassCard className="p-8 text-center">
          <AlertCircle size={40} className="text-orange-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[var(--text-primary)] mb-2">No Data Available</h1>
          <p className="text-[var(--text-muted)]">Student data or decision record not found.</p>
        </GlassCard>
      </div>
    );
  }

  const decision = decisionRecord.adaptiveDecision;
  const getStatusColor = (s: DecisionStatus) => {
    switch (s) {
      case "approved": return "bg-green-100 border-green-400 text-green-900";
      case "rejected": return "bg-red-100 border-red-400 text-red-900";
      case "modified": return "bg-blue-100 border-blue-400 text-blue-900";
      default: return "bg-yellow-100 border-yellow-400 text-yellow-900";
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] p-6 space-y-8 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className={`fixed bottom-6 right-6 px-6 py-3 rounded-lg shadow-xl font-navigation uppercase tracking-widest text-xs z-50 animate-fade-in flex items-center justify-between ${
          toastMessage.type === 'success' ? 'bg-[var(--lav)] text-white shadow-[var(--lav)]/20' : 'bg-[var(--red)] text-white shadow-[var(--red)]/20'
        }`}>
          <span>{toastMessage.message}</span>
          <button onClick={() => setToastMessage(null)} className="ml-4 hover:opacity-70">×</button>
        </div>
      )}

      <div className="max-w-7xl mx-auto flex justify-between items-center no-print">
        <div>
          <h1 className="text-4xl font-bold text-[var(--text-primary)] mb-2 flex items-center gap-3">
            <CheckCircle2 size={36} className="text-[var(--lav)]" />
            Teacher Decision Panel
          </h1>
          <p className="text-[var(--text-muted)]">Review and approve adaptive decisions for <span className="text-[var(--lav)] font-semibold">{student.name}</span></p>
        </div>
        <Button variant="secondary" onClick={handlePrint} leftIcon={<Printer size={18} />}>
          Export PDF Report
        </Button>
      </div>

      <div className="hidden print:block mb-8 border-b pb-4 pt-10">
        <h1 className="text-3xl font-bold text-black mb-2">WriteLens Detailed Student Report</h1>
        <div className="flex justify-between text-gray-700">
          <p>Student: <strong>{student.name}</strong></p>
          <p>Date: <strong>{new Date().toLocaleDateString()}</strong></p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 print-container" >
        {/* Status Badge */}
        <div className={`p-4 rounded-lg border-2 font-bold text-center no-print ${getStatusColor(status)}`}>
          Status: {status.toUpperCase()}
        </div>

        {/* Decision Summary Card */}
        <GlassCard className="p-8 border-[var(--border)]">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">Decision Summary</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)] uppercase tracking-wide">Profile</p>
              <p className="text-lg font-bold text-[var(--lav)]">{decision.learner_profile}</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)] uppercase tracking-wide">Cluster</p>
              <p className="text-lg font-bold text-[var(--lav)]">{decision.cluster_profile}</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)] uppercase tracking-wide">Improvement</p>
              <p className="text-lg font-bold text-green-500">{decision.predicted_improvement}</p>
            </div>
            <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
              <p className="text-sm text-[var(--text-muted)] uppercase tracking-wide">Predicted Score</p>
              <p className="text-2xl font-bold text-green-500">{decision.predicted_score.toFixed(1)}</p>
            </div>
          </div>

          {/* Personalized Feedback Section (Editable) */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xl font-bold text-[var(--text-primary)]">Personalized Feedback</h3>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center gap-2 px-3 py-1 rounded-lg bg-[var(--lav)] text-white hover:opacity-90 transition"
              >
                {isEditing ? <X size={16} /> : <Edit2 size={16} />}
                {isEditing ? "Cancel" : "Edit"}
              </button>
            </div>
            
            {isEditing ? (
              <textarea
                value={editedFeedback}
                onChange={(e) => setEditedFeedback(e.target.value)}
                className="w-full p-4 rounded-lg border border-[var(--lav)] bg-[var(--bg-deep)] text-[var(--text-primary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-[var(--lav)]"
                rows={5}
              />
            ) : (
              <div className="p-4 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)]">
                <p className="text-[var(--text-secondary)] leading-relaxed">{editedFeedback || decision.personalized_feedback}</p>
              </div>
            )}
          </div>

          {/* Focus Area */}
          <div className="p-4 rounded-lg border border-blue-300 bg-blue-50 dark:bg-blue-900/20 mb-8">
            <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-2">Primary Focus</h3>
            <p className="text-blue-800 dark:text-blue-200">{decision.final_feedback_focus}</p>
          </div>

          {/* Triggered Rules Preview */}
          {decision.rule_matches && decision.rule_matches.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Triggered Rules ({decision.rule_matches.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {decision.rule_matches.map((rule, idx) => (
                  <div key={idx} className="p-3 rounded-lg bg-[var(--bg-deep)] border border-[var(--border)] hover:border-[var(--lav)] transition">
                    <p className="font-semibold text-[var(--text-primary)]">{rule.rule_id}</p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">{rule.interpretation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </GlassCard>

        {/* Teacher Approval Section */}
        {status === "pending" && (
          <GlassCard className="p-8 border-orange-400/50 bg-orange-500/5 no-print">
            <h2 className="text-2xl font-bold text-orange-600 mb-6 flex items-center gap-2">
              <AlertCircle size={28} />
              Teacher Validation & Decision
            </h2>

            <div className="mb-6">
              <label className="block text-[var(--text-primary)] font-semibold mb-2">Your Review Notes</label>
              <textarea
                value={approvalNotes}
                onChange={(e) => setApprovalNotes(e.target.value)}
                placeholder="Add any observations, modifications, or concerns about this adaptive decision..."
                className="w-full p-4 rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] text-[var(--text-secondary)] font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-400"
                rows={4}
              />
            </div>

            <div className="flex gap-4 justify-end">
              <button
                onClick={handleReject}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-red-600 text-white hover:bg-red-700 transition disabled:opacity-50"
              >
                <XCircle size={18} />
                Reject & Override
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-green-600 text-white hover:bg-green-700 transition disabled:opacity-50"
              >
                {submitting ? <Loader className="animate-spin" size={18} /> : <CheckCircle2 size={18} />}
                Approve & Finalize
              </button>
            </div>
          </GlassCard>
        )}

        {/* Approved/Rejected Summary */}
        {status !== "pending" && (
          <GlassCard className={`p-8 border-2 ${status === "approved" ? "border-green-400" : "border-red-400"}`}>
            <div className="flex items-center gap-3 mb-4">
              {status === "approved" ? (
                <CheckCircle2 size={28} className="text-green-500" />
              ) : (
                <XCircle size={28} className="text-red-500" />
              )}
              <h3 className={`text-2xl font-bold ${status === "approved" ? "text-green-600" : "text-red-600"}`}>
                Decision {status === "approved" ? "Approved" : "Rejected"}
              </h3>
            </div>
            <p className="text-[var(--text-secondary)]">Approval notes: {approvalNotes || "No additional notes."}</p>
          </GlassCard>
        )}
      </div>
    </div>
  );
};
