import { useMemo, useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';
import { getSelectedStudyCase, useStudyScopeStore } from '../state/studyScope';

interface SignalVariable {
  shortLabel: string;
  label: string;
  normalized: number;
  sourceNote: string;
}

interface PlotPoint {
  x: number;
  y: number;
  id: string;
}

interface MatrixCellSelection {
  row: number;
  col: number;
  val: number;
}

const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));

const getColorForAlignment = (value: number) => {
  if (value === 1) return 'rgba(24, 32, 52, 0.95)';
  if (value >= 0.75) return 'rgba(196, 181, 253, 0.92)';
  if (value >= 0.55) return 'rgba(124, 214, 197, 0.82)';
  return 'rgba(148, 163, 184, 0.48)';
};

const getTextColorForAlignment = (value: number) => {
  if (value === 1 || value < 0.55) return 'var(--text-primary)';
  return 'var(--bg-deep)';
};

const getStrengthBand = (value: number) => {
  if (value >= 0.75) return 'strong';
  if (value >= 0.55) return 'moderate';
  return 'limited';
};

function buildAlignmentMatrix(variables: SignalVariable[]) {
  return variables.map((rowVariable, rowIndex) =>
    variables.map((columnVariable, colIndex) => {
      if (rowIndex === colIndex) {
        return 1;
      }

      const proximity = 1 - Math.abs(rowVariable.normalized - columnVariable.normalized);
      return Number((0.2 + clamp(proximity) * 0.8).toFixed(2));
    })
  );
}

function buildRevisionScorePlot(scoreJourney: Array<{ name: string; score: number }>): PlotPoint[] {
  return scoreJourney.map((checkpoint, index) => ({
    x: index + 1,
    y: checkpoint.score,
    id: checkpoint.name,
  }));
}

function buildFeedbackPlot(feedbackEvents: number, scoreJourney: Array<{ name: string; score: number }>): PlotPoint[] {
  const steps = Math.max(scoreJourney.length, 1);

  return scoreJourney.map((checkpoint, index) => ({
    x: Number((((index + 1) / steps) * Math.max(feedbackEvents, 1)).toFixed(1)),
    y: checkpoint.score,
    id: checkpoint.name,
  }));
}

function buildTimeWordCountPlot(wordCounts: number[], estimatedMinutes: number): PlotPoint[] {
  const usableWordCounts = wordCounts.length > 0 ? wordCounts : [0];
  const stepMinutes = estimatedMinutes > 0 ? estimatedMinutes / usableWordCounts.length : 0;

  return usableWordCounts.map((wordCount, index) => ({
    x: Number((stepMinutes * (index + 1)).toFixed(0)),
    y: wordCount,
    id: `Checkpoint ${index + 1}`,
  }));
}

