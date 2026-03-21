import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { CommunicationTrace } from '../components/CommunicationTrace';
import { caseStudyMeta, instructorComments, primaryStudent, teacherStudentDialogue } from '../data/diagnostic';

const student = primaryStudent;

const histogramData = [
  { range: '< 1 day', count: 0, fill: 'var(--teal)' },
  { range: '1-2 days', count: 1, fill: 'var(--gold)' },
  { range: '> 3 days', count: 0, fill: 'var(--red)' },
];

const swimlaneData = student
  ? [
      {
        id: student.student_id,
        sent: 0,
        viewed: 0.5,
        submitted: 1.2,
        speed: 'fast',
        feedback: student.personalized_feedback,
      },
    ]
  : [];

export function Station10() {
  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="positive"
          label="Intervention Efficacy"
          observation="Asmaa reopened the feedback trail within roughly half a day and returned a revision in about 1.2 days."
          implication="The short loop suggests usable feedback uptake rather than passive viewing."
          action="Keep feedback narrow, direct, and tied to one structural target at a time."
          citation="Carless & Boud (2018) - Feedback Literacy / Formative Feedback"
        />
      }
    >
      <div className="max-w-6xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={10} title="Feedback Delivery & Latency" subtitle="Layer 9: Pedagogical Decision (Feedback Delivery)" />

        <GlassCard elevation="high" className="p-6 md:p-8 mb-8 overflow-x-auto" pedagogicalLabel="Swimlane topography visualises the temporal relationship between feedback delivery and revision response.">
          <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-6">Feedback Response Topography</h3>

          <div className="min-w-[600px] border border-[var(--border)] rounded-lg bg-[var(--bg-deep)] p-4 relative">
            <div className="flex justify-between border-b border-[var(--border)] pb-2 mb-4 font-navigation text-[10px] text-[var(--text-primary)] font-bold">
              <span>Day 0 (sent)</span>
              <span>Day 2</span>
              <span>Day 4</span>
              <span>Day 6+</span>
            </div>

            <div className="space-y-4 relative">
              <div className="absolute inset-y-0 left-[33%] w-px bg-[var(--border-bright)] border-dashed"></div>
              <div className="absolute inset-y-0 left-[66%] w-px bg-[var(--border-bright)] border-dashed"></div>

              {swimlaneData.map((row, i) => (
                <div key={i} className="flex items-center h-8 group hover:bg-[var(--bg-raised)] rounded px-2 -mx-2 transition-colors">
                  <div className="w-20 font-forensic text-xs text-[var(--text-sec)] group-hover:text-[var(--text-primary)]">CASE {row.id}</div>
                  <div className="flex-1 relative h-full flex items-center">
                    <div
                      className="absolute h-0.5"
                      style={{
                        left: `${(row.sent / 7) * 100}%`,
                        width: `${((row.submitted - row.sent) / 7) * 100}%`,
                        backgroundColor: row.speed === 'fast' ? 'var(--teal-dim)' : 'var(--gold-dim)',
                      }}
                    />

                    <div className="absolute w-3 h-3 rounded-full bg-[var(--text-muted)] border-2 border-[var(--bg-deep)] -translate-x-1.5" style={{ left: `${(row.sent / 7) * 100}%` }} title="Feedback sent" />
                    <div className="absolute w-3 h-3 rounded-full border-2 border-[var(--lav)] bg-[var(--bg-deep)] -translate-x-1.5 z-10" style={{ left: `${(row.viewed / 7) * 100}%` }} title="Feedback viewed" />
                    <div
                      className="absolute w-3 h-3 z-20 -translate-x-1.5"
                      style={{
                        left: `${(row.submitted / 7) * 100}%`,
                        backgroundColor: row.speed === 'fast' ? 'var(--teal)' : 'var(--gold)',
                      }}
                      title="Revision submitted"
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-6 mt-6 pt-4 border-t border-[var(--border)] font-navigation text-xs text-[var(--text-sec)]">
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[var(--text-muted)]"></div> Sent</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full border-2 border-[var(--lav)]"></div> Viewed</div>
              <div className="flex items-center gap-2"><div className="w-2 h-2 bg-[var(--teal)]"></div> Revised</div>
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 mb-8">
          <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)] mb-6">Targeted Feedback Preview</h3>
          <div className="space-y-4">
            {swimlaneData.map((s, i) => (
              <div key={i} className="p-4 bg-[var(--bg-deep)] rounded border border-[var(--border)] border-l-4 border-l-[var(--lav)]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-navigation text-xs font-bold text-[var(--text-primary)]">CASE {s.id}</span>
                  <span className="font-forensic text-[10px] text-[var(--text-muted)] uppercase tracking-widest">Instructor-facing synthesis</span>
                </div>
                <p className="font-body text-sm text-[var(--text-sec)] italic leading-relaxed">
                  &quot;{s.feedback || 'Your writing shows good progress. Focus on connecting your arguments more clearly.'}&quot;
                </p>
              </div>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 mb-8" pedagogicalLabel="The exchange trace shows how Asmaa asked for clarification, where the teacher redirected attention to Moodle comments, and how the teacher's written comment modeled a more academic version.">
          <CommunicationTrace
            messages={teacherStudentDialogue}
            comments={instructorComments}
            title="Dialogue and Comment Trace"
            subtitle="Teacher-student messages and the formal instructor comment extracted from the verified workbook."
          />
        </GlassCard>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <GlassCard className="p-6 h-[300px]" pedagogicalLabel="Response latency is a practical indicator of feedback uptake and task re-entry.">
            <h4 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)] mb-4">Observed Response Latency</h4>
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={220}>
              <BarChart data={histogramData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" />
                <XAxis dataKey="range" tick={{ fill: 'var(--text-sec)', fontSize: 11, fontFamily: 'var(--font-navigation)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: 'var(--text-sec)', fontSize: 11, fontFamily: 'var(--font-forensic)' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: 'var(--bg-raised)' }} contentStyle={{ backgroundColor: 'var(--bg-high)', border: 'none', borderRadius: '4px', color: 'var(--text-primary)' }} />
                <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard accent="lav" glow className="p-6 flex flex-col justify-center bg-[var(--bg-base)]">
            <div className="font-forensic text-3xl text-[var(--lav)] mb-2">1.2 Days</div>
            <p className="font-navigation text-sm text-[var(--text-sec)] mb-4">Observed revision loop after targeted feedback</p>
            <div className="font-forensic text-xl text-[var(--text-muted)] mb-2">3.0 Days</div>
            <p className="font-navigation text-sm text-[var(--text-sec)]">Monitoring threshold for delayed response</p>
            <p className="font-body text-xs text-[var(--text-sec)] mt-6">Workbook viewed timestamp: {caseStudyMeta.feedbackViewedAt}</p>
          </GlassCard>
        </div>

        <StationFooter prevPath="/pipeline/9" nextPath="/pipeline/11" />
      </div>
    </PipelineLayout>
  );
}
