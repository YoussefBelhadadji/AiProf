import React, { useMemo, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, GraduationCap, Info, LineChart as LineIcon, BarChart3, List } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
} from 'recharts';
import { CircularProgress } from '../ui/CircularProgress';
import type { SubmissionDetail as SubmissionDetailType, AnalysisStation } from '../../../../shared/types';

function colorForScore(p: number) {
  if (p >= 80) return '#10B981';
  if (p >= 65) return '#3B82F6';
  if (p >= 50) return '#F97316';
  return '#EF4444';
}

const StationCard: React.FC<{
  station: AnalysisStation;
  selected: boolean;
  onClick: () => void;
}> = ({ station, selected, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group rounded-2xl border p-4 text-left transition-all ${
      selected ? 'border-blue-200 bg-blue-50 shadow-sm' : 'border-slate-200/80 bg-white hover:border-blue-200 hover:shadow-sm'
    }`}
  >
    <div className="flex items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-slate-900">{station.name}</p>
        <p className="mt-0.5 line-clamp-2 text-xs text-slate-500">{station.insight}</p>
      </div>
      <CircularProgress value={station.scorePct} size={46} stroke={4} color={colorForScore(station.scorePct)} />
    </div>
  </button>
);

export const SubmissionDetail: React.FC<{ detail: SubmissionDetailType }> = ({ detail }) => {
  const navigate = useNavigate();
  const [activeStationId, setActiveStationId] = useState<string>(detail.stations[0]?.id ?? 'organization');
  const activeStation = useMemo(
    () => detail.stations.find((s) => s.id === activeStationId) ?? detail.stations[0],
    [detail.stations, activeStationId]
  );

  const series = detail.stationSeries[activeStationId] ?? [];
  const radarData = detail.comparisonBars.map((b) => ({
    metric: b.label,
    student: b.student,
    cohort: b.cohort,
  }));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(`/submissions/student/${detail.studentId}`)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to submissions
          </button>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 md:text-2xl">{detail.title}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-3 text-sm text-slate-500">
              <span className="inline-flex items-center gap-1"><GraduationCap className="h-4 w-4" /> {detail.studentName}</span>
              <span className="inline-flex items-center gap-1"><BookOpen className="h-4 w-4" /> {detail.course}</span>
              <span className="inline-flex items-center gap-1"><Calendar className="h-4 w-4" /> {new Date(detail.submittedAt).toLocaleString()}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-4 py-3 shadow-sm">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Overall score</p>
            <p className="text-sm font-semibold text-slate-800">{detail.overallScorePct}%</p>
          </div>
          <CircularProgress value={detail.overallScorePct} size={56} stroke={5} color={colorForScore(detail.overallScorePct)} />
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1fr_420px] xl:items-start">
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <Info className="h-4 w-4" />
              AI insight
            </div>
            <p className="mt-2 text-sm text-slate-700">{detail.aiInsight}</p>
            {detail.preview && <p className="mt-3 rounded-xl bg-slate-50 p-3 text-sm text-slate-600">{detail.preview}</p>}
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">AI Analysis Stations</h2>
                <p className="text-sm text-slate-500">Click a station for deep analytics.</p>
              </div>
            </div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {detail.stations.map((s: any) => (
                <StationCard
                  key={s.id}
                  station={s}
                  selected={s.id === activeStationId}
                  onClick={() => setActiveStationId(s.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Station</p>
                <h3 className="mt-1 text-lg font-semibold text-slate-900">{activeStation?.name}</h3>
              </div>
              <CircularProgress value={activeStation?.scorePct ?? 0} size={54} stroke={5} color={colorForScore(activeStation?.scorePct ?? 0)} />
            </div>
            <p className="mt-3 text-sm text-slate-600">{detail.aiExplanation[activeStationId] ?? activeStation?.insight}</p>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <LineIcon className="h-4 w-4" />
              Metric evolution
            </div>
            <div className="mt-3 h-[220px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={series} margin={{ left: -16, right: 8, top: 8, bottom: 0 }}>
                  <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="t" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} hide />
                  <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                  <Tooltip
                    contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                    formatter={(v: any) => {
                      const val = typeof v === 'number' ? v : 0;
                      return [`${val}%`, 'Score'];
                    }}
                  />
                  <Line type="monotone" dataKey="value" stroke="#3B82F6" strokeWidth={2.5} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <BarChart3 className="h-4 w-4" />
              Comparison
            </div>
            <div className="mt-3 grid gap-4">
              <div className="h-[220px]">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="#e2e8f0" />
                    <PolarAngleAxis dataKey="metric" tick={{ fill: '#64748b', fontSize: 11 }} />
                    <Radar dataKey="student" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.18} />
                    <Radar dataKey="cohort" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.12} />
                    <Tooltip />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
              <div className="h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={detail.comparisonBars} margin={{ left: -12, right: 8, top: 8, bottom: 0 }}>
                    <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#64748b', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} width={32} />
                    <Tooltip formatter={(v: any) => {
                      const val = typeof v === 'number' ? v : 0;
                      return [`${val}%`, ''];
                    }} />
                    <Bar dataKey="student" fill="#3B82F6" radius={[10, 10, 4, 4]} />
                    <Bar dataKey="cohort" fill="#22D3EE" radius={[10, 10, 4, 4]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
              <List className="h-4 w-4" />
              Logs
            </div>
            <div className="mt-3 space-y-2">
              {detail.logs.slice(0, 6).map((l: any) => (
                <div key={l.at} className="rounded-xl border border-slate-100 bg-slate-50 p-3">
                  <div className="flex items-center justify-between text-xs text-slate-500">
                    <span>{new Date(l.at).toLocaleString()}</span>
                    <span className="font-semibold text-slate-700">{l.scorePct}%</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-sm text-slate-600">{l.excerpt}</p>
                </div>
              ))}
            </div>
          </div>

          {detail.recommendations.length > 0 && (
            <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Actionable recommendations</p>
              <ul className="mt-3 space-y-2 text-sm text-slate-700">
                {detail.recommendations.map((r, i) => (
                  <li key={i} className="flex gap-2">
                    <span className="mt-0.5 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[11px] font-bold text-emerald-700">
                      {i + 1}
                    </span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
};

export default SubmissionDetail;

