import { Activity, ShieldAlert } from 'lucide-react';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { primaryStudent, getStudentClusterName } from '../data/diagnostic';

interface Intervention {
  student: string;
  archetype: string;
  tier: 'Alpha' | 'Beta';
  type: string;
  retention: number;
  timeline: string;
  completed: number;
  total: number;
}

interface InterventionCardProps {
  data: Intervention;
}

const student = primaryStudent;

const interventions: Intervention[] = student
  ? [
      {
        student: student.name,
        archetype: getStudentClusterName(student),
        tier: 'Beta',
        type: 'Directed scaffolding for cohesion and argumentation',
        retention: 92.4,
        timeline: 'Weeks 4-10',
        completed: 2,
        total: 3,
      },
    ]
  : [];

export function Station11() {
  const alphaInterventions = interventions.filter((intervention) => intervention.tier === 'Alpha');
  const betaInterventions = interventions.filter((intervention) => intervention.tier === 'Beta');

  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="monitor"
          label="Retention Trajectory"
          observation="One monitored case is active. Asmaa stays in the Beta tier because engagement is strong but writing quality still needs directed support."
          implication="Retention risk is currently low, yet unresolved argumentation gaps could slow progress if feedback becomes too general."
          action="Continue monitoring Asmaa through the next rubric cycle and escalate only if revision quality stalls."
          citation="Tinto (1987) - Leaving College & Student Mortality"
        />
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={11} title="Intervention Tracking" subtitle="Layer 10: Onsite Adaptive Intervention" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="space-y-4">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--red)] mb-4 flex items-center gap-2">
              <ShieldAlert size={16} /> Alpha Tier (Intensive)
            </h3>
            {alphaInterventions.length > 0 ? (
              alphaInterventions.map((intervention, index) => (
                <InterventionCard key={index} data={intervention} />
              ))
            ) : (
              <EmptyTier message="No intensive intervention is required at the current checkpoint." />
            )}
          </div>

          <div className="space-y-4">
            <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--gold)] mb-4 flex items-center gap-2">
              <Activity size={16} /> Beta Tier (Monitoring)
            </h3>
            {betaInterventions.length > 0 ? (
              betaInterventions.map((intervention, index) => (
                <InterventionCard key={index} data={intervention} />
              ))
            ) : (
              <EmptyTier message="No monitoring interventions are active." />
            )}
          </div>
        </div>

        <StationFooter prevPath="/pipeline/10" nextPath="/pipeline/12" />
      </div>
    </PipelineLayout>
  );
}

function EmptyTier({ message }: { message: string }) {
  return (
    <GlassCard className="p-5 border border-dashed border-[var(--border)]">
      <p className="font-body text-sm text-[var(--text-sec)]">{message}</p>
    </GlassCard>
  );
}

function InterventionCard({ data }: InterventionCardProps) {
  const getRetentionColor = (value: number) => {
    if (value < 50) return 'text-[var(--red)]';
    if (value < 80) return 'text-[var(--gold)]';
    return 'text-[var(--teal)]';
  };

  const getRetentionRisk = (value: number) => {
    if (value < 50) return 'HIGH RISK';
    if (value < 80) return 'MODERATE';
    return 'LOW RISK';
  };

  const progressPct = (data.completed / data.total) * 100;

  return (
    <GlassCard className="p-5 border-l-2" style={{ borderLeftColor: data.tier === 'Alpha' ? 'var(--red)' : 'var(--gold)' }} pedagogicalLabel="Retention trajectory estimates persistence probability based on intervention engagement.">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-navigation text-lg font-medium text-[var(--text-primary)] flex items-center gap-2">
            {data.student}
            <span className="text-[10px] uppercase font-body bg-[var(--bg-deep)] px-2 py-0.5 rounded text-[var(--text-sec)]">
              {data.archetype}
            </span>
          </h4>
          <p className="font-body text-xs text-[var(--lav)] mt-1">{data.type}</p>
        </div>
        <div className="text-right">
          <div className={`font-forensic text-xl ${getRetentionColor(data.retention)}`}>
            {data.retention.toFixed(1)}%
          </div>
          <div className={`font-navigation text-[10px] uppercase ${getRetentionColor(data.retention)}`}>
            {getRetentionRisk(data.retention)}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-body text-[var(--text-sec)] mb-2">
        <span>Timeline: {data.timeline}</span>
        <span>Milestones: {data.completed}/{data.total}</span>
      </div>

      <div className="h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden flex">
        <div
          className="h-full transition-all duration-500"
          style={{
            width: `${progressPct}%`,
            backgroundColor: data.completed === data.total ? 'var(--teal)' : 'var(--lav)',
          }}
        />
      </div>
    </GlassCard>
  );
}
