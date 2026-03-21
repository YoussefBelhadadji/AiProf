import { useState } from 'react';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { StatusChip } from '../components/Atoms';
import { primaryStudent, getEngagementScore } from '../data/diagnostic';

const student = primaryStudent;

const hasHit = (ruleId: string) => {
  if (!student) return 0;

  if (ruleId === 'A1' && student.rubric_views === 0 && student.first_access_delay_minutes > 30) return 1;
  if (ruleId === 'B1' && student.cohesion <= 3.2) return 1;
  if (ruleId === 'B2' && student.argumentation <= 3.6) return 1;
  if (ruleId === 'C1' && student.revision_frequency === 0) return 1;
  if (ruleId === 'D1' && student.help_seeking_messages >= 4) return 1;
  if (ruleId === 'E1' && student.time_on_task > 150 && student.total_score < 20) return 1;

  return 0;
};

const diagnosticRules = [
  { id: 'A1', type: 'Engagement', active: true, ifCond: 'rubric_views == 0 AND delay > 30m', thenCond: 'Flag for criteria awareness + rubric walkthrough', basis: 'Zimmerman (2000) - Self-Regulated Learning', hits: hasHit('A1') },
  { id: 'B1', type: 'Quality', active: true, ifCond: 'cohesion <= 3.2', thenCond: 'Flag for discourse organization + restructuring scaffold', basis: 'Crossley & McNamara (2012)', hits: hasHit('B1') },
  { id: 'B2', type: 'Quality', active: true, ifCond: 'argumentation <= 3.6', thenCond: 'Flag for weak claim-evidence structure + C-E-E scaffold', basis: 'Toulmin (1958) - Uses of Argument', hits: hasHit('B2') },
  { id: 'C1', type: 'Progress', active: true, ifCond: 'revision_frequency == 0', thenCond: 'Flag for weak self-regulation + revision checklist', basis: 'Hyland (2003)', hits: hasHit('C1') },
  { id: 'D1', type: 'Engagement', active: true, ifCond: 'help_seeking_messages >= 4', thenCond: 'Flag for adaptive help-seeking + dialogic support', basis: 'Aleven et al. (2003)', hits: hasHit('D1') },
  { id: 'E1', type: 'Engagement', active: true, ifCond: 'time_on_task > 150 AND score < 20', thenCond: 'Flag as effortful but struggling + strategic instruction', basis: 'Shute (2008)', hits: hasHit('E1') },
];

const summaryBars = student
  ? [
      { label: 'Engagement', value: getEngagementScore(student), accent: 'var(--teal)' },
      { label: 'Quality', value: Math.round(((student.cohesion + student.argumentation + student.grammar_accuracy + student.lexical_resource) / 20) * 100), accent: 'var(--lav)' },
      { label: 'Revision Uptake', value: Math.round((student.revision_frequency / 4) * 100), accent: 'var(--gold)' },
      { label: 'Help-Seeking', value: Math.round((student.help_seeking_messages / 5) * 100), accent: 'var(--red)' },
    ]
  : [];

