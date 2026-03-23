import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, Cell, ScatterChart, Scatter, ReferenceLine } from 'recharts';
import { CheckCircle2, TrendingUp } from 'lucide-react';
import { getSelectedStudyCase, useStudyScopeStore } from '../state/studyScope';

interface FeatureBar {
  name: string;
  value: number;
  color: string;
}

const MAX_SCORE = 25;

function formatFeatureName(name: string) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

function getModelReadiness(cohortSize: number, featureCount: number) {
  if (cohortSize >= 12 && featureCount >= 5) {
    return {
      label: 'Stronger fit',
      note: 'The imported cohort is large enough to treat the Random Forest output as a serious support signal, provided the teacher still checks the writing evidence.',
      accent: 'var(--teal)',
    };
  }

  if (cohortSize >= 5 && featureCount >= 3) {
    return {
      label: 'Usable with caution',
      note: 'The model can still guide attention, but its predictions should be read carefully because the cohort remains relatively small.',
      accent: 'var(--gold)',
    };
  }

  return {
    label: 'Weak fit',
    note: 'The model should not be overinterpreted. A sparse cohort can make prediction unstable even when a verified output exists.',
    accent: 'var(--red)',
  };
}

export function Station07() {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const predictionAvailable = Boolean(selectedCase?.analytics?.prediction.available);
  const metrics = selectedCase?.metrics?.rf_metrics;
  const student = selectedCase?.student;
  const cohortSize = selectedCase?.analytics?.cohort_size ?? 0;
  const cohortBackedMode = predictionAvailable && Boolean(metrics);

  const importance = selectedCase?.metrics?.rf_importance ?? [];
  const featureData: FeatureBar[] = importance.slice(0, 5).map((feature, index) => {
    const colors = ['var(--teal)', 'var(--lav)', 'var(--gold)', 'var(--red)', 'var(--lav-dim)'];
    return {
      name: formatFeatureName(feature.feature),
      value: feature.importance,
      color: colors[index] ?? 'var(--text-muted)',
    };
  });
  const readiness = cohortBackedMode
    ? getModelReadiness(cohortSize, featureData.length)
    : {
        label: 'Case-level mode',
        note: 'The cohort is not yet large enough for verified Random Forest training, so this station falls back to the selected learner\'s stored predictive summary and feature ordering.',
        accent: 'var(--gold)',
      };
  const topFeature = featureData[0]?.name ?? 'No dominant feature';
  const predictiveTakeaway = topFeature.toLowerCase().includes('time')
    ? 'Time-on-task appears highly influential here. The teacher should therefore check whether time reflects productive effort, repeated consultation, or confusion before turning it into a classroom decision.'
    : topFeature.toLowerCase().includes('attempt') || topFeature.toLowerCase().includes('revision')
      ? 'Attempts or revision signals appear influential here. That supports using the model to inspect persistence, but not to assume that more attempts always mean better learning.'
      : 'The strongest feature is not automatically the most important pedagogical priority. Feature importance still has to be interpreted in the context of the text, rubric evidence, and revision trace.';

  const scatterData = student && typeof student.predicted_score === 'number'
    ? [
        {
          id: student.student_id,
          actual: Number(student.total_score.toFixed(1)),
          predicted: Number(student.predicted_score.toFixed(1)),
          color: 'var(--teal)',
        },
      ]
    : [];

  return (
    <PipelineLayout
      verifiedEnabled={Boolean(student)}
      unavailableTitle="Verified Prediction Unavailable"
      unavailableMessage={
        selectedCase
          ? selectedCase.analytics?.prediction.reason ?? 'This selected case does not currently have prediction output.'
          : 'Select an imported workbook case first to open the verified prediction station.'
      }
      rightPanel={
        student ? (
          <PedagogicalInsightBadge
            urgency="positive"
            label="Predictive Signal"
            observation={cohortBackedMode && metrics
              ? `The verified cohort model estimates ${student.name}'s writing score with R2 = ${metrics.r2.toFixed(2)} and MAE = ${metrics.mae.toFixed(2)}.`
              : `${student.name} still has a case-level predictive output: ${student.random_forest_output ?? 'predictive summary available'}; projected score ${student.predicted_score?.toFixed?.(1) ?? student.predicted_score ?? 'N/A'}.`}
            implication={featureData[0]
              ? `${featureData[0].name} is the strongest visible feature in the current model view, but the instructional meaning still requires teacher judgment.`
              : 'Even when the cohort is small, the predictive output can still guide attention to likely priorities; it should not be treated as an autonomous decision.'}
            action={cohortBackedMode
              ? 'Use the prediction as a support signal, then confirm priorities from the actual text, rubric evidence, and revision trace.'
              : 'Use the case-level prediction as a prompt for inspection, then validate it from the writing sample, rubric evidence, and revision trace.'}
            citation="Hattie & Timperley (2007) - The Power of Feedback"
          />
        ) : undefined
      }
    >
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={7} title="Predictive Model" subtitle="Layer 7B: Performance Prediction (Random Forest)" />

        <GlassCard className="p-4 mb-6 bg-[var(--bg-raised)]/40 border-dashed border-[var(--border-bright)]">
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            This screen also supports two modes. When enough verified cases are imported, it uses cohort-backed Random Forest metrics. When the cohort is still small, it stays open in case-level mode and shows the stored prediction, improvement label, and feature ordering for the selected learner.
          </p>
        </GlassCard>

        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--teal)]"><TrendingUp size={20} /></div>
              <div className="min-w-0">
                <p className="font-forensic text-[var(--teal)] text-lg">
                  {cohortBackedMode && metrics ? `MAE: ${metrics.mae.toFixed(2)}` : `Predicted: ${student?.predicted_score?.toFixed?.(1) ?? student?.predicted_score ?? 'N/A'}`}
                </p>
                <p className="font-body text-[10px] text-[var(--text-sec)]">
                  {cohortBackedMode ? 'Model-wide prediction error' : 'Case-level projected score'}
                </p>
              </div>
            </div>
            <div className="hidden sm:block w-px h-10 bg-[var(--border)]"></div>
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-full bg-[var(--bg-card)] border border-[var(--border)] flex items-center justify-center text-[var(--lav)]"><CheckCircle2 size={20} /></div>
              <div className="min-w-0">
                <p className="font-forensic text-[var(--lav)] text-lg">
                  {cohortBackedMode && metrics ? `R2: ${metrics.r2.toFixed(2)}` : student?.predicted_improvement ?? 'N/A'}
                </p>
                <p className="font-body text-[10px] text-[var(--text-sec)]">
                  {cohortBackedMode ? 'Variance explained in cohort evaluation' : 'Stored improvement label'}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Model Family</div>
            <div className="font-forensic text-lg text-[var(--teal)]">
              {cohortBackedMode ? 'Random Forest' : 'Predictive Layer'}
            </div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">
              {cohortBackedMode
                ? 'Used here to estimate writing performance from behaviour and text signals in the imported cohort.'
                : 'The selected learner still retains predictive output from the adaptive engine even without a trainable cohort.'}
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">
              {cohortBackedMode ? 'Training Base' : 'Selected Learner'}
            </div>
            <div className="font-forensic text-lg text-[var(--lav)]">
              {cohortBackedMode ? `${cohortSize} cases` : student?.name ?? 'No case'}
            </div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">
              {cohortBackedMode
                ? 'Prediction is shown only when the imported cohort is large enough for verified training and evaluation.'
                : 'The station remains visible so the learner\'s predictive interpretation does not disappear in single-case mode.'}
            </div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Teacher Use</div>
            <div className="font-forensic text-lg text-[var(--gold)]">Decision Support</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">
              Feature importance highlights what the model noticed, but the teacher still decides what matters pedagogically.
            </div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <GlassCard className="p-5">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Model Trust Conditions</div>
            <div className="font-forensic text-lg" style={{ color: readiness.accent }}>{readiness.label}</div>
            <p className="font-body text-sm text-[var(--text-sec)] mt-2 leading-relaxed">{readiness.note}</p>
          </GlassCard>
          <GlassCard className="p-5">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Model Reliability Note</div>
            <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
              No single model wins in every educational task. Performance changes with cohort size, grade distribution, and how clearly time, attempts, and outcomes relate inside the dataset.
            </p>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GlassCard elevation="high" className="p-6 md:p-8 min-h-[380px] md:min-h-[450px]" pedagogicalLabel="Predictive feature importance identifies the strongest variables in the selected learner's current score estimate, whether case-level or cohort-backed.">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-2">Predictive Feature Importance</h3>
            <p className="font-body text-[var(--text-sec)] text-xs mb-6">
              {cohortBackedMode
                ? 'Variables most influential in the selected learner\'s score estimate within the imported cohort.'
                : 'Stored feature ordering for the selected learner. Treat this as a case-level support signal until the cohort is large enough for verified model fitting.'}
            </p>

            <ResponsiveContainer width="100%" height="80%" minWidth={0} minHeight={240}>
              <BarChart data={featureData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="var(--border)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-primary)', fontSize: 11, fontFamily: 'var(--font-navigation)' }} width={128} />
                <RechartsTooltip cursor={{ fill: 'var(--bg-raised)' }} contentStyle={{ backgroundColor: 'var(--bg-high)', border: 'none', borderRadius: '4px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={24}>
                  {featureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard elevation="high" className="p-6 md:p-8 min-h-[380px] md:min-h-[450px]" pedagogicalLabel="The single point represents the selected learner's current alignment between predicted and observed achievement.">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-2">Prediction vs Actual (Case Study)</h3>
            <p className="font-body text-[var(--text-sec)] text-xs mb-6">Mapping the selected student's predicted and observed result on the same 25-point scale.</p>

            <ResponsiveContainer width="100%" height="80%" minWidth={0} minHeight={240}>
              <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis type="number" dataKey="predicted" name="Predicted" domain={[0, MAX_SCORE]} stroke="var(--text-sec)" tick={{ fontSize: 10, fontFamily: 'var(--font-forensic)' }} tickFormatter={(value: number) => value.toFixed(0)} />
                <YAxis type="number" dataKey="actual" name="Actual" domain={[0, MAX_SCORE]} stroke="var(--text-sec)" tick={{ fontSize: 10, fontFamily: 'var(--font-forensic)' }} tickFormatter={(value: number) => value.toFixed(0)} />
                <RechartsTooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-high)', border: '1px solid var(--border)' }} />
                <ReferenceLine segment={[{ x: 0, y: 0 }, { x: MAX_SCORE, y: MAX_SCORE }]} stroke="var(--text-muted)" strokeDasharray="4 4" />
                <Scatter name={student?.name ?? 'Selected student'} data={scatterData}>
                  {scatterData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} r={10} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>

            <div className="flex justify-center gap-4 mt-2 font-navigation text-[10px] text-[var(--text-sec)] uppercase tracking-wider">
              <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[var(--teal)]"></div> Target Alignment</span>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-3">Method Reading</h3>
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            Random Forest answers a predictive question: which variables are most associated with writing performance or improvement? When the cohort is large enough, this station shows verified model metrics. When it is not, the station stays open with case-level predictive output so the AI layer remains visible in the teacher workflow.
          </p>
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed mt-3">
            {predictiveTakeaway}
          </p>
        </GlassCard>

        <StationFooter prevPath="/pipeline/6" nextPath="/pipeline/8" />
      </div>
    </PipelineLayout>
  );
}
