import { Activity, AlertCircle, BarChart3, Users } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { MetricCard } from '../components/MetricCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { activitySnapshot, caseStudyMeta, primaryStudent, getStudentClusterName, getStudentRiskLevel } from '../data/diagnostic';

const timelineData = [
  { date: '27 Jan', access: 1.0, feedback: 0.0, revision: 0.0 },
  { date: '03 Feb', access: 2.0, feedback: 0.0, revision: 0.5 },
  { date: '10 Feb', access: 2.8, feedback: 1.4, revision: 1.2 },
  { date: '12 Feb', access: 3.2, feedback: 2.0, revision: 1.4 },
  { date: '16 Feb', access: 3.8, feedback: 3.0, revision: 2.4 },
  { date: '24 Feb', access: 4.4, feedback: 4.0, revision: 3.2 },
  { date: '07 Mar', access: 4.7, feedback: 4.5, revision: 4.2 },
  { date: '14 Mar', access: 5.0, feedback: 5.0, revision: 5.0 },
];

const heatmapIntensities = [
  0.05, 0.08, 0.15, 0.12, 0.18, 0.22, 0.1, 0.14, 0.18, 0.26,
  0.3, 0.34, 0.42, 0.61, 0.78, 0.32, 0.2, 0.12, 0.18, 0.36,
  0.44, 0.58, 0.7, 0.86, 0.46, 0.24, 0.18, 0.34, 0.5, 0.74,
];

