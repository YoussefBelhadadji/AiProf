import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { students, primaryStudent, getClusterCentroids, getStudentClusterName, getClusterNameFromLabel, getEngagementScore } from '../data/diagnostic';
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

const centroids = getClusterCentroids();
const student = primaryStudent;

const scatterData: ScatterPoint[] = student
  ? [
      ...centroids.map((centroid) => ({
        name: `${getClusterNameFromLabel(centroid.cluster_label)} Centroid`,
        eng: Math.min(100, centroid.time_on_task / 3),
        perf: centroid.total_score / 5,
        cluster: getClusterNameFromLabel(centroid.cluster_label),
        isCentroid: true,
      })),
      {
        name: student.name,
        eng: getEngagementScore(student),
        perf: student.total_score / 5,
        cluster: getStudentClusterName(student),
        isCentroid: false,
      },
    ]
  : [];

const clusterCounts = students.reduce<Record<ClusterName, number>>(
  (accumulator, entry) => {
    const cluster = getStudentClusterName(entry);
    accumulator[cluster] += 1;
    return accumulator;
  },
  {
    'Engaged-Developing': 0,
    Efficient: 0,
    Struggling: 0,
    'At-Risk': 0,
  }
);

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
  if (!student) {
    return null;
  }

  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="monitor"
          label="Cluster Diagnostics"
          observation="Asmaa aligns closest with the Engaged-Developing centroid: high engagement, visible revision effort, and remaining need in argument depth."
          implication="This is not a disengaged case. Intervention should refine quality and structure rather than simply push for more raw activity."
          action="Sustain drafting momentum and redirect support toward claim-evidence development."
          citation="Gasevic et al. (2015) - Learning Analytics and Educational Data Mining"
        />
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={6} title="Archetypal Mapping" subtitle="Layer 7A: Learner Profiling (Clustering)" />

        <GlassCard elevation="high" className="p-6 md:p-8 mb-8 h-[500px] w-full relative" pedagogicalLabel="K-means centroids position the case against four reference profiles spanning engagement and performance.">
          <div className="absolute top-8 left-8">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)]">Behavioral Profile Positioning</h3>
            <p className="font-body text-[var(--text-sec)] text-sm mb-6">Subject: {student.name} (ID: {student.student_id})</p>
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
