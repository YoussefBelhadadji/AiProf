import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  CheckCircle2,
  Download,
  Edit3,
  GraduationCap,
  Lightbulb,
  Mail,
  Save,
  Target,
  TrendingUp,
  TrendingDown,
  Minus,
  X,
  AlertCircle,
  Clock,
  Loader2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { CircularProgress } from '../ui/CircularProgress';
import { getFinalReport } from '../../services/reportService';
import { useReportStore } from '../../store/reportStore';
import type { FinalReport, ReportStatus } from '../../../../shared/types';

// ── Types ─────────────────────────────────────────────────────────────────────

interface Props {
  studentId: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function colorForScore(p: number) {
  if (p >= 80) return '#10B981';
  if (p >= 65) return '#3B82F6';
  if (p >= 50) return '#F97316';
  return '#EF4444';
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join('');
}

function avatarGradient(name: string) {
  const palettes = [
    'from-blue-500 to-violet-500',
    'from-emerald-500 to-teal-500',
    'from-rose-500 to-pink-500',
    'from-amber-500 to-orange-500',
    'from-indigo-500 to-blue-600',
    'from-cyan-500 to-sky-600',
    'from-purple-500 to-fuchsia-500',
    'from-lime-500 to-green-600',
  ];
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % palettes.length;
  return palettes[idx];
}

const STATUS_CONFIG: Record<ReportStatus, { label: string; pill: string; icon: React.ElementType }> = {
  ready:        { label: 'Ready',        pill: 'bg-emerald-50 text-emerald-700 ring-emerald-200', icon: CheckCircle2 },
  draft:        { label: 'Draft',        pill: 'bg-amber-50  text-amber-700  ring-amber-200',    icon: Clock       },
  needs_review: { label: 'Needs Review', pill: 'bg-rose-50   text-rose-700   ring-rose-200',     icon: AlertCircle },
};

const TrendIcon: React.FC<{ trend: FinalReport['trend'] }> = ({ trend }) => {
  if (trend === 'improving')  return <TrendingUp  className="h-4 w-4 text-emerald-600" />;
  if (trend === 'declining')  return <TrendingDown className="h-4 w-4 text-rose-500" />;
  return <Minus className="h-4 w-4 text-slate-400" />;
};

// ── Section wrapper ───────────────────────────────────────────────────────────

const Section: React.FC<{ title: string; icon?: React.ElementType; children: React.ReactNode; className?: string }> = ({
  title,
  icon: Icon,
  children,
  className = '',
}) => (
  <div className={`rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm ${className}`}>
    <div className="mb-4 flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      <h2 className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">{title}</h2>
    </div>
    {children}
  </div>
);

// ── PDF generation ────────────────────────────────────────────────────────────
//
// html2canvas v1.4 crashes on ANY modern color function it doesn't recognise:
//   oklch()  — Tailwind v4 palette variables  (--color-*)
//   oklab()  — Tailwind v4 shadow/ring values (--tw-shadow, --tw-ring-*)
//   lab(), lch(), color(), hwb() — possible in plugins / custom themes
//
// The crash happens inside CSSParsedDeclaration BEFORE onclone runs.
// Injecting an override <style> tag does NOT work because html2canvas still
// iterates the ORIGINAL rules and crashes on the original oklch/oklab values.
//
// Correct strategy — directly mutate the live CSSOM rules:
//   1. Walk every accessible stylesheet rule (including @layer / @media …).
//   2. For each property that contains an unsupported color function, replace
//      in-place with its rgb() equivalent (Canvas 2D resolves all modern color
//      spaces natively) and record an undo function.
//   3. Force a synchronous style recalc so html2canvas sees the safe values.
//   4. Call html2canvas.
//   5. In finally {}, run all undo functions to restore the original values.

/** Convert any CSS color string → rgb() / rgba() via a 1×1 Canvas. */
function colorToRgb(color: string): string {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = 1;
    const ctx = c.getContext('2d')!;
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
    return a < 255
      ? `rgba(${r},${g},${b},${(a / 255).toFixed(3)})`
      : `rgb(${r},${g},${b})`;
  } catch {
    return color; // return unchanged if anything goes wrong
  }
}

/** Color-function tokens that html2canvas v1.4 cannot parse. */
const UNSUPPORTED_FNS = ['oklch(', 'oklab(', 'lab(', 'lch(', 'color(', 'hwb('] as const;

function hasUnsupportedColor(v: string): boolean {
  return UNSUPPORTED_FNS.some((fn) => v.includes(fn));
}

