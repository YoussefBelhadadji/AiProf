import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { StatusChip } from '../components/Atoms';
import { getBayesianBeliefs } from '../data/diagnostic';
import { getSelectedStudyCase, useStudyScopeStore } from '../state/studyScope';

interface BeliefRowProps {
  label: string;
  prior: number;
  posterior: number;
}

function formatState(value?: string) {
  return value && value.trim() ? value : 'Unavailable';
}

function formatPercent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function Station08() {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const student = selectedCase?.student;
  const bayesianAvailable = Boolean(
    selectedCase?.analytics?.bayesian.available ||
    student?.bayesian_output ||
    student?.ai_argument_state
  );
  const beliefs = student ? getBayesianBeliefs(student) : null;

  const competenceStates = student
    ? [
        { label: 'Forethought', value: formatState(student.ai_forethought_state) },
        { label: 'Argument', value: formatState(student.ai_argument_state) },
        { label: 'Cohesion', value: formatState(student.ai_cohesion_state) },
        { label: 'Revision', value: formatState(student.ai_revision_state) },
        { label: 'Feedback Uptake', value: formatState(student.ai_feedback_state) },
        { label: 'Linguistic Control', value: formatState(student.ai_linguistic_state) },
        { label: 'Lexical Control', value: formatState(student.ai_lexical_state) },
        { label: 'Help-Seeking', value: formatState(student.ai_help_state) },
      ]
    : [];

  return (
    <PipelineLayout
      verifiedEnabled={Boolean(selectedCase && bayesianAvailable)}
      unavailableTitle="Bayesian Synthesis Unavailable"
      unavailableMessage={
        selectedCase?.analytics?.bayesian.reason ??
        'Select an imported workbook case with competence-state output to open the Bayesian synthesis station.'
      }
      rightPanel={
        student ? (
          <PedagogicalInsightBadge
            urgency="monitor"
            label="Latent Competence Reading"
            observation={`${student.name} currently resolves to: ${student.bayesian_output ?? 'Bayesian competence states available.'}`}
            implication="These states summarize the most likely hidden competencies behind the visible writing trace. They guide teacher interpretation, but they do not replace rubric judgment or direct reading of the text."
            action="Use the competence states to confirm which difficulty is most central before choosing the final feedback and onsite intervention."
            citation="Shute (2008) - Formative Feedback / Probabilistic Diagnostic Support"
          />
        ) : undefined
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={8} title="Bayesian Synthesis" subtitle="Layer 7C: Latent Competence Inference" />

        <GlassCard className="p-4 mb-6 bg-[var(--bg-raised)]/40 border-dashed border-[var(--border-bright)]">
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            This station is now live whenever the selected case contains competence-state output. It shows the Bayesian-style synthesis retained in the adaptive decision layer, so the teacher can still inspect latent competence states even when no cohort-level posterior service is running.
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Station Role</div>
            <div className="font-forensic text-lg text-[var(--lav)]">Latent Competence</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">Used to infer the writing competencies most likely operating beneath visible behaviour and product quality.</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Current Status</div>
            <div className="font-forensic text-lg text-[var(--teal)]">Live Case-Level Synthesis</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">The station reads the Bayesian-style competence states already stored with the selected learner.</div>
          </GlassCard>
          <GlassCard className="p-4">
            <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-1">Teacher Use</div>
            <div className="font-forensic text-lg text-[var(--gold)]">Interpretive Layer</div>
            <div className="font-body text-xs text-[var(--text-sec)] mt-1">Use these states to focus interpretation, then validate the pedagogical meaning from the rubric, text, and revision evidence.</div>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <GlassCard elevation="high" className="p-6 md:p-8">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-2">Bayesian Output Summary</h3>
            <p className="font-body text-[var(--text-sec)] text-sm mb-6">
              {student?.bayesian_output ?? 'No Bayesian summary string was returned for this case.'}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {competenceStates.map((state) => (
                <div key={state.label} className="rounded-lg border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{state.label}</span>
                    <StatusChip variant="lav">{state.value}</StatusChip>
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>

          <GlassCard elevation="high" className="p-6 md:p-8">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-2">Belief Shift Snapshot</h3>
            <p className="font-body text-[var(--text-sec)] text-sm mb-6">
              These bars show a simple prior-to-posterior comparison for five competence domains so the teacher can see how the synthesis shifts after the available evidence is considered.
            </p>

            <div className="space-y-5">
              {beliefs ? (
                <>
                  <BeliefRow label="Lexical" prior={beliefs.prior.lexical} posterior={beliefs.posterior.lexical} />
                  <BeliefRow label="Grammar" prior={beliefs.prior.grammar} posterior={beliefs.posterior.grammar} />
                  <BeliefRow label="Cohesion" prior={beliefs.prior.cohesion} posterior={beliefs.posterior.cohesion} />
                  <BeliefRow label="Argumentation" prior={beliefs.prior.argumentation} posterior={beliefs.posterior.argumentation} />
                  <BeliefRow label="Regulation" prior={beliefs.prior.regulation} posterior={beliefs.posterior.regulation} />
                </>
              ) : (
                <p className="font-body text-sm text-[var(--text-sec)]">No belief comparison is available for the current case.</p>
              )}
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6">
          <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-3">Method Reading</h3>
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            Bayesian synthesis answers a different question from clustering and Random Forest: not "which group is this learner in?" and not "what result is likely?", but "which competence state is most plausible given the available evidence?" That makes this station especially useful when the teacher wants to separate visible surface problems from the deeper competence pattern underneath them.
          </p>
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed mt-3">
            In the current build, the station reads case-level competence states retained in the adaptive decision layer. If a fuller posterior service is added later, the same teacher workflow can remain unchanged while the underlying posterior computation becomes more sophisticated.
          </p>
        </GlassCard>

        <StationFooter prevPath="/pipeline/7" nextPath="/pipeline/9" />
      </div>
    </PipelineLayout>
  );
}

function BeliefRow({ label, prior, posterior }: BeliefRowProps) {
  return (
    <div>
      <div className="flex items-center justify-between gap-4 mb-2">
        <span className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-muted)]">{label}</span>
        <div className="flex items-center gap-3 text-[11px] font-forensic text-[var(--text-sec)]">
          <span>Prior {formatPercent(prior)}</span>
          <span>Posterior {formatPercent(posterior)}</span>
        </div>
      </div>
      <div className="space-y-2">
        <div className="h-2 rounded-full bg-[var(--bg-raised)] overflow-hidden">
          <div className="h-full bg-[var(--gold)]" style={{ width: `${Math.round(prior * 100)}%` }} />
        </div>
        <div className="h-2 rounded-full bg-[var(--bg-raised)] overflow-hidden">
          <div className="h-full bg-[var(--lav)]" style={{ width: `${Math.round(posterior * 100)}%` }} />
        </div>
      </div>
    </div>
  );
}
