import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { StatusChip } from '../components/Atoms';
import { getSelectedStudyCase, useStudyScopeStore } from '../state/studyScope';

const benchmark = {
  ttr: 0.58,
  cohesion: 4.1,
  lexical: 4.0,
  grammar: 4.0,
  errorDensity: 1.8,
  argumentation: 4.2,
};

export function Station04() {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });
  const student = selectedCase?.student;

  const radarData = student
    ? [
        { subject: 'Vocabulary (TTR)', A: student.ttr * 100, B: benchmark.ttr * 100, fullMark: 100 },
        { subject: 'Cohesion', A: student.cohesion * 20, B: benchmark.cohesion * 20, fullMark: 100 },
        { subject: 'Lexical Resource', A: student.lexical_resource * 20, B: benchmark.lexical * 20, fullMark: 100 },
        { subject: 'Grammar Accuracy', A: student.grammar_accuracy * 20, B: benchmark.grammar * 20, fullMark: 100 },
        { subject: 'Error Density (Inv)', A: Math.max(0, 100 - student.error_density * 5), B: Math.max(0, 100 - benchmark.errorDensity * 5), fullMark: 100 },
        { subject: 'Argumentation', A: student.argumentation * 20, B: benchmark.argumentation * 20, fullMark: 100 },
      ]
    : [];

  return (
    <PipelineLayout
      verifiedEnabled={Boolean(selectedCase && student)}
      unavailableTitle="Verified Stylometric Analysis Unavailable"
      unavailableMessage="Import a verified workbook case before opening the stylometric station."
      rightPanel={
        student ? (
          <PedagogicalInsightBadge
            urgency="monitor"
            label="Stylometric Profile Synthesis"
            observation={`${selectedCase?.meta.studentName}'s vocabulary range is workable (TTR ${student.ttr.toFixed(2)}), but grammar accuracy (${student.grammar_accuracy.toFixed(1)}/5) and argumentation (${student.argumentation.toFixed(1)}/5) remain below the target band.`}
            implication="The main gap is higher-order control: claim development, sentence accuracy, and explicit links between evidence and stance."
            action="Model sentence combining and claim-evidence explanation in the next feedback round."
            citation="Crossley & McNamara (2012) - Automated NLP indices of writing quality"
          />
        ) : undefined
      }
    >
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={4} title="Stylometric Fingerprint" subtitle="Layer 5: NLP and Systematic Analytics" />

        <GlassCard className="p-4 mb-6 bg-[var(--bg-raised)]/40 border-dashed border-[var(--border-bright)]">
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            This station shows the NLP-derived and stylometric indicators extracted from the selected case, including TTR, cohesion, lexical resource, grammar accuracy, error density, and argumentation.
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
          <GlassCard elevation="high" className="xl:col-span-8 p-6 md:p-8 flex flex-col min-h-[420px] md:min-h-[500px]" pedagogicalLabel="This radar charts six key writing indices against the target band for a successful argumentative paragraph.">
            <div className="flex flex-col md:flex-row justify-between items-start gap-3 mb-6">
              <div>
                <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)]">Individual Competence Profile</h3>
                <p className="font-body text-[var(--text-sec)] text-sm">Case Study: {selectedCase?.meta.studentName}</p>
              </div>
              <div className="bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] rounded px-4 py-1.5 font-forensic text-xs break-words">
                ID: {student?.student_id}
              </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-sec)', fontSize: 11, fontFamily: 'var(--font-navigation)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={selectedCase?.meta.studentName ?? 'Selected student'} dataKey="A" stroke="var(--lav)" strokeWidth={2} fill="var(--lav)" fillOpacity={0.4} />
                  <Radar name="Target Benchmark" dataKey="B" stroke="var(--teal)" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 font-navigation text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--lav)] opacity-80"></div>
                <span className="text-[var(--text-primary)]">{selectedCase?.meta.studentName}&apos;s Performance</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full border-2 border-[var(--teal)] border-dashed"></div>
                <span className="text-[var(--text-sec)]">Target Benchmark</span>
              </div>
            </div>
          </GlassCard>

          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="space-y-3">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--text-sec)] mb-2">Individual Indicators</h3>
              <GlassCard className="p-4 bg-[var(--bg-raised)] border-l-2 border-[var(--teal)]" pedagogicalLabel="High TTR indicates broader lexical range.">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-navigation font-medium text-[var(--text-primary)] text-sm">Vocabulary Diversity</span>
                  <StatusChip variant={(student?.ttr ?? 0) > 0.4 ? 'teal' : 'gold'}>{(student?.ttr ?? 0) > 0.4 ? 'EXPECTED' : 'LOW'}</StatusChip>
                </div>
                <p className="font-body text-xs text-[var(--text-sec)]">TTR Score: {student?.ttr.toFixed(2)}</p>
              </GlassCard>
              <GlassCard className="p-4 bg-[var(--bg-raised)] border-l-2 border-[var(--lav)]" pedagogicalLabel="Lexical resource indicates how varied and academically appropriate the vocabulary is.">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-navigation font-medium text-[var(--text-primary)] text-sm">Lexical Resource</span>
                  <StatusChip variant={(student?.lexical_resource ?? 0) >= 4.0 ? 'teal' : 'lav'}>{(student?.lexical_resource ?? 0) >= 4.0 ? 'PROFICIENT' : 'DEVELOPING'}</StatusChip>
                </div>
                <p className="font-body text-xs text-[var(--text-sec)]">Score: {student?.lexical_resource.toFixed(1)} / 5</p>
              </GlassCard>
            </div>

            <GlassCard className="p-6 flex-1 bg-[var(--bg-base)] border-[var(--border)] overflow-hidden" pedagogicalLabel="Raw indices extracted from the active case text and revision history.">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--lav-dim)] mb-6">Individual Telemetry</h3>
              <div className="font-forensic text-xs space-y-6">
                <Telemetry label="TTR_SCORE" color="var(--teal)" value={student?.ttr ?? 0} scale={10} display={student?.ttr.toFixed(2) ?? '0.00'} />
                <Telemetry label="COHESION_IDX" color="var(--gold)" value={(student?.cohesion ?? 0) / 5} scale={10} display={student?.cohesion.toFixed(2) ?? '0.00'} />
                <Telemetry label="ERROR_DENSITY" color="var(--red)" value={Math.max(0, Math.min(1, (student?.error_density ?? 0) / 10))} scale={10} display={student?.error_density.toFixed(1) ?? '0.0'} />
                <div className="pt-4 border-t border-[var(--border)] mt-4">
                  <div className="flex justify-between items-center text-[var(--text-primary)] mb-2">
                    <span>{student?.student_id ? `AS_${student.student_id}_STATUS` : 'CASE_STATUS'}</span>
                    <span className={`font-bold ${(student?.total_score ?? 0) >= 10 ? 'text-[var(--teal)]' : 'text-[var(--red)]'}`}>
                      {(student?.total_score ?? 0) >= 10 ? 'ON TRACK' : 'BELOW TARGET'}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <StationFooter prevPath="/pipeline/3" nextPath="/pipeline/5" />
      </div>
    </PipelineLayout>
  );
}

function Telemetry({ label, color, value, scale, display }: { label: string; color: string; value: number; scale: number; display: string }) {
  const filled = Math.max(0, Math.min(scale, Math.round(value * scale)));
  return (
    <div>
      <div className="flex flex-col gap-2 sm:flex-row sm:justify-between sm:items-center text-[var(--text-primary)] mb-2">
        <span className="break-words">{label}</span>
        <span className="flex items-center gap-2 flex-wrap sm:justify-end">
          <span style={{ color }} className="tracking-tighter break-all">{'#'.repeat(filled) + '-'.repeat(scale - filled)}</span>
          <span className="w-12 text-right shrink-0">{display}</span>
        </span>
      </div>
    </div>
  );
}
