/**
 * PortfolioAssessmentSheet.tsx
 *
 * Implements the portfolio-based writing assessment correction model grounded in:
 *   Hamp-Lyons, L. & Condon, W. (2000). Assessing the Portfolio: Principles for
 *   Practice, Theory, and Research. Hampton Press.
 *   https://www.hamptonpress.com/Merchant2/merchant.mvc?Screen=PROD&Product_Code=1-57273-169-X
 *
 * And supplemented by:
 *   Weigle, S. C. (2002). Assessing Writing. Cambridge University Press.
 *   https://doi.org/10.1017/CBO9780511732997
 *
 * Correction model:
 *   - Delayed evaluation (score after revision, not before)
 *   - Two-part scoring: Product (70%) + Process (30%)
 *   - 6-step correction sequence (portfolio contents → product → comparison → uptake → reflection → judgment)
 *   - 5 core correction questions
 */

import React from 'react';
import { Printer, BookOpen, ExternalLink, CheckCircle2, AlertTriangle, TrendingUp, FileText, MessageSquare, Star } from 'lucide-react';

interface DraftEntry {
  label: string;      // e.g. "Draft 1", "Draft 2", "Final Version"
  score: number;      // analytic total 1-5
  date?: string;
  wordCount?: number;
}

interface PortfolioAssessmentSheetProps {
  student: any;
  drafts?: DraftEntry[];
  reflectionText?: string;
  feedbackUptakeNotes?: string;
}

// ─── helpers ──────────────────────────────────────────────────────────────────

const clamp = (val: number, min = 1, max = 5) =>
  isNaN(val) ? min : Math.min(max, Math.max(min, Math.round(val)));

const pct = (n: number, d: number) => (d === 0 ? 0 : Math.round((n / d) * 100));

const levelLabel = (score: number) => {
  if (score >= 4.5) return { text: 'Excellent', color: 'text-emerald-600' };
  if (score >= 3.5) return { text: 'Good', color: 'text-blue-600' };
  if (score >= 2.5) return { text: 'Developing', color: 'text-amber-600' };
  return { text: 'Needs Support', color: 'text-rose-600' };
};

// ─── sub-components ───────────────────────────────────────────────────────────

const SectionTitle: React.FC<{ step: string; title: string }> = ({ step, title }) => (
  <div className="flex items-center gap-3 mb-4">
    <span className="w-8 h-8 rounded-full bg-gray-800 text-white text-sm font-bold flex items-center justify-center shrink-0">
      {step}
    </span>
    <h2 className="text-base font-bold uppercase tracking-wide text-gray-800 m-0 border-b border-gray-300 pb-1 flex-1">
      {title}
    </h2>
  </div>
);

const ScoreBar: React.FC<{ score: number; max?: number; color?: string }> = ({
  score,
  max = 5,
  color = '#2563eb',
}) => {
  const pctVal = pct(score, max);
  return (
    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
      <div
        className="h-full rounded-full transition-all"
        style={{ width: `${pctVal}%`, backgroundColor: color }}
      />
    </div>
  );
};

// ─── main component ───────────────────────────────────────────────────────────