export function Station09() {
  const [activeTab, setActiveTab] = useState('Engagement');
  const tabs = ['Engagement', 'Quality', 'Progress'];

  const filteredRules = diagnosticRules.filter((rule) => rule.type === activeTab);
  const totalIndicators = diagnosticRules.reduce((accumulator, rule) => accumulator + rule.hits, 0);

  if (!student) {
    return null;
  }

  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="urgent"
          label="Individual Diagnosis"
          observation={`Asmaa matches ${totalIndicators} active pedagogical indicators.`}
          implication="The case-level diagnosis points to strong effort and help-seeking, with the main quality gap concentrated in argument development."
          action="Review the quality triggers first so the next feedback round closes the gap between effort and score."
          citation="Mislevy (1994) - Evidence-Centered Design in Assessment"
        />
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={9} title="Diagnosis Engine" subtitle="Layer 8: Diagnostic Synthesis (Logic Engine)" />

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-6 gap-4">
          <div className="flex gap-4 border-b border-[var(--border)] overflow-x-auto w-full md:w-auto">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 px-2 text-sm font-navigation font-medium transition-colors border-b-2 whitespace-nowrap ${
                  activeTab === tab
                    ? 'border-[var(--lav)] text-[var(--lav)]'
                    : 'border-transparent text-[var(--text-sec)] hover:text-[var(--text-primary)]'
                }`}
              >
                {tab} Rules
              </button>
            ))}
          </div>
          <div className="font-forensic text-sm text-[var(--text-sec)] bg-[var(--bg-raised)] px-4 py-2 rounded-lg border border-[var(--border)]">
            Active Indicators for {student.name}: <span className="text-[var(--red)] font-bold text-lg">{totalIndicators}</span>
          </div>
        </div>

        <GlassCard elevation="high" className="p-6 md:p-8 mb-8" pedagogicalLabel="The diagnosis panel synthesises product and process indicators into a unified developmental profile.">
          <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-6">Diagnostic Summary Panel</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {summaryBars.map((item) => (
              <div key={item.label} className="p-4 bg-[var(--bg-deep)] rounded-lg border border-[var(--border)]">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-navigation text-sm text-[var(--text-primary)]">{item.label}</span>
                  <span className="font-forensic text-sm" style={{ color: item.accent }}>{item.value}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[var(--bg-raised)] overflow-hidden">
                  <div className="h-full transition-all duration-500" style={{ width: `${item.value}%`, backgroundColor: item.accent }} />
                </div>
              </div>
            ))}
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {filteredRules.map((rule, index) => (
            <RuleCard key={index} rule={rule} />
          ))}
        </div>

        <StationFooter prevPath="/pipeline/8" nextPath="/pipeline/10" />
      </div>
    </PipelineLayout>
  );
}

function RuleCard({ rule }: { rule: typeof diagnosticRules[0] }) {
  const [isActive, setIsActive] = useState(rule.active);

  return (
    <GlassCard className={`p-6 border-l-4 transition-colors ${isActive ? (rule.hits > 0 ? 'border-l-[var(--red)]' : 'border-l-[var(--teal)]') : 'border-l-[var(--border)] opacity-60'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="font-navigation text-[10px] tracking-widest text-[var(--text-sec)] flex items-center gap-3">
          RULE ID: <span className="text-[var(--text-primary)] font-forensic text-xs">{rule.id}</span>
        </div>

        <label className="relative inline-flex items-center cursor-pointer">
          <input type="checkbox" className="sr-only peer" checked={isActive} onChange={() => setIsActive(!isActive)} />
          <div className="w-9 h-5 bg-[var(--bg-deep)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-sec)] peer-checked:after:bg-[var(--bg-deep)] after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--lav)]"></div>
          <span className="ml-3 text-xs font-navigation font-medium text-[var(--text-sec)] uppercase">
            {isActive ? 'Active' : 'Muted'}
          </span>
        </label>
      </div>

      <div className="font-forensic text-sm space-y-4 mb-6 text-[var(--text-primary)]">
        <div className="flex gap-4 p-3 bg-[var(--bg-deep)] rounded border border-[var(--border)] border-l-2 border-l-[var(--lav-dim)]">
          <span className="text-[var(--lav)] font-bold">IF:</span>
          <span className="tracking-wide">{rule.ifCond}</span>
        </div>
        <div className="flex gap-4 p-3 bg-[var(--bg-deep)] rounded border border-[var(--border)] border-l-2 border-l-[var(--teal-dim)]">
          <span className="text-[var(--teal)] font-bold">THEN:</span>
          <span>{rule.thenCond}</span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-4 border-t border-[var(--border)]">
        <div className="font-body text-[10px] text-[var(--text-sec)] max-w-[220px] leading-tight">
          <span className="uppercase tracking-wide text-[var(--text-muted)] block mb-1">Theoretical Basis</span>
          {rule.basis}
        </div>
        <div className="text-right">
          <span className="font-navigation text-[10px] uppercase tracking-wider text-[var(--text-sec)] block mb-1">Case Match</span>
          {isActive && rule.hits > 0 ? (
            <StatusChip variant="red" className="shadow-[0_0_10px_var(--red-dim)]">MATCHED</StatusChip>
          ) : (
            <StatusChip variant="teal">CLEAR</StatusChip>
          )}
        </div>
      </div>
    </GlassCard>
  );
}
