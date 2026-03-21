import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { StatusChip } from '../components/Atoms';
import { primaryStudent } from '../data/diagnostic';

const benchmark = {
  ttr: 0.58,
  cohesion: 4.1,
  lexical: 4.0,
  grammar: 4.0,
  errorDensity: 1.8,
  argumentation: 4.2,
};

const getRadarData = () => {
  if (!primaryStudent) {
    return [];
  }

  const student = primaryStudent;

  return [
    { subject: 'Vocabulary (TTR)', A: student.ttr * 100, B: benchmark.ttr * 100, fullMark: 100 },
    { subject: 'Cohesion', A: student.cohesion * 20, B: benchmark.cohesion * 20, fullMark: 100 },
    { subject: 'Lexical Resource', A: student.lexical_resource * 20, B: benchmark.lexical * 20, fullMark: 100 },
    { subject: 'Grammar Accuracy', A: student.grammar_accuracy * 20, B: benchmark.grammar * 20, fullMark: 100 },
    { subject: 'Error Density (Inv)', A: Math.max(0, 100 - student.error_density * 5), B: Math.max(0, 100 - benchmark.errorDensity * 5), fullMark: 100 },
    { subject: 'Argumentation', A: student.argumentation * 20, B: benchmark.argumentation * 20, fullMark: 100 },
  ];
};

export function Station04() {
  if (!primaryStudent) {
    return null;
  }

  const radarData = getRadarData();
  const currentStudent = primaryStudent;

  return (
    <PipelineLayout>
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={4} title="Stylometric Fingerprint" subtitle="Layer 5: Systematic Analytics (Thresholds & Indices)" />

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 mb-8">
          <GlassCard elevation="high" className="xl:col-span-8 p-6 md:p-8 flex flex-col h-[500px]" pedagogicalLabel="This radar charts six key writing indices against the target band for a successful argumentative paragraph.">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)]">Individual Competence Profile</h3>
                <p className="font-body text-[var(--text-sec)] text-sm">Case Study: {currentStudent.name}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-[var(--bg-deep)] border border-[var(--border)] text-[var(--text-primary)] rounded px-4 py-1.5 font-forensic text-xs">
                  ID: {currentStudent.student_id}
                </div>
              </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={280}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="var(--border)" />
                  <PolarAngleAxis dataKey="subject" tick={{ fill: 'var(--text-sec)', fontSize: 11, fontFamily: 'var(--font-navigation)' }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                  <Radar name={currentStudent.name} dataKey="A" stroke="var(--lav)" strokeWidth={2} fill="var(--lav)" fillOpacity={0.4} />
                  <Radar name="Target Benchmark" dataKey="B" stroke="var(--teal)" strokeWidth={2} strokeDasharray="4 4" fill="transparent" />
                </RadarChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-6 mt-4 font-navigation text-xs">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[var(--lav)] opacity-80"></div>
                <span className="text-[var(--text-primary)]">Asmaa&apos;s Performance</span>
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
              <GlassCard className="p-4 bg-[var(--bg-raised)] border-l-2 border-[var(--teal)]" pedagogicalLabel="High TTR indicates broad lexical range.">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-navigation font-medium text-[var(--text-primary)] text-sm">Vocabulary Diversity</span>
                  <StatusChip variant={currentStudent.ttr > 0.4 ? 'teal' : 'gold'}>{currentStudent.ttr > 0.4 ? 'EXPECTED' : 'LOW'}</StatusChip>
                </div>
                <p className="font-body text-xs text-[var(--text-sec)]">TTR Score: {currentStudent.ttr.toFixed(2)}</p>
              </GlassCard>
              <GlassCard className="p-4 bg-[var(--bg-raised)] border-l-2 border-[var(--lav)]" pedagogicalLabel="Lexical resource indicates how varied and academically appropriate the vocabulary is.">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-navigation font-medium text-[var(--text-primary)] text-sm">Lexical Resource</span>
                  <StatusChip variant={currentStudent.lexical_resource >= 4.0 ? 'teal' : 'lav'}>{currentStudent.lexical_resource >= 4.0 ? 'PROFICIENT' : 'DEVELOPING'}</StatusChip>
                </div>
                <p className="font-body text-xs text-[var(--text-sec)]">Score: {currentStudent.lexical_resource.toFixed(1)} / 5</p>
              </GlassCard>
            </div>

            <GlassCard className="p-6 flex-1 bg-[var(--bg-base)] border-[var(--border)] overflow-hidden" pedagogicalLabel="Raw indices extracted from the case text and revision history.">
              <h3 className="font-navigation text-sm uppercase tracking-widest text-[var(--lav-dim)] mb-6">Individual Telemetry</h3>
              <div className="font-forensic text-xs space-y-6">
                <div>
                  <div className="flex justify-between items-center text-[var(--text-primary)] mb-2 gap-4">
                    <span className="shrink-0">TTR_SCORE</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[var(--teal)] tracking-tighter">{'#'.repeat(Math.round(currentStudent.ttr * 10)) + '-'.repeat(10 - Math.round(currentStudent.ttr * 10))}</span>
                      <span className="w-12 text-right">{currentStudent.ttr.toFixed(2)}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[var(--text-primary)] mb-2 gap-4">
                    <span className="shrink-0">COHESION_IDX</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[var(--gold)] tracking-tighter">{'#'.repeat(Math.round(currentStudent.cohesion * 2)) + '-'.repeat(10 - Math.round(currentStudent.cohesion * 2))}</span>
                      <span className="w-12 text-right">{currentStudent.cohesion.toFixed(2)}</span>
                    </span>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between items-center text-[var(--text-primary)] mb-2 gap-4">
                    <span className="shrink-0">ERROR_DENSITY</span>
                    <span className="flex items-center gap-2">
                      <span className="text-[var(--red)] tracking-tighter">{'#'.repeat(Math.max(0, Math.min(10, Math.round(currentStudent.error_density)))) + '-'.repeat(Math.max(0, 10 - Math.round(currentStudent.error_density)))}</span>
                      <span className="w-12 text-right">{currentStudent.error_density.toFixed(1)}</span>
                    </span>
                  </div>
                </div>
                <div className="pt-4 border-t border-[var(--border)] mt-4">
                  <div className="flex justify-between items-center text-[var(--text-primary)] mb-2">
                    <span>AS_9263_STATUS</span>
                    <span className={`font-bold ${currentStudent.total_score >= 10 ? 'text-[var(--teal)]' : 'text-[var(--red)]'}`}>
                      {currentStudent.total_score >= 10 ? 'ON TRACK' : 'BELOW TARGET'}
                    </span>
                  </div>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        <PedagogicalInsightBadge
          urgency="monitor"
          label="Stylometric Profile Synthesis"
          observation={`Asmaa's vocabulary range is workable (TTR ${currentStudent.ttr.toFixed(2)}), but grammar accuracy (${currentStudent.grammar_accuracy.toFixed(1)}/5) and argumentation (${currentStudent.argumentation.toFixed(1)}/5) remain below the target band.`}
          implication="The main gap is higher-order control: claim development, sentence accuracy, and explicit links between evidence and stance."
          action="Model sentence combining and claim-evidence explanation in the next feedback round."
          citation="Crossley & McNamara (2012) - Automated NLP indices of writing quality"
        />

        <StationFooter prevPath="/pipeline/3" nextPath="/pipeline/5" />
      </div>
    </PipelineLayout>
  );
}
