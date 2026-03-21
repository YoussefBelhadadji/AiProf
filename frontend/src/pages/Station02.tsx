import type { ElementType } from 'react';
import { ArrowRight, Database, FileSpreadsheet, GraduationCap, FileText, MessageCircle } from 'lucide-react';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { StatusChip, Button } from '../components/Atoms';
import { caseStudyMeta } from '../data/diagnostic';

interface SourceNodeProps {
  icon: ElementType;
  name: string;
  count: string;
  status: string;
  isPending?: boolean;
  pedagogicalLabel?: string;
}

export function Station02() {
  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="positive"
          label="Data Triangulation Status"
          observation="All four workbook streams are integrated for the same learner identity: summary data, Moodle logs, writing samples, and communication evidence."
          implication="The case is internally consistent across user ID 9263, course 379, and the full semester trace, so downstream analysis can proceed without merge conflict risk."
          action="Proceed to pattern analysis; no unresolved joins remain."
          citation="Siemens (2013) - Learning Analytics: The Emergence of a Discipline"
        />
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={2} title="Forensic Data Integration" />

        <GlassCard elevation="high" className="p-8 md:p-12 mb-8 relative overflow-hidden flex flex-col items-center min-h-[500px] justify-center">
          <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ zIndex: 0 }}>
            <path d="M 50% 50% C 50% 20%, 25% 20%, 25% 25%" fill="none" stroke="var(--lav)" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" opacity="0.4" />
            <path d="M 50% 50% C 50% 20%, 75% 20%, 75% 25%" fill="none" stroke="var(--lav)" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" opacity="0.4" />
            <path d="M 50% 50% C 50% 80%, 25% 80%, 25% 75%" fill="none" stroke="var(--lav)" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" opacity="0.4" />
            <path d="M 50% 50% C 50% 80%, 75% 80%, 75% 75%" fill="none" stroke="var(--lav)" strokeWidth="2" strokeDasharray="6 6" className="animate-[dash_20s_linear_infinite]" opacity="0.4" />

            <style>{`
              @keyframes dash {
                to { stroke-dashoffset: -1000; }
              }
            `}</style>
          </svg>

          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="w-32 h-32 rounded-full border border-[var(--lav)] bg-[var(--bg-deep)] shadow-[0_0_40px_var(--lav-glow)] flex items-center justify-center mb-4 relative">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--lav)] border-dashed animate-[spin_20s_linear_infinite] opacity-30" />
              <Database size={40} className="text-[var(--lav)]" />
            </div>
            <h3 className="font-editorial text-xl text-[var(--text-primary)] font-medium">Case Evidence Hub</h3>
            <p className="font-forensic text-xs text-[var(--teal)] mt-1">1 VALIDATED STUDENT CASE</p>
          </div>

          <div className="w-full h-full flex flex-col justify-between z-10">
            <div className="flex justify-around w-full mt-4">
              <SourceNode
                icon={FileSpreadsheet}
                name="Workbook Metadata"
                count={`1 file / ${caseStudyMeta.totalAssignmentsSubmitted} submissions`}
                status="SYNCED"
                pedagogicalLabel="Summary and assignment sheets anchor the verified learner identity, course metadata, and grading status."
              />
              <SourceNode
                icon={GraduationCap}
                name="Moodle Logs"
                count={`${caseStudyMeta.activityLogEntries} entries`}
                status="SYNCED"
                pedagogicalLabel="Behavioral indicators from Moodle activity logs trace access, submission, and viewing behaviour over time."
              />
            </div>

            <div className="flex justify-around w-full mb-4 mt-80">
              <SourceNode
                icon={FileText}
                name="Writing Samples"
                count="13 archived texts"
                status="SYNCED"
                pedagogicalLabel="Drafts, revised comments, forum posts, and final paragraph evidence are available for linguistic analysis."
              />
              <SourceNode
                icon={MessageCircle}
                name="Chat + Feedback"
                count={`${caseStudyMeta.chatMessages} messages`}
                status="SYNCED"
                pedagogicalLabel="Chat messages and exported instructor feedback capture help-seeking and response latency."
              />
            </div>
          </div>
        </GlassCard>

        <Button className="w-full py-6 text-lg justify-center shadow-[0_0_30px_var(--lav-glow)] mb-8" onClick={() => { window.location.href = '/pipeline/3'; }}>
          Proceed to Analytics <ArrowRight className="ml-2" />
        </Button>

        <StationFooter prevPath="/pipeline/1" nextPath="/pipeline/3" />
      </div>
    </PipelineLayout>
  );
}

function SourceNode({ icon: Icon, name, count, status, isPending = false, pedagogicalLabel }: SourceNodeProps) {
  return (
    <div className={`flex flex-col items-center p-4 bg-[var(--bg-card)] border ${isPending ? 'border-[var(--gold-dim)]' : 'border-[var(--border)]'} rounded-xl w-48 text-center group cursor-help relative`}>
      <Icon size={24} className={`mb-3 ${isPending ? 'text-[var(--gold)]' : 'text-[var(--text-primary)]'}`} />
      <h4 className="font-navigation text-sm font-medium text-[var(--text-primary)]">{name}</h4>
      <p className="font-forensic text-xs text-[var(--text-sec)] mt-1 mb-3">{count}</p>
      <StatusChip variant={isPending ? 'gold' : 'teal'}>{status}</StatusChip>

      <div className="absolute top-full mt-2 w-48 p-2 bg-[var(--bg-high)] border border-[var(--border)] rounded text-xs font-body text-[var(--text-sec)] opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-none">
        {pedagogicalLabel && <div className="mb-2 text-[var(--lav)] italic border-b border-[var(--border)] pb-2">{pedagogicalLabel}</div>}
        <div>Deduplication: {isPending ? 'Pending' : '100%'}</div>
        <div>Last sync: verified workbook import</div>
      </div>
    </div>
  );
}
