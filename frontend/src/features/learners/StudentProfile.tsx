/**
 * WriteLens – StudentProfile Page  (/students/:studentId)
 *
 * Full-detail view for one learner:
 *   • Hero header:  avatar, name, email, risk badge, overall score ring
 *   • Summary band: key facts (profile, competence, performance, primary issue)
 *   • AI Station grid (3×3): StationCard × 9
 *   • StationDetailPanel: slides in from the right when a card is selected
 */

import React, { useEffect, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, Loader2, AlertCircle, Mail, BookOpen, Zap } from 'lucide-react';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { StationCard } from './StationCard';
import { StationDetailPanel } from './StationDetailPanel';
import { useLearnerStore } from './useLearnerStore';
import { enrichStationCards, deriveOverallScore, deriveRiskSeverity } from './learnerLoader';
import type { EnrichedStationCard } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────────────────────

const AVATAR_COLORS = [
  'from-blue-400 to-blue-600',
  'from-violet-400 to-violet-600',
  'from-emerald-400 to-emerald-600',
  'from-amber-400 to-orange-500',
  'from-pink-400 to-rose-500',
  'from-sky-400 to-cyan-500',
];
function avatarColor(id: string) {
  const n = parseInt(id, 10) || 0;
  return AVATAR_COLORS[n % AVATAR_COLORS.length];
}
function toInitials(name: string) {
  return name.split(/[\s_]+/).filter(Boolean).slice(0, 2).map((n) => n[0].toUpperCase()).join('');
}

const RISK_BADGE: Record<number, { label: string; cls: string }> = {
  1: { label: 'Low Risk',  cls: 'bg-emerald-100 text-emerald-800 ring-emerald-300' },
  2: { label: 'Monitor',   cls: 'bg-sky-100 text-sky-800 ring-sky-300' },
  3: { label: 'Moderate',  cls: 'bg-amber-100 text-amber-800 ring-amber-300' },
  4: { label: 'High Risk', cls: 'bg-red-100 text-red-800 ring-red-300' },
};

const QUALITY_COLOR: Record<string, string> = {
  poor:         'bg-red-50 text-red-700',
  satisfactory: 'bg-amber-50 text-amber-700',
  good:         'bg-blue-50 text-blue-700',
  excellent:    'bg-emerald-50 text-emerald-700',
};

// ─────────────────────────────────────────────────────────────────────────────
// SKELETON
// ─────────────────────────────────────────────────────────────────────────────

