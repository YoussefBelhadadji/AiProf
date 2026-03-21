import { GlassCard } from './GlassCard';
import { StatusChip } from './Atoms';

export function AIEngines() {
  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <GlassCard className="p-6 md:p-8">
        <h2 className="font-editorial text-2xl text-[var(--teal)] mb-6">Machine Learning & NLP Architecture</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--lav)] mb-4 border-b border-[var(--border)] pb-2">Part 1: NLP Techniques (8)</h3>
            <ul className="space-y-3 font-body text-sm text-[var(--text-sec)]">
              <li><strong className="text-[var(--text-primary)]">1. TTR (Type-Token Ratio)</strong> - Mathematical vocabulary richness calculus.</li>
              <li><strong className="text-[var(--text-primary)]">2. Syntactic Complexity</strong> - MLU/MLT parsing logic.</li>
              <li><strong className="text-[var(--text-primary)]">3. Lexical Density</strong> - Functional words exclusion list algorithm.</li>
              <li><strong className="text-[var(--text-primary)]">4. Cohesion Index</strong> - Semantic mapping across marker categories.</li>
              <li><strong className="text-[var(--text-primary)]">5. Sentence Variation</strong> - Standard deviation of syntactic structures.</li>
              <li><strong className="text-[var(--text-primary)]">6. Argument Structure</strong> - Toulmin-style claim and evidence detection.</li>
              <li><strong className="text-[var(--text-primary)]">7. Text Diff / LCS</strong> - Longest common subsequence for revision tracing.</li>
              <li><strong className="text-[var(--text-primary)]">8. Sequential Behaviour</strong> - Temporal activity analysis.</li>
            </ul>
          </div>
          <div>
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--gold)] mb-4 border-b border-[var(--border)] pb-2">Part 2: ML Techniques (6)</h3>
            <ul className="space-y-3 font-body text-sm text-[var(--text-sec)]">
              <li><strong className="text-[var(--text-primary)]">1. K-Means Clustering</strong> - Archetypal case positioning.</li>
              <li><strong className="text-[var(--text-primary)]">2. Random Forest</strong> - Multi-feature predictive importance weighting.</li>
              <li><strong className="text-[var(--text-primary)]">3. Bayesian Tracing</strong> - Prior and posterior probability updating.</li>
              <li><strong className="text-[var(--text-primary)]">4. KL-Divergence</strong> - Information-gain bit calculation.</li>
              <li><strong className="text-[var(--text-primary)]">5. Evidence Link Matrix</strong> - Cross-signal alignment inside one case.</li>
              <li><strong className="text-[var(--text-primary)]">6. Logistic Regression</strong> - Retention probability modeling.</li>
            </ul>
          </div>
        </div>
      </GlassCard>

      <GlassCard accent="red" className="p-6 md:p-8">
        <h2 className="font-editorial text-2xl text-[var(--red)] mb-4">Part 3: Diagnostic Rule Engine</h2>
        <p className="font-body text-sm text-[var(--text-sec)] mb-6">Rule families translate engagement and writing thresholds into actionable pedagogical signals.</p>

        <div className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-md p-4 font-forensic text-xs text-[var(--lav)] overflow-x-auto">
          <code>
            // Example Family 1: Syntactic Risk<br />
            IF (LexicalDensity {'<'} 0.42 AND TTR {'<'} 0.3) THEN trigger(SCAFFOLDING_REQ)<br />
            // Example Family 2: Behavioral Latency<br />
            IF (RevisionDelay {'>'} 120hrs) THEN trigger(ENGAGEMENT_MONITOR)<br />
            ...
          </code>
        </div>
      </GlassCard>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <GlassCard className="lg:col-span-2 p-6 md:p-8">
          <h2 className="font-editorial text-2xl text-[var(--text-primary)] mb-6">Part 4: Pipeline Matrix</h2>
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
                <tr><td className="py-3 px-2">TTR / Lexical</td><td className="py-3 px-2">Station 04 (Stylometric)</td><td className="py-3 px-2"><StatusChip variant="teal">Active</StatusChip></td></tr>
                <tr><td className="py-3 px-2">K-Means</td><td className="py-3 px-2">Station 06 (Archetypal)</td><td className="py-3 px-2"><StatusChip variant="teal">Active</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Random Forest</td><td className="py-3 px-2">Station 07 (Predictive)</td><td className="py-3 px-2"><StatusChip variant="teal">Active</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Bayesian Prior/Post</td><td className="py-3 px-2">Station 08 (Synthesis)</td><td className="py-3 px-2"><StatusChip variant="teal">Active</StatusChip></td></tr>
                <tr><td className="py-3 px-2">Text Diff LCS</td><td className="py-3 px-2">Station 12 (Revision)</td><td className="py-3 px-2"><StatusChip variant="teal">Active</StatusChip></td></tr>
              </tbody>
            </table>
          </div>
        </GlassCard>

        <GlassCard className="p-6 md:p-8 bg-[var(--bg-raised)] border-dashed border-[var(--border-bright)]">
          <h2 className="font-editorial text-2xl text-[var(--text-primary)] mb-6">Part 5: Libs</h2>
          <div className="space-y-4">
            <div>
              <div className="text-xs font-navigation text-[var(--text-muted)] mb-1">JAVASCRIPT (Frontend/Edge)</div>
              <div className="flex flex-wrap gap-2">
                <StatusChip variant="gold">Natural</StatusChip>
                <StatusChip variant="gold">Compromise</StatusChip>
                <StatusChip variant="gold">ml-kmeans</StatusChip>
                <StatusChip variant="gold">mathjs</StatusChip>
              </div>
            </div>
            <div>
              <div className="text-xs font-navigation text-[var(--text-muted)] mb-1">PYTHON (Backend Service)</div>
              <div className="flex flex-wrap gap-2">
                <StatusChip variant="lav">scikit-learn</StatusChip>
                <StatusChip variant="lav">NLTK</StatusChip>
                <StatusChip variant="lav">spaCy</StatusChip>
                <StatusChip variant="lav">scipy</StatusChip>
              </div>
            </div>
          </div>
        </GlassCard>
      </div>

      <GlassCard elevation="high" glow accent="lav" className="p-6 md:p-8">
        <h2 className="font-editorial text-2xl text-[var(--lav)] mb-6">Part 6: Theoretical Pedagogy Links</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-deep)]">
            <h4 className="font-navigation text-sm text-[var(--teal)] mb-1">Text Diff & Revisions</h4>
            <p className="font-body text-xs text-[var(--text-sec)]">Sadler (1989) - Formative assessment</p>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-deep)]">
            <h4 className="font-navigation text-sm text-[var(--gold)] mb-1">Sequential Latency (Swimlanes)</h4>
            <p className="font-body text-xs text-[var(--text-sec)]">Zimmerman (2002) - SRL model</p>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-deep)]">
            <h4 className="font-navigation text-sm text-[var(--lav)] mb-1">Lexical/Cohesion Bounds</h4>
            <p className="font-body text-xs text-[var(--text-sec)]">Vygotsky (1978) - Zone of proximal development</p>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-deep)]">
            <h4 className="font-navigation text-sm text-[var(--red)] mb-1">Logistic Retention</h4>
            <p className="font-body text-xs text-[var(--text-sec)]">Tinto (1987) - Student persistence</p>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-deep)]">
            <h4 className="font-navigation text-sm text-[var(--teal)] mb-1">Feedback Tracking</h4>
            <p className="font-body text-xs text-[var(--text-sec)]">Boud & Molloy (2013) - Feedback exchange</p>
          </div>
          <div className="p-4 border border-[var(--border)] rounded-lg bg-[var(--bg-deep)]">
            <h4 className="font-navigation text-sm text-[var(--gold)] mb-1">Bayesian Knowledge Trace</h4>
            <p className="font-body text-xs text-[var(--text-sec)]">Corbett & Anderson (1994) - BKT</p>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
