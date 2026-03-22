import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { getClusterNameFromLabel, getEngagementScore } from '../data/diagnostic';
import { getSelectedStudyCase, useStudyScopeStore } from '../state/studyScope';
import type { ClusterName } from '../data/diagnostic';

interface ScatterPoint {
  name: string;
  eng: number;
  perf: number;
  cluster: ClusterName;
  isCentroid: boolean;
}

interface ScatterTooltipPayload {
  payload: ScatterPoint;
}

interface ScatterTooltipProps {
  active?: boolean;
  payload?: ScatterTooltipPayload[];
}

interface ClusterCardProps {
  title: ClusterName;
  count: number;
  color: 'teal' | 'lav' | 'gold' | 'red';
  description: string;
  strategy: string;
}

const getClusterColor = (cluster: ClusterName) => {
  switch (cluster) {
    case 'Engaged-Developing':
      return 'var(--teal)';
    case 'Efficient':
      return 'var(--lav)';
    case 'Struggling':
      return 'var(--gold)';
    case 'At-Risk':
      return 'var(--red)';
    default:
      return 'var(--text-muted)';
  }
};

const CustomTooltip = ({ active, payload }: ScatterTooltipProps) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-[var(--bg-high)] border border-[var(--border)] p-3 rounded-lg shadow-xl font-body">
        <p className="font-navigation font-medium text-[var(--text-primary)] mb-1">{data.name}</p>
        <p className="text-xs text-[var(--text-sec)]">Cluster: <span style={{ color: getClusterColor(data.cluster) }}>{data.cluster}</span></p>
        <p className="text-xs text-[var(--text-sec)]">Engagement: <span className="font-forensic text-[var(--text-primary)]">{data.eng}%</span></p>
        <p className="text-xs text-[var(--text-sec)]">Performance: <span className="font-forensic text-[var(--text-primary)]">{data.perf.toFixed(1)}</span></p>
      </div>
    );
  }
  return null;
};

