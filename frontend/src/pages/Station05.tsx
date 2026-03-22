import { useState } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { PipelineLayout, StationHeader, StationFooter } from '../layouts/PipelineLayout';
import { GlassCard } from '../components/GlassCard';
import { PedagogicalInsightBadge } from '../components/PedagogicalInsightBadge';

const variables = [
  { shortLabel: 'TTR', label: 'Lexical Variety' },
  { shortLabel: 'Cohesion', label: 'Cohesion' },
  { shortLabel: 'Lexical', label: 'Academic Lexis' },
  { shortLabel: 'Grammar', label: 'Grammar Accuracy' },
  { shortLabel: 'Arg', label: 'Argument Quality' },
  { shortLabel: 'Score', label: 'Writing Score' },
  { shortLabel: 'Revision', label: 'Revision Frequency' },
  { shortLabel: 'Time', label: 'Time on Task' },
];

const evidenceMatrix = [
  [1.0, 0.62, 0.71, 0.55, 0.48, 0.52, 0.36, 0.28],
  [0.62, 1.0, 0.58, 0.66, 0.74, 0.78, 0.63, 0.44],
  [0.71, 0.58, 1.0, 0.6, 0.54, 0.64, 0.32, 0.26],
  [0.55, 0.66, 0.6, 1.0, 0.69, 0.73, 0.57, 0.35],
  [0.48, 0.74, 0.54, 0.69, 1.0, 0.81, 0.67, 0.42],
  [0.52, 0.78, 0.64, 0.73, 0.81, 1.0, 0.76, 0.46],
  [0.36, 0.63, 0.32, 0.57, 0.67, 0.76, 1.0, 0.59],
  [0.28, 0.44, 0.26, 0.35, 0.42, 0.46, 0.59, 1.0],
];

const plot1Data = [
  { x: 1, y: 2.1, id: 'Intro draft' },
  { x: 2, y: 2.8, id: 'Body paragraph 1' },
  { x: 3, y: 3.3, id: 'Body paragraph 2' },
  { x: 4, y: 3.7, id: 'Final revision' },
];

const plot2Data = [
  { x: 1, y: 2.1, id: 'Initial feedback' },
  { x: 2, y: 2.9, id: 'Viewed and revised intro' },
  { x: 3, y: 3.4, id: 'Body paragraph response' },
  { x: 4, y: 3.7, id: 'Final follow-up' },
];

const plot3Data = [
  { x: 90, y: 112, id: 'Intro draft' },
  { x: 130, y: 186, id: 'Body paragraph 1' },
  { x: 160, y: 200, id: 'Body paragraph 2' },
  { x: 180, y: 199, id: 'Final revision' },
];

const getColorForAlignment = (value: number) => {
  if (value === 1) return 'rgba(24, 32, 52, 0.95)';

  if (value >= 0.75) {
    return 'rgba(196, 181, 253, 0.92)';
  }

  if (value >= 0.55) {
    return 'rgba(124, 214, 197, 0.82)';
  }

  return 'rgba(148, 163, 184, 0.48)';
};

const getTextColorForAlignment = (value: number) => {
  if (value === 1 || value < 0.55) {
    return 'var(--text-primary)';
  }

  return 'var(--bg-deep)';
};

const getStrengthBand = (value: number) => {
  if (value >= 0.75) {
    return 'strong';
  }

  if (value >= 0.55) {
    return 'moderate';
  }

  return 'limited';
};

export function Station05() {
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number; val: number } | null>(null);

  const handleCellClick = (row: number, col: number, val: number) => {
    if (row === col) return;
    setSelectedCell({ row, col, val });
  };

  return (
    <PipelineLayout
      rightPanel={
        <PedagogicalInsightBadge
          urgency="positive"
          label="Evidence Link Matrix"
          observation="Feedback use, revision frequency, and later score recovery form the strongest link set in this case."
          implication="The writing gains are best explained by iterative uptake of instructor feedback, not by raw time alone."
          action="Keep the case on short feedback cycles and continue tying comments to one concrete structural target."
          citation="Mislevy (1994) - Evidence-Centered Design in Assessment"
        />
      }
    >
      <div className="max-w-7xl mx-auto p-6 md:p-8 pb-32">
        <StationHeader id={5} title="Evidence Alignment Matrix" />

        <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 mb-8">
          <GlassCard elevation="high" className="xl:col-span-3 p-6 md:p-8 overflow-x-auto" pedagogicalLabel="The matrix visualises how process signals align with outcome signals inside one verified case.">
            <h3 className="font-navigation text-lg font-medium text-[var(--text-primary)] mb-2">Case Signal Alignment</h3>
            <p className="font-body text-sm text-[var(--text-sec)] leading-relaxed mb-6">
              This is an evidence-alignment matrix for one verified case. The cell values are expert-coded link strengths drawn from the workbook trail, not population correlations.
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
                    <div className="w-32 shrink-0 font-navigation text-xs text-[var(--text-sec)] text-right pr-4 leading-snug" title={variables[rowIndex].label}>
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
                      {getStrengthBand(selectedCell.val)} workbook-coded alignment
                    </span>
                  </div>
                  <p className="mt-3 text-[var(--text-sec)] leading-relaxed italic">
                    &quot;Within this case, {variables[selectedCell.row].label} aligns {selectedCell.val >= 0.75 ? 'strongly' : selectedCell.val >= 0.55 ? 'moderately' : 'in a limited way'} with {variables[selectedCell.col].label}. The interpretation comes from dated revisions, feedback traces, and writing changes rather than population statistics.&quot;
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
              Diagonal cells mark the same construct matched with itself. Off-diagonal cells represent interpreted alignment across behavioural, writing, and outcome signals.
            </div>
          </GlassCard>

          <div className="xl:col-span-2 space-y-6">
            <GlassCard className="p-4 h-[200px]">
              <h4 className="text-[10px] font-navigation uppercase tracking-widest text-[var(--text-sec)] mb-2">Revision Count vs Score</h4>
              <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={140}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis type="number" dataKey="x" name="Revision" hide />
                  <YAxis type="number" dataKey="y" name="Score" domain={[1, 5]} hide />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)' }} />
                  <Scatter name="Checkpoints" data={plot1Data} fill="var(--teal)" />
                </ScatterChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4 h-[200px]">
              <h4 className="text-[10px] font-navigation uppercase tracking-widest text-[var(--text-sec)] mb-2">Feedback Touchpoints vs Score</h4>
              <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={140}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis type="number" dataKey="x" name="Views" hide />
                  <YAxis type="number" dataKey="y" name="Gain" hide />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)' }} />
                  <Scatter name="Checkpoints" data={plot2Data} fill="var(--teal)" />
                </ScatterChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard className="p-4 h-[200px]">
              <h4 className="text-[10px] font-navigation uppercase tracking-widest text-[var(--text-sec)] mb-2">Time on Task vs Word Count</h4>
              <ResponsiveContainer width="100%" height="85%" minWidth={0} minHeight={140}>
                <ScatterChart margin={{ top: 10, right: 10, bottom: 20, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis type="number" dataKey="x" name="Time" hide />
                  <YAxis type="number" dataKey="y" name="Words" hide />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} contentStyle={{ backgroundColor: 'var(--bg-deep)', border: '1px solid var(--border)' }} />
                  <Scatter name="Checkpoints" data={plot3Data} fill="var(--lav)" />
                </ScatterChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </div>

        <StationFooter prevPath="/pipeline/4" nextPath="/pipeline/6" />
      </div>
    </PipelineLayout>
  );
}
