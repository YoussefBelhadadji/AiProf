import React from 'react';
import { Printer, ExternalLink, TrendingUp } from 'lucide-react';

interface AdaptiveFeedbackSheetProps {
  student: any;
}

export const AdaptiveFeedbackSheet: React.FC<AdaptiveFeedbackSheetProps> = ({ student }) => {
  if (!student) return null;

  // Helpers to get Phase 1 score (1-5) safely
  const getScore = (val: number, maxFallback: number = 3) => {
    if (!val || isNaN(val)) return maxFallback;
    return Math.min(5, Math.max(1, Math.round(val)));
  };

  const scores = {
    grammar: getScore(student.grammar_accuracy || 3),
    lexical: getScore(student.lexical_resource || 3),
    organization: getScore((student.argumentation + student.cohesion) / 2 || 3),
    cohesion: getScore(student.cohesion || 3),
    argumentation: getScore(student.argumentation || 3),
  };

  const overallScore = Object.values(scores).reduce((a, b) => a + b, 0) / 5;

  const getInterpretation = (score: number) => {
    if (score >= 4) return 'Strong competence';
    if (score >= 3) return 'Moderate performance';
    return 'Area requiring adaptive support';
  };

  // Phase 2 variables
  const bData = {
    logins: student.platform_logins || 10,
    resourceAccess: student.resource_access || 8,
    drafts: student.draft_submissions || 2,
    revisions: student.revision_frequency || 1,
    engagement: student.srl_self_reflection > 60 ? 'High' : (student.srl_self_reflection > 40 ? 'Medium' : 'Low')
  };

  const getEngagementInterp = (engagement: string) => {
    switch (engagement) {
      case 'High': return 'Active learning behaviour';
      case 'Medium': return 'Partial participation';
      default: return 'Potential self-regulation difficulty';
    }
  };

  const printSheet = () => {
    const printContent = document.getElementById('adaptive-feedback-sheet')?.innerHTML;
    if (printContent) {
      const w = window.open('', '_blank');
      if (w) {
        w.document.write(`
          <html>
            <head>
              <title>Adaptive Feedback Sheet - ${student.name}</title>
              <style>
                body { font-family: sans-serif; padding: 20px; line-height: 1.5; color: #111; }
                table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
                th, tr, td { border: 1px solid #333; padding: 8px; text-align: left; }
                th { background-color: #f0f0f0; }
                .text-center { text-align: center; }
                .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
                .header h1 { margin: 0; font-size: 24px; text-transform: uppercase; }
                .student-info { display: flex; justify-content: space-between; background: #fafafa; padding: 15px; border: 1px solid #ddd; margin-bottom: 20px; }
                .section-title { background: #222; color: #fff; padding: 5px 10px; margin-bottom: 10px; font-size: 16px; }
                .overall { background: #eef2ff; padding: 15px; border: 1px solid #b7c4ff; margin-bottom: 20px; }
                .final-feedback { border: 2px solid #000; padding: 15px; margin-top: 20px; }
                .phase3-rules { padding-left: 20px; margin-bottom: 20px; border-left: 4px solid #0056b3; background: #fafafa; padding-top: 10px; padding-bottom: 10px; }
                li { margin-bottom: 4px; }
              </style>
            </head>
            <body>
              ${printContent}
            </body>
          </html>
        `);
        w.document.close();
        w.focus();
        setTimeout(() => {
          w.print();
          w.close();
        }, 250);
      }
    }
  };

  return (
    <div className="bg-white text-black p-6 rounded-lg shadow-xl font-sans w-full max-w-4xl mx-auto border border-gray-200 relative mb-8">
      <div className="absolute top-4 right-4 print:hidden z-10">
        <button 
          onClick={printSheet}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-md px-4 py-2 flex items-center gap-2 transition font-medium"
        >
          <Printer size={18} />
          Print Feedback Sheet
        </button>
      </div>

      <div id="adaptive-feedback-sheet">
        <div className="header mb-8 text-center pb-6 border-b-2 border-gray-800">
          <h1 className="text-2xl font-bold uppercase tracking-wide text-gray-900 m-0">Adaptive Blended Assessment Feedback Sheet</h1>
          <p className="text-gray-600 italic mt-2 m-0">(Used during the writing intervention session)</p>
        </div>
        
        <div className="student-info flex justify-between bg-gray-50 border border-gray-300 p-4 rounded-md mb-8">
          <div>
            <p className="m-1"><strong>Student ID:</strong> {student.student_id}</p>
            <p className="m-1"><strong>Name:</strong> {student.name || 'Sample Student'}</p>
          </div>
          <div>
            <p className="m-1"><strong>Date:</strong> {student.report_date || new Date().toLocaleDateString()}</p>
            <p className="m-1"><strong>Writing Task:</strong> Academic Essay Revision</p>
          </div>
        </div>

        {/* PHASE 1 */}
        <section className="mb-8">
          <h2 className="section-title text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-4">Phase 1 — Writing Performance Diagnosis</h2>
          <p className="mb-2 text-sm text-gray-700">Evaluate the essay using the analytic rubric.</p>
          
          <table className="w-full border-collapse border border-gray-400 mb-4 text-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border border-gray-400 px-4 py-2 text-left w-1/3">Writing Variable</th>
                <th className="border border-gray-400 px-4 py-2 text-center w-1/4">Score (1–5)</th>
                <th className="border border-gray-400 px-4 py-2 text-left">Diagnostic Notes</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Grammar Accuracy</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-bold text-blue-700">{scores.grammar}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{scores.grammar <= 2 ? 'High error density observed' : 'Adequate control'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Lexical Range</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-bold text-blue-700">{scores.lexical}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{scores.lexical <= 2 ? 'Limited academic lexis' : 'Good vocabulary range'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Text Organization</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-bold text-blue-700">{scores.organization}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{scores.organization <= 2 ? 'Weak structural planning' : 'Clear macro-structure'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Cohesion Devices</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-bold text-blue-700">{scores.cohesion}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{scores.cohesion <= 2 ? 'Lacking connectors' : 'Smooth logical flow'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Argumentation Quality</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-bold text-blue-700">{scores.argumentation}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{scores.argumentation <= 2 ? 'Weak claim/evidence link' : 'Well-reasoned arguments'}</td>
              </tr>
            </tbody>
          </table>

          <div className="overall bg-blue-50 p-4 border border-blue-200 mb-2">
            <p className="m-0 text-md font-bold text-gray-900">Overall Writing Score = Average of all categories: <span className="text-blue-700">{overallScore.toFixed(1)} / 5</span></p>
            <p className="m-0 mt-2 text-md text-gray-800"><strong>Interpretation:</strong> {getInterpretation(overallScore)}</p>
          </div>
          <p className="text-xs text-gray-500 italic mt-2">Analytic scoring enables the identification of specific linguistic and rhetorical weaknesses, which is fundamental for diagnostic writing assessment according to Sara Cushing Weigle.</p>
        </section>

        {/* PHASE 2 */}
        <section className="mb-8">
          <h2 className="section-title text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-4">Phase 2 — Learning Analytics Behaviour Indicators</h2>
          <p className="mb-2 text-sm text-gray-700">Extract behavioural data from Moodle.</p>
          
          <table className="w-full border-collapse border border-gray-400 mb-4 text-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border border-gray-400 px-4 py-2 text-left w-2/5">Indicator</th>
                <th className="border border-gray-400 px-4 py-2 text-center">Observed Value</th>
                <th className="border border-gray-400 px-4 py-2 text-left">Interpretation</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Platform Logins</td>
                <td className="border border-gray-400 px-4 py-2 text-center text-gray-900">{bData.logins}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{bData.logins > 15 ? 'Frequent access' : 'Infrequent log-ins'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Resource Access</td>
                <td className="border border-gray-400 px-4 py-2 text-center text-gray-900">{bData.resourceAccess}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{bData.resourceAccess > 5 ? 'High resource use' : 'Low resource use'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Draft Submissions</td>
                <td className="border border-gray-400 px-4 py-2 text-center text-gray-900">{bData.drafts}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{bData.drafts > 1 ? 'Multiple drafts' : 'Single draft'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Revision Frequency</td>
                <td className="border border-gray-400 px-4 py-2 text-center text-gray-900">{bData.revisions}</td>
                <td className="border border-gray-400 px-4 py-2 text-gray-700">{bData.revisions > 1 ? 'Iterative writer' : 'Linear writer'}</td>
              </tr>
              <tr>
                <td className="border border-gray-400 px-4 py-2 font-medium">Feedback Engagement</td>
                <td className="border border-gray-400 px-4 py-2 text-center font-bold">{bData.engagement}</td>
                <td className="border border-gray-400 px-4 py-2 font-medium text-blue-700">{getEngagementInterp(bData.engagement)}</td>
              </tr>
            </tbody>
          </table>
          <p className="text-xs text-gray-500 italic mt-2">Behavioural indicators provide insight into learners' participation patterns and self-regulated learning processes.</p>
        </section>

        {/* PHASE 3 */}
        <section className="mb-4">
          <h2 className="section-title text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-4">Phase 3 — Adaptive Instructional Feedback</h2>
          <p className="mb-4 text-sm text-gray-700">Using the results of Phase 1 and Phase 2, provide targeted adaptive feedback.</p>

          <div className="phase3-rules border-l-4 border-blue-600 bg-gray-50 p-4 text-sm text-gray-900 mb-6">
            <h3 className="font-bold border-b pb-1 mb-2 text-md mt-0">A. Performance-Based Feedback</h3>
            <ul className="mb-4 pl-4 pt-1">
              {scores.grammar <= 2 && <li><strong>Grammar ≤ 2:</strong> explanation of grammar rule + focused practice</li>}
              {scores.cohesion <= 2 && <li><strong>Cohesion ≤ 2:</strong> modelling of connectors and transitions</li>}
              {scores.organization <= 2 && <li><strong>Organization ≤ 2:</strong> paragraph structure scaffold</li>}
              {scores.argumentation <= 2 && <li><strong>Argumentation ≤ 2:</strong> claim–evidence structure guidance</li>}
              {scores.grammar > 2 && scores.cohesion > 2 && scores.organization > 2 && scores.argumentation > 2 && <li>No critical performance gaps. Advance to higher-order style revision.</li>}
            </ul>

            <h3 className="font-bold border-b pb-1 mb-2 text-md">B. Engagement-Based Feedback</h3>
            <ul className="mb-4 pl-4 pt-1">
              {bData.logins < 5 && <li><strong>Low platform access:</strong> motivational reminder and task clarification</li>}
              {bData.resourceAccess < 3 && <li><strong>Limited resource consultation:</strong> recommend specific materials</li>}
              {bData.drafts === 0 && <li><strong>No draft submission:</strong> enforce staged drafting</li>}
              {(bData.logins >= 5 && bData.resourceAccess >= 3 && bData.drafts > 0) && <li>Maintains healthy engagement and resource exploration.</li>}
            </ul>

            <h3 className="font-bold border-b pb-1 mb-2 text-md">C. Revision-Based Feedback</h3>
            <ul className="mb-0 pl-4 pt-1">
              {bData.revisions === 0 && <li><strong>No revision:</strong> guided revision checklist</li>}
              {bData.revisions > 0 && bData.engagement === 'Medium' && <li><strong>Surface corrections only:</strong> encourage meaning-level revision</li>}
              {bData.revisions > 0 && bData.engagement === 'High' && <li><strong>Active revision:</strong> provide advanced writing challenge</li>}
            </ul>
          </div>
          
          <div className="final-feedback border-2 border-gray-800 p-6 mt-4">
            <h3 className="font-bold uppercase text-lg mb-4 text-center border-b-2 border-gray-300 pb-2">Final Adaptive Feedback Delivered to the Student</h3>
            <div className="grid grid-cols-2 gap-6 text-sm">
              <div>
                <p className="font-bold text-gray-900 m-0 mb-1">Strengths identified:</p>
                <p className="m-0 text-gray-800">{overallScore >= 3 ? 'Engagement with the core task and academic tone.' : 'Demonstrated participation in the initial drafting phase.'}</p>
              </div>
              <div>
                <p className="font-bold text-gray-900 m-0 mb-1">Areas for improvement:</p>
                <p className="m-0 text-gray-800">{scores.argumentation <= 2 ? 'Argumentative structure' : scores.grammar <= 2 ? 'Grammatical consistency' : 'Refinement of transition devices'}.</p>
              </div>
            </div>
            
            <div className="mt-6 border-t pt-4">
               <p className="font-bold text-gray-900 m-0 mb-1">Specific adaptive tasks assigned:</p>
               <p className="m-0 text-gray-800 bg-gray-100 p-3 italic">
                 {bData.revisions === 0 
                  ? 'Start by running through the guided revision checklist before submitting.' 
                  : (scores.organization <= 2 
                    ? 'Restructure the second paragraph using a clear claim-evidence scaffold.' 
                    : 'Review the explicit feedback in Moodle and improve meaning-level clarity.')}
               </p>
            </div>
            <div className="mt-6 border-t pt-4">
               <p className="font-bold text-gray-900 m-0 mb-1">Next writing goal:</p>
               <p className="m-0 text-gray-800">Ensure claims are fully elaborated with valid academic evidence to increase the overall progression.</p>
            </div>
          </div>

          <p className="text-xs text-gray-600 mt-6 italic text-center">Process-oriented revision is widely recognized as a key mechanism in writing development within second language pedagogy (Hyland).</p>
        </section>

        {/* PHASE 4 — PORTFOLIO ASSESSMENT (Hamp-Lyons & Condon, 2000) */}
        <section className="mb-4">
          <h2 className="section-title text-lg font-bold bg-gray-800 text-white px-3 py-1 mb-4">
            Phase 4 — Portfolio Assessment &amp; Correction
            <span className="text-xs font-normal ml-2 opacity-70">(Hamp-Lyons &amp; Condon, 2000)</span>
          </h2>

          <div className="bg-blue-50 border border-blue-200 p-3 rounded mb-4 text-xs text-blue-800">
            <strong>Delayed Evaluation Principle:</strong> This phase applies only after the student has
            submitted a revised final version. The portfolio is judged as a body of evidence — not as a
            single isolated text — covering collection, selection, reflection, and delayed scoring.{' '}
            <a
              href="https://www.hamptonpress.com/Merchant2/merchant.mvc?Screen=PROD&Product_Code=1-57273-169-X"
              target="_blank"
              rel="noreferrer"
              className="underline text-blue-600 inline-flex items-center gap-0.5"
            >
              <ExternalLink size={9} /> Hamp-Lyons &amp; Condon (2000)
            </a>
          </div>

          {/* 6-Step Correction Sequence */}
          <table className="w-full border-collapse border border-gray-400 mb-4 text-sm">
            <thead>
              <tr className="bg-gray-200 text-gray-800">
                <th className="border border-gray-400 px-3 py-2 text-center w-8">Step</th>
                <th className="border border-gray-400 px-3 py-2 text-left w-1/3">What You Correct</th>
                <th className="border border-gray-400 px-3 py-2 text-left">What You Look For</th>
              </tr>
            </thead>
            <tbody>
              {[
                { step: '1', what: 'Portfolio Contents', look: 'Draft 1 + Draft 2 + feedback record + reflection + final version all present?' },
                { step: '2', what: 'Final Draft (Product Quality)', look: 'Score the final revised text with the analytic rubric (Phase 1 above). This is 70% of the portfolio score.' },
                { step: '3', what: 'Draft Comparison', look: 'What improved from Draft 1 to final? What did not improve? Are weaknesses from Phase 1 addressed?' },
                { step: '4', what: 'Feedback Uptake', look: 'Did the student apply the formative comments given in Phase 3? Evidence of targeted vs. surface revision?' },
                { step: '5', what: 'Student Reflection', look: 'Does the reflection show awareness of strengths, weaknesses, revision choices, and next writing goals?' },
                { step: '6', what: 'Final Portfolio Judgment', look: 'Combined decision: writing quality (70%) + writing development (30%) = portfolio score.' },
              ].map((r) => (
                <tr key={r.step}>
                  <td className="border border-gray-400 px-3 py-2 text-center font-bold text-blue-700">{r.step}</td>
                  <td className="border border-gray-400 px-3 py-2 font-semibold">{r.what}</td>
                  <td className="border border-gray-400 px-3 py-2 text-gray-700">{r.look}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Two-part scoring */}
          <div className="phase3-rules border-l-4 border-blue-600 bg-gray-50 p-4 text-sm text-gray-900 mb-4">
            <h3 className="font-bold border-b pb-1 mb-3 text-md mt-0 flex items-center gap-2">
              <TrendingUp size={14} />
              Two-Part Portfolio Scoring Model
            </h3>

            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className="border border-gray-300 rounded p-3 bg-white">
                <p className="font-bold text-blue-700 mb-1">Product Component — 70%</p>
                <p className="text-xs text-gray-600 mb-2">Quality of the final revised text (analytic rubric from Phase 1)</p>
                <ul className="list-disc pl-4 text-xs space-y-1 text-gray-700">
                  <li>Argumentation quality</li>
                  <li>Text organization</li>
                  <li>Cohesion &amp; transitions</li>
                  <li>Lexical resource</li>
                  <li>Grammatical accuracy</li>
                  <li>Academic style</li>
                </ul>
                <p className="mt-2 font-bold text-blue-700 text-sm">
                  Product score: {overallScore.toFixed(1)} / 5
                </p>
              </div>

              <div className="border border-gray-300 rounded p-3 bg-white">
                <p className="font-bold text-emerald-700 mb-1">Process Component — 30%</p>
                <p className="text-xs text-gray-600 mb-2">Quality of the student's portfolio process</p>
                <ul className="list-disc pl-4 text-xs space-y-1 text-gray-700">
                  <li>Evidence of planning</li>
                  <li>Revision depth</li>
                  <li>Feedback uptake</li>
                  <li>Reflection quality</li>
                  <li>Strategic improvement</li>
                </ul>
                <p className="mt-2 font-bold text-emerald-700 text-sm">
                  {bData.revisions > 1 ? 'Iterative revision detected' : bData.revisions === 1 ? 'Single revision documented' : 'No revision documented'}
                </p>
              </div>
            </div>

            {/* 5 Correction Questions */}
            <h3 className="font-bold border-b pb-1 mb-3 text-md">5 Core Portfolio Correction Questions</h3>
            <ol className="list-decimal pl-5 text-sm space-y-2 text-gray-800">
              <li>
                <strong>How strong is the final text?</strong>{' '}
                <span className={overallScore >= 4 ? 'text-emerald-700' : overallScore >= 3 ? 'text-blue-700' : 'text-rose-700'}>
                  {overallScore >= 4 ? 'Good — ' : overallScore >= 3 ? 'Developing — ' : 'Needs support — '}
                  overall analytic score {overallScore.toFixed(1)}/5.
                </span>
              </li>
              <li>
                <strong>How much did the text improve from Draft 1 to the final version?</strong>{' '}
                {bData.revisions > 0
                  ? <span className="text-emerald-700">{bData.revisions} revision(s) documented. Compare Phase 1 scores with earlier draft scores.</span>
                  : <span className="text-rose-700">No revision submitted. Development cannot be measured without a revised draft.</span>}
              </li>
              <li>
                <strong>Did the student use feedback meaningfully?</strong>{' '}
                {bData.engagement === 'High'
                  ? <span className="text-emerald-700">Yes — high SRL self-reflection score indicates active feedback processing.</span>
                  : bData.engagement === 'Medium'
                  ? <span className="text-amber-700">Partially — surface uptake observed. Encourage deeper meaning-level revision.</span>
                  : <span className="text-rose-700">Limited — feedback uptake not evident. Reinforce reflective practice.</span>}
              </li>
              <li>
                <strong>Does the reflection show real awareness of writing problems and strategies?</strong>{' '}
                {bData.engagement === 'High'
                  ? <span className="text-emerald-700">Yes — student demonstrates metacognitive awareness.</span>
                  : <span className="text-amber-700">Developing — encourage explicit statement of revision rationale in next cycle.</span>}
              </li>
              <li>
                <strong>What is the student's next writing need?</strong>{' '}
                <span className="text-blue-700">
                  {scores.argumentation <= 2
                    ? 'Deepen claim–evidence structure with more precise academic support.'
                    : scores.cohesion <= 2
                    ? 'Expand cohesive devices and inter-paragraph transitions.'
                    : scores.organization <= 2
                    ? 'Strengthen macro-structure: intro–body–conclusion logical flow.'
                    : scores.lexical <= 2
                    ? 'Diversify academic vocabulary and avoid basic repetition.'
                    : scores.grammar <= 2
                    ? 'Target high-frequency grammatical errors (tense, agreement, articles).'
                    : 'Continue developing writing quality and reflective revision practice.'}
                </span>
              </li>
            </ol>
          </div>

          <p className="text-xs text-gray-500 italic mt-2">
            Portfolio assessment is implemented here as a delayed, criterion-based evaluation of both
            final written performance and documented writing development, in line with the principles
            of collection, selection, reflection, and delayed evaluation (Hamp-Lyons &amp; Condon, 2000).
            See also:{' '}
            <a
              href="https://doi.org/10.1017/CBO9780511732997"
              target="_blank"
              rel="noreferrer"
              className="underline text-blue-600"
            >
              Weigle (2002), Assessing Writing
            </a>.
          </p>
        </section>

      </div>
    </div>
  );
};
