import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { primaryStudent, getBayesianBeliefs } from '../data/diagnostic';

interface BayesianDatum {
  subject: string;
  posterior: number;
  prior: number;
  fullMark: number;
}

interface ProgressRowProps {
  label: string;
  prior: number;
  post: number;
  valPrior: string;
  valPost: string;
  pct: string;
}

const student = primaryStudent;
const beliefs = student ? getBayesianBeliefs(student) : null;

const bayesianData: BayesianDatum[] = beliefs
  ? [
      { subject: 'Lexical', posterior: beliefs.posterior.lexical * 100, prior: beliefs.prior.lexical * 100, fullMark: 100 },
      { subject: 'Grammar', posterior: beliefs.posterior.grammar * 100, prior: beliefs.prior.grammar * 100, fullMark: 100 },
      { subject: 'Cohesion', posterior: beliefs.posterior.cohesion * 100, prior: beliefs.prior.cohesion * 100, fullMark: 100 },
      { subject: 'Argument', posterior: beliefs.posterior.argumentation * 100, prior: beliefs.prior.argumentation * 100, fullMark: 100 },
      { subject: 'Regulation', posterior: beliefs.posterior.regulation * 100, prior: beliefs.prior.regulation * 100, fullMark: 100 },
    ]
  : [];

export function Station08() {
  if (!student) {
    return null;
  }

  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="positive"
          label="Theory Verification"
          observation="Bayesian updating shows measurable competence growth across all five dimensions between the earlier and later drafts."
          implication="The posterior shift suggests that feedback is altering Asmaa's writing strategy, not merely polishing surface errors."
          action="Acknowledge the improvement and keep future comments focused on argument depth and formal sentence control."
          citation="Murphy (2012) - Machine Learning: A Probabilistic Perspective"
        />
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={8} title="Bayesian Synthesis" subtitle="Layer 7C: Latent Competence Inference (BKT/Network)" />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
          <GlassCard elevation="high" className="lg:col-span-5 p-6 md:p-8 h-[450px] flex flex-col items-center" pedagogicalLabel="Bayesian updating models latent competence shifts across multiple evidence streams.">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-6 w-full">Current Case Belief Update</h3>
            <div className="flex-1 w-full max-w-[350px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={260}>
                <RadarChart cx="50%" cy="50%" outerRadius="65%" data={bayesianData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-sec)', fontSize: 11, fontFamily: 'var(--font-navigation)' }} />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name="Prior" dataKey="prior" stroke="var(--text-muted)" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                  <Radar name="Posterior" dataKey="posterior" stroke="var(--lav)" strokeWidth={2} fill="var(--lav)" fillOpacity={0.4} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 font-navigation text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[var(--text-muted)] border-dashed"></div>
                <span className="text-[var(--text-sec)]">Prior (earlier draft)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--lav)] opacity-80"></div>
                <span className="text-[var(--text-primary)]">Posterior (current case)</span>
              </div>
            </div>
          </GlassCard>

          <div className="lg:col-span-7 flex flex-col gap-6">
            <GlassCard accent="lav" glow className="p-6 bg-[var(--bg-base)]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)]">KL-Divergence</h3>
                <span className="font-forensic text-2xl text-[var(--lav)]">1.84 bits</span>
              </div>
              <p className="font-body text-sm text-[var(--text-primary)] leading-relaxed">
                Asmaa&apos;s writing profile shifted materially between the early introduction and the later body-paragraph revisions. The change is strong enough to treat as meaningful learning, not noise.
              </p>
            </GlassCard>

            <GlassCard className="p-6 flex-1">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)] mb-6">Competence Delta (Prior to Posterior)</h3>

              <div className="space-y-6">
                {bayesianData.map((datum) => (
                  <ProgressRow
                    key={datum.subject}
                    label={datum.subject}
                    prior={datum.prior}
                    post={datum.posterior}
                    valPrior={(datum.prior / 20).toFixed(1)}
                    valPost={(datum.posterior / 20).toFixed(1)}
                    pct={`+${Math.max(0, Math.round(((datum.posterior - datum.prior) / Math.max(datum.prior, 1)) * 100))}%`}
                  />
                ))}
              </div>
            </GlassCard>
          </div>
        </div>

        <StationFooter prevPath="/pipeline/7" nextPath="/pipeline/9" />
      </div>
    </PipelineLayout>
  );
}

function ProgressRow({ label, prior, post, valPrior, valPost, pct }: ProgressRowProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
      <div className="w-24 font-body text-sm text-[var(--text-sec)]">{label}</div>
      <div className="flex-1 max-w-[200px] h-2 bg-[var(--bg-raised)] rounded shadow-inner relative overflow-hidden">
        <div className="absolute top-0 left-0 h-full bg-[var(--text-muted)] opacity-50 transition-all duration-1000" style={{ width: `${prior}%` }} />
        <div className="absolute top-0 left-0 h-full bg-[var(--lav)] transition-all duration-1000 delay-500" style={{ width: `${post}%` }} />
      </div>
      <div className="flex-1 font-forensic text-xs text-[var(--text-muted)] whitespace-nowrap">
        Prior: {valPrior} -&gt; <span className="text-[var(--text-primary)]">Post: {valPost}</span>
      </div>
      <div className="w-16 text-right font-navigation font-bold text-sm text-[var(--teal)]">
        {pct}
      </div>
    </div>
  );
}
