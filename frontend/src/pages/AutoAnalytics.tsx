/**
 * WriteLens - Auto Analytics Page Component
 * TypeScript/React Implementation
 */

import React, { useState, useEffect } from 'react';
import './AutoAnalytics.css'; // FIX: Extracted all inline styles to separate stylesheet
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  summary?: {
    totalStudents: number;
    totalRulesApplied: number;
    totalMetricsAnalyzed: number;
    systemPrecision: number;
    processingTime: string;
  };
  statistics?: {
    totalStudents: number;
    avgWordCount: number;
    avgTimeOnTask: number;
    avgScore: number;
    avgTTR: number;
    avgCohesion: number;
  };
  studentProfiles?: Array<{
    studentId: string;
    profile: string;
    cluster: number;
  }>;
  statesDistribution?: Record<string, Record<string, number>>;
  latestFeedback?: any[];
}

interface ChartData {
  name: string;
  value: number;
}

const _DEFAULT_API_BASE = import.meta.env.DEV ? 'http://127.0.0.1:5000' : '';
const _API_BASE_ROOT = (import.meta.env.VITE_API_URL ?? _DEFAULT_API_BASE).replace(/\/$/, '');

const AutoAnalyticsDashboard: React.FC = () => {
  const API_BASE = `${_API_BASE_ROOT}/api`;

  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [charts, setCharts] = useState<Record<string, ChartData[]>>({});
  const [processing, setProcessing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ==========================================
  // AUTOMATIC DATA FETCHING
  // ==========================================

  const fetchDashboard = async () => {
    try {
      const response = await fetch(`${API_BASE}/dashboard`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch dashboard`);
      }
      const result = await response.json();
      // FIX: Validate data structure before setting state
      if (!result.data || typeof result.data !== 'object') {
        throw new Error('Invalid dashboard data structure from server');
      }
      setDashboard(result.data);
      setLastUpdate(new Date());
      setError(null);
      setLoading(false);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      console.error('Error fetching dashboard:', err);
      setError(errorMessage);
      setLoading(false);
    }
  };

  const fetchCharts = async () => {
    try {
      const types = ['learnerProfiles', 'aiStates', 'scoreDistribution'];
      const chartsData: Record<string, ChartData[]> = {};

      for (const type of types) {
        const response = await fetch(`${API_BASE}/charts/${type}`);
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch ${type}`);
        }
        const data = await response.json();
        // FIX: Validate chart data is array before setting
        if (!Array.isArray(data.data)) {
          console.warn(`Invalid chart data for ${type}, using empty array`);
          chartsData[type] = [];
        } else {
          chartsData[type] = data.data;
        }
      }
      setCharts(chartsData);
      setError(null);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error fetching charts';
      console.error('Error fetching charts:', err);
      setError(errorMessage);
    }
  };

  // ==========================================
  // EFFECTS & AUTO-REFRESH
  // ==========================================

  useEffect(() => {
    // Initial load on component mount
    fetchDashboard();
    fetchCharts();
  }, []);

  // ==========================================
  // AUTO PROCESSING
  // ==========================================

  const triggerProcessing = async () => {
    setProcessing(true);
    try {
      const response = await fetch(`${API_BASE}/process`, {
        method: 'POST',
      });
      await response.json();

      // Auto-refresh after processing
      setTimeout(() => {
        fetchDashboard();
        fetchCharts();
      }, 2000);
    } catch (err) {
      console.error('Error processing:', err);
    } finally {
      setProcessing(false);
    }
  };

  // ==========================================
  // COMPONENTS
  // ==========================================

  const StatCard: React.FC<{
    title: string;
    value: number | string;
    unit?: string;
    color?: string;
  }> = ({ title, value, unit, color }) => (
    <div className="stat-card" style={color ? { borderLeftColor: color } : {}}>
      {/* FIX: Using CSS classes for dark theme instead of inline styles */}
      <div className="stat-label">
        {title}
      </div>
      <div className="stat-value">
        {typeof value === 'number' ? value.toFixed(2) : value}
        <span className="stat-unit">
          {unit}
        </span>
      </div>
    </div>
  );

  const ChartContainer: React.FC<{
    title: string;
    children: React.ReactNode;
  }> = ({ title, children }) => (
    <div className="chart-container">
      {/* FIX: Using CSS classes for proper dark theme styling */}
      <h3 className="chart-title">{title}</h3>
      {children}
    </div>
  );

  // FIX: Show error state with user-friendly message and retry option
  if (error && !dashboard) {
    return (
      <div className="analytics-container">
        <div className="p-8 rounded-xl bg-red-500/10 border border-red-500/20">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Unable to Load Analytics</h2>
          <p className="text-red-300 mb-6">{error}</p>
          <div className="flex gap-4">
            <button 
              onClick={() => {
                setError(null);
                setLoading(true);
                fetchDashboard();
                fetchCharts();
              }}
              className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
            >
              Retry
            </button>
            <button 
              onClick={() => window.location.reload()}
              className="px-6 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Refresh Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="analytics-container">
        <div className="loading-container">
          <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">WriteLens Analytics Dashboard</h2>
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-[var(--lav)] animate-pulse"></div>
            <p className="text-[var(--text-secondary)]">Loading data from server...</p>
          </div>
          <p className="text-xs text-[var(--text-muted)]">If this takes more than 10 seconds, the API server may not be running on port 5000.</p>
        </div>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="analytics-container">
        <div className="p-8 rounded-xl bg-amber-500/10 border border-amber-500/20">
          <h2 className="text-2xl font-bold text-amber-400 mb-2">No Data Available</h2>
          <p className="text-amber-300 mb-4">The analytics dashboard is empty. Please ensure the backend API is running.</p>
          <button 
            onClick={() => {
              setLoading(true);
              fetchDashboard();
              fetchCharts();
            }}
            className="px-6 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors"
          >
            Load Data
          </button>
        </div>
      </div>
    );
  }

  const COLORS = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe'];

  return (
    <div className="analytics-container">
      {/* Header with Process Button */}
      <div className="mb-8 p-6 bg-gradient-to-r from-[#667eea] to-[#764ba2] rounded-lg text-white flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold m-0">WriteLens Analytics</h1>
          <p className="mt-1 opacity-90">Educational Analytics Dashboard</p>
        </div>
        <button
          onClick={triggerProcessing}
          disabled={processing}
          className={`px-5 py-2 font-bold rounded-lg transition-colors ${
            processing 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-60'
              : 'bg-white text-[#667eea] hover:bg-gray-100 cursor-pointer'
          }`}
        >
          {processing ? 'Processing...' : 'Process Data'}
        </button>
      </div>

      {/* Last Update Banner */}
      {lastUpdate && (
        <div className="p-3 px-5 bg-blue-900/30 border border-blue-500/30 rounded-lg mb-6 text-sm text-blue-300">
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      )}

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
        <StatCard
          title="Total Students"
          value={dashboard?.summary?.totalStudents || 0}
          color="#f0f4ff"
        />
        <StatCard
          title="Average Word Count"
          value={dashboard?.statistics?.avgWordCount || 0}
          unit="words"
          color="#fff5f0"
        />
        <StatCard
          title="Average Time on Task"
          value={dashboard?.statistics?.avgTimeOnTask || 0}
          unit="mins"
          color="#f0fff5"
        />
        <StatCard
          title="Average Score"
          value={dashboard?.statistics?.avgScore || 0}
          unit="/32"
          color="#fff0f5"
        />
        <StatCard
          title="System Precision"
          value={dashboard?.summary?.systemPrecision || 0}
          unit="%"
          color="#f5f0ff"
        />
        <StatCard
          title="Rules Applied"
          value={dashboard?.summary?.totalRulesApplied || 0}
          unit="rules"
          color="#eff5ff"
        />
      </div>

      {/* Charts Grid - Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Learner Profiles */}
        <ChartContainer title="📊 Learner Profile Distribution">
          {charts.learnerProfiles && charts.learnerProfiles.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={charts.learnerProfiles}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, value }) => `${name}: ${value}`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {charts.learnerProfiles.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[index % COLORS.length]}
                    />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#cbd5e1' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </ChartContainer>

        {/* Score Distribution */}
        <ChartContainer title="📈 Score Distribution">
          {charts.scoreDistribution && charts.scoreDistribution.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={charts.scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} tick={{ fill: '#cbd5e1' }} />
                <YAxis tick={{ fill: '#cbd5e1' }} />
                <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#cbd5e1' }} />
                <Bar dataKey="value" fill="#667eea" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-500">No data available</p>
          )}
        </ChartContainer>
      </div>

      {/* AI States Distribution */}
      {charts.aiStates && charts.aiStates.length > 0 && (
        <ChartContainer title="🧠 AI States Distribution">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.aiStates}>
              <CartesianGrid strokeDasharray="3 3" stroke="#475569" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} tick={{ fill: '#cbd5e1' }} />
              <YAxis tick={{ fill: '#cbd5e1' }} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #475569', color: '#cbd5e1' }} />
              <Bar dataKey="value" fill="#764ba2" />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      )}

      {/* Student Profiles Table */}
      {dashboard?.studentProfiles && dashboard.studentProfiles.length > 0 && (
        <ChartContainer title="👥 Student Profiles">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b-2 border-slate-600 bg-slate-800/50">
                  <th className="p-3 text-left">Student ID</th>
                  <th className="p-3 text-left">Profile</th>
                  <th className="p-3 text-center">Cluster</th>
                </tr>
              </thead>
              <tbody>
                {dashboard.studentProfiles.slice(0, 5).map((student, idx) => (
                  <tr key={idx} className="border-b border-slate-700 hover:bg-slate-700/30">
                    <td className="p-3">{student.studentId}</td>
                    <td className="p-3">
                      <span className="px-3 py-1 bg-blue-900/40 border border-blue-500/30 rounded-full text-xs text-blue-300">
                        {student.profile.toUpperCase().replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="p-3 text-center">{student.cluster}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {dashboard.studentProfiles.length > 5 && (
            <p className="mt-3 text-xs text-gray-500">
              ... and {dashboard.studentProfiles.length - 5} more students
            </p>
          )}
        </ChartContainer>
      )}

      {/* Footer */}
      <div className="mt-10 p-6 bg-slate-800/50 border border-slate-700 rounded-lg text-center text-gray-400 text-sm">
        <p>
          WriteLens v2.0 • Fully Automated Analytics System
          <br />
          Last Update: {lastUpdate?.toLocaleString() || 'Never'}
          <br />
          System Status: <span className="text-green-400">✅ OPERATIONAL</span>
        </p>
      </div>
    </div>
  );
};

export default AutoAnalyticsDashboard;