export function Station03() {
  if (!primaryStudent) {
    return null;
  }

  const student = primaryStudent;
  const clusterName = getStudentClusterName(student);
  const risk = getStudentRiskLevel(student).toUpperCase();
  const accentColors = {
    lav: 'var(--lav)',
    teal: 'var(--teal)',
    gold: 'var(--gold)',
    red: 'var(--red)',
  } as const;

  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="monitor"
          label="Pattern Analysis"
          observation="Activity intensifies immediately after instructor feedback windows, especially around 10 February and 7 March."
          implication="This case responds to feedback in short cycles. The pattern points to productive revision behaviour rather than last-minute panic."
          action="Preserve the short feedback cadence and attach one structural target to each revision round."
          citation="Hyland (2005) - Metadiscourse: Exploring Interaction in Writing"
        />
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={3} title="Submission Pattern Analytics" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <MetricCard
            value="1 Case"
            label="Case Study Focus"
            interpretation="Analysis is restricted to Lahmarabbou Asmaa and her verified workbook trace."
            accent="lav"
            icon={Users}
          />
          <MetricCard
            value={activitySnapshot.estimatedActiveMinutes}
            label="Estimated Active Time (min)"
            interpretation="Estimated from gaps between logged Moodle events rather than a single platform timer."
            accent="teal"
            icon={Activity}
            trend={`${activitySnapshot.activeSessions} sessions`}
            trendDirection="up"
          />
          <MetricCard
            value={caseStudyMeta.introGrade}
            label="Intro Draft Score"
            interpretation="Only one task is formally graded in the workbook, so it remains the main anchor for current performance."
            accent="gold"
            icon={BarChart3}
          />
          <MetricCard
            value={risk}
            label="Diagnostic Risk"
            interpretation={`Current cluster is ${clusterName}; risk stays monitored because engagement is stronger than argument quality.`}
            accent="red"
            icon={AlertCircle}
            trend="B2 and D1"
            trendDirection="neutral"
          />
        </div>

        <GlassCard elevation="high" className="p-6 mb-8 w-full h-[400px]" pedagogicalLabel="Longitudinal tracking identifies reactive versus strategic regulation across the case timeline.">
          <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-6">Longitudinal Engagement Trajectory</h3>
          <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
            <AreaChart data={timelineData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorD1" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--lav)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--lav)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorD2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--teal)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--teal)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorD3" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--gold)" stopOpacity={0.6} />
                  <stop offset="95%" stopColor="var(--gold)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
              <XAxis dataKey="date" tickLine={false} axisLine={false} stroke="var(--text-sec)" fontSize={12} fontFamily="var(--font-forensic)" />
              <YAxis tickLine={false} axisLine={false} stroke="var(--text-sec)" fontSize={12} fontFamily="var(--font-forensic)" domain={[0, 5]} />
              <Tooltip
                contentStyle={{ backgroundColor: 'var(--bg-high)', border: '1px solid var(--border)', borderRadius: '8px', fontFamily: 'var(--font-body)' }}
                itemStyle={{ color: 'var(--text-primary)' }}
                labelStyle={{ fontFamily: 'var(--font-navigation)', color: 'var(--text-sec)', marginBottom: '8px' }}
              />
              <ReferenceLine x="10 Feb" stroke="var(--lav)" strokeDasharray="3 3" />
              <ReferenceLine x="24 Feb" stroke="var(--teal)" strokeDasharray="3 3" />
              <ReferenceLine x="14 Mar" stroke="var(--gold)" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="access" stroke="var(--lav)" fillOpacity={1} fill="url(#colorD1)" name="Platform Access" />
              <Area type="monotone" dataKey="feedback" stroke="var(--teal)" fillOpacity={1} fill="url(#colorD2)" name="Feedback Loop" />
              <Area type="monotone" dataKey="revision" stroke="var(--gold)" fillOpacity={1} fill="url(#colorD3)" name="Revision Depth" />
            </AreaChart>
          </ResponsiveContainer>
        </GlassCard>

        <div className="mb-8">
          <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)] mb-4">Activity Intensity Heatmap (Final 30 Days)</h3>
          <GlassCard className="flex gap-1 overflow-x-auto pb-2 border-b border-[var(--border)] snap-x p-2" pedagogicalLabel="Intensity of engagement traces cognitive investment and effort persistence over the closing month of the course.">
            {heatmapIntensities.map((intensity, index) => {
              const colorClass = intensity > 0.8 ? 'bg-[var(--teal)]' : intensity > 0.5 ? 'bg-[var(--lav-dim)]' : intensity > 0.2 ? 'bg-[var(--bg-high)]' : 'bg-[var(--bg-raised)]';

              return (
                <div
                  key={index}
                  className={`w-6 h-6 rounded-sm snap-start shrink-0 ${colorClass}`}
                  title={`Day ${index + 1}: ${Math.floor(intensity * 100)} relative activity units`}
                />
              );
            })}
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Clicks and Participation</h3>
              <span className="font-forensic text-xs text-[var(--lav)]">{activitySnapshot.totalEvents} total logged events</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {activitySnapshot.clickSignals.map((signal) => (
                <GlassCard
                  key={signal.label}
                  className="p-4 border-l-2"
                  style={{ borderLeftColor: accentColors[signal.accent] }}
                  pedagogicalLabel={signal.note}
                >
                  <div className="flex items-center justify-between gap-4">
                    <span className="font-navigation text-xs uppercase tracking-widest text-[var(--text-sec)]">{signal.label}</span>
                    <span className="font-forensic text-xl" style={{ color: accentColors[signal.accent] }}>{signal.value}</span>
                  </div>
                  <p className="mt-3 font-body text-xs text-[var(--text-sec)] leading-relaxed">{signal.note}</p>
                </GlassCard>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Estimated Sessions</h3>
              <span className="font-forensic text-xs text-[var(--gold)]">{activitySnapshot.sessionGapRule}</span>
            </div>
            {activitySnapshot.highlightedSessions.map((session) => (
              <GlassCard key={`${session.start}-${session.end}`} className="p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="font-navigation text-sm text-[var(--text-primary)]">{session.start}</p>
                    <p className="font-forensic text-[11px] text-[var(--text-muted)]">to {session.end}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-forensic text-lg text-[var(--teal)]">{session.minutes} min</p>
                    <p className="font-forensic text-[11px] text-[var(--text-muted)]">{session.events} events</p>
                  </div>
                </div>
                <p className="mt-3 font-body text-xs text-[var(--text-sec)] leading-relaxed">{session.focus}</p>
              </GlassCard>
            ))}
          </div>
        </div>

        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">Chronological Trace</h3>
            <span className="font-forensic text-xs text-[var(--teal)]">Open {'->'} feedback {'->'} revision {'->'} final submission</span>
          </div>
          <div className="space-y-3">
            {activitySnapshot.trace.map((entry, index) => (
              <GlassCard key={`${entry.timestamp}-${entry.event}`} className="p-4">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div className="flex gap-3">
                    <div className="w-7 h-7 shrink-0 rounded-full border border-[var(--lav-border)] bg-[var(--bg-deep)] flex items-center justify-center font-forensic text-[10px] text-[var(--lav)]">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-navigation text-sm text-[var(--text-primary)]">{entry.event}</p>
                      <p className="font-body text-xs text-[var(--text-sec)] mt-1 leading-relaxed">{entry.context}</p>
                      <p className="font-body text-xs text-[var(--text-muted)] mt-2 leading-relaxed">{entry.detail}</p>
                    </div>
                  </div>
                  <span className="font-forensic text-[11px] text-[var(--gold)]">{entry.timestamp}</span>
                </div>
              </GlassCard>
            ))}
          </div>
        </div>

        <StationFooter prevPath="/pipeline/2" nextPath="/pipeline/4" />
      </div>
    </PipelineLayout>
  );
}
