import { useMemo, useState } from 'react';
import { Download, FileText, Printer, Info, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStudyScopeStore, type TeacherStudyCase } from '../state/studyScope';
import { GlassCard } from '../components/GlassCard';
import { ReportGenerator } from '../components/reports/ReportGenerator';

export function Reports() {
  const navigate = useNavigate();
  const cases = useStudyScopeStore((state) => state.cases);
  const [selectedCaseId, setSelectedCaseId] = useState<string>('');

  // Initialize selectedCaseId when cases load
  const selectedCase: TeacherStudyCase | undefined = useMemo(() => {
    // If no selectedCaseId, use first case
    if (!selectedCaseId && cases.length > 0) {
      return cases[0];
    }
    // Otherwise find the case with the selected ID
    return cases.find((c) => c.id === selectedCaseId) || (cases.length > 0 ? cases[0] : undefined);
  }, [cases, selectedCaseId]);

  // Auto-select first case when cases load
  useMemo(() => {
    if (cases.length > 0 && !selectedCaseId) {
      setSelectedCaseId(cases[0].id);
    }
  }, [cases, selectedCaseId]);

  const exportJson = () => {
    if (!selectedCase) return;
    const blob = new Blob([JSON.stringify(selectedCase, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `final_report_${selectedCase.meta.userId}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const printReport = () => window.print();

  const reportData = useMemo(() => {
    if (!selectedCase) {
      return null;
    }

    const student = selectedCase.student as any;
    const selectedMeta = selectedCase.meta as any;
    return {
      total_score: student.total_score ?? 0,
      success_probability: student.success_probability ?? Math.max(0, Math.min(100, Number(student.total_score ?? 0) * 3)),
      srl_overall: student.srl_overall ?? student.srl_score ?? 0,
      risk_level: selectedCase.riskLevel ?? 'Medium',
      recommendation: student.personalized_feedback || selectedMeta.teacherNote || 'Teacher review required',
      bayesian_argumentation_pct: student.bayesian_argumentation_pct ?? Math.round(Number(student.argumentation ?? 0) * 20),
      bayesian_srl_pct: student.bayesian_srl_pct ?? Math.round(Number(student.srl_overall ?? 0) || 0),
      bayesian_linguistic_pct: student.bayesian_linguistic_pct ?? Math.round(Number(student.lexical_resource ?? 0) * 20),
    };
  }, [selectedCase]);

  const downloadHtml = () => {
    if (!selectedCase || !reportData) return;

    const html = `
      <html>
        <head><title>WriteLens report - ${selectedCase.meta.studentName}</title></head>
        <body style="font-family: sans-serif; padding: 24px;">
          <h1>${selectedCase.meta.studentName}</h1>
          <p>ID: ${selectedCase.meta.userId}</p>
          <pre>${JSON.stringify(reportData, null, 2)}</pre>
        </body>
      </html>
    `;

    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `writelens_report_${selectedCase.meta.userId}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!selectedCase) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="space-y-6">
          {/* Page Header */}
          <div>
            <h1 className="text-4xl font-bold font-navigation uppercase tracking-tight mb-2">Final Reports</h1>
            <p className="text-[var(--text-muted)] text-base">Teacher-ready comprehensive analysis reports with NLP + ML outcomes</p>
          </div>

          {/* Empty State Alert */}
          <GlassCard className="p-8 border-l-4" style={{ borderLeftColor: 'var(--teal)' }}>
            <div className="flex items-start gap-4">
              <FileText className="w-8 h-8 text-[var(--teal)] flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-bold text-[var(--text-primary)] mb-3">Select a Student Case to View Report</h3>
                <p className="text-[var(--text-sec)] text-sm mb-4 leading-relaxed">
                  Professional analysis reports are automatically generated for each student. The system analyzes writing quality metrics, predicts improvement potential, and produces teacher-ready feedback. Simply select a student case from the workspace selector above to view their comprehensive report.
                </p>
                
                <div className="space-y-3 mb-6 p-4 bg-[var(--bg-high)] rounded-lg border border-[var(--border)]">
                  <p className="text-[var(--text-sec)] text-sm font-medium">Automatic Report Generation Process:</p>
                  <ol className="text-[var(--text-muted)] text-sm space-y-2 list-decimal list-inside">
                    <li>System analyzes each student's writing data in real-time</li>
                    <li>Select a student case from the dropdown selector</li>
                    <li>Complete report instantly displays with all NLP + ML metrics</li>
                    <li>Print to PDF or export as JSON with one click</li>
                  </ol>
                </div>

                <div className="bg-[var(--bg-sidebar)] rounded-lg p-4 mb-6 border border-[var(--border)] border-dashed">
                  <p className="text-xs font-bold text-[var(--text-sec)] mb-2 uppercase tracking-wider">Report Includes:</p>
                  <p className="text-xs text-[var(--text-muted)]">Executive summary with overall score and risk level • Writing quality metrics (argumentation, cohesion, grammar, vocabulary) • Predictive improvement analysis • Personalized teacher-ready feedback and recommendations</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => window.location.reload()}
                    className="px-6 py-2.5 bg-[var(--lav)] hover:opacity-90 text-white font-bold rounded-lg transition-colors flex items-center gap-2 justify-center text-sm"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Refresh Data
                  </button>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="px-6 py-2.5 bg-[var(--slate-700)] hover:bg-[var(--slate-600)] text-white font-bold rounded-lg transition-colors text-sm"
                  >
                    Check Dashboard
                  </button>
                </div>
              </div>
            </div>
          </GlassCard>

          {/* Info Box */}
          <GlassCard className="p-6 border-[var(--lav)]/20 bg-[var(--lav)]/5">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-[var(--lav)] opacity-50 shrink-0 mt-0.5" />
              <div>
                <h4 className="font-bold text-[var(--lav)] text-sm uppercase tracking-wider mb-2">Automatic Analysis & Reporting</h4>
                <p className="text-[var(--text-muted)] text-xs leading-relaxed">
                  The system automatically analyzes each student case and generates comprehensive final reports in real-time. When you select a student case, you'll see NLP-powered analysis results (argumentation, cohesion, grammar, vocabulary metrics), ML predictions, risk assessment, and teacher-ready personalized feedback. Reports can be exported as JSON or printed directly.
                </p>
              </div>
            </div>
          </GlassCard>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            color-adjust: exact !important;
          }
          
          body {
            background: white !important;
            color: #000 !important;
          }
          
          .print\\:hidden {
            display: none !important;
          }
          
          @page {
            size: A4;
            margin: 0.75in;
            orphans: 3;
            widows: 3;
          }
          
          h2 {
            page-break-after: avoid;
            margin-top: 0;
          }
          
          h3 {
            page-break-after: avoid;
            margin-top: 1.5rem;
          }
          
          .print\\:page-break-after-avoid {
            page-break-after: avoid !important;
          }
          
          .print\\:page-break-before-avoid {
            page-break-before: avoid !important;
          }
          
          table, figure, pre {
            page-break-inside: avoid;
          }
        }
      `}</style>
      <div className="space-y-8">
      {/* Print Controls - Hidden in Print */}
      <div className="print:hidden max-w-7xl mx-auto px-6 py-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h1 className="text-4xl font-bold font-navigation uppercase tracking-tight mb-2">Final Reports</h1>
            <p className="text-[var(--text-muted)] text-base">Teacher-ready analysis with NLP + ML outcomes, automatically generated</p>
          </div>
          <div className="flex gap-3">
            <button onClick={printReport} className="px-6 py-3 rounded-lg border border-[var(--border)] text-xs font-navigation font-bold uppercase tracking-wider text-[var(--text-muted)] flex items-center gap-2 hover:text-[var(--lav)] transition-all hover:bg-[var(--lav)]/10">
              <Printer className="w-4 h-4" />
              Print / PDF
            </button>
            <button onClick={exportJson} className="px-6 py-3 rounded-lg bg-[var(--lav)] text-white text-xs font-navigation font-bold uppercase tracking-wider shadow-lg flex items-center gap-2 hover:bg-[var(--blue)] transition-all hover:shadow-xl">
              <Download className="w-4 h-4" />
              Export JSON
            </button>
          </div>
        </div>

        <div className="rounded-lg border border-[var(--border)] p-4 bg-[var(--bg-raised)]">
          <label className="text-xs uppercase tracking-widest font-navigation font-bold text-[var(--text-muted)] mr-3">Select Student Case</label>
          <select
            value={selectedCaseId || ''}
            onChange={(e) => setSelectedCaseId(e.target.value)}
            className="px-3 py-2 rounded border border-[var(--border)] bg-[var(--bg-base)] text-sm text-[var(--text-primary)]"
          >
            {cases.length === 0 ? (
              <option value="">No cases available</option>
            ) : (
              cases.map((c) => (
                <option key={c.id} value={c.id}>{c.meta?.studentName || 'Unknown'} ({c.meta?.userId || 'N/A'})</option>
              ))
            )}
          </select>
        </div>
      </div>

      {selectedCase && reportData && (
        <div className="max-w-7xl mx-auto px-6 pb-6">
          <GlassCard className="p-6 border-[var(--border)] bg-[var(--bg-raised)]">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <p className="text-xs uppercase tracking-widest font-navigation font-bold text-[var(--text-muted)]">Teacher-configured report</p>
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mt-2">Choose what appears in the report</h2>
                <p className="text-sm text-[var(--text-sec)] mt-1">
                  The teacher can keep a short version, a full version, or anything in between.
                </p>
              </div>
            </div>
            <ReportGenerator
              studentName={selectedCase.meta?.studentName || 'Unknown'}
              studentId={selectedCase.meta?.userId || 'N/A'}
              data={reportData}
              onPrint={printReport}
              onDownloadPdf={printReport}
              onDownloadHtml={downloadHtml}
            />
          </GlassCard>
        </div>
      )}

      {/* Print-Ready Report Section */}
      <div className="print:p-0 max-w-4xl mx-auto px-6 py-8 print:max-w-full print:mx-0 print:px-0">
        
        {/* Report Header - Print Optimized */}
        <div className="print:mb-8 mb-8 pb-6 print:pb-8 border-b-2 print:border-black border-[var(--border)]">
          <div className="text-center mb-2">
            <p className="text-xs print:text-sm uppercase tracking-widest font-navigation text-[var(--text-muted)] print:text-gray-700">WriteLens Comprehensive Analysis Report</p>
          </div>
          <h2 className="text-3xl print:text-4xl font-bold text-center mb-2 font-editorial italic text-[var(--text-primary)] print:text-black">
            {selectedCase?.meta?.studentName || 'Student Report'}
          </h2>
          <div className="text-center text-xs print:text-sm text-[var(--text-sec)] print:text-gray-700">
            <p className="mb-1">Student ID: <strong>{selectedCase?.meta?.userId || 'N/A'}</strong></p>
            <p className="mb-1">Course: <strong>{selectedCase?.meta?.courseTitle || 'N/A'}</strong></p>
            <p>Report Generated: <strong>{new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong></p>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="print:mb-8 mb-8 print:page-break-after-avoid">
          <h3 className="text-xl print:text-2xl font-bold mb-4 font-navigation uppercase tracking-wider text-[var(--text-primary)] print:text-black">Executive Summary</h3>
          <div className="grid grid-cols-2 print:grid-cols-3 gap-4 print:gap-6 mb-6">
            <div className="p-4 print:p-4 rounded-lg print:rounded-none bg-[var(--bg-raised)] print:bg-white print:border-l-4 print:border-gray-800">
              <p className="text-xs print:text-xs uppercase tracking-widest text-[var(--text-muted)] print:text-gray-600 font-navigation font-bold mb-1">Overall Score</p>
              <p className="text-2xl print:text-3xl font-bold text-[var(--lav)] print:text-black">{selectedCase?.student?.total_score || 'N/A'}</p>
            </div>
            <div className="p-4 print:p-4 rounded-lg print:rounded-none bg-[var(--bg-raised)] print:bg-white print:border-l-4 print:border-gray-800">
              <p className="text-xs print:text-xs uppercase tracking-widest text-[var(--text-muted)] print:text-gray-600 font-navigation font-bold mb-1">Risk Level</p>
              <p className="text-2xl print:text-3xl font-bold text-[var(--red)] print:text-black">{selectedCase?.riskLevel || 'Medium'}</p>
            </div>
            <div className="p-4 print:p-4 rounded-lg print:rounded-none bg-[var(--bg-raised)] print:bg-white print:border-l-4 print:border-gray-800 print:col-span-1 col-span-2 print:col-span-1">
              <p className="text-xs print:text-xs uppercase tracking-widest text-[var(--text-muted)] print:text-gray-600 font-navigation font-bold mb-1">Cluster</p>
              <p className="text-lg print:text-2xl font-bold text-[var(--blue)] print:text-black">{selectedCase?.clusterName || 'Unclassified'}</p>
            </div>
          </div>
        </div>

        {/* NLP & ML Analysis Results */}
        <div className="print:mb-8 mb-8 print:page-break-after-avoid">
          <h3 className="text-xl print:text-2xl font-bold mb-4 font-navigation uppercase tracking-wider text-[var(--text-primary)] print:text-black">NLP & ML Analysis Results</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 print:gap-6">
            <div className="p-5 print:p-5 rounded-lg print:rounded-none bg-[var(--bg-raised)] print:bg-white print:border print:border-gray-300">
              <h4 className="font-bold text-sm print:text-base mb-3 text-[var(--text-primary)] print:text-black">Writing Quality Metrics</h4>
              <div className="space-y-3 print:space-y-2.5 text-sm print:text-base">
                <div className="flex justify-between pb-2 print:pb-2 border-b border-[var(--border)] print:border-gray-200">
                  <span className="text-[var(--text-sec)] print:text-gray-700">Argumentation</span>
                  <span className="font-bold text-[var(--text-primary)] print:text-black">{selectedCase?.student?.argumentation || '0/100'}</span>
                </div>
                <div className="flex justify-between pb-2 print:pb-2 border-b border-[var(--border)] print:border-gray-200">
                  <span className="text-[var(--text-sec)] print:text-gray-700">Cohesion & Flow</span>
                  <span className="font-bold text-[var(--text-primary)] print:text-black">{selectedCase?.student?.cohesion || '0/100'}</span>
                </div>
                <div className="flex justify-between pb-2 print:pb-2 border-b border-[var(--border)] print:border-gray-200">
                  <span className="text-[var(--text-sec)] print:text-gray-700">Grammar Accuracy</span>
                  <span className="font-bold text-[var(--text-primary)] print:text-black">{selectedCase?.student?.grammar_accuracy || '0/100'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[var(--text-sec)] print:text-gray-700">Vocabulary Diversity (TTR)</span>
                  <span className="font-bold text-[var(--text-primary)] print:text-black">{selectedCase?.student?.ttr || '0.0'}</span>
                </div>
              </div>
            </div>

            <div className="p-5 print:p-5 rounded-lg print:rounded-none bg-[var(--bg-raised)] print:bg-white print:border print:border-gray-300">
              <h4 className="font-bold text-sm print:text-base mb-3 text-[var(--text-primary)] print:text-black">Predictive Analysis</h4>
              <div className="space-y-3 print:space-y-2.5 text-sm print:text-base">
                <div className="p-3 print:p-3 rounded bg-[var(--lav)]/10 print:bg-gray-100 print:border-l-4 print:border-gray-400">
                  <p className="text-xs print:text-xs uppercase tracking-widest text-[var(--lav)] print:text-gray-700 font-bold mb-1">Predicted Improvement</p>
                  <p className="text-lg print:text-xl font-bold text-[var(--text-primary)] print:text-black">{selectedCase?.student?.predicted_improvement || 'Moderate'}</p>
                </div>
                <div className="p-3 print:p-3 rounded bg-[var(--blue)]/10 print:bg-gray-100 print:border-l-4 print:border-gray-400">
                  <p className="text-xs print:text-xs uppercase tracking-widest text-[var(--blue)] print:text-gray-700 font-bold mb-1">Workbook</p>
                  <p className="text-sm print:text-base font-semibold text-[var(--text-primary)] print:text-black">{selectedCase?.workbookName || 'Not specified'}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Teacher-Ready Feedback */}
        <div className="print:mb-8 mb-8 print:page-break-before-avoid">
          <h3 className="text-xl print:text-2xl font-bold mb-4 font-navigation uppercase tracking-wider text-[var(--text-primary)] print:text-black">Teacher-Ready Feedback & Recommendations</h3>
          <div className="p-6 print:p-6 rounded-lg print:rounded-none bg-[var(--bg-raised)] print:bg-white print:border print:border-gray-300">
            <p className="text-sm print:text-base leading-8 print:leading-8 text-[var(--text-sec)] print:text-gray-800 whitespace-pre-wrap font-body">
              {selectedCase?.student?.personalized_feedback || 'Comprehensive feedback is being generated from the analysis data. Please ensure the backend API is running and all data has been properly imported.'}
            </p>
          </div>
        </div>

        {/* Footer - Print Only */}
        <div className="hidden print:block mt-12 pt-8 border-t-2 border-gray-300 text-center text-xs text-gray-600">
          <p className="mb-2">WriteLens Comprehensive Analysis Report</p>
          <p>This report was automatically generated by the WriteLens system</p>
        </div>
      </div>
    </div>
    </>
  );
}
