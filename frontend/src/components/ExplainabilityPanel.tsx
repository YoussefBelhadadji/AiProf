import { Cpu, FileText, Target, Activity, CheckCircle, ArrowRight } from 'lucide-react';

interface ExplainabilityPanelProps {
  evidence: {
    words: number;
    timeOnTask: number;
    errorDensity: number;
  };
  aiStates: {
    forethought: string;
    engagement: string;
    predictedGain: number;
  };
  rulesFired: string[];
  templates: string[];
}

export function ExplainabilityPanel({ evidence, aiStates, rulesFired, templates }: ExplainabilityPanelProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-xs font-navigation uppercase tracking-widest text-[var(--lav)] mb-2 flex items-center gap-1.5 opacity-80">
        <Cpu size={12} /> Decision Audit Trail
      </h3>

      <div className="relative border-l border-[var(--border)] ml-3 pl-5 space-y-5">
        
        {/* Step 1: Raw Evidence */}
        <div className="relative">
          <div className="absolute -left-[27px] bg-[var(--bg-base)] rounded-full p-1 border border-[var(--border)] text-[var(--text-sec)]">
            <FileText size={12} />
          </div>
          <h4 className="text-xs font-navigation uppercase tracking-wider text-[var(--text-primary)] mb-1">Raw Evidence</h4>
          <div className="flex gap-2 flex-wrap text-xs font-forensic text-[var(--text-sec)]">
            <span className="bg-[var(--bg-deep)] px-2 py-0.5 rounded border border-[var(--border-bright)]">{evidence.words} Words</span>
            <span className="bg-[var(--bg-deep)] px-2 py-0.5 rounded border border-[var(--border-bright)]">{evidence.timeOnTask}m Active</span>
            <span className="bg-[var(--bg-deep)] px-2 py-0.5 rounded border border-[var(--border-bright)]">{(evidence.errorDensity).toFixed(2)} Err/Dens</span>
          </div>
        </div>

        {/* Step 2: AI State Translation */}
        <div className="relative">
          <div className="absolute -left-[27px] bg-[var(--bg-base)] rounded-full p-1 border border-[var(--border)] text-[var(--blue)]">
            <Activity size={12} />
          </div>
          <h4 className="text-xs font-navigation uppercase tracking-wider text-[var(--text-primary)] mb-1">AI Classification</h4>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Forethought: {aiStates.forethought}</span>
            <span className="text-xs text-blue-400 bg-blue-500/10 px-2 py-1 rounded">Engagement: {aiStates.engagement}</span>
          </div>
        </div>

        {/* Step 3: Triggered Rules */}
        <div className="relative">
          <div className="absolute -left-[27px] bg-[var(--bg-base)] rounded-full p-1 border border-[var(--border)] text-emerald-500">
            <Target size={12} />
          </div>
          <h4 className="text-xs font-navigation uppercase tracking-wider text-[var(--text-primary)] mb-1">Rule Engine Matches</h4>
          <div className="space-y-1 mt-1.5">
            {rulesFired.length > 0 ? rulesFired.map((rule, idx) => (
              <div key={idx} className="flex items-start gap-1.5 text-xs text-[var(--text-sec)] leading-tight">
                <ArrowRight size={10} className="shrink-0 mt-0.5 text-emerald-500/50" />
                <span>{rule}</span>
              </div>
            )) : <span className="text-xs text-[var(--text-muted)] italic">No specialized rules triggered</span>}
          </div>
        </div>

        {/* Step 4: Feedback Selection */}
        <div className="relative">
          <div className="absolute -left-[27px] bg-[var(--bg-base)] rounded-full p-1 border border-[var(--lav-border)] text-[var(--lav)] shadow-[0_0_10px_var(--lav-glow)]">
            <CheckCircle size={12} />
          </div>
          <h4 className="text-xs font-navigation uppercase tracking-wider text-[var(--text-primary)] mb-1">Template Synthesis</h4>
          <div className="bg-[var(--lav-dim)] border border-[var(--lav-border)]/50 rounded p-2 text-xs text-[var(--text-primary)]">
            {templates.length > 0 ? `Assembled ${templates.length} pedagogical segments.` : 'Fell back to generic growth template.'}
          </div>
        </div>

      </div>
    </div>
  );
}