/**
 * Replace every unsupported color-function call within a compound CSS value.
 * Handles values like `0 1px 3px oklab(0 0 0 / 0.1), 0 1px 2px -1px oklab(…)`.
 * The regex matches `fn(…)` stopping at the first `)` — safe for all current
 * CSS Color Level 4 functions (none use nested parentheses in Tailwind output).
 */
function replaceUnsupportedColors(value: string): string {
  if (!hasUnsupportedColor(value)) return value;
  return value.replace(/(oklch|oklab|lab|lch|hwb|color)\([^)]+\)/g, colorToRgb);
}

/** Recursively collect CSSStyleRules, descending into @layer / @media / @supports. */
function collectStyleRules(rules: CSSRuleList, out: CSSStyleRule[] = []): CSSStyleRule[] {
  for (const rule of Array.from(rules)) {
    if (rule instanceof CSSStyleRule) {
      out.push(rule);
    } else if ('cssRules' in rule) {
      try {
        collectStyleRules(
          (rule as unknown as { cssRules: CSSRuleList }).cssRules,
          out,
        );
      } catch { /* cross-origin or inaccessible — skip */ }
    }
  }
  return out;
}

/**
 * Mutate every live CSSStyleRule that contains unsupported color functions,
 * replacing the offending values in-place with rgb() equivalents.
 * Returns an array of undo callbacks — call each to restore originals.
 */
function mutateStyleRules(): Array<() => void> {
  const undos: Array<() => void> = [];

  for (const sheet of Array.from(document.styleSheets)) {
    let rules: CSSStyleRule[];
    try {
      rules = collectStyleRules(sheet.cssRules);
    } catch {
      continue; // cross-origin or locked sheet — skip
    }

    for (const rule of rules) {
      const { style } = rule;
      const count = style.length; // snapshot — length won't change for updates
      for (let i = 0; i < count; i++) {
        const prop     = style.item(i);
        const origVal  = style.getPropertyValue(prop).trim();
        if (!hasUnsupportedColor(origVal)) continue;

        const converted = replaceUnsupportedColors(origVal);
        if (converted === origVal) continue; // regex found nothing — skip

        const origPrio = style.getPropertyPriority(prop);
        // Overwrite the live rule value — html2canvas will now read rgb(…)
        rule.style.setProperty(prop, converted, 'important');
        // Capture for restoration
        undos.push(() => rule.style.setProperty(prop, origVal, origPrio));
      }
    }
  }

  return undos;
}

async function generatePDF(element: HTMLElement, fileName: string) {
  const [{ jsPDF }, html2canvas] = await Promise.all([
    import('jspdf'),
    import('html2canvas').then((m) => m.default),
  ]);

  // Mutate live CSSOM rules to remove all oklch/oklab/… BEFORE html2canvas
  // reads any stylesheet.  This is the only approach that reliably works
  // because html2canvas iterates raw CSSStyleRule objects — injecting an
  // override <style> does not prevent it from reading the original rules.
  const undos = mutateStyleRules();
  void document.documentElement.offsetHeight; // force synchronous style recalc

  try {
    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      windowWidth: document.documentElement.scrollWidth,
      windowHeight: document.documentElement.scrollHeight,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.92);
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / pageW;
    const imgH  = canvas.height / ratio;

    let heightLeft = imgH;
    let position   = 0;

    pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH);
    heightLeft -= pageH;

    while (heightLeft > 0) {
      position   -= pageH;
      pdf.addPage();
      pdf.addImage(imgData, 'JPEG', 0, position, pageW, imgH);
      heightLeft -= pageH;
    }

    pdf.save(fileName);
  } finally {
    // Always restore — never leave mutated styles in the document
    for (const undo of undos) undo();
  }
}

// ── Main component ────────────────────────────────────────────────────────────