const ProfileSkeleton: React.FC = () => (
  <div className="animate-pulse space-y-6">
    <div className="h-40 rounded-2xl bg-slate-100" />
    <div className="grid grid-cols-3 gap-4 sm:grid-cols-3">
      {Array.from({ length: 9 }).map((_, i) => (
        <div key={i} className="h-36 rounded-2xl bg-slate-100" />
      ))}
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

export const StudentProfile: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();

  const {
    studentIndex,
    profileCache,
    isLoadingProfile,
    profileError,
    selectedStationId,
    loadIndex,
    selectStudent,
    loadProfile,
    selectStation,
  } = useLearnerStore();

  // Ensure index is loaded (in case user lands directly via URL)
  useEffect(() => { loadIndex(); }, [loadIndex]);

  // Find the lightweight index entry for this student
  const indexEntry = useMemo(
    () => studentIndex.find((s) => s.student_id === studentId) ?? null,
    [studentIndex, studentId],
  );

  // Once we have the index entry, trigger profile load
  useEffect(() => {
    if (!indexEntry) return;
    selectStudent(indexEntry.student_id);
    loadProfile(indexEntry.profile_path, indexEntry.student_id);
  }, [indexEntry, selectStudent, loadProfile]);

  const profile = studentId ? profileCache[studentId] : null;

  // Enriched station cards derived from profile
  const enrichedCards = useMemo<EnrichedStationCard[]>(() => {
    if (!profile) return [];
    return enrichStationCards(profile.station_cards);
  }, [profile]);

  // The currently selected station card (for the detail panel)
  const selectedCard = useMemo(
    () => enrichedCards.find((c) => c.station_id === selectedStationId) ?? null,
    [enrichedCards, selectedStationId],
  );

  // Derived display values
  const overallScore = useMemo(() => indexEntry ? deriveOverallScore(indexEntry) : 0, [indexEntry]);
  const riskSeverity = useMemo(() => indexEntry ? deriveRiskSeverity(indexEntry) : 3, [indexEntry]);
  const risk = RISK_BADGE[riskSeverity];

  // ── Render states ────────────────────────────────────────────────────────

  if (isLoadingProfile && !profile) {
    return (
      <div className="space-y-6">
        <Link to="/students" className="flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" /> Back to Learners
        </Link>
        <ProfileSkeleton />
      </div>
    );
  }

  if (profileError && !profile) {
    return (
      <div className="space-y-4">
        <Link to="/students" className="flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="flex items-center gap-2 rounded-xl bg-red-50 p-4 text-red-700">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <p>{profileError}</p>
        </div>
      </div>
    );
  }

  if (!profile && !isLoadingProfile) {
    return (
      <div className="space-y-4">
        <Link to="/students" className="flex items-center gap-2 text-sm text-slate-500">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <div className="rounded-xl bg-amber-50 p-4 text-sm text-amber-700">
          Student not found. The profile may not have been generated yet.
        </div>
      </div>
    );
  }

  const student = profile?.student;
  const summary = profile?.summary;
  const qColor = QUALITY_COLOR[summary?.quality_profile ?? 'good'] ?? 'bg-slate-50 text-slate-600';

  return (
    <div className="space-y-6">
      {/* ── Back nav ── */}
      <button
        onClick={() => navigate('/students')}
        className="flex items-center gap-2 text-sm text-slate-500 transition-colors hover:text-slate-900"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Learners
      </button>

      {/* ── Hero Header ── */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/60">
        {/* Colored top band */}
        <div className="h-2 bg-linear-to-r from-blue-400 via-violet-500 to-emerald-400" />

        <div className="flex flex-wrap items-start justify-between gap-6 p-6">
          {/* Avatar + identity */}
          <div className="flex items-center gap-5">
            <div
              className={`flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-linear-to-br ${avatarColor(student?.student_id ?? '0')} text-2xl font-bold text-white shadow-lg`}
            >
              {toInitials(student?.student_name ?? 'ST')}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900">{student?.student_name}</h1>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                <Mail className="h-3.5 w-3.5" />
                {student?.email}
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ring-1 ${risk.cls}`}>
                  {risk.label}
                </span>
                <span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${qColor}`}>
                  {summary?.quality_profile}
                </span>
                <span className="inline-flex items-center gap-1 rounded-lg bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-700">
                  <BookOpen className="h-3 w-3" />
                  {summary?.competence_level}
                </span>
              </div>
            </div>
          </div>

          {/* Overall score ring */}
          <div className="flex flex-col items-center gap-1">
            <CircularProgress value={overallScore} size={88} stroke={8} />
            <p className="text-xs text-slate-400">Overall AI Score</p>
          </div>
        </div>

        {/* Summary band */}
        <div className="flex flex-wrap gap-px border-t border-slate-100 bg-slate-100">
          {[
            { label: 'Learner Profile',  value: summary?.learner_profile.split(' - ')[1] ?? summary?.learner_profile },
            { label: 'Performance',      value: summary?.performance_level },
            { label: 'Primary Issue',    value: summary?.primary_issue?.replace(/_/g, ' ') },
            { label: 'Problem Group',    value: summary?.problem_group },
          ].map((item) => (
            <div key={item.label} className="flex flex-1 min-w-35 flex-col bg-white px-4 py-3">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{item.label}</p>
              <p className="mt-0.5 text-sm font-medium text-slate-800">{item.value ?? '—'}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Root Causes + Recommendations ── */}
      {summary && (summary.root_causes.length > 0 || summary.recommendations.length > 0) && (
        <div className="grid gap-4 sm:grid-cols-2">
          {summary.root_causes.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
              <div className="mb-3 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <p className="text-sm font-semibold text-slate-900">Root Causes</p>
              </div>
              <div className="flex flex-wrap gap-2">
                {summary.root_causes.map((cause) => (
                  <span key={cause} className="rounded-lg bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200">
                    {cause.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
          {summary.recommendations.length > 0 && (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-200/60">
              <div className="mb-3 flex items-center gap-2">
                <Zap className="h-4 w-4 text-blue-500" />
                <p className="text-sm font-semibold text-slate-900">Recommendations</p>
              </div>
              <ul className="space-y-2">
                {summary.recommendations.slice(0, 4).map((rec, i) => {
                  const [code, ...rest] = rec.split(':');
                  return (
                    <li key={i} className="flex gap-2 text-xs">
                      <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[9px] font-bold text-blue-600">
                        {i + 1}
                      </span>
                      <span>
                        <span className="font-semibold text-slate-700">{code.trim().replace(/_/g, ' ')}</span>
                        {rest.length > 0 && <span className="text-slate-500">:{rest.join(':')}</span>}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* ── AI Analysis Stations grid ── */}
      <div>
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">AI Analysis Stations</h2>
            <p className="text-xs text-slate-400">Click any station to explore detailed metrics</p>
          </div>
          {isLoadingProfile && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Loading…
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {enrichedCards.map((card) => (
            <StationCard
              key={card.station_id}
              card={card}
              isSelected={selectedStationId === card.station_id}
              onSelect={(id) => {
                if (selectedStationId === id) selectStation(null);
                else selectStation(id);
              }}
            />
          ))}
        </div>
      </div>

      {/* ── Station Detail Panel (slide-in) ── */}
      {selectedCard && (
        <StationDetailPanel
          card={selectedCard}
          onClose={() => selectStation(null)}
        />
      )}
    </div>
  );
};
