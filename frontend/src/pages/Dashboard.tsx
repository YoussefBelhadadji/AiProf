import { ResearchShell } from '../layouts/ResearchShell';
import { GlassCard } from '../components/GlassCard';
import { MetricCard } from '../components/MetricCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { Button } from '../components/Atoms';
import { StudyScopePanel } from '../components/StudyScopePanel';
import {
  AlertTriangle,
  MessageSquare,
  Download,
  FileSpreadsheet,
  Star,
  BarChart3,
  Activity,
  Upload,
  ArrowRight,
  Clock,
  History,
  Sparkles,
  BookMarked,
  MessagesSquare,
  PenTool,
  Scale,
  type LucideIcon,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';
import {
  STUDY_VARIABLES,
  getSelectedStudyCase,
  getSelectedTask,
  getSelectedTaskId,
  getStudyCaseVariableValue,
  useStudyScopeStore,
  type StudyVariableId,
} from '../state/studyScope';

const activityIconMap = {
  download: Download,
  alert: AlertTriangle,
  message: MessageSquare,
  upload: Upload,
  activity: Activity,
} as const;

const variableIconMap: Record<StudyVariableId, LucideIcon> = {
  assignment_views: FileSpreadsheet,
  time_on_task: Clock,
  revision_frequency: History,
  feedback_views: MessageSquare,
  help_seeking_messages: MessagesSquare,
  word_count: PenTool,
  cohesion: BarChart3,
  argumentation: Scale,
  grammar_accuracy: Star,
  ttr: Sparkles,
  rubric: BookMarked,
  private_messages: MessagesSquare,
};

export function Dashboard() {
  const navigate = useNavigate();
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedTaskByCase = useStudyScopeStore((state) => state.selectedTaskByCase);
  const selectedVariableIds = useStudyScopeStore((state) => state.selectedVariableIds);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const selectedTask = getSelectedTask(
    selectedCase,
    getSelectedTaskId({ selectedCaseId, selectedTaskByCase })
  );
  const highlightedVariables = STUDY_VARIABLES.filter((variable) => selectedVariableIds.includes(variable.id)).slice(0, 4);

  return (
    <ResearchShell>
      <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-8 pb-32">
        <div className="flex flex-col md:flex-row gap-6 justify-between items-start md:items-center">
          <div>
            <h1 className="font-editorial italic text-4xl font-medium text-[var(--text-primary)]">
              Teacher Overview
            </h1>
            <p className="text-[var(--text-sec)] font-body mt-1">
              Start by choosing the student and the exercise below. The dashboard, the reports, and the student page will all follow the same selection.
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost" onClick={() => navigate('/students')}><History size={16} /> Open student registry</Button>
            <Button variant="secondary" onClick={() => navigate('/import')}><Upload size={16} /> Import workbooks</Button>
          </div>
        </div>

        <StudyScopePanel />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard accent="lav" glow className="lg:col-span-2 p-6 h-full flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-start mb-4 gap-4">
                <span className="text-[10px] uppercase tracking-widest font-navigation text-[var(--lav)] font-bold">Active Study Selection</span>
                <span className="text-[var(--text-muted)] font-forensic text-[10px]">Workbook: {selectedCase.workbookName}</span>
              </div>
              <h2 className="font-editorial text-2xl text-[var(--text-primary)] leading-tight mb-4">
                {selectedCase.meta.courseTitle}: {selectedCase.meta.studentName}
              </h2>
              <p className="font-body text-sm text-[var(--text-sec)] max-w-3xl">
                {selectedTask
                  ? `You are reading the exercise "${selectedTask.title}".`
                  : 'You are reading the full case overview across the imported semester trace.'} The same selection is used across the dashboard, student page, and reports.
              </p>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-navigation">Institution</div>
                  <div className="text-xs font-body text-[var(--text-sec)]">{selectedCase.meta.institution}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-navigation">Instructor</div>
                  <div className="text-xs font-body text-[var(--text-sec)]">{selectedCase.meta.instructor}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-navigation">Period</div>
                  <div className="text-xs font-body text-[var(--text-sec)]">{selectedCase.meta.periodCovered}</div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-[var(--text-muted)] font-navigation">Current Profile</div>
                  <div className="text-xs font-body text-[var(--text-sec)]">{selectedCase.clusterName}</div>
                </div>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="p-6 h-full bg-[var(--bg-raised)]/50 border-dashed border-[var(--border-bright)]">
            <h3 className="font-navigation text-xs uppercase tracking-widest text-[var(--text-sec)] mb-4">Current Teaching Scope</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-end mb-1">
                <span className="text-sm font-editorial italic text-[var(--text-primary)]">Imported student cases</span>
                <span className="font-forensic text-lg text-[var(--lav)]">{cases.length}</span>
              </div>
              <div className="h-1 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden">
                <div className="h-full bg-[var(--lav)] shadow-[0_0_10px_var(--lav)]" style={{ width: `${Math.min(100, cases.length * 20)}%` }} />
              </div>
              <p className="text-[11px] font-body text-[var(--text-sec)] leading-relaxed">
                This view follows your current choices: one active student, one active exercise, selected sections, and selected indicators.
              </p>
              <Button onClick={() => navigate('/reports')} className="w-full mt-2 py-2 text-xs">Open teacher report <ArrowRight size={14} /></Button>
            </div>
          </GlassCard>
        </div>

        <GlassCard className="p-6 md:p-8 overflow-x-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-widest">
              <Sparkles size={16} className="text-[var(--lav)]" />
              Key Indicators
            </h3>
            <span className="text-[var(--text-muted)] font-forensic text-[10px]">
              {selectedVariableIds.length} variables active
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            {highlightedVariables.map((variable) => {
              const Icon = variableIconMap[variable.id];

              return (
                <MetricCard
                  key={variable.id}
                  label={variable.label}
                  value={getStudyCaseVariableValue(selectedCase, variable.id)}
                  interpretation={variable.description}
                  icon={Icon}
                  accent={variable.category === 'writing' ? 'gold' : variable.category === 'communication' ? 'lav' : variable.category === 'assessment' ? 'red' : 'teal'}
                />
              );
            })}
          </div>
        </GlassCard>

        <GlassCard className="p-6 md:p-8 overflow-x-hidden">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-navigation text-sm font-bold text-[var(--text-primary)] flex items-center gap-2 uppercase tracking-widest">
              <Sparkles size={16} className="text-[var(--lav)]" />
              Analysis Map
            </h3>
            <span className="text-[var(--text-muted)] font-forensic text-[10px]">
              Active student: {selectedCase.meta.studentName}
            </span>
          </div>

          <div className="space-y-6">
            <BandRow
              label="Band 1 - Data and Analytics"
              color="teal"
              stations={['S01: Task', 'S02: Import', 'S03: Timeline', 'S04: NLP', 'S05: Correlation']}
              activeId={12}
            />
            <BandRow
              label="Band 2 - AI Support"
              color="lav"
              stations={['S06: Profile', 'S07: RF', 'S08: Bayesian']}
              activeId={12}
            />
            <BandRow
              label="Band 3 - Pedagogical Action"
              color="gold"
              stations={['S09: Diagnosis', 'S10: Feedback', 'S11: Tracking', 'S12: Growth']}
              activeId={12}
            />
          </div>
        </GlassCard>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="ACTIVE STUDENT" value={selectedCase.meta.userId} interpretation="Current Moodle user under study" icon={FileSpreadsheet} accent="lav" />
          <MetricCard label="EXERCISES" value={selectedCase.writing.artifacts.length} interpretation="Writing tasks available in the selected case" icon={BookMarked} accent="teal" />
          <MetricCard label="CURRENT SCORE" value={selectedCase.workspace.postScore.toFixed(1)} trend={`+${selectedCase.workspace.gain.toFixed(1)}`} trendDirection="up" interpretation="Latest analytic writing estimate on a 5-point scale" icon={Star} accent="gold" />
          <MetricCard label="RISK STATUS" value={selectedCase.riskLevel.toUpperCase()} interpretation={`Profile: ${selectedCase.clusterName}. Dominant need: ${selectedCase.meta.dominantNeed}.`} icon={AlertTriangle} accent={selectedCase.riskLevel === 'critical' ? 'red' : selectedCase.riskLevel === 'monitor' ? 'gold' : 'teal'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 flex flex-col gap-6">
            <GlassCard accent="teal" className="flex-1 p-6 md:p-8 flex flex-col">
              <h2 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-primary)] mb-6 flex items-center gap-2 font-bold">
                <BarChart3 size={16} className="text-[var(--teal)]" />
                Writing Progress
              </h2>
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={240}>
                  <BarChart data={selectedCase.scoreJourney} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal vertical={false} stroke="var(--border)" />
                    <XAxis type="number" domain={[0, 5]} />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-sec)', fontSize: 10, fontFamily: 'var(--font-forensic)' }} width={70} />
                    <Tooltip
                      cursor={{ fill: 'var(--border)' }}
                      contentStyle={{ backgroundColor: 'var(--bg-high)', border: '1px solid var(--border)', borderRadius: '8px' }}
                      itemStyle={{ color: 'var(--lav)', fontFamily: 'var(--font-forensic)', fontSize: '10px' }}
                    />
                    <Bar dataKey="score" radius={[0, 4, 4, 0]}>
                      {selectedCase.scoreJourney.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={index === selectedCase.scoreJourney.length - 1 ? 'var(--teal)' : 'var(--bg-raised)'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-[var(--border)]">
                <PedagogicalInsightBadge
                  urgency="positive"
                  label="Case Synthesis"
                  observation={selectedTask
                    ? `The current task selection is ${selectedTask.title}.`
                    : `The current overview covers ${selectedCase.meta.totalAssignmentsSubmitted} submitted tasks.`}
                  implication="The teacher can now switch between students and tasks before interpreting the results."
                  action="Use the student registry and reports to keep the same scope while moving across the interface."
                  citation="Vygotsky (1978) - Guided support and gradual control"
                />
              </div>
            </GlassCard>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <GlassCard className="p-4 hover:bg-[var(--bg-high)]/30 transition-all cursor-pointer group" onClick={() => navigate('/students')}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--lav-glow)] rounded-lg text-[var(--lav)]"><FileSpreadsheet size={18} /></div>
                    <span className="font-navigation text-sm font-medium">Choose another student</span>
                  </div>
                  <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--lav)] transition-colors" />
                </div>
              </GlassCard>
              <GlassCard className="p-4 hover:bg-[var(--bg-high)]/30 transition-all cursor-pointer group" onClick={() => navigate('/import')}>
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[var(--teal-dim)] rounded-lg text-[var(--teal)]"><Upload size={18} /></div>
                    <span className="font-navigation text-sm font-medium">Import more workbooks</span>
                  </div>
                  <ArrowRight size={16} className="text-[var(--text-muted)] group-hover:text-[var(--teal)] transition-colors" />
                </div>
              </GlassCard>
            </div>
          </div>

          <GlassCard className="h-full flex flex-col">
            <h3 className="p-6 font-navigation text-sm uppercase tracking-widest text-[var(--lav)] border-b border-[var(--border)] font-bold flex items-center gap-2">
              <History size={16} />
              Current Case Events
            </h3>
            <div className="flex-1 overflow-y-auto">
              <div className="divide-y divide-[var(--border)]">
                {selectedCase.recentActivity.map((item, index) => {
                  const Icon = activityIconMap[item.icon];
                  return (
                    <div key={`${item.time}-${index}`} className="px-6 py-4 flex gap-4 hover:bg-[var(--bg-raised)]/30 transition-colors">
                      <div className="mt-1 shrink-0 p-1.5 bg-[var(--bg-deep)] rounded border border-[var(--border)] text-[var(--text-muted)]">
                        <Icon size={14} />
                      </div>
                      <div className="min-w-0">
                        <p className="font-body text-xs text-[var(--text-primary)] leading-snug">{item.action}</p>
                        <div className="flex items-center gap-1.5 mt-1 text-[var(--text-muted)] font-forensic text-[9px]">
                          <Clock size={10} />
                          {item.time}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <div className="p-6 border-t border-[var(--border)]">
              <Button onClick={() => navigate('/pipeline/1')} className="w-full h-12 flex justify-center gap-3 text-sm">
                Open full analysis <ArrowRight size={18} />
              </Button>
            </div>
          </GlassCard>
        </div>
      </div>
    </ResearchShell>
  );
}

function BandRow({ label, color, stations, activeId }: { label: string; color: string; stations: string[]; activeId: number }) {
  const navigate = useNavigate();
  const palette = {
    teal: { color: 'var(--teal)', borderColor: 'var(--teal)', backgroundColor: 'var(--teal-dim)' },
    lav: { color: 'var(--lav)', borderColor: 'var(--lav)', backgroundColor: 'var(--lav-dim)' },
    gold: { color: 'var(--gold)', borderColor: 'var(--gold)', backgroundColor: 'var(--gold-dim)' },
  }[color] ?? { color: 'var(--text-primary)', borderColor: 'var(--border)', backgroundColor: 'var(--bg-raised)' };

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center px-1">
        <span className="text-[9px] uppercase tracking-widest font-navigation font-bold" style={{ color: palette.color }}>{label}</span>
      </div>
      <div className="flex gap-2">
        {stations.map((station) => {
          const stationId = Number.parseInt(station.split(':')[0].replace('S', ''), 10);
          const isActive = stationId === activeId;
          const isDone = stationId < activeId;
          const style = isActive
            ? {
                backgroundColor: palette.backgroundColor,
                borderColor: palette.borderColor,
                boxShadow: `0 0 15px ${palette.backgroundColor}`,
              }
            : isDone
              ? {
                  backgroundColor: 'var(--bg-card)',
                  borderColor: palette.backgroundColor,
                }
              : undefined;

          return (
            <div
              key={station}
              onClick={() => navigate(`/pipeline/${stationId}`)}
              className={clsx(
                'flex-1 h-12 rounded-md border flex flex-col items-center justify-center p-1 transition-all cursor-pointer group',
                isActive
                  ? 'ring-1'
                  : isDone
                    ? 'opacity-40 hover:opacity-100'
                    : 'bg-[var(--bg-deep)] border-[var(--border)] opacity-20 hover:opacity-100'
              )}
              style={style}
            >
              <span className={clsx('text-[8px] font-forensic', isActive ? 'font-bold' : 'text-[var(--text-sec)]')} style={isActive ? { color: palette.color } : undefined}>
                {station.split(':')[0]}
              </span>
              <span className={`text-[9.5px] font-navigation truncate w-full text-center ${isActive ? 'text-[var(--text-primary)] font-medium' : 'text-[var(--text-muted)]'}`}>
                {station.split(':')[1].trim()}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
