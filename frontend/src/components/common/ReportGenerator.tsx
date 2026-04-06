import React, { useState } from 'react';
import { Download, Printer, FileText, Settings } from 'lucide-react';
import { GlassCard } from '../GlassCard';

interface ReportGeneratorProps {
  studentName: string;
  studentId: string;
  data: any;
  onPrint: () => void;
  onDownloadPdf: () => void;
  onDownloadHtml: () => void;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  studentName,
  studentId,
  data,
  onPrint,
  onDownloadPdf,
  onDownloadHtml,
}) => {
  const [showSettings, setShowSettings] = useState(false);
  const [settings, setSettings] = useState({
    includeRawData: true,
    includeFeedback: true,
    includeAnalytics: true,
    includeRecommendations: true,
    fontSize: 'normal' as 'small' | 'normal' | 'large',
    colorMode: 'light' as 'light' | 'dark',
  });

  return (
    <div className="space-y-6">
      {/* Report Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-2">
          Student Analysis Report
        </h2>
        <p className="text-[var(--text-muted)]">
          {studentName} • ID: {studentId}
        </p>
      </div>

      {/* Report Settings */}
      <GlassCard className="p-6 border-[var(--border)]">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="flex items-center gap-2 text-[var(--lav)] hover:text-[var(--blue)] transition-colors font-bold"
        >
          <Settings size={18} />
          Report Settings
        </button>

        {showSettings && (
          <div className="mt-6 space-y-6 pt-6 border-t border-[var(--border)]">
            {/* Include Options */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Content Sections
              </h4>
              {[
                { key: 'includeRawData', label: 'Raw Data & Metrics' },
                { key: 'includeFeedback', label: 'Feedback & Recommendations' },
                { key: 'includeAnalytics', label: 'Advanced Analytics' },
                { key: 'includeRecommendations', label: 'Teacher Recommendations' },
              ].map((item) => (
                <label key={item.key} className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={(settings as any)[item.key]}
                    onChange={(e) =>
                      setSettings({ ...settings, [item.key]: e.target.checked })
                    }
                    className="w-4 h-4 rounded"
                  />
                  <span className="text-sm text-[var(--text-primary)]">{item.label}</span>
                </label>
              ))}
            </div>

            {/* Font Size */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Font Size
              </h4>
              <div className="flex gap-3">
                {(['small', 'normal', 'large'] as const).map((size) => (
                  <button
                    key={size}
                    onClick={() => setSettings({ ...settings, fontSize: size })}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${
                      settings.fontSize === size
                        ? 'bg-[var(--lav)] text-white'
                        : 'border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-raised)]'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Color Mode */}
            <div className="space-y-3">
              <h4 className="text-sm font-bold text-[var(--text-primary)] uppercase tracking-wider">
                Print Mode
              </h4>
              <div className="flex gap-3">
                {(['light', 'dark'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setSettings({ ...settings, colorMode: mode })}
                    className={`px-4 py-2 rounded-lg text-sm font-bold uppercase transition-all ${
                      settings.colorMode === mode
                        ? 'bg-[var(--lav)] text-white'
                        : 'border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--bg-raised)]'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </GlassCard>

      {/* Report Preview */}
      <GlassCard className="p-8 border-[var(--border)] space-y-6">
        {/* Student Info */}
        <div className="pb-6 border-b border-[var(--border)]">
          <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">{studentName}</h3>
          <p className="text-[var(--text-muted)]">Student ID: {studentId}</p>
          <p className="text-xs text-[var(--text-muted)] mt-2">
            Generated: {new Date().toLocaleDateString()} at {new Date().toLocaleTimeString()}
          </p>
        </div>

        {/* Data Sections */}
        {settings.includeRawData && data && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[var(--text-primary)]">Performance Metrics</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Total Score', value: `${data.total_score}%` },
                { label: 'Success Rate', value: `${data.success_probability}%` },
                { label: 'SRL Profile', value: `${data.srl_overall}%` },
                { label: 'Risk Level', value: data.risk_level },
              ].map((metric) => (
                <div key={metric.label} className="p-4 rounded-lg bg-[var(--bg-raised)] border border-[var(--border)]">
                  <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider font-bold mb-2">
                    {metric.label}
                  </p>
                  <p className="text-lg font-bold text-[var(--text-primary)]">{metric.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {settings.includeFeedback && data && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[var(--text-primary)]">Key Feedback</h4>
            <div className="p-4 rounded-lg bg-[var(--lav)]/5 border border-[var(--lav)]/20">
              <p className="text-[var(--text-primary)]">
                {data.recommendation || 'No specific feedback available'}
              </p>
            </div>
          </div>
        )}

        {settings.includeAnalytics && data && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[var(--text-primary)]">Competence Assessment</h4>
            <div className="space-y-3">
              {[
                { label: 'Argumentation', value: data.bayesian_argumentation_pct },
                { label: 'Self-Regulation', value: data.bayesian_srl_pct },
                { label: 'Academic Language', value: data.bayesian_linguistic_pct },
              ].map((comp) => (
                <div key={comp.label}>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-bold text-[var(--text-primary)]">{comp.label}</span>
                    <span className="text-sm font-bold text-[var(--lav)]">{comp.value}%</span>
                  </div>
                  <div className="h-2 w-full bg-[var(--bg-raised)] border border-[var(--border)] rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[var(--lav)] rounded-full" 
                      style={{ width: `${comp.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {settings.includeRecommendations && (
          <div className="space-y-4">
            <h4 className="text-lg font-bold text-[var(--text-primary)]">Recommendations</h4>
            <ul className="space-y-2 pl-6">
              <li className="text-[var(--text-primary)]">• Focus on evidence-based argumentation</li>
              <li className="text-[var(--text-primary)]">• Practice academic register in formal writing</li>
              <li className="text-[var(--text-primary)]">• Expand vocabulary for advanced concepts</li>
              <li className="text-[var(--text-primary)]">• Use feedback cycles for revision practice</li>
            </ul>
          </div>
        )}
      </GlassCard>

      {/* Export Options */}
      <div className="flex gap-4 flex-wrap">
        <button
          onClick={onPrint}
          className="flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--lav)] text-white font-bold text-sm uppercase hover:bg-[var(--blue)] transition-all"
        >
          <Printer size={18} />
          Print to PDF
        </button>
        <button
          onClick={onDownloadPdf}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--lav)] text-[var(--lav)] font-bold text-sm uppercase hover:bg-[var(--lav)]/10 transition-all"
        >
          <Download size={18} />
          Download PDF
        </button>
        <button
          onClick={onDownloadHtml}
          className="flex items-center gap-2 px-6 py-3 rounded-lg border border-[var(--border)] text-[var(--text-primary)] font-bold text-sm uppercase hover:bg-[var(--bg-raised)] transition-all"
        >
          <FileText size={18} />
          Download HTML
        </button>
      </div>
    </div>
  );
};