export const StudentFinalReport: React.FC<Props> = ({ studentId }) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const autoPdf = searchParams.get('pdf') === '1';

  const { isEditMode, setEditMode, saveEdits, getEdits } = useReportStore();
  const reportRef = useRef<HTMLDivElement>(null);

  const [report, setReport] = useState<FinalReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Edit mode local state
  const [draftComments, setDraftComments] = useState('');
  const [draftConclusion, setDraftConclusion] = useState('');

  // Fetch report
  useEffect(() => {
    let alive = true;
    setIsLoading(true);
    setError(null);
    setEditMode(false);
    getFinalReport(studentId)
      .then((r) => { if (alive) setReport(r); })
      .catch((e) => { if (alive) setError(e instanceof Error ? e.message : 'Failed to load report'); })
      .finally(() => alive && setIsLoading(false));
    return () => { alive = false; };
  }, [studentId, setEditMode]);

  // Merge teacher edits on top of AI-generated text
  const effectiveReport = useMemo<FinalReport | null>(() => {
    if (!report) return null;
    const edit = getEdits(studentId);
    if (!edit) return report;
    return {
      ...report,
      teacherComments: edit.comments,
      overallConclusion: edit.conclusion,
      status: edit.status,
    };
  }, [report, studentId, getEdits]);

  // Auto-trigger PDF when `?pdf=1` is set, after data loads
  useEffect(() => {
    if (!autoPdf || !effectiveReport || isLoading || !reportRef.current) return;
    const t = setTimeout(() => handleGeneratePDF(), 600);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoPdf, effectiveReport, isLoading]);

  const handleEnterEdit = () => {
    if (!effectiveReport) return;
    setDraftComments(effectiveReport.teacherComments);
    setDraftConclusion(effectiveReport.overallConclusion);
    setEditMode(true);
  };

  const handleSave = () => {
    if (!report) return;
    saveEdits(studentId, draftComments, draftConclusion);
  };

  const handleCancel = () => {
    setEditMode(false);
    setDraftComments('');
    setDraftConclusion('');
  };

  const handleGeneratePDF = async () => {
    if (!reportRef.current || !effectiveReport) return;
    setIsGeneratingPDF(true);
    try {
      const safeName = effectiveReport.studentName.replace(/\s+/g, '_');
      await generatePDF(reportRef.current, `${safeName}_FR.pdf`);
    } catch (e) {
      console.error('[PDF] Generation failed:', e);
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // ── Loading / Error ─────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <div className="flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-5 py-3 text-sm text-slate-600 shadow-sm">
          <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
          Building final report…
        </div>
      </div>
    );
  }

  if (error || !effectiveReport) {
    return (
      <div className="rounded-2xl border border-rose-200 bg-rose-50 p-6 text-rose-700">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          Could not load report
        </div>
        <p className="mt-2 text-sm">{error ?? 'Unknown error'}</p>
      </div>
    );
  }

  const r = effectiveReport;
  const sc = STATUS_CONFIG[r.status] ?? STATUS_CONFIG.draft;
  const StatusIcon = sc.icon;

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-5">

      {/* ── Top action bar (excluded from PDF) ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <button
          type="button"
          onClick={() => navigate('/reports/final')}
          className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
        >
          <ArrowLeft className="h-4 w-4" />
          All Reports
        </button>

        <div className="flex items-center gap-2">
          {!isEditMode ? (
            <>
              <button
                type="button"
                onClick={handleEnterEdit}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                <Edit3 className="h-4 w-4 text-slate-500" />
                Edit Report
              </button>
              <button
                type="button"
                onClick={handleGeneratePDF}
                disabled={isGeneratingPDF || r.status !== 'ready'}
                title={r.status !== 'ready' ? 'Mark report as Ready before exporting' : 'Generate PDF'}
                className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
                  r.status === 'ready' && !isGeneratingPDF
                    ? 'bg-violet-600 text-white shadow-violet-500/25 hover:bg-violet-700 hover:shadow-md hover:shadow-violet-500/30'
                    : 'cursor-not-allowed bg-slate-100 text-slate-400'
                }`}
              >
                {isGeneratingPDF ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isGeneratingPDF ? 'Generating…' : 'Generate PDF'}
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleCancel}
                className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-emerald-500/25 hover:bg-emerald-700"
              >
                <Save className="h-4 w-4" />
                Save Changes
              </button>
            </>
          )}
        </div>
      </div>

      {/* Edit mode banner */}
      {isEditMode && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <Edit3 className="h-4 w-4 shrink-0" />
          <span>
            <strong>Edit mode active.</strong> Modify the Teacher Comments and Overall Conclusion
            below, then click <em>Save Changes</em> to mark this report as Ready.
          </span>
        </div>
      )}

      {/* ── Report content (captured for PDF) ── */}
      <div ref={reportRef} className="space-y-5 bg-white">

        {/* ── Header card ── */}
        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
          {/* WriteLens branding row (visible in PDF) */}
          <div className="mb-5 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-sm font-bold text-white">
                W
              </span>
              <span className="text-sm font-semibold text-slate-700">WriteLens</span>
              <span className="ml-2 text-xs text-slate-400">· Final Assessment Report</span>
            </div>
            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ring-1 ${sc.pill}`}>
              <StatusIcon className="h-3.5 w-3.5" />
              {sc.label}
            </span>
          </div>

          <div className="flex flex-wrap items-start gap-5">
            {/* Avatar */}
            <div
              className={`flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-linear-to-br ${avatarGradient(r.studentName)} text-lg font-bold text-white shadow-md`}
            >
              {initials(r.studentName)}
            </div>

            {/* Student metadata */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900">{r.studentName}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="inline-flex items-center gap-1.5">
                  <Mail className="h-4 w-4 text-slate-400" />
                  {r.email}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <GraduationCap className="h-4 w-4 text-slate-400" />
                  {r.course}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Calendar className="h-4 w-4 text-slate-400" />
                  {r.period}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <BookOpen className="h-4 w-4 text-slate-400" />
                  {r.totalSubmissions} submissions
                </span>
              </div>
            </div>

            {/* Score + trend */}
            <div className="flex shrink-0 flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-slate-50 p-4">
              <CircularProgress
                value={r.overallScorePct}
                size={72}
                stroke={6}
                color={colorForScore(r.overallScorePct)}
              />
              <div className="text-center">
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Final Score
                </p>
                <div className="mt-0.5 flex items-center justify-center gap-1">
                  <TrendIcon trend={r.trend} />
                  <span
                    className={`text-xs font-semibold ${
                      r.improvementPct > 0
                        ? 'text-emerald-600'
                        : r.improvementPct < 0
                        ? 'text-rose-500'
                        : 'text-slate-400'
                    }`}
                  >
                    {r.improvementPct > 0 ? '+' : ''}
                    {r.improvementPct}%
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Generated date */}
          <p className="mt-4 text-right text-[11px] text-slate-400">
            Generated {new Date(r.generatedAt).toLocaleDateString('en-US', {
              day: 'numeric', month: 'long', year: 'numeric',
            })}
          </p>
        </div>

        {/* ── Two-column layout ── */}
        <div className="grid gap-5 xl:grid-cols-[1fr_380px] xl:items-start">

          {/* LEFT column */}
          <div className="space-y-5">

            {/* Progress chart */}
            <Section title="Writing Score Evolution" icon={TrendingUp}>
              {r.evolution.length > 1 ? (
                <div className="h-50">
                  <ResponsiveContainer width="100%" height={200} minWidth={0}>
                    <AreaChart
                      data={r.evolution}
                      margin={{ left: -16, right: 8, top: 8, bottom: 0 }}
                    >
                      <defs>
                        <linearGradient id="scoreGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%"  stopColor="#3B82F6" stopOpacity={0.15} />
                          <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}    />
                        </linearGradient>
                      </defs>
                      <CartesianGrid stroke="#e2e8f0" strokeDasharray="3 3" vertical={false} />
                      <XAxis
                        dataKey="t"
                        tick={{ fill: '#64748b', fontSize: 10 }}
                        axisLine={false}
                        tickLine={false}
                        tickFormatter={(v: string) =>
                          new Date(v).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        }
                      />
                      <YAxis
                        domain={[0, 100]}
                        tick={{ fill: '#64748b', fontSize: 11 }}
                        axisLine={false}
                        tickLine={false}
                        width={32}
                      />
                      <Tooltip
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0', fontSize: 12 }}
                        formatter={(v: any) => {
                          const val = typeof v === 'number' ? v : 0;
                          return [`${val}%`, 'Score'];
                        }}
                        labelFormatter={(l: any) => {
                          try {
                            return new Date(String(l)).toLocaleDateString('en-US', {
                              weekday: 'short', month: 'short', day: 'numeric',
                            });
                          } catch {
                            return String(l);
                          }
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#3B82F6"
                        strokeWidth={2.5}
                        fill="url(#scoreGrad)"
                        dot={{ r: 3, fill: '#3B82F6', strokeWidth: 0 }}
                        activeDot={{ r: 5 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <p className="py-6 text-center text-sm text-slate-400">
                  Insufficient data points to render evolution chart.
                </p>
              )}
            </Section>

            {/* AI Station breakdown */}
            <Section title="AI Analysis Stations — Detailed Breakdown">
              <div className="grid gap-3 sm:grid-cols-2">
                {r.stationsSummary.map((s) => (
                  <div
                    key={s.id}
                    className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50/60 p-3"
                  >
                    <CircularProgress
                      value={s.avgScorePct}
                      size={46}
                      stroke={4}
                      color={s.color}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="truncate text-sm font-semibold text-slate-800">{s.name}</p>
                        <span
                          className={`text-[10px] font-medium ${
                            s.trend === 'improving'
                              ? 'text-emerald-600'
                              : s.trend === 'declining'
                              ? 'text-rose-500'
                              : 'text-slate-400'
                          }`}
                        >
                          {s.trend === 'improving' ? '↑' : s.trend === 'declining' ? '↓' : '→'}
                        </span>
                      </div>
                      <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-500">{s.insight}</p>
                    </div>
                  </div>
                ))}
              </div>
            </Section>

            {/* Teacher comments */}
            <Section title="Teacher Comments" icon={Edit3} className={isEditMode ? 'ring-2 ring-amber-300 ring-offset-1' : ''}>
              {isEditMode ? (
                <textarea
                  value={draftComments}
                  onChange={(e) => setDraftComments(e.target.value)}
                  rows={7}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your professional assessment and observations…"
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {r.teacherComments || (
                    <em className="text-slate-400">No comments yet. Click Edit Report to add.</em>
                  )}
                </p>
              )}
            </Section>

            {/* Overall conclusion */}
            <Section title="Overall Conclusion / Final Assessment" icon={Target} className={isEditMode ? 'ring-2 ring-amber-300 ring-offset-1' : ''}>
              {isEditMode ? (
                <textarea
                  value={draftConclusion}
                  onChange={(e) => setDraftConclusion(e.target.value)}
                  rows={4}
                  className="w-full resize-none rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-800 outline-none placeholder:text-slate-400 focus:border-blue-300 focus:bg-white focus:ring-2 focus:ring-blue-100"
                  placeholder="Enter your final assessment and recommended next steps…"
                />
              ) : (
                <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">
                  {r.overallConclusion || (
                    <em className="text-slate-400">No conclusion yet. Click Edit Report to add.</em>
                  )}
                </p>
              )}
            </Section>
          </div>

          {/* RIGHT column (sidebar) */}
          <div className="space-y-5">

            {/* Strengths */}
            <Section title="Key Strengths" icon={Lightbulb}>
              {r.strengths.length === 0 ? (
                <p className="text-sm text-slate-400">No strengths data available.</p>
              ) : (
                <ul className="space-y-2">
                  {r.strengths.map((s, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-[10px] font-bold text-emerald-600">
                        {i + 1}
                      </span>
                      {s}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Areas for improvement */}
            <Section title="Areas for Improvement">
              {r.areasForImprovement.length === 0 ? (
                <p className="text-sm text-slate-400">No improvement areas identified.</p>
              ) : (
                <ul className="space-y-2">
                  {r.areasForImprovement.map((a, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-slate-700">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-amber-50 text-[10px] font-bold text-amber-600">
                        {i + 1}
                      </span>
                      {a}
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            {/* Recommendations */}
            <Section title="Actionable Recommendations" icon={Target}>
              {r.recommendations.length === 0 ? (
                <p className="text-sm text-slate-400">No recommendations available.</p>
              ) : (
                <ol className="space-y-3">
                  {r.recommendations.map((rec, i) => (
                    <li key={i} className="flex gap-3 text-sm">
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-[11px] font-bold text-blue-600">
                        {i + 1}
                      </span>
                      <span className="text-slate-700">{rec}</span>
                    </li>
                  ))}
                </ol>
              )}
            </Section>

            {/* Station quick scores */}
            <Section title="Station Score Summary">
              <div className="space-y-2.5">
                {r.stationsSummary.map((s) => (
                  <div key={s.id}>
                    <div className="mb-1 flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700">{s.name}</span>
                      <span className="font-semibold" style={{ color: s.color }}>
                        {s.avgScorePct}%
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${s.avgScorePct}%`, backgroundColor: s.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        </div>

        {/* ── Footer (shows in PDF) ── */}
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4 text-center text-xs text-slate-400">
          WriteLens Adaptive Assessment Platform · Final Report ·{' '}
          {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
      </div>

      {/* PDF overlay */}
      {isGeneratingPDF && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3 rounded-2xl border border-slate-200/80 bg-white px-8 py-6 shadow-xl">
            <Loader2 className="h-8 w-8 animate-spin text-violet-600" />
            <p className="text-sm font-medium text-slate-700">
              Generating PDF for <strong>{r.studentName}</strong>…
            </p>
            <p className="text-xs text-slate-400">This may take a few seconds</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentFinalReport;