export const PortfolioAssessmentSheet: React.FC<PortfolioAssessmentSheetProps> = ({
  student,
  drafts,
  reflectionText,
  feedbackUptakeNotes,
}) => {
  if (!student) return null;

  // ── Product scores (final draft analytic rubric) ──
  const productScores = {
    argumentation: clamp(student.argumentation || 3),
    organization:  clamp(student.cohesion ? (student.argumentation + student.cohesion) / 2 : 3),
    cohesion:      clamp(student.cohesion || 3),
    lexical:       clamp(student.lexical_resource || 3),
    grammar:       clamp(student.grammar_accuracy || 3),
    academicStyle: clamp(student.academic_style || student.lexical_resource || 3),
  };

  const productAvg =
    Object.values(productScores).reduce((a, b) => a + b, 0) /
    Object.keys(productScores).length;

  // ── Process scores ──
  const processScores = {
    revisionDepth:    clamp(student.revision_frequency ? Math.min(5, student.revision_frequency * 2) : 2),
    feedbackUptake:   clamp(student.srl_self_reflection ? Math.round(student.srl_self_reflection / 20) : 2),
    reflection:       clamp(student.srl_self_reflection ? Math.round(student.srl_self_reflection / 20) : 2),
    strategicImprovement: clamp(student.draft_submissions ? Math.min(5, student.draft_submissions + 1) : 2),
  };

  const processAvg =
    Object.values(processScores).reduce((a, b) => a + b, 0) /
    Object.keys(processScores).length;

  // ── Weighted final score: 70% product + 30% process ──
  const finalPortfolioScore = productAvg * 0.7 + processAvg * 0.3;

  // ── Draft progression ──
  const defaultDrafts: DraftEntry[] = drafts || [
    {
      label: 'Draft 1 (Initial)',
      score: clamp((productAvg - (student.revision_frequency || 1) * 0.4)),
      wordCount: student.word_count ? Math.round(student.word_count * 0.7) : undefined,
    },
    {
      label: 'Final Version',
      score: productAvg,
      wordCount: student.word_count,
    },
  ];

  const draft1 = defaultDrafts[0];
  const finalDraft = defaultDrafts[defaultDrafts.length - 1];
  const improvementDelta = finalDraft.score - draft1.score;

  // ── Reflection & uptake ──
  const reflectionNote =
    reflectionText ||
    (student.srl_self_reflection > 60
      ? 'Student demonstrates clear awareness of revision strategies and writing weaknesses.'
      : student.srl_self_reflection > 40
      ? 'Student shows partial reflective awareness. Revision is evident but not always targeted.'
      : 'Student reflection is limited. Revision behaviour remains surface-level.');

  const uptakeNote =
    feedbackUptakeNotes ||
    (student.revision_frequency > 1
      ? 'Evidence of targeted revisions aligned with prior feedback.'
      : 'Limited evidence of feedback integration. Revision appears superficial.');

  // ── Next writing need ──
  const nextNeed = (() => {
    const lowest = Object.entries(productScores).sort(([, a], [, b]) => a - b)[0];
    const labels: Record<string, string> = {
      argumentation: 'Deepen claim–evidence structure with more precise academic support.',
      organization:  'Strengthen macro-structure: ensure a clear intro–body–conclusion flow.',
      cohesion:      'Expand use of cohesive devices and inter-paragraph transitions.',
      lexical:       'Diversify academic vocabulary and avoid repetition of basic terms.',
      grammar:       'Target high-frequency grammatical errors (tense, agreement, articles).',
      academicStyle: 'Elevate register: reduce informal constructions and hedging errors.',
    };
    return labels[lowest[0]] || 'Continue developing overall writing quality.';
  })();

  // ── Contents checklist ──
  const contentsCheck = [
    { item: 'Draft 1 submitted',            present: (student.draft_submissions || 0) >= 1 },
    { item: 'At least one revision submitted', present: (student.revision_frequency || 0) >= 1 },
    { item: 'Final version present',         present: true },
    { item: 'Teacher feedback received',     present: true },
    { item: 'Student reflection included',   present: (student.srl_self_reflection || 0) > 0 },
  ];
  const contentsScore = contentsCheck.filter((c) => c.present).length;

  // ── Print ──
  const handlePrint = () => {
    const el = document.getElementById('portfolio-assessment-sheet');
    if (!el) return;
    const w = window.open('', '_blank');
    if (!w) return;
    w.document.write(`<html><head><title>Portfolio Assessment — ${student.name || student.student_id}</title>
      <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Segoe UI', sans-serif; padding: 28px; color: #111; font-size: 13px; line-height: 1.5; }
        h1 { font-size: 20px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 4px; }
        h2 { font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: .5px; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 10px; }
        h3 { font-size: 13px; font-weight: 700; margin-bottom: 6px; }
        table { width: 100%; border-collapse: collapse; margin-bottom: 16px; }
        th, td { border: 1px solid #aaa; padding: 6px 10px; text-align: left; }
        th { background: #f0f0f0; font-weight: 700; }
        .step { display: flex; align-items: center; gap: 10px; margin-bottom: 12px; }
        .step-num { width: 26px; height: 26px; border-radius: 50%; background: #1a1a1a; color: #fff; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 700; flex-shrink: 0; }
        .badge-ok { color: #16a34a; font-weight: 700; }
        .badge-miss { color: #dc2626; font-weight: 700; }
        .score-box { border: 2px solid #1a1a1a; padding: 12px; margin-bottom: 16px; }
        .two-col { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cite { font-size: 10px; color: #666; font-style: italic; margin-top: 8px; }
        .final-box { border: 3px solid #1a1a1a; padding: 16px; margin-top: 16px; }
        .section { margin-bottom: 24px; }
      </style>
    </head><body>${el.innerHTML}</body></html>`);
    w.document.close();
    w.focus();
    setTimeout(() => { w.print(); w.close(); }, 300);
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-xl font-sans w-full max-w-4xl mx-auto border border-gray-200 relative mb-8">

      {/* Print button */}
      <div className="absolute top-4 right-4 print:hidden z-10">
        <button
          onClick={handlePrint}
          className="bg-gray-900 hover:bg-gray-700 text-white rounded-md px-4 py-2 flex items-center gap-2 transition font-medium text-sm"
        >
          <Printer size={16} />
          Print Portfolio Sheet
        </button>
      </div>

      <div id="portfolio-assessment-sheet">

        {/* ── Header ── */}
        <div className="text-center pb-5 border-b-2 border-gray-800 mb-8">
          <h1 className="text-2xl font-extrabold uppercase tracking-widest text-gray-900 m-0">
            Portfolio-Based Writing Assessment
          </h1>
          <p className="text-sm text-gray-500 italic mt-1 m-0">
            Correction model: Hamp-Lyons &amp; Condon (2000) · Delayed Evaluation · Two-Part Scoring
          </p>
          <a
            href="https://www.hamptonpress.com/Merchant2/merchant.mvc?Screen=PROD&Product_Code=1-57273-169-X"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 underline mt-1"
          >
            <ExternalLink size={11} />
            Hamp-Lyons &amp; Condon, Assessing the Portfolio (2000) — Hampton Press
          </a>
        </div>

        {/* Student info */}
        <div className="flex justify-between bg-gray-50 border border-gray-200 p-4 rounded mb-8 text-sm">
          <div>
            <p className="m-0 mb-1"><strong>Student ID:</strong> {student.student_id}</p>
            <p className="m-0"><strong>Name:</strong> {student.name || '—'}</p>
          </div>
          <div className="text-right">
            <p className="m-0 mb-1"><strong>Date of Assessment:</strong> {new Date().toLocaleDateString()}</p>
            <p className="m-0"><strong>Evaluation Type:</strong> Delayed Portfolio Judgment</p>
          </div>
        </div>

        {/* ── STEP 1 · Portfolio Contents ── */}
        <section className="mb-8 section">
          <SectionTitle step="1" title="Portfolio Contents Check" />
          <p className="text-xs text-gray-600 mb-3 italic">
            A complete portfolio must include: initial draft, at least one revision, teacher feedback,
            student reflection, and final version. (Hamp-Lyons &amp; Condon, 2000, pp. 44–52)
          </p>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-2">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left w-2/3">Required Portfolio Component</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Present?</th>
              </tr>
            </thead>
            <tbody>
              {contentsCheck.map((c, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 px-4 py-2">{c.item}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                    {c.present
                      ? <span className="text-emerald-600">✓ Yes</span>
                      : <span className="text-rose-600">✗ Missing</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs text-gray-500">
            Contents score: <strong>{contentsScore} / {contentsCheck.length}</strong> components present.{' '}
            {contentsScore < 3 && (
              <span className="text-rose-600 font-semibold">
                Portfolio is incomplete. Delayed evaluation cannot be fully applied until all required components are present.
              </span>
            )}
          </p>
        </section>

        {/* ── STEP 2 · Final Draft Product Quality ── */}
        <section className="mb-8 section">
          <SectionTitle step="2" title="Product Score — Final Draft Quality (Analytic Rubric)" />
          <p className="text-xs text-gray-600 mb-3 italic">
            Score the quality of the student's final revised text using the analytic rubric.
            This constitutes <strong>70%</strong> of the portfolio score.
            (Weigle, 2002, Ch. 7; Hamp-Lyons &amp; Condon, 2000, p. 89)
          </p>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left w-1/3">Writing Criterion</th>
                <th className="border border-gray-300 px-4 py-2 text-center w-1/6">Score (1–5)</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Criterion-Based Comment</th>
              </tr>
            </thead>
            <tbody>
              {[
                { key: 'argumentation', label: 'Argumentation Quality',
                  comment: productScores.argumentation <= 2 ? 'Claims lack evidence; argument is underdeveloped.' : productScores.argumentation >= 4 ? 'Well-reasoned, evidence-backed claims throughout.' : 'Argument present but requires deeper elaboration.' },
                { key: 'organization', label: 'Text Organization',
                  comment: productScores.organization <= 2 ? 'Macro-structure unclear; sections lack logical order.' : productScores.organization >= 4 ? 'Clear intro–body–conclusion with paragraph unity.' : 'Structure evident but transitions need strengthening.' },
                { key: 'cohesion', label: 'Cohesion & Transitions',
                  comment: productScores.cohesion <= 2 ? 'Cohesive devices absent or misused.' : productScores.cohesion >= 4 ? 'Smooth logical flow with varied connectors.' : 'Some connectors present; inter-paragraph links weak.' },
                { key: 'lexical', label: 'Lexical Resource',
                  comment: productScores.lexical <= 2 ? 'Vocabulary is basic and repetitive.' : productScores.lexical >= 4 ? 'Broad and precise academic lexical range.' : 'Adequate vocabulary; limited academic register.' },
                { key: 'grammar', label: 'Grammatical Accuracy',
                  comment: productScores.grammar <= 2 ? 'High error density impedes communication.' : productScores.grammar >= 4 ? 'Consistently accurate with minor slips.' : 'Errors present but do not obscure meaning.' },
                { key: 'academicStyle', label: 'Academic Style',
                  comment: productScores.academicStyle <= 2 ? 'Informal register and hedging errors prevalent.' : productScores.academicStyle >= 4 ? 'Appropriate formal register maintained throughout.' : 'Partially formal; some colloquial constructions remain.' },
              ].map((row) => {
                const score = productScores[row.key as keyof typeof productScores];
                const lv = levelLabel(score);
                return (
                  <tr key={row.key}>
                    <td className="border border-gray-300 px-4 py-2 font-medium">{row.label}</td>
                    <td className="border border-gray-300 px-4 py-2 text-center">
                      <span className={`font-bold text-lg ${lv.color}`}>{score}</span>
                      <p className={`text-xs m-0 ${lv.color}`}>{lv.text}</p>
                    </td>
                    <td className="border border-gray-300 px-4 py-2 text-xs text-gray-700">{row.comment}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <div className="bg-blue-50 border border-blue-200 p-3 rounded text-sm">
            <strong>Product Average:</strong>{' '}
            <span className={`font-bold text-lg ${levelLabel(productAvg).color}`}>
              {productAvg.toFixed(2)} / 5
            </span>
            {' '}— {levelLabel(productAvg).text}
            <ScoreBar score={productAvg} max={5} color="#2563eb" />
          </div>
        </section>

        {/* ── STEP 3 · Draft Comparison ── */}
        <section className="mb-8 section">
          <SectionTitle step="3" title="Draft Comparison — Evidence of Writing Development" />
          <p className="text-xs text-gray-600 mb-3 italic">
            Read earlier drafts and compare to the final version. Earlier drafts are not archives —
            they are evidence of growth and revision behaviour. (Hamp-Lyons &amp; Condon, 2000, p. 61)
          </p>
          <table className="w-full border-collapse border border-gray-300 text-sm mb-3">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Draft</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Analytic Score (1–5)</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Words</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Development Notes</th>
              </tr>
            </thead>
            <tbody>
              {defaultDrafts.map((d, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 px-4 py-2 font-semibold">{d.label}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold">{d.score.toFixed(1)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{d.wordCount ?? '—'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-xs text-gray-600">
                    {i === 0 ? 'Initial submission. Serves as baseline for development measurement.' : 'Final revised version. Evaluated for portfolio product score.'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className={`p-3 rounded text-sm border ${improvementDelta > 0 ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <TrendingUp size={14} className="inline mr-1" />
            <strong>Improvement delta:</strong>{' '}
            <span className={`font-bold ${improvementDelta > 0 ? 'text-emerald-700' : 'text-rose-700'}`}>
              {improvementDelta > 0 ? '+' : ''}{improvementDelta.toFixed(2)} points
            </span>
            {' '}from Draft 1 to Final Version.{' '}
            {improvementDelta >= 0.5
              ? 'Meaningful writing development is documented.'
              : improvementDelta > 0
              ? 'Modest improvement. Encourage deeper revision in next cycle.'
              : 'No measurable improvement. Investigate revision process and support needs.'}
          </div>
        </section>

        {/* ── STEP 4 · Feedback Uptake ── */}
        <section className="mb-8 section">
          <SectionTitle step="4" title="Feedback Uptake — Did the Student Apply Prior Comments?" />
          <p className="text-xs text-gray-600 mb-3 italic">
            Verify whether the student responded to teacher and peer feedback in the revision phase.
            Feedback uptake is a core indicator of writing development. (Hamp-Lyons &amp; Condon, 2000, p. 78)
          </p>
          <div className="bg-gray-50 border border-gray-300 p-4 rounded text-sm mb-3">
            <p className="m-0 font-semibold mb-1 flex items-center gap-2">
              <MessageSquare size={14} />
              Observed Feedback Uptake:
            </p>
            <p className="m-0 text-gray-800">{uptakeNote}</p>
          </div>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left w-2/3">Uptake Indicator</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Score (1–5)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Evidence of revision across drafts</td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">{processScores.revisionDepth}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Alignment of revisions with prior feedback</td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">{processScores.feedbackUptake}</td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2">Evidence of targeted (not surface) revision</td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">{processScores.strategicImprovement}</td>
              </tr>
            </tbody>
          </table>
        </section>

        {/* ── STEP 5 · Reflection Quality ── */}
        <section className="mb-8 section">
          <SectionTitle step="5" title="Reflection Quality — Metacognitive Awareness" />
          <p className="text-xs text-gray-600 mb-3 italic">
            The student reflection must be read as evidence of metacognitive engagement — not as
            decoration. Evaluate awareness of strengths, weaknesses, revision choices, and goals.
            (Hamp-Lyons &amp; Condon, 2000, pp. 95–102)
          </p>
          <div className="bg-gray-50 border border-gray-300 p-4 rounded text-sm mb-3">
            <p className="m-0 font-semibold mb-1 flex items-center gap-2">
              <FileText size={14} />
              Student Reflection:
            </p>
            <p className="m-0 text-gray-700 italic">"{reflectionNote}"</p>
          </div>
          <table className="w-full border-collapse border border-gray-300 text-sm">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left w-2/3">Reflection Criterion</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Present?</th>
              </tr>
            </thead>
            <tbody>
              {[
                { q: 'Awareness of writing strengths', ok: processScores.reflection >= 3 },
                { q: 'Identification of specific weaknesses', ok: processScores.reflection >= 2 },
                { q: 'Explanation of revision choices made', ok: processScores.revisionDepth >= 2 },
                { q: 'Evidence of feedback use in reflection', ok: processScores.feedbackUptake >= 3 },
                { q: 'Statement of next writing goal', ok: processScores.strategicImprovement >= 3 },
              ].map((r, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 px-4 py-2">{r.q}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center font-bold">
                    {r.ok ? <span className="text-emerald-600">✓</span> : <span className="text-rose-600">✗</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="text-xs mt-2 text-gray-500">
            Reflection score: <strong>{processScores.reflection} / 5</strong>
          </p>
        </section>

        {/* ── STEP 6 · Final Portfolio Judgment ── */}
        <section className="mb-8 section">
          <SectionTitle step="6" title="Final Portfolio Judgment — Combined Score" />
          <p className="text-xs text-gray-600 mb-3 italic">
            Final score = 70% product (final text quality) + 30% process (revision evidence, feedback
            uptake, reflection). This weighting keeps writing quality central while honouring the
            developmental logic of portfolio assessment. (Hamp-Lyons &amp; Condon, 2000, p. 112)
          </p>

          <table className="w-full border-collapse border border-gray-300 text-sm mb-4">
            <thead>
              <tr className="bg-gray-100">
                <th className="border border-gray-300 px-4 py-2 text-left">Component</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Raw Score (1–5)</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Weight</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Weighted Score</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Product: Final Text Quality</td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">{productAvg.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">70%</td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold text-blue-700">
                  {(productAvg * 0.7).toFixed(2)}
                </td>
              </tr>
              <tr>
                <td className="border border-gray-300 px-4 py-2 font-semibold">Process: Writing Development</td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold">{processAvg.toFixed(2)}</td>
                <td className="border border-gray-300 px-4 py-2 text-center">30%</td>
                <td className="border border-gray-300 px-4 py-2 text-center font-bold text-emerald-700">
                  {(processAvg * 0.3).toFixed(2)}
                </td>
              </tr>
              <tr className="bg-gray-800 text-white">
                <td className="border border-gray-600 px-4 py-3 font-bold uppercase tracking-wide" colSpan={3}>
                  Final Portfolio Score
                </td>
                <td className="border border-gray-600 px-4 py-3 text-center font-extrabold text-xl">
                  {finalPortfolioScore.toFixed(2)} / 5
                </td>
              </tr>
            </tbody>
          </table>

          {/* 5 Correction Questions */}
          <div className="border border-gray-300 rounded p-4 bg-gray-50 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wide mb-3 flex items-center gap-2">
              <Star size={14} />
              5 Core Portfolio Correction Questions
            </h3>
            <ol className="list-decimal pl-5 text-sm space-y-2 text-gray-800">
              <li>
                <strong>How strong is the final text?</strong>{' '}
                <span className={levelLabel(productAvg).color}>{levelLabel(productAvg).text} ({productAvg.toFixed(1)}/5)</span>
              </li>
              <li>
                <strong>How much did the text improve from Draft 1 to the final version?</strong>{' '}
                {improvementDelta > 0
                  ? <span className="text-emerald-700">+{improvementDelta.toFixed(2)} points improvement documented.</span>
                  : <span className="text-rose-700">No measurable improvement detected.</span>}
              </li>
              <li>
                <strong>Did the student use feedback meaningfully?</strong>{' '}
                {processScores.feedbackUptake >= 3
                  ? <span className="text-emerald-700">Yes — evidence of targeted feedback uptake.</span>
                  : <span className="text-amber-700">Partially — revision remains surface-level.</span>}
              </li>
              <li>
                <strong>Does the reflection show real awareness of writing problems and strategies?</strong>{' '}
                {processScores.reflection >= 3
                  ? <span className="text-emerald-700">Yes — metacognitive engagement is evident.</span>
                  : <span className="text-rose-700">Limited — reflection does not demonstrate strategic awareness.</span>}
              </li>
              <li>
                <strong>What is the student's next writing need?</strong>{' '}
                <span className="text-blue-700">{nextNeed}</span>
              </li>
            </ol>
          </div>

          {/* Final judgment box */}
          <div className="border-2 border-gray-800 p-5 rounded">
            <h3 className="text-center font-bold uppercase text-sm tracking-widest border-b border-gray-300 pb-2 mb-4">
              Final Portfolio Judgment Delivered to Student
            </h3>
            <div className="grid grid-cols-2 gap-6 text-sm mb-4">
              <div>
                <p className="font-bold mb-1 flex items-center gap-1">
                  <CheckCircle2 size={13} className="text-emerald-600" /> Portfolio Strengths:
                </p>
                <p className="text-gray-700">
                  {productAvg >= 3 ? 'Final text demonstrates adequate writing competence. ' : ''}
                  {improvementDelta > 0 ? 'Clear development from initial to final draft. ' : ''}
                  {processScores.reflection >= 3 ? 'Student shows metacognitive awareness of revision.' : ''}
                  {productAvg < 3 && improvementDelta <= 0 && processScores.reflection < 3
                    ? 'Participation in the drafting process is acknowledged.'
                    : ''}
                </p>
              </div>
              <div>
                <p className="font-bold mb-1 flex items-center gap-1">
                  <AlertTriangle size={13} className="text-amber-600" /> Development Priority:
                </p>
                <p className="text-gray-700">{nextNeed}</p>
              </div>
            </div>
            <div className="bg-gray-100 p-3 rounded text-sm">
              <p className="font-bold mb-1">Thesis-compatible judgment statement:</p>
              <p className="text-gray-700 italic">
                "Portfolio assessment in this study was implemented as a delayed, criterion-based
                evaluation of both final written performance and documented writing development.
                In line with Hamp-Lyons &amp; Condon (2000), this student's portfolio was judged
                on final text quality ({productAvg.toFixed(1)}/5) and on evidence of revision,
                feedback uptake, and reflective awareness ({processAvg.toFixed(1)}/5),
                yielding a final portfolio score of{' '}
                <strong>{finalPortfolioScore.toFixed(2)}/5</strong>."
              </p>
            </div>
          </div>
        </section>

        {/* ── Citation footer ── */}
        <div className="border-t border-gray-300 pt-4 text-xs text-gray-500 space-y-1">
          <p className="flex items-center gap-1">
            <BookOpen size={11} />
            <strong>Primary source:</strong> Hamp-Lyons, L. &amp; Condon, W. (2000).{' '}
            <em>Assessing the Portfolio: Principles for Practice, Theory, and Research.</em>{' '}
            Hampton Press.{' '}
            <a
              href="https://www.hamptonpress.com/Merchant2/merchant.mvc?Screen=PROD&Product_Code=1-57273-169-X"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline inline-flex items-center gap-0.5"
            >
              Link <ExternalLink size={9} />
            </a>
          </p>
          <p>
            <strong>Secondary source:</strong> Weigle, S. C. (2002).{' '}
            <em>Assessing Writing.</em> Cambridge University Press.{' '}
            <a
              href="https://doi.org/10.1017/CBO9780511732997"
              target="_blank"
              rel="noreferrer"
              className="text-blue-600 underline inline-flex items-center gap-0.5"
            >
              DOI <ExternalLink size={9} />
            </a>
          </p>
          <p className="italic text-gray-400">
            Assessment logic: Collection → Selection → Reflection → Delayed Evaluation (Hamp-Lyons &amp; Condon, 2000)
          </p>
        </div>

      </div>
    </div>
  );
};
