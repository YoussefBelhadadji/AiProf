import { GlassCard } from './GlassCard';
import { StatusChip } from './Atoms';

export function AIEngines() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <GlassCard className="p-6 md:p-8">
        <h2 className="font-editorial text-2xl text-[var(--teal)] mb-6">Adaptive Assessment Architecture</h2>
        <div className="mb-6 rounded-lg border border-[var(--gold)]/25 bg-[var(--gold-dim)] px-4 py-3 font-body text-sm text-[var(--text-sec)]">
          This screen documents the study methodology. In the current app build, workbook extraction is live, NLP and stylometric indicators are workbook-derived, clustering and prediction can operate in case-level mode or cohort-backed mode, and Bayesian synthesis is visible whenever the imported case includes competence-state output.
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <GlassCard className="p-5 bg-[var(--bg-raised)] border-dashed border-[var(--border-bright)]">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--lav)] mb-3">AI Assistant Tool Role</h3>
            <ul className="space-y-2 font-body text-sm text-[var(--text-sec)]">
              <li>Calculate descriptive patterns from verified Moodle workbook evidence.</li>
              <li>Store rubric rows, extract NLP and text indicators, and organise process and product traces.</li>
              <li>Surface learner grouping and predictive signals in case-level mode first, then upgrade to cohort-backed modelling when enough imported cases are available.</li>
              <li>Suggest diagnostic signals and feedback triggers for teacher review.</li>
            </ul>
          </GlassCard>
          <GlassCard className="p-5 bg-[var(--bg-raised)] border-dashed border-[var(--border-bright)]">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--gold)] mb-3">Instructor Role</h3>
            <ul className="space-y-2 font-body text-sm text-[var(--text-sec)]">
              <li>Interpret what the patterns mean for engagement, writing behaviour, and development.</li>
              <li>Evaluate essays with academic writing criteria and validate the pedagogical reading.</li>
              <li>Supervise the final feedback and onsite intervention decision.</li>
              <li>Guide revision, support learning, and confirm the meaning of any analytics signal.</li>
            </ul>
          </GlassCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard className="p-5">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--lav)] mb-3">Band 1: Data and Analytics</h3>
            <ul className="space-y-2 font-body text-sm text-[var(--text-sec)]">
              <li>Process data: views, time-on-task, revisions, feedback access, help-seeking.</li>
              <li>Product data: drafts, rubric rows, word count, cohesion, lexical variety, error density.</li>
              <li>Thresholds and rule-based interpretation remain pedagogy-controlled.</li>
            </ul>
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--gold)] mb-3">Band 2: AI Support</h3>
            <ul className="space-y-2 font-body text-sm text-[var(--text-sec)]">
              <li>K-Means clustering for learner profiles when the cohort is sufficient.</li>
              <li>Random Forest for predictive factors and score estimation, with case-level fallback when the cohort is still small.</li>
              <li>Bayesian competence inference is visible through the adaptive competence-state synthesis shown in Station 08.</li>
            </ul>
          </GlassCard>
          <GlassCard className="p-5">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--teal)] mb-3">Band 3: Pedagogical Action</h3>
            <ul className="space-y-2 font-body text-sm text-[var(--text-sec)]">
              <li>Diagnostic signals organize evidence for teacher review.</li>
              <li>Feedback planning suggests focus areas but does not deliver final feedback automatically.</li>
              <li>Intervention planning, revision, and growth remain teacher-supervised outcomes.</li>
            </ul>
          </GlassCard>
        </div>
      </GlassCard>

      <GlassCard accent="red" className="p-6 md:p-8">
        <h2 className="font-editorial text-2xl text-[var(--red)] mb-4">Rule-Based Pedagogical Interpretation</h2>
        <p className="font-body text-sm text-[var(--text-sec)] mb-6">
          Threshold families translate workbook indicators into teacher-review signals. They do not replace the teacher&apos;s pedagogical decision.
        </p>

        <div className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-md p-4 font-forensic text-xs text-[var(--lav)] overflow-x-auto">
          <code>
            IF (revision_frequency = 0) THEN trigger(REVISION_SUPPORT)<br />
            IF (feedback_viewed AND no_revision) THEN trigger(FEEDBACK_UPTAKE_REVIEW)<br />
            IF (cohesion {'<'} threshold AND argumentation {'<'} threshold) THEN trigger(DISCOURSE_SUPPORT)<br />
            IF (help_seeking {'>'} threshold) THEN trigger(DIALOGIC_SUPPORT)
          </code>
        </div>
      </GlassCard>

      <GlassCard className="p-6 md:p-8">
        <h2 className="font-editorial text-2xl text-[var(--text-primary)] mb-4">Model Reliability Notes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <GlassCard className="p-5 bg-[var(--bg-raised)]">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--lav)] mb-3">Model Use</h3>
            <ul className="space-y-2 font-body text-sm text-[var(--text-sec)]">
              <li>No single algorithm should be presented as universally best for every educational task.</li>
              <li>Random Forest is often strong, but its usefulness depends on data pattern clarity, cohort size, and outcome distribution.</li>
              <li>Time on task may influence predictions more strongly than attempts in some datasets.</li>
            </ul>
          </GlassCard>
          <GlassCard className="p-5 bg-[var(--bg-raised)]">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--gold)] mb-3">System Implication</h3>
            <ul className="space-y-2 font-body text-sm text-[var(--text-sec)]">
              <li>The app should always show model context, fit conditions, and limits beside advanced analytics.</li>
              <li>Pedagogical action should focus on redesign, scaffolds, hints, and teacher judgment, not on model output alone.</li>
              <li>Confidence in analytics should rise only when the imported data are sufficiently rich and patterned.</li>
            </ul>
          </GlassCard>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-6 md:p-8">
          <h2 className="font-editorial text-2xl text-[var(--text-primary)] mb-6">Pipeline Matrix</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left whitespace-nowrap font-body text-sm">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] text-xs uppercase">
                  <th className="pb-3 px-2">Technique</th>
                  <th className="pb-3 px-2">Station</th>
                  <th className="pb-3 px-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] text-[var(--text-sec)]">
                <tr><td className="py-3 px-2">Process integration</td><td className="py-3 px-2">Station 02-03</td><td className="py-3 px-2"><StatusChip variant="teal">Workbook-derived</StatusChip></td></tr>
                <tr><td className="py-3 px-2">NLP / text analytics</td><td className="py-3 px-2">Station 04</td><td className="py-3 px-2"><StatusChip variant="teal">Workbook-derived</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Evidence alignment</td><td className="py-3 px-2">Station 05</td><td className="py-3 px-2"><StatusChip variant="teal">Case-derived</StatusChip></td></tr>
                <tr><td className="py-3 px-2">K-Means</td><td className="py-3 px-2">Station 06</td><td className="py-3 px-2"><StatusChip variant="teal">Case-level or cohort-backed</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Random Forest</td><td className="py-3 px-2">Station 07</td><td className="py-3 px-2"><StatusChip variant="teal">Case-level or cohort-backed</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Bayesian competence inference</td><td className="py-3 px-2">Station 08</td><td className="py-3 px-2"><StatusChip variant="gold">Case-level synthesis live</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Teacher review signals</td><td className="py-3 px-2">Station 09-11</td><td className="py-3 px-2"><StatusChip variant="gold">Teacher-supervised</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Growth across drafts</td><td className="py-3 px-2">Station 12</td><td className="py-3 px-2"><StatusChip variant="teal">Workbook-derived</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6 md:p-8 bg-[var(--bg-raised)] border-dashed border-[var(--border-bright)]">
          <h2 className="font-editorial text-2xl text-[var(--text-primary)] mb-6">Method Flags</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-navigation text-[var(--text-muted)] mb-1">HUMAN-CONTROLLED LAYERS</div>
              <div className="flex flex-wrap gap-2">
                <StatusChip variant="gold">Task Design</StatusChip>
                <StatusChip variant="gold">Rubric Logic</StatusChip>
                <StatusChip variant="gold">Thresholds</StatusChip>
                <StatusChip variant="gold">Final Validation</StatusChip>
              </div>
            </div>
            <div>
              <div className="text-xs font-navigation text-[var(--text-muted)] mb-1">AI-SUPPORTED LAYERS</div>
              <div className="flex flex-wrap gap-2">
                <StatusChip variant="lav">Clustering</StatusChip>
                <StatusChip variant="lav">Prediction</StatusChip>
                <StatusChip variant="lav">Text Indicators</StatusChip>
                <StatusChip variant="lav">Bayesian States</StatusChip>
              </div>
            </div>
            <div>
              <div className="text-xs font-navigation text-[var(--text-muted)] mb-1">OUTCOME LAYERS</div>
              <div className="flex flex-wrap gap-2">
                <StatusChip variant="teal">Feedback Planning</StatusChip>
                <StatusChip variant="teal">Intervention</StatusChip>
                <StatusChip variant="teal">Revision</StatusChip>
                <StatusChip variant="teal">Growth</StatusChip>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
