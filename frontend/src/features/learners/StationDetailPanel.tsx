/**
 * WriteLens – StationDetailPanel
 *
 * A slide-in right panel showing full details for the selected station.
 * Contents adapt to the station type:
 *   S01 → behavioral metric bars
 *   S02 → threshold table + triggered rules
 *   S03 → cluster radar chart + root causes
 *   S04 → prediction bar + model metrics
 *   S05 → competence radar + probabilities
 *   S06 → risk + instructional group info
 *   S07 → teacher actions table
 *   S08 → adaptive feedback text + recommendations
 *   S09 → validation checklist
 */

import React, { useEffect } from 'react';
import { X, Loader2, AlertCircle, ChevronRight } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CircularProgress } from '../../components/ui/CircularProgress';
import { useLearnerStore } from './useLearnerStore';
import type { EnrichedStationCard, StationDetail } from './types';

// ─────────────────────────────────────────────────────────────────────────────
// SUB-COMPONENTS
// ─────────────────────────────────────────────────────────────────────────────

/** Horizontal metric bar row */
const MetricBar: React.FC<{ label: string; value: number; max: number; color?: string }> = ({
  label, value, max, color = '#3b82f6',
}) => {
  const pct = Math.round(Math.min((value / max) * 100, 100));
  return (
    <div className="space-y-1">
      <div className="flex justify-between text-xs text-slate-500">
        <span>{label}</span>
        <span className="font-medium text-slate-700">{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className="h-full rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
};

/** Pill badge */
const Pill: React.FC<{ text: string; cls?: string }> = ({ text, cls = '' }) => (
  <span className={`inline-flex items-center rounded-lg px-2.5 py-1 text-xs font-medium ${cls}`}>
    {text.replace(/_/g, ' ')}
  </span>
);

/** Recommendation row */
const RecommendationRow: React.FC<{ text: string; index: number }> = ({ text, index }) => {
  const [title, ...rest] = text.split(':');
  return (
    <li className="flex gap-3">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[10px] font-bold text-blue-600">
        {index + 1}
      </span>
      <div>
        <p className="text-xs font-semibold text-slate-700">{title.trim().replace(/_/g, ' ')}</p>
        {rest.length > 0 && (
          <p className="text-xs text-slate-500">{rest.join(':').trim()}</p>
        )}
      </div>
    </li>
  );
};

// ─────────────────────────────────────────────────────────────────────────────
// STATION-SPECIFIC CONTENT RENDERERS
// ─────────────────────────────────────────────────────────────────────────────

function renderStation01(metrics: Record<string, unknown>) {
  const bars: Array<{ label: string; value: number; max: number; color: string }> = [
    { label: 'Assignment Views', value: Number(metrics.assignment_views ?? 0), max: 30, color: '#3b82f6' },
    { label: 'Resource Access',  value: Number(metrics.resource_access_count ?? 0), max: 30, color: '#8b5cf6' },
    { label: 'Time on Task (min)', value: Number(metrics.time_on_task ?? 0), max: 200, color: '#10b981' },
    { label: 'Revision Frequency', value: Number(metrics.revision_frequency ?? 0), max: 8, color: '#f97316' },
    { label: 'Feedback Views',   value: Number(metrics.feedback_views ?? 0), max: 10, color: '#6366f1' },
    { label: 'Rubric Views',     value: Number(metrics.rubric_views ?? 0), max: 10, color: '#0ea5e9' },
    { label: 'Help-Seeking Msgs', value: Number(metrics.help_seeking_messages ?? 0), max: 10, color: '#ec4899' },
    { label: 'Word Count',       value: Number(metrics.word_count ?? 0), max: 800, color: '#f59e0b' },
  ];
  return (
    <div className="space-y-4">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Behavioral Signals</p>
      <div className="space-y-3">
        {bars.map((b) => <MetricBar key={b.label} {...b} />)}
      </div>
      <div className="mt-2 grid grid-cols-2 gap-3 border-t border-slate-100 pt-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Error Density</p>
          <p className="mt-0.5 text-lg font-bold text-slate-800">
            {Number(metrics.error_density ?? 0).toFixed(3)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Cohesion Index</p>
          <p className="mt-0.5 text-lg font-bold text-slate-800">
            {Number(metrics.cohesion_index ?? 0).toFixed(3)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">TTR (Lexical Variety)</p>
          <p className="mt-0.5 text-lg font-bold text-slate-800">
            {Number(metrics.ttr ?? 0).toFixed(3)}
          </p>
        </div>
      </div>
    </div>
  );
}

function renderStation02(metrics: Record<string, unknown>) {
  const priority = String(metrics.highest_priority ?? 'medium');
  const priorityColor: Record<string, string> = {
    critical: 'bg-red-50 text-red-700 ring-red-200',
    high:     'bg-orange-50 text-orange-700 ring-orange-200',
    medium:   'bg-amber-50 text-amber-700 ring-amber-200',
    low:      'bg-emerald-50 text-emerald-700 ring-emerald-200',
  };
  const rules = String(metrics.all_triggered_rule_ids ?? '').split(';').map((r) => r.trim()).filter(Boolean);
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: 'Quality Profile', value: String(metrics.quality_profile ?? '—') },
          { label: 'Word Count Level', value: String(metrics.word_count_level ?? '—') },
          { label: 'Error Density Level', value: String(metrics.error_density_level ?? '—') },
        ].map((item) => (
          <div key={item.label} className="rounded-xl bg-slate-50 p-3">
            <p className="text-[10px] uppercase tracking-wide text-slate-400">{item.label}</p>
            <p className="mt-0.5 text-sm font-semibold capitalize text-slate-800">{item.value}</p>
          </div>
        ))}
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Priority</p>
          <span className={`mt-1 inline-flex rounded-lg px-2 py-0.5 text-xs font-bold ring-1 capitalize ${priorityColor[priority] ?? priorityColor.medium}`}>
            {priority}
          </span>
        </div>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Triggered Rules ({rules.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {rules.map((r) => (
            <span key={r} className="rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700">
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderStation03(metrics: Record<string, unknown>) {
  const radarData = [
    { subject: 'Engagement',   value: Math.round(Number(metrics.overall_engagement ?? 0) * 100) },
    { subject: 'Planning',     value: Math.round(Number(metrics.planning_index ?? 0) * 100) },
    { subject: 'Discourse',    value: Math.round(Number(metrics.discourse_quality ?? 0) * 100) },
    { subject: 'Argumentation',value: Math.round(Number(metrics.argumentation_strength ?? 0) * 100) },
    { subject: 'Feedback Use', value: Math.round(Number(metrics.feedback_receptiveness ?? 0) * 100) },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-xl bg-blue-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-blue-400">Learner Profile</p>
        <p className="mt-0.5 text-sm font-bold text-blue-900">
          {String(metrics.learner_profile ?? '—')}
        </p>
      </div>
      <div className="rounded-xl bg-orange-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-400">Primary Issue</p>
        <p className="mt-0.5 text-sm font-bold text-orange-900">
          {String(metrics.primary_issue ?? '—').replace(/_/g, ' ')}
        </p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <RadarChart data={radarData}>
          <PolarGrid stroke="#e2e8f0" />
          <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11, fill: '#64748b' }} />
          <Radar name="Student" dataKey="value" stroke="#8b5cf6" fill="#8b5cf6" fillOpacity={0.25} strokeWidth={2} />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

function renderStation04(metrics: Record<string, unknown>) {
  const score = Number(metrics.predicted_performance_score ?? 0);
  const modelMetrics = metrics.model_metrics as Record<string, unknown> | undefined;
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-emerald-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Predicted Score</p>
          <p className="mt-1 text-3xl font-bold text-emerald-800">{score.toFixed(2)}</p>
          <p className="text-xs text-emerald-600">{String(metrics.performance_level ?? '—')}</p>
        </div>
        <CircularProgress value={Math.min((score / 5) * 100, 100)} size={72} stroke={7} color="#10b981" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Improvement State</p>
          <p className="mt-0.5 text-sm font-semibold text-slate-800">
            {String(metrics.predicted_improvement_state ?? '—').replace(/_/g, ' ')}
          </p>
        </div>
        {modelMetrics && (
          <>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">Model R²</p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">
                {Number(modelMetrics.r2 ?? 0).toFixed(3)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">MAE</p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">
                {Number(modelMetrics.mae ?? 0).toFixed(3)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[10px] uppercase tracking-wide text-slate-400">RMSE</p>
              <p className="mt-0.5 text-sm font-bold text-slate-800">
                {Number(modelMetrics.rmse ?? 0).toFixed(3)}
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function renderStation05(metrics: Record<string, unknown>) {
  const dims = [
    { name: 'Argumentation', key: 'argument_competence',      color: '#8b5cf6' },
    { name: 'Cohesion',      key: 'cohesion_competence',      color: '#3b82f6' },
    { name: 'Linguistic',    key: 'linguistic_competence',    color: '#10b981' },
    { name: 'Self-Reg.',     key: 'self_regulation_competence', color: '#f97316' },
  ];
  const barData = dims.map((d) => ({
    name: d.name,
    value: Math.round(Number(metrics[d.key] ?? 0) * 100),
  }));
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between rounded-2xl bg-violet-50 p-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-violet-500">Avg Competence</p>
          <p className="mt-1 text-3xl font-bold text-violet-900">
            {(Number(metrics.avg_competence ?? 0) * 100).toFixed(1)}%
          </p>
          <p className="text-xs text-violet-600">{String(metrics.competence_level ?? '—')}</p>
        </div>
        <CircularProgress value={Math.round(Number(metrics.avg_competence ?? 0) * 100)} size={72} stroke={7} color="#8b5cf6" />
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={barData} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
          <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(val) => [`${val}%`, 'Competence']}
            contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} fill="#8b5cf6" fillOpacity={0.85} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function renderStation06(metrics: Record<string, unknown>) {
  return (
    <div className="space-y-3">
      {[
        { label: 'Risk Group', value: String(metrics.risk_group ?? '—'), color: 'bg-red-50 text-red-800' },
        { label: 'Problem Group', value: String(metrics.problem_group ?? '—'), color: 'bg-amber-50 text-amber-800' },
        { label: 'Instructional Group', value: String(metrics.instructional_group ?? '—'), color: 'bg-blue-50 text-blue-800' },
      ].map((item) => (
        <div key={item.label} className={`rounded-xl p-4 ${item.color}`}>
          <p className="text-[10px] font-semibold uppercase tracking-wide opacity-60">{item.label}</p>
          <p className="mt-0.5 text-sm font-semibold">{item.value}</p>
        </div>
      ))}
    </div>
  );
}

function renderStation07(metrics: Record<string, unknown>) {
  const rules = (metrics.triggered_rules as string[] | undefined) ??
    String(metrics.all_triggered_rule_ids ?? '').split(';').map((r) => r.trim()).filter(Boolean);
  const priorityColor: Record<string, string> = {
    critical: 'bg-red-100 text-red-800',
    high:     'bg-orange-100 text-orange-800',
    medium:   'bg-yellow-100 text-yellow-800',
    low:      'bg-green-100 text-green-800',
  };
  const priority = String(metrics.highest_priority ?? 'medium').toLowerCase();
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className={`rounded-xl p-3 ${priorityColor[priority] ?? 'bg-slate-50'}`}>
          <p className="text-[10px] uppercase tracking-wide opacity-60">Priority</p>
          <p className="mt-0.5 text-sm font-bold capitalize">{priority}</p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-[10px] uppercase tracking-wide text-slate-400">Competence</p>
          <p className="mt-0.5 text-sm font-bold text-slate-800">{String(metrics.competence_level ?? '—')}</p>
        </div>
      </div>
      <div className="rounded-xl bg-sky-50 p-3">
        <p className="text-[10px] font-semibold uppercase tracking-wide text-sky-500">Intervention Focus</p>
        <p className="mt-1 text-sm text-sky-900">{String(metrics.group_intervention_focus ?? '—')}</p>
      </div>
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
          Triggered Rules ({rules.length})
        </p>
        <div className="flex flex-wrap gap-1.5">
          {rules.map((r) => (
            <span key={r} className="rounded-md bg-orange-50 px-2 py-0.5 text-xs font-semibold text-orange-700">
              {r}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function renderStation08(metrics: Record<string, unknown>) {
  const recs = metrics.recommendations as string[] | undefined;
  const causes = metrics.root_causes as string[] | undefined;
  // Show only the structured part (before the === markers)
  const feedbackText = String(metrics.adaptive_feedback ?? '')
    .split('\n')
    .filter((l) => !l.startsWith('===') && l.trim())
    .slice(0, 20)
    .join('\n');

  return (
    <div className="space-y-4">
      {causes && causes.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Root Causes</p>
          <div className="flex flex-wrap gap-1.5">
            {causes.map((c) => (
              <Pill key={c} text={c} cls="bg-red-50 text-red-700 ring-1 ring-red-200" />
            ))}
          </div>
        </div>
      )}
      {recs && recs.length > 0 && (
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Recommendations</p>
          <ul className="space-y-2.5">
            {recs.map((r, i) => <RecommendationRow key={i} text={r} index={i} />)}
          </ul>
        </div>
      )}
      {feedbackText && (
        <div className="rounded-xl bg-teal-50 p-3">
          <p className="mb-1 text-[10px] font-semibold uppercase tracking-wide text-teal-500">AI Feedback Excerpt</p>
          <p className="whitespace-pre-wrap text-xs leading-relaxed text-teal-900 line-clamp-8">{feedbackText}</p>
        </div>
      )}
    </div>
  );
}

function renderStation09(metrics: Record<string, unknown>) {
  const checks = [
    { label: 'Has Feedback',         value: Boolean(metrics.student_has_feedback) },
    { label: 'Has Prediction',       value: Boolean(metrics.student_has_prediction) },
    { label: 'Has Group Assignment', value: Boolean(metrics.student_has_group_assignment) },
  ];
  return (
    <div className="space-y-3">
      {checks.map((c) => (
        <div key={c.label} className={`flex items-center justify-between rounded-xl p-3 ${c.value ? 'bg-emerald-50' : 'bg-red-50'}`}>
          <p className={`text-sm font-medium ${c.value ? 'text-emerald-800' : 'text-red-800'}`}>{c.label}</p>
          <span className={`text-sm font-bold ${c.value ? 'text-emerald-600' : 'text-red-500'}`}>
            {c.value ? '✓ Passed' : '✗ Missing'}
          </span>
        </div>
      ))}
    </div>
  );
}

function renderGeneric(metrics: Record<string, unknown>) {
  return (
    <div className="space-y-2">
      {Object.entries(metrics).map(([k, v]) => {
        if (typeof v === 'object') return null;
        return (
          <div key={k} className="flex items-start justify-between rounded-lg bg-slate-50 px-3 py-2">
            <p className="text-xs font-medium text-slate-500">{k.replace(/_/g, ' ')}</p>
            <p className="ml-4 text-xs font-semibold text-slate-800">{String(v)}</p>
          </div>
        );
      })}
    </div>
  );
}

function renderMetrics(stationId: string, metrics: Record<string, unknown>): React.ReactNode {
  switch (stationId) {
    case 'station_01_data_intake':        return renderStation01(metrics);
    case 'station_02_thresholds_rules':   return renderStation02(metrics);
    case 'station_03_clustering_profiles':return renderStation03(metrics);
    case 'station_04_prediction_engine':  return renderStation04(metrics);
    case 'station_05_competence_inference':return renderStation05(metrics);
    case 'station_06_instructional_groups':return renderStation06(metrics);
    case 'station_07_teacher_actions':    return renderStation07(metrics);
    case 'station_08_student_views':      return renderStation08(metrics);
    case 'station_09_run_validation':     return renderStation09(metrics);
    default:                              return renderGeneric(metrics);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// MAIN PANEL
// ─────────────────────────────────────────────────────────────────────────────

interface StationDetailPanelProps {
  card: EnrichedStationCard | null;
  onClose: () => void;
}

export const StationDetailPanel: React.FC<StationDetailPanelProps> = ({ card, onClose }) => {
  const { stationDetailCache, isLoadingStation, stationError, loadStationDetail } = useLearnerStore();

  useEffect(() => {
    if (!card) return;
    loadStationDetail(card.detail_path, card.station_id);
  }, [card, loadStationDetail]);

  if (!card) return null;

  const detail: StationDetail | undefined = stationDetailCache[card.station_id];

  return (
    /* Overlay */
    <div className="fixed inset-0 z-40 flex justify-end" onClick={onClose}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]" />

      {/* Panel */}
      <aside
        className="relative z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={`flex items-start justify-between gap-3 border-b border-slate-100 p-5 ${card.bgClass}`}>
          <div className="flex items-center gap-3">
            <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/80 shadow-sm ${card.colorClass}`}>
              <ChevronRight className="h-5 w-5" />
            </span>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide opacity-60">
                Station {String(card.order).padStart(2, '0')}
              </p>
              <h2 className="text-base font-bold text-slate-900">{card.title}</h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-white/60 hover:text-slate-700"
            aria-label="Close panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Score summary bar */}
        <div className="flex items-center gap-4 border-b border-slate-100 bg-white px-5 py-3">
          <CircularProgress value={card.score} size={52} stroke={5} />
          <div>
            <p className="text-xs text-slate-400">Station score</p>
            <p className="text-lg font-bold text-slate-900">{card.score}%</p>
          </div>
          <div className="ml-auto">
            <p className="text-right text-xs text-slate-400">Insight</p>
            <p className="max-w-[180px] text-right text-xs font-medium text-slate-600">{card.insight}</p>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5">
          {isLoadingStation && !detail && (
            <div className="flex items-center gap-2 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading station data…
            </div>
          )}
          {stationError && (
            <div className="flex items-center gap-2 rounded-xl bg-red-50 p-3 text-sm text-red-700">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {stationError}
            </div>
          )}
          {detail && renderMetrics(card.station_id, detail.metrics as Record<string, unknown>)}
        </div>
      </aside>
    </div>
  );
};