export function Station06() {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const clusteringAvailable = Boolean(selectedCase?.analytics?.clustering.available);
  const student = selectedCase?.student;
  const cohortSize = selectedCase?.analytics?.cohort_size ?? 0;

  const centroids = selectedCase?.metrics?.cluster_centroids ?? [];
  const scatterData: ScatterPoint[] = student && clusteringAvailable
    ? [
        ...centroids.map((centroid) => ({
          name: `${getClusterNameFromLabel(Number(centroid.cluster_label ?? 3))} Centroid`,
          eng: Math.min(100, Number(centroid.time_on_task ?? 0) / 3),
          perf: Number(centroid.total_score ?? 0) / 5,
          cluster: getClusterNameFromLabel(Number(centroid.cluster_label ?? 3)),
          isCentroid: true,
        })),
        {
          name: student.name,
          eng: getEngagementScore(student),
          perf: student.total_score / 5,
          cluster: getClusterNameFromLabel(student.cluster_label),
          isCentroid: false,
        },
      ]
    : [];

  const clusterCounts = cases.reduce<Record<ClusterName, number>>(
    (accumulator, entry) => {
      if (entry.analytics?.clustering.available && entry.student.cluster_label >= 0) {
        const cluster = getClusterNameFromLabel(entry.student.cluster_label);
        accumulator[cluster] += 1;
      }
      return accumulator;
    },
    {
      'Engaged-Developing': 0,
      Efficient: 0,
      Struggling: 0,
      'At-Risk': 0,
    }
  );

  const activeCluster = student ? getClusterNameFromLabel(student.cluster_label) : null;

  return (
    <PipelineLayout
      verifiedEnabled={clusteringAvailable && Boolean(student)}
      unavailableTitle="Verified Clustering Unavailable"
      unavailableMessage={
        selectedCase
          ? selectedCase.analytics?.clustering.reason ?? 'This selected case does not currently have verified clustering output.'
          : 'Select an imported workbook case first to open the verified clustering station.'
      }
      rightPanel={
        activeCluster ? (
          <PedagogicalInsightBadge
            urgency="monitor"
            label="Cluster Diagnostics"
            observation={`${student?.name} aligns with the ${activeCluster} profile in the verified imported cohort.`}
            implication="The clustering output places the learner near similar engagement and writing traces in the cohort, but the cluster label is still only an analytic grouping until the teacher interprets it pedagogically."
            action="Use the cohort profile as a comparative signal, then confirm any teaching response from the workbook evidence, rubric, and revision history."
            citation="Gasevic et al. (2015) - Learning Analytics and Educational Data Mining"
          />
        ) : undefined
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={6} title="Archetypal Mapping" subtitle="Layer 7A: Learner Profiling (Clustering)" />

        <GlassCard className="p-4 mb-6 bg-[var(--bg-raised)]/40 border-dashed border-[var(--border-bright)]">
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            This screen uses verified K-Means output from the imported workbook cohort. It opens only when the backend has enough unique learners to calculate clusters without fallback values, and the profile labels remain teacher-interpreted rather than automatically pedagogical.
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Model Status</div>
            <div className="font-forensic text-lg text-[var(--teal)]">Verified K-Means</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">Cluster output appears only when the imported cases are sufficient for verified cohort profiling.</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Imported Cohort</div>
            <div className="font-forensic text-lg text-[var(--lav)]">{cohortSize} cases</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">The selected learner is plotted against live cohort centroids rather than against static demo points.</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Teacher Use</div>
            <div className="font-forensic text-lg text-[var(--gold)]">Profile Reading</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">Use cluster position for comparison, then interpret its pedagogical meaning from real case evidence.</div>
          </GlassCard>
        </div>

        <GlassCard elevation="high" className="p-6 md:p-8 mb-8 h-[500px] w-full relative" pedagogicalLabel="K-means centroids position the case against cohort-derived engagement and performance profiles.">
          <div className="absolute top-8 left-8">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)]">Behavioral Profile Positioning</h3>
            <p className="font-body text-[var(--text-sec)] text-sm mb-6">Subject: {student?.name} (ID: {student?.student_id})</p>
          </div>

          <div className="w-full h-full pt-16">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
              <ScatterChart margin={{ top: 20, right: 30, bottom: 20, left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" horizontal vertical />
                <XAxis
                  type="number"
                  dataKey="eng"
                  name="Engagement"
                  domain={[0, 100]}
                  stroke="var(--text-sec)"
                  tick={{ fontFamily: 'var(--font-forensic)', fontSize: 12 }}
                  label={{ value: 'Engagement Score (%)', position: 'bottom', fill: 'var(--text-sec)', fontSize: 12, fontFamily: 'var(--font-navigation)' }}
                />
                <YAxis
                  type="number"
                  dataKey="perf"
                  name="Performance"
                  domain={[0, 5]}
                  stroke="var(--text-sec)"
                  tick={{ fontFamily: 'var(--font-forensic)', fontSize: 12 }}
                  label={{ value: 'Performance Score (0-5)', angle: -90, position: 'left', fill: 'var(--text-sec)', fontSize: 12, fontFamily: 'var(--font-navigation)' }}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3', stroke: 'var(--border-bright)' }} />
                <Scatter name="Profiles" data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={getClusterColor(entry.cluster)}
                      stroke={entry.isCentroid ? 'transparent' : 'var(--border-bright)'}
                      strokeWidth={entry.isCentroid ? 0 : 2}
                      r={entry.isCentroid ? 6 : 10}
                      className="cursor-pointer hover:opacity-80 transition-opacity"
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <ClusterCard
            title="Engaged-Developing"
            count={clusterCounts['Engaged-Developing']}
            color="teal"
            description="High interaction, active revision, and clear developmental potential."
            strategy="Keep engagement high while tightening claim-evidence logic and formal phrasing."
          />
          <ClusterCard
            title="Efficient"
            count={clusterCounts.Efficient}
            color="lav"
            description="Lower interaction footprint but stable writing outcomes."
            strategy="Validate strategy quality and monitor for hidden disengagement."
          />
          <ClusterCard
            title="Struggling"
            count={clusterCounts.Struggling}
            color="gold"
            description="High effort with inconsistent quality gains."
            strategy="Prioritize targeted scaffolds and frequent formative checkpoints."
          />
          <ClusterCard
            title="At-Risk"
            count={clusterCounts['At-Risk']}
            color="red"
            description="Low engagement and low performance trend."
            strategy="Trigger immediate support plans with close follow-up cycles."
          />
        </div>

        <GlassCard className="p-6">
          <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-3">Method Reading</h3>
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            Clustering answers a comparative question: which learners in the imported cohort show similar behavioural and writing profiles? It does not replace teacher judgment. The educational meaning of each profile still depends on the selected learner&apos;s rubric, writing samples, feedback uptake, and revision trace.
          </p>
        </GlassCard>

        <StationFooter prevPath="/pipeline/5" nextPath="/pipeline/7" />
      </div>
    </PipelineLayout>
  );
}

function ClusterCard({ title, count, color, description, strategy }: ClusterCardProps) {
  const palette = {
    teal: { color: 'var(--teal)', backgroundColor: 'var(--teal-dim)' },
    lav: { color: 'var(--lav)', backgroundColor: 'var(--lav-dim)' },
    gold: { color: 'var(--gold)', backgroundColor: 'var(--gold-dim)' },
    red: { color: 'var(--red)', backgroundColor: 'var(--red-dim)' },
  }[color];

  return (
    <GlassCard accent={color} className="p-6">
      <div className="flex justify-between items-start mb-3">
        <h4 className="font-navigation text-xl font-medium text-[var(--text-primary)]">{title}</h4>
        <span className="font-forensic text-xs px-2 py-1 rounded" style={palette}>N={count}</span>
      </div>
      <p className="font-body text-sm text-[var(--text-sec)] mb-4 h-11">{description}</p>
      <div className="p-3 bg-[var(--bg-deep)] rounded border border-[var(--border)]">
        <span className="font-navigation text-[10px] uppercase tracking-wider text-[var(--text-muted)] block mb-1">Recommended Strategy</span>
        <p className="font-body text-xs text-[var(--text-primary)]">{strategy}</p>
      </div>
    </GlassCard>
  );
}
