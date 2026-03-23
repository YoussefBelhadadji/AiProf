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

function getClusterReadiness(cohortSize: number, representedClusters: number) {
  if (cohortSize >= 12 && representedClusters >= 3) {
    return {
      label: 'Comparative reading is stronger',
      note: 'The cohort contains enough cases and profile spread to make cluster placement more informative for teacher comparison.',
      accent: 'var(--teal)',
    };
  }

  if (cohortSize >= 4 && representedClusters >= 2) {
    return {
      label: 'Comparative reading is limited',
      note: 'The cluster view can still orient teacher attention, but profile labels should be handled cautiously because the cohort is still small.',
      accent: 'var(--gold)',
    };
  }

  return {
    label: 'Comparative reading is weak',
    note: 'Low cohort variety can make learner groupings unstable. Use this station only as a visual hint, not as a stable typology.',
    accent: 'var(--red)',
  };
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
  const cohortBackedMode = clusteringAvailable && centroids.length > 0;
  const activeClusterLabel =
    student?.learner_profile ??
    student?.cluster_profile ??
    (student ? getClusterNameFromLabel(student.cluster_label) : null);

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
    : student
      ? [
          ...centroids.map((centroid) => ({
            name: `${getClusterNameFromLabel(Number(centroid.cluster_label ?? 3))} Reference`,
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
      if (entry.student.cluster_label >= 0) {
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

  const representedClusters = Object.values(clusterCounts).filter((count) => count > 0).length;
  const readiness = cohortBackedMode
    ? getClusterReadiness(cohortSize, representedClusters)
    : {
        label: 'Case-level mode',
        note: 'The imported cohort is still too small for verified K-Means training, so this station falls back to the learner profile and reference centroids already stored in the case record.',
        accent: 'var(--gold)',
      };

  return (
    <PipelineLayout
      verifiedEnabled={Boolean(student)}
      unavailableTitle="Verified Clustering Unavailable"
      unavailableMessage={
        selectedCase
          ? selectedCase.analytics?.clustering.reason ?? 'This selected case does not currently have clustering output.'
          : 'Select an imported workbook case first to open the verified clustering station.'
      }
      rightPanel={
        activeClusterLabel ? (
          <PedagogicalInsightBadge
            urgency="monitor"
            label="Cluster Diagnostics"
            observation={`${student?.name} is currently read as ${activeClusterLabel}${cohortBackedMode ? ' in the verified imported cohort.' : ' in case-level fallback mode.'}`}
            implication={cohortBackedMode
              ? 'The clustering output places the learner near similar engagement and writing traces in the cohort, but the cluster label is still only an analytic grouping until the teacher interprets it pedagogically.'
              : 'The profile label remains useful for teacher orientation, but it should be read as a case-level adaptive classification until enough imported cases are available for cohort-backed clustering.'}
            action={cohortBackedMode
              ? 'Use the cohort profile as a comparative signal, then confirm any teaching response from the workbook evidence, rubric, and revision history.'
              : 'Use this profile as an orientation signal, then verify the pedagogical reading from the text, rubric, and revision trace.'}
            citation="Gasevic et al. (2015) - Learning Analytics and Educational Data Mining"
          />
        ) : undefined
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={6} title="Archetypal Mapping" subtitle="Layer 7A: Learner Profiling (Clustering)" />

        <GlassCard className="p-4 mb-6 bg-[var(--bg-raised)]/40 border-dashed border-[var(--border-bright)]">
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            This screen now supports two modes. When the imported cohort is large enough, it uses verified K-Means output. When the cohort is still small, it stays open in case-level mode and shows the learner profile already inferred for the selected student so the station does not disappear from the workflow.
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Model Status</div>
            <div className="font-forensic text-lg text-[var(--teal)]">
              {cohortBackedMode ? 'Verified K-Means' : 'Case-Level Profile'}
            </div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">
              {cohortBackedMode
                ? 'The imported cases are sufficient for verified cohort profiling.'
                : 'The selected learner still retains a usable profile even though the cohort is too small for live K-Means training.'}
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">
              {cohortBackedMode ? 'Imported Cohort' : 'Selected Learner'}
            </div>
            <div className="font-forensic text-lg text-[var(--lav)]">
              {cohortBackedMode ? `${cohortSize} cases` : activeClusterLabel ?? 'No profile'}
            </div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">
              {cohortBackedMode
                ? 'The selected learner is plotted against live cohort centroids.'
                : 'The plotted references are retained from the case record so the station can still explain the learner profile.'}
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Teacher Use</div>
            <div className="font-forensic text-lg text-[var(--gold)]">Profile Reading</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">
              Use the profile for comparison when the cohort is ready, or as a case-level orientation signal when it is not.
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <GlassCard className="p-5">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Cluster Trust Conditions</div>
            <div className="font-forensic text-lg" style={{ color: readiness.accent }}>{readiness.label}</div>
            <p className="font-body text-sm text-[var(--text-sec)] mt-2 leading-relaxed">{readiness.note}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Comparative Reading Note</div>
            <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
              Dataset structure matters more than algorithm prestige alone. If the exercise data do not show a clear pattern, clustering can become visually impressive but pedagogically weak.
            </p>
          </GlassCard>
        </div>

        <GlassCard elevation="high" className="p-6 md:p-8 mb-8 h-[500px] w-full relative" pedagogicalLabel="Profile references position the case against engagement and performance patterns, either from the cohort model or from the retained case-level profile record.">
          <div className="absolute top-8 left-8">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)]">Behavioral Profile Positioning</h3>
            <p className="font-body text-[var(--text-sec)] text-sm mb-6">
              Subject: {student?.name} (ID: {student?.student_id}) {cohortBackedMode ? '· cohort-backed view' : '· case-level fallback view'}
            </p>
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
            Clustering answers a comparative question: which learners show similar behavioural and writing profiles? When the cohort is large enough, that comparison is cohort-backed. When it is not, the station still surfaces the selected learner's stored profile so the analytic pathway remains visible to the teacher.
          </p>
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed mt-3">
            Higher-level teacher actions should follow from these profile signals only after they are checked against the writing sample, rubric evidence, and revision history. In this build, cluster labels are therefore prompts for comparison, not final classifications of the learner.
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
