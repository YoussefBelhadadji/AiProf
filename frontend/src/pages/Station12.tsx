import { useState } from 'react';
import { XAxis, YAxis, CartesianGrid, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { Columns, Info } from 'lucide-react';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { StatusChip } from '../components/Atoms';
import { paragraphComparison, primaryStudent, getLongitudinalData, revisionSequence, writingArtifacts } from '../data/diagnostic';

interface TrendDatum {
  draft: string;
  cohesion: number;
  lexical: number;
  grammar: number;
  arg: number;
}

interface MiniTrendChartProps {
  title: string;
  dataKey: keyof Omit<TrendDatum, 'draft'>;
  data: TrendDatum[];
  trend: string;
  color: string;
}

const student = primaryStudent;
const longitudinalData: TrendDatum[] = student
  ? getLongitudinalData(student).map((point) => ({
      draft: `Draft ${point.cycle}`,
      cohesion: point.cohesion,
      lexical: point.ttr * 5,
      grammar: point.score / 20,
      arg: point.score / 25,
    }))
  : [];

const firstPoint = longitudinalData[0] ?? { draft: 'Draft 1', cohesion: 0, lexical: 0, grammar: 0, arg: 0 };
const lastPoint = longitudinalData[longitudinalData.length - 1] ?? firstPoint;
const beforeArtifact = writingArtifacts.find((artifact) => artifact.id === paragraphComparison.beforeId) ?? writingArtifacts[0];
const afterArtifact = writingArtifacts.find((artifact) => artifact.id === paragraphComparison.afterId) ?? writingArtifacts[writingArtifacts.length - 1];
const kindTone = {
  draft: 'gold',
  feedback: 'red',
  revision: 'lav',
  resource: 'teal',
  final: 'teal',
} as const;

export function Station12() {
  const [showDiff, setShowDiff] = useState(false);

  if (!student) {
    return null;
  }

  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="positive"
          label="Growth Trajectory"
          observation={`Asmaa improved her scaled score from ${firstPoint.grammar.toFixed(1)} to ${lastPoint.grammar.toFixed(1)} across the tracked revision cycle.`}
          implication="The clearest improvement is in cohesion and revision persistence, though argument precision still needs deliberate support."
          action="Use the next module to convert this momentum into stronger structural complexity and tighter academic phrasing."
          citation="Zimmerman (2002) - Self-Regulated Learning & Writing Development"
        />
      }
    >
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={12} title="Revision Cycle Synthesis" subtitle="Layer 12: Growth Measurement (Revision Cycle)" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <h2 className="font-navigation text-xl text-[var(--text-primary)]">Longitudinal Trace: {student.name}</h2>
            </div>
            <div className="flex items-center gap-3 font-forensic text-sm text-[var(--text-sec)]">
              <span>Paragraph 1: {beforeArtifact.wordCount} words</span>
              <span className="text-[var(--border-bright)]">to</span>
              <span>Paragraph 2 Final: {afterArtifact.wordCount} words</span>
              <span className="text-[var(--border-bright)]">to</span>
              <span className="text-[var(--text-primary)] font-bold">Current writing estimate: {lastPoint.grammar.toFixed(1)}</span>
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowDiff(!showDiff)} className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--border)] font-navigation text-sm text-[var(--text-sec)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] transition-colors">
              <Columns size={16} /> Text Diff
            </button>
            <button className="flex items-center gap-2 px-3 py-2 rounded border border-[var(--border)] font-navigation text-sm text-[var(--text-sec)] hover:bg-[var(--bg-raised)] hover:text-[var(--text-primary)] transition-colors">
              <Info size={16} /> Methodology
            </button>
          </div>
        </div>

        {showDiff && (
          <GlassCard className="p-6 mb-8 border-l-4 border-l-[var(--teal)] animate-in slide-in-from-top-4 duration-300">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Draft Comparison Snapshot</h3>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 font-body text-sm leading-relaxed">
              <div className="p-4 bg-[var(--bg-deep)] rounded border border-[var(--border)]">
                <div className="flex items-center justify-between gap-3 mb-2 border-b border-[var(--border)] pb-2">
                  <span className="text-xs font-navigation text-[var(--text-muted)] block">{beforeArtifact.title}</span>
                  <StatusChip variant="gold">{beforeArtifact.status}</StatusChip>
                </div>
                <p className="text-[var(--text-sec)] whitespace-pre-line">{beforeArtifact.text}</p>
                {beforeArtifact.teacherComment && (
                  <p className="mt-3 text-xs text-[var(--gold)] leading-relaxed">
                    Teacher focus: {beforeArtifact.teacherComment}
                  </p>
                )}
              </div>
              <div className="p-4 bg-[var(--bg-deep)] rounded border border-[var(--border)]">
                <div className="flex items-center justify-between gap-3 mb-2 border-b border-[var(--border)] pb-2">
                  <span className="text-xs font-navigation text-[var(--text-muted)] block">{afterArtifact.title}</span>
                  <StatusChip variant="teal">{afterArtifact.status}</StatusChip>
                </div>
                <p className="text-[var(--text-primary)] whitespace-pre-line">{afterArtifact.text}</p>
                {afterArtifact.teacherComment && (
                  <p className="mt-3 text-xs text-[var(--teal)] leading-relaxed">
                    Teacher focus: {afterArtifact.teacherComment}
                  </p>
                )}
              </div>
            </div>
          </GlassCard>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Paragraph Baseline</h3>
              <StatusChip variant="gold">{beforeArtifact.date}</StatusChip>
            </div>
            <p className="font-navigation text-base text-[var(--text-primary)]">{beforeArtifact.title}</p>
            <p className="mt-2 font-forensic text-xs text-[var(--text-muted)]">{beforeArtifact.wordCount} words</p>
            <p className="mt-4 font-body text-sm text-[var(--text-sec)] leading-relaxed whitespace-pre-line">{beforeArtifact.text}</p>
          </GlassCard>

          <GlassCard className="p-5">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Paragraph After Revision</h3>
              <StatusChip variant="teal">{afterArtifact.date}</StatusChip>
            </div>
            <p className="font-navigation text-base text-[var(--text-primary)]">{afterArtifact.title}</p>
            <p className="mt-2 font-forensic text-xs text-[var(--text-muted)]">{afterArtifact.wordCount} words</p>
            <p className="mt-4 font-body text-sm text-[var(--text-sec)] leading-relaxed whitespace-pre-line">{afterArtifact.text}</p>
          </GlassCard>
        </div>

        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 mb-4">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Analytical Comparison</h3>
            <span className="font-forensic text-xs text-[var(--lav)]">Paragraph 1 {'->'} Paragraph 2 final</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 mb-4">
            {paragraphComparison.metrics.map((metric) => (
              <GlassCard key={metric.label} className="p-4">
                <p className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{metric.label}</p>
                <div className="flex items-end justify-between gap-3 mt-3">
                  <div>
                    <p className="font-forensic text-xs text-[var(--text-sec)]">Before</p>
                    <p className="font-forensic text-xl text-[var(--gold)]">{metric.before}</p>
                  </div>
                  <div className="text-center">
                    <p className="font-forensic text-[10px] text-[var(--text-muted)]">Delta</p>
                    <p className={`font-forensic text-sm ${metric.delta.startsWith('-') ? 'text-[var(--red)]' : 'text-[var(--teal)]'}`}>{metric.delta}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-forensic text-xs text-[var(--text-sec)]">After</p>
                    <p className="font-forensic text-xl text-[var(--lav)]">{metric.after}</p>
                  </div>
                </div>
              </GlassCard>
            ))}
          </div>
          <GlassCard className="p-5">
            <h4 className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] mb-3">Interpretive Notes</h4>
            <div className="space-y-2">
              {paragraphComparison.commentary.map((note) => (
                <p key={note} className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
                  {note}
                </p>
              ))}
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <MiniTrendChart title="Cohesion" dataKey="cohesion" data={longitudinalData} trend="+ Improving" color="var(--teal)" />
          <MiniTrendChart title="Lexical Density" dataKey="lexical" data={longitudinalData} trend="+ Improving" color="var(--lav)" />
          <MiniTrendChart title="Grammar Accuracy" dataKey="grammar" data={longitudinalData} trend="+ Improving" color="var(--red)" />
          <MiniTrendChart title="Argument Structure" dataKey="arg" data={longitudinalData} trend="+ Improving" color="var(--gold)" />
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between gap-4">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Revision Sequence</h3>
            <span className="font-forensic text-xs text-[var(--gold)]">{revisionSequence.length} tracked steps</span>
          </div>
          <div className="space-y-3">
            {revisionSequence.map((step, index) => (
              <GlassCard key={`${step.timestamp}-${step.phase}`} className="p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 shrink-0 rounded-full border border-[var(--border)] bg-[var(--bg-deep)] flex items-center justify-center font-forensic text-[10px] text-[var(--text-primary)]">
                      {index + 1}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-navigation text-sm text-[var(--text-primary)]">{step.phase}</p>
                        <StatusChip variant={kindTone[step.kind]}>{step.kind}</StatusChip>
                      </div>
                      <p className="mt-2 font-body text-sm text-[var(--text-sec)] leading-relaxed">{step.detail}</p>
                    </div>
                  </div>
                  <span className="font-forensic text-[11px] text-[var(--text-muted)]">{step.timestamp}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <StationFooter prevPath="/pipeline/11" nextPath="/dashboard" />
      </div>
    </PipelineLayout>
  );
}

function MiniTrendChart({ title, dataKey, data, trend, color }: MiniTrendChartProps) {
  return (
    <GlassCard className="p-5 h-[240px] flex flex-col">
      <div className="flex justify-between items-start mb-4">
        <h4 className="font-navigation text-base font-medium text-[var(--text-primary)]">{title}</h4>
        <span className="font-navigation text-xs text-[var(--teal)] bg-[var(--teal-dim)] px-2 py-0.5 rounded">{trend}</span>
      </div>
      <div className="flex-1 w-full relative">
        <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
          <AreaChart data={data} margin={{ top: 10, right: 35, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
            <XAxis dataKey="draft" tick={{ fill: 'var(--text-sec)', fontSize: 10, fontFamily: 'var(--font-navigation)' }} axisLine={false} tickLine={false} padding={{ right: 20 }} />
            <YAxis domain={[0, 5]} tick={{ fill: 'var(--text-sec)', fontSize: 10, fontFamily: 'var(--font-forensic)' }} axisLine={false} tickLine={false} />
            <defs>
              <linearGradient id={`color-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={color} stopOpacity={0.2} />
                <stop offset="95%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <Area type="monotone" dataKey={dataKey} stroke={color} strokeWidth={2} fillOpacity={1} fill={`url(#color-${dataKey})`} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </GlassCard>
  );
}
