import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  Filter,
  Users,
  Zap,
  AlertTriangle,
  Upload,
  RefreshCw,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useStudyScopeStore } from '../state/studyScope';

interface StudentRecord {
  id: string;
  name: string;
  group: string;
  currentTask: string;
  profile: string;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  score: number;
  improvement: string;
  feedbackPending: boolean;
  lastActivity: string;
}

/**
 * Student Management Page
 * Professor-optimized table view with filtering, bulk actions, and search
 */
export const Students: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStudents, setSelectedStudents] = useState<Set<string>>(new Set());
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);
  const [filters, setFilters] = useState({
    risk: 'all' as string,
    profile: 'all' as string,
    task: 'all' as string,
    feedbackStatus: 'all' as string,
  });
  const [sortBy, setSortBy] = useState<'name' | 'risk' | 'score' | 'activity'>('name');
  const [showFilters, setShowFilters] = useState(false);
  const cases = useStudyScopeStore((state) => state.cases);

  const mappedCaseStudents = useMemo<StudentRecord[]>(() => {
    return cases.map((studyCase) => {
      const student = studyCase.student;
      const risk = studyCase.riskLevel;
      return {
        id: student.student_id || studyCase.id,
        name: student.name || studyCase.meta.studentName,
        group: `${studyCase.meta.courseTitle || 'Course'} • ${studyCase.meta.institution || 'Institution'}`,
        currentTask: studyCase.writing.artifacts[0]?.title || 'Case overview',
        profile: student.learner_profile || studyCase.clusterName || 'General profile',
        riskLevel: risk === 'critical' ? 'critical' : risk === 'monitor' ? 'medium' : 'low',
        score: Math.round(Number(student.total_score || 0)),
        improvement: student.predicted_improvement || `Gain: ${Number(student.score_gain || 0).toFixed(1)}`,
        feedbackPending: studyCase.meta.ungradedAssignments > 0,
        lastActivity: studyCase.meta.reportGenerated || studyCase.meta.periodCovered,
      };
    });
  }, [cases]);

  const realStudents: StudentRecord[] = mappedCaseStudents;

  // Filter and search
  const filteredStudents = useMemo(() => {
    return realStudents
      .filter(
        (s) =>
          s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          s.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(
        (s) =>
          (filters.risk === 'all' || s.riskLevel === filters.risk) &&
          (filters.profile === 'all' || s.profile === filters.profile) &&
          (filters.feedbackStatus === 'all' ||
            (filters.feedbackStatus === 'pending' && s.feedbackPending) ||
            (filters.feedbackStatus === 'reviewed' && !s.feedbackPending))
      )
      .sort((a, b) => {
        if (sortBy === 'risk') {
          const riskOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          return riskOrder[a.riskLevel] - riskOrder[b.riskLevel];
        }
        if (sortBy === 'score') return b.score - a.score;
        return a.name.localeCompare(b.name);
      });
  }, [searchTerm, filters, sortBy]);

  const handleSelectAll = () => {
    if (selectedStudents.size === filteredStudents.length) {
      setSelectedStudents(new Set());
    } else {
      setSelectedStudents(new Set(filteredStudents.map((s) => s.id)));
    }
  };

  const toggleStudent = (id: string) => {
    const newSelected = new Set(selectedStudents);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedStudents(newSelected);
  };

  const getRiskPillClass = (risk: string) => {
    switch (risk) {
      case 'critical':
        return 'text-[var(--red)] bg-[var(--red-dim)] border-[var(--red-glow)]';
      case 'high':
        return 'text-[var(--amber)] bg-[var(--amber-dim)] border-[var(--amber-dim)]';
      case 'medium':
        return 'text-[var(--blue)] bg-[var(--blue-dim)] border-[var(--blue-dim)]';
      default:
        return 'text-[var(--green)] bg-[var(--green-dim)] border-[var(--green-dim)]';
    }
  };

  return (
    <div className="space-y-8 pb-20 px-6 lg:px-12 relative">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 bg-[var(--lav)] text-white px-6 py-3 rounded-lg shadow-xl shadow-[var(--lav)]/20 font-navigation uppercase tracking-widest text-xs z-50 animate-fade-in flex items-center justify-between">
          <span>{toastMessage}</span>
          <button onClick={() => setToastMessage(null)} className="ml-4 hover:opacity-70">×</button>
        </div>
      )}

      {/* Page Header */}
      <div className="pt-8">
        <h1 className="text-4xl lg:text-5xl font-bold font-navigation uppercase tracking-tight mb-3 text-[var(--text-primary)]">
          Student Management
        </h1>
        {realStudents.length > 0 ? (
          <p className="text-[var(--text-sec)] text-base">
            Manage {filteredStudents.length} student{filteredStudents.length !== 1 ? 's' : ''} • {selectedStudents.size} selected
          </p>
        ) : (
          <p className="text-[var(--text-sec)] text-base">
            Automated Data Pipeline
          </p>
        )}
      </div>

      {realStudents.length > 0 && (
        <div className="space-y-6">
          {/* Toolbar */}
          <div className="glass-card p-6 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="flex gap-3 items-center flex-1 min-w-0 w-full sm:w-auto">
              <div className="relative flex-1 min-w-0">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search by name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-raised)] border border-[var(--border)] rounded-lg py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] placeholder-[var(--text-muted)] focus:border-[var(--lav)] focus:bg-[rgba(167,139,250,0.05)] transition-all"
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`p-3 rounded-lg transition-all ${
              showFilters
                ? 'glass-card bg-[var(--lav)] text-white'
                : 'glass-card text-[var(--text-muted)] hover:text-[var(--lav)]'
            }`}
          >
            <Filter className="w-5 h-5" />
          </button>
        </div>

        {selectedStudents.size > 0 && (
          <div className="flex gap-3 items-center w-full sm:w-auto">
            <button onClick={() => setToastMessage(`Assigning feedback templates to ${selectedStudents.size} selected student${selectedStudents.size !== 1 ? 's' : ''}...`)} className="px-4 py-2.5 text-sm font-bold font-navigation uppercase text-white bg-[var(--lav)] hover:bg-[var(--blue)] rounded-lg transition-all hover:shadow-lg">
              Assign Feedback ({selectedStudents.size})
            </button>
            <button onClick={() => setToastMessage(`Exporting data and profiles for ${selectedStudents.size} selected student${selectedStudents.size !== 1 ? 's' : ''} - Preparing download...`)} className="px-4 py-2.5 text-sm font-bold font-navigation uppercase text-[var(--lav)] glass-card hover:text-white hover:bg-[var(--lav)] transition-all">
              Export
            </button>
            <button
              onClick={() => setSelectedStudents(new Set())}
              className="px-4 py-2.5 text-sm font-bold font-navigation uppercase text-[var(--text-muted)] glass-card hover:text-[var(--text-primary)] transition-all"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {filteredStudents.length > 0 && (
        <div className="md:hidden glass-card p-4 flex items-center justify-between gap-3">
          <div className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)]">
            Bulk Selection
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSelectAll}
              className="px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--lav)] hover:text-[var(--lav)] transition-colors"
            >
              {selectedStudents.size === filteredStudents.length && filteredStudents.length > 0 ? 'Clear All' : 'Select All'}
            </button>
            {selectedStudents.size > 0 && (
              <button
                type="button"
                onClick={() => setSelectedStudents(new Set())}
                className="px-3 py-2 text-xs font-bold uppercase tracking-widest rounded-lg bg-[var(--lav)] text-white hover:bg-[var(--blue)] transition-colors"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}

      {/* Filter Panel */}
      {showFilters && (
        <div className="glass-card p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div>
              <label className="block text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Risk Level
              </label>
              <select
                value={filters.risk}
                onChange={(e) => setFilters({ ...filters, risk: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--lav)] focus:ring-2 focus:ring-[var(--lav)]/20 transition-all"
              >
                <option value="all">All Risk Levels</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Learner Profile
              </label>
              <select
                value={filters.profile}
                onChange={(e) => setFilters({ ...filters, profile: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--lav)] focus:ring-2 focus:ring-[var(--lav)]/20 transition-all"
              >
                <option value="all">All Profiles</option>
                <option value="engaged">Engaged Developer</option>
                <option value="strategic">Strategic Reviser</option>
                <option value="passive">Passive Submitter</option>
                <option value="resource">Resource Avoider</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Feedback Status
              </label>
              <select
                value={filters.feedbackStatus}
                onChange={(e) => setFilters({ ...filters, feedbackStatus: e.target.value })}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--lav)] focus:ring-2 focus:ring-[var(--lav)]/20 transition-all"
              >
                <option value="all">Any Status</option>
                <option value="pending">Pending Approval</option>
                <option value="reviewed">Reviewed</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
                Sort By
              </label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-4 py-2.5 border border-[var(--border)] rounded-lg text-sm bg-[var(--bg-base)] text-[var(--text-primary)] focus:border-[var(--lav)] focus:ring-2 focus:ring-[var(--lav)]/20 transition-all"
              >
                <option value="name">Name (A-Z)</option>
                <option value="risk">Risk (Highest)</option>
                <option value="score">Score (Highest)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Student Table */}
      <div className="glass-card overflow-hidden">
        <div className="md:hidden divide-y divide-[var(--border)]">
          {filteredStudents.map((student) => (
            <div key={student.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-base">{student.name}</div>
                  <div className="text-xs text-[var(--text-muted)]">{student.id}</div>
                </div>
                <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getRiskPillClass(student.riskLevel)}`}>
                  {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)}
                </span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Profile</span>
                  <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-[var(--lav)]/10 text-[var(--lav)] border border-[var(--lav)]/30 font-bold uppercase tracking-wider text-xs">
                    {student.profile}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Score</span>
                  <span className="font-bold text-[var(--text-primary)]">{student.score}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--text-muted)]">Status</span>
                  {student.feedbackPending ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-[var(--amber)]/10 border border-[var(--amber)]/30 text-[var(--amber)] rounded font-bold uppercase text-xs">
                      <Zap className="w-3 h-3" />
                      Pending
                    </span>
                  ) : (
                    <span className="text-[var(--teal)] font-medium">Reviewed</span>
                  )}
                </div>
              </div>
              <div className="flex items-center justify-between pt-1">
                <label className="inline-flex items-center gap-2 text-xs text-[var(--text-sec)]">
                  <input
                    type="checkbox"
                    checked={selectedStudents.has(student.id)}
                    onChange={() => toggleStudent(student.id)}
                    className="rounded cursor-pointer w-4 h-4"
                  />
                  Select
                </label>
                  <Link to={`/student-profile/${student.id}`} className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--lav)]/10 text-[var(--lav)] border border-[var(--lav)]/30 hover:bg-[var(--lav)] hover:text-white font-bold text-xs uppercase transition-all">
                    View Profile
                </Link>
              </div>
            </div>
          ))}
        </div>
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-[var(--bg-high)] border-b border-[var(--border)]">
              <tr>
                <th className="px-6 py-4 text-left">
                  <input
                    type="checkbox"
                    checked={selectedStudents.size === filteredStudents.length && filteredStudents.length > 0}
                    onChange={handleSelectAll}
                    disabled={filteredStudents.length === 0}
                    className="rounded cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Name
                </th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Risk
                </th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Profile
                </th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Score
                </th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Feedback
                </th>
                <th className="px-6 py-4 text-left font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Last Activity
                </th>
                <th className="px-6 py-4 text-center font-bold text-xs uppercase tracking-wider text-[var(--text-muted)]">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => (
                <tr
                  key={student.id}
                  className={`border-b border-[var(--border)] hover:bg-[var(--lav)]/5 transition-colors ${
                    selectedStudents.has(student.id) ? 'bg-[var(--lav)]/10' : ''
                  }`}
                >
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedStudents.has(student.id)}
                      onChange={() => toggleStudent(student.id)}
                      className="rounded cursor-pointer w-4 h-4"
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-base">{student.name}</div>
                    <div className="text-xs text-[var(--text-muted)]">{student.id}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold border ${getRiskPillClass(student.riskLevel)}`}
                    >
                      {student.riskLevel.charAt(0).toUpperCase() + student.riskLevel.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-[var(--lav)]/10 text-[var(--lav)] border border-[var(--lav)]/30 text-xs font-bold uppercase tracking-wider">
                      {student.profile}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="font-bold text-lg text-[var(--text-primary)]">{student.score}%</div>
                      <div className={`text-xs font-semibold px-2 py-1 rounded ${student.improvement.includes('+') ? 'bg-[var(--teal)]/10 text-[var(--teal)]' : 'bg-[var(--red)]/10 text-[var(--red)]'}`}>
                        {student.improvement.includes('+') ? '↑' : '↓'} {Math.abs(parseFloat(student.improvement))}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {student.feedbackPending ? (
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[var(--amber)]/10 border border-[var(--amber)]/30 text-[var(--amber)] rounded text-xs font-bold">
                        <Zap className="w-3.5 h-3.5" />
                        Pending
                      </span>
                    ) : (
                      <span className="text-xs text-[var(--text-muted)] font-medium">Reviewed</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-[var(--text-muted)]">{student.lastActivity}</td>
                  <td className="px-6 py-4 text-center">
                    <Link
                      to={`/student-profile/${student.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[var(--lav)]/10 text-[var(--lav)] border border-[var(--lav)]/30 hover:bg-[var(--lav)] hover:text-white font-bold text-xs uppercase tracking-wider transition-all"
                    >
                      View Profile
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredStudents.length === 0 && (
          <div className="p-8">
            {realStudents.length === 0 ? (
              // No student data at all
              <div className="rounded-lg bg-amber-500/10 border border-amber-500/20 p-12 text-center space-y-6">
                <div className="flex justify-center">
                  <AlertTriangle className="w-16 h-16 text-amber-400 opacity-70" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-amber-300 mb-2">No Student Data Available</h3>
                  <p className="text-amber-200/80 text-sm mb-2">
                    Student cases have not been imported or loaded from the backend API.
                  </p>
                  <p className="text-amber-200/70 text-xs space-y-1">
                    <span className="block">To get started, you need to:</span>
                    <span className="block">1. Ensure the backend API is running on port 5000</span>
                    <span className="block">2. Import student data from an Excel workbook</span>
                    <span className="block">3. Verify data was successfully loaded</span>
                  </p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg transition-colors flex items-center gap-2 justify-center"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Reload Page
                  </button>
                  <button
                    onClick={() => navigate('/import')}
                    className="px-6 py-2.5 bg-[var(--lav)] hover:bg-[var(--lav)]/80 text-white font-bold rounded-lg transition-colors flex items-center gap-2 justify-center"
                  >
                    <Upload className="w-4 h-4" />
                    Import Student Data
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-bold rounded-lg transition-colors"
                  >
                    Dashboard
                  </button>
                </div>
              </div>
            ) : (
              // Student data exists but filters hide it all
              <div className="text-center py-12">
                <Users className="w-16 h-16 text-[var(--text-muted)] mx-auto mb-4 opacity-40" />
                <p className="text-[var(--text-primary)] text-lg font-semibold mb-2">No students match your filters</p>
                <p className="text-[var(--text-muted)] text-sm mb-6">
                  Try adjusting your search criteria or filters to find students
                </p>
                <button
                  onClick={() => {
                    setSearchTerm('');
                    setFilters({ risk: 'all', profile: 'all', task: 'all', feedbackStatus: 'all' });
                  }}
                  className="px-6 py-2 bg-[var(--lav)] hover:bg-[var(--lav)]/80 text-white font-bold rounded-lg transition-colors text-sm"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Stats Footer */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
        <div className="glass-card p-6">
          <div className="text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Total Students
          </div>
          <div className="text-3xl font-bold">{filteredStudents.length}</div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Pending Feedback
          </div>
          <div className="text-3xl font-bold text-[var(--amber)]">
            {filteredStudents.filter((s) => s.feedbackPending).length}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
            High Risk
          </div>
          <div className="text-3xl font-bold text-[var(--red)]">
            {filteredStudents.filter((s) => s.riskLevel === 'high' || s.riskLevel === 'critical').length}
          </div>
        </div>
        <div className="glass-card p-6">
          <div className="text-xs font-bold font-navigation uppercase tracking-wider text-[var(--text-muted)] mb-3">
            Avg. Score
          </div>
          <div className="text-3xl font-bold">
            {Math.round(
              filteredStudents.reduce((acc, s) => acc + s.score, 0) / filteredStudents.length || 0
            )}%
          </div>
        </div>
      </div>
      </div>
      )}
    </div>
  );
};