export function Station05() {
  const [selectedCell, setSelectedCell] = useState<MatrixCellSelection | null>(null);
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCaseId = useStudyScopeStore((state) => state.selectedCaseId);
  const selectedCase = getSelectedStudyCase({ cases, selectedCaseId });

  const student = selectedCase?.student;
  const comparisonMetrics = selectedCase?.writing.comparison.metrics ?? [];
  const feedbackEvents = selectedCase?.student.feedback_views ?? 0;
  const estimatedMinutes = selectedCase?.activity.estimatedActiveMinutes ?? 0;
  const wordCounts = selectedCase?.writing.artifacts.map((artifact) => artifact.wordCount) ?? [];
  const commentary = selectedCase?.writing.comparison.commentary ?? [];

  const variables = useMemo<SignalVariable[]>(() => {
    if (!student) {
      return [];
    }

    return [
      { shortLabel: 'TTR', label: 'Lexical Variety', normalized: clamp(student.ttr), sourceNote: `Scaled TTR ${student.ttr.toFixed(2)}` },
      { shortLabel: 'Cohesion', label: 'Cohesion', normalized: clamp(student.cohesion / 5), sourceNote: `Cohesion ${student.cohesion.toFixed(1)} / 5` },
      { shortLabel: 'Lexical', label: 'Academic Lexis', normalized: clamp(student.lexical_resource / 5), sourceNote: `Lexical resource ${student.lexical_resource.toFixed(1)} / 5` },
      { shortLabel: 'Grammar', label: 'Grammar Accuracy', normalized: clamp(student.grammar_accuracy / 5), sourceNote: `Grammar accuracy ${student.grammar_accuracy.toFixed(1)} / 5` },
      { shortLabel: 'Arg', label: 'Argument Quality', normalized: clamp(student.argumentation / 5), sourceNote: `Argumentation ${student.argumentation.toFixed(1)} / 5` },
      { shortLabel: 'Score', label: 'Writing Score', normalized: clamp(student.total_score / 25), sourceNote: `Observed score ${student.total_score.toFixed(1)} / 25` },
      { shortLabel: 'Revision', label: 'Revision Frequency', normalized: clamp(student.revision_frequency / 6), sourceNote: `${student.revision_frequency} tracked revision moves` },
      { shortLabel: 'Time', label: 'Time on Task', normalized: clamp((selectedCase?.activity.estimatedActiveMinutes ?? student.time_on_task) / 240), sourceNote: `${selectedCase?.activity.estimatedActiveMinutes ?? student.time_on_task} estimated minutes` },
    ];
  }, [selectedCase?.activity.estimatedActiveMinutes, student]);

  const evidenceMatrix = useMemo(() => buildAlignmentMatrix(variables), [variables]);
  const revisionScorePlot = useMemo(() => buildRevisionScorePlot(selectedCase?.scoreJourney ?? []), [selectedCase?.scoreJourney]);
  const feedbackPlot = useMemo(() => buildFeedbackPlot(feedbackEvents, selectedCase?.scoreJourney ?? []), [feedbackEvents, selectedCase?.scoreJourney]);
  const timeWordCountPlot = useMemo(() => buildTimeWordCountPlot(wordCounts, estimatedMinutes), [wordCounts, estimatedMinutes]);

  const strongestPair = useMemo<MatrixCellSelection | null>(() => {
    let current: MatrixCellSelection | null = null;

    evidenceMatrix.forEach((row, rowIndex) => {
      row.forEach((value, colIndex) => {
        if (rowIndex === colIndex) return;
        if (!current || value > current.val) {
          current = { row: rowIndex, col: colIndex, val: value };
        }
      });
    });

    return current;
  }, [evidenceMatrix]);

  const handleCellClick = (row: number, col: number, val: number) => {
    if (row === col) return;
    setSelectedCell({ row, col, val });
  };

  return (
    <PipelineLayout
      verifiedEnabled={Boolean(selectedCase && student)}
      unavailableTitle="Verified Evidence Matrix Unavailable"
      unavailableMessage="Import and select a workbook-backed case first. This station builds an evidence map from that selected learner trace."
      rightPanel={
        strongestPair && variables.length > 0 ? (
          <PedagogicalInsightBadge
            urgency="positive"
            label="Evidence Link Matrix"
            observation={`${variables[strongestPair.row].label} and ${variables[strongestPair.col].label} form the strongest alignment pair in this selected case.`}
            implication="This matrix does not report population correlation. It maps how closely the case signals move together after normalization from workbook evidence."
            action="Use the strongest pair as a teacher-reading prompt, then confirm it against the text comparison, feedback trace, and revision sequence."
            citation="Mislevy (1994) - Evidence-Centered Design in Assessment"
          />
        ) : undefined
      }
    >
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={5} title="Evidence Alignment Matrix" subtitle="Layer 6: Case-Signal Alignment (Evidence Mapping)" />

        <GlassCard className="p-4 mb-6 bg-[var(--bg-raised)]/40 border-dashed border-[var(--border-bright)]">
          <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
            This station preserves the advanced matrix view, but the values are now built from normalized workbook-derived signals in the selected case. They should be read as within-case evidence alignment, not as cohort correlation coefficients.
          </p>
        </GlassCard>

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
          <GlassCard elevation="high" className="xl:col-span-3 p-6 md:p-8 overflow-x-auto" pedagogicalLabel="The matrix visualises how behavioural, writing, and outcome signals align inside the selected verified case.">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-2">Case Signal Alignment</h3>
            <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed mb-6">
              Each cell is a normalized proximity score built from the selected student's workbook metrics. It helps the teacher inspect which process and product signals move together inside one learner trace.
            </p>

            <div className="min-w-[620px]">
              <div className="flex">
                <div className="w-32 shrink-0"></div>
                {variables.map((variable) => (
                  <div
                    key={`header-${variable.shortLabel}`}
                    className="flex-1 text-center font-navigation text-[10px] uppercase tracking-wider text-[var(--text-sec)] px-1 pb-6"
                    title={variable.label}
                  >
                    {variable.shortLabel}
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-1 mt-4">
                {evidenceMatrix.map((row, rowIndex) => (
                  <div key={`row-${rowIndex}`} className="flex gap-1 items-center">
                    <div className="w-32 shrink-0 font-navigation text-xs text-[var(--text-sec)] text-right pr-4 leading-snug" title={variables[rowIndex].sourceNote}>
                      {variables[rowIndex].label}
                    </div>
                    {row.map((value, colIndex) => {
                      const isSelected = selectedCell?.row === rowIndex && selectedCell?.col === colIndex;
                      return (
                        <div
                          key={`cell-${rowIndex}-${colIndex}`}
                          onClick={() => handleCellClick(rowIndex, colIndex, value)}
                          className={`flex-1 aspect-square rounded flex items-center justify-center font-forensic text-[10px] transition-transform cursor-pointer
                            ${rowIndex === colIndex ? 'cursor-default' : 'hover:scale-105 hover:shadow-lg hover:z-10'}
                            ${isSelected ? 'ring-2 ring-[var(--lav)] scale-105 z-10' : ''}
                          `}
                          style={{
                            backgroundColor: getColorForAlignment(value),
                            color: rowIndex === colIndex ? 'var(--text-muted)' : getTextColorForAlignment(value),
                          }}
                          title={`${variables[rowIndex].label} x ${variables[colIndex].label}: ${value.toFixed(2)}`}
                        >
                          {value.toFixed(2).replace('1.00', '1.0')}
                        </div>
                      );
                    })}
                  </div>
                ))}
              </div>
            </div>

            {selectedCell && (
              <GlassCard accent="lav" glow className="mt-8 p-4 animate-in fade-in slide-in-from-top-2 duration-300">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-navigation text-sm font-medium text-[var(--lav)]">Case Interpretation</h4>
                  <button onClick={() => setSelectedCell(null)} className="text-[var(--text-muted)] hover:text-[var(--text-primary)]">x</button>
                </div>
                <div className="font-body text-sm text-[var(--text-primary)]">
                  <span className="font-navigation text-[var(--text-sec)]">Relationship:</span> {variables[selectedCell.row].label} vs {variables[selectedCell.col].label}
                  <div className="mt-2 text-xs">
                    <span className="font-forensic text-[var(--lav)] font-bold text-lg mr-2">strength = {selectedCell.val.toFixed(2)}</span>
                    <span className="text-[var(--text-sec)] border-l border-[var(--border)] pl-2">
                      {getStrengthBand(selectedCell.val)} within-case alignment
                    </span>
                  </div>
                  <p className="mt-3 text-[var(--text-sec)] leading-relaxed italic">
                    {variables[selectedCell.row].sourceNote}. {variables[selectedCell.col].sourceNote}. This cell helps the teacher inspect whether these two signals move closely enough to justify a pedagogical reading.
                  </p>
                </div>
              </GlassCard>
            )}

            <div className="flex flex-wrap gap-4 items-center mt-8 pt-6 border-t border-[var(--border)] text-[10px] font-navigation uppercase tracking-widest text-[var(--text-sec)]">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[rgba(148,163,184,0.48)] border border-[var(--border)]"></div>
                limited alignment
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[rgba(124,214,197,0.82)]"></div>
                moderate alignment
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm bg-[rgba(196,181,253,0.92)]"></div>
                strong alignment
              </div>
            </div>

            <div className="mt-4 text-[11px] font-body text-[var(--text-muted)] italic">
              Diagonal cells mark the same construct matched with itself. Off-diagonal cells show normalized alignment across process, writing, and score signals from the selected workbook case.
            </div>
          </GlassCard>

          <div className="xl:col-span-2 space-y-6">
            <GlassCard className="p-4 h-[200px]">
              <h4 className="text-[10px] font-navigation uppercase tracking-widest text-[var(--text-sec)] mb-2">Revision Steps vs Score Journey</h4>
              <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={140}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis type="number" dataKey="x" name="Revision Step" hide />
                  <YAxis type="number" dataKey="y" name="Score" domain={[1, 5]} hide />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)' }} />
                  <Scatter name="Checkpoints" data={revisionScorePlot} fill="var(--teal)" />
                </ScatterChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4 h-[200px]">
              <h4 className="text-[10px] font-navigation uppercase tracking-widest text-[var(--text-sec)] mb-2">Feedback Touchpoints vs Score Journey</h4>
              <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={140}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis type="number" dataKey="x" name="Feedback Events" hide />
                  <YAxis type="number" dataKey="y" name="Score" domain={[1, 5]} hide />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)' }} />
                  <Scatter name="Checkpoints" data={feedbackPlot} fill="var(--teal)" />
                </ScatterChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4 h-[200px]">
              <h4 className="text-[10px] font-navigation uppercase tracking-widest text-[var(--text-sec)] mb-2">Time on Task vs Writing Volume</h4>
              <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={140}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis type="number" dataKey="x" name="Estimated Minutes" hide />
                  <YAxis type="number" dataKey="y" name="Word Count" hide />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)' }} />
                  <Scatter name="Checkpoints" data={timeWordCountPlot} fill="var(--lav)" />
                </ScatterChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>

        {comparisonMetrics.length > 0 || commentary.length > 0 ? (
          <GlassCard className="p-6 md:p-8 mb-8">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-4">Comparison Anchors Used In This Matrix</h3>
            {comparisonMetrics.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {comparisonMetrics.slice(0, 4).map((metric) => (
                  <div key={metric.label} className="rounded-2xl border border-[var(--border)] bg-[var(--bg-base)] p-4">
                    <div className="font-navigation text-[10px] uppercase tracking-widest text-[var(--text-sec)] mb-2">{metric.label}</div>
                    <div className="font-body text-sm text-[var(--text-primary)]">{metric.before} → {metric.after}</div>
                    <div className="font-forensic text-sm text-[var(--lav)] mt-1">Delta {metric.delta}</div>
                  </div>
                ))}
              </div>
            ) : null}
            {commentary.length > 0 ? (
              <div className="space-y-2">
                {commentary.slice(0, 3).map((item) => (
                  <p key={item} className="font-body text-sm text-[var(--text-sec)] leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            ) : null}
          </GlassCard>
        ) : null}

        <StationFooter prevPath="/pipeline/4" nextPath="/pipeline/6" />
      </div>
    </PipelineLayout>
  );
}
