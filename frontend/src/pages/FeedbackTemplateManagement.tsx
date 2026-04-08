import { useEffect, useMemo, useState } from 'react';
import { FileText, Save, Sparkles, Eye } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';
import { useStudyScopeStore } from '../store/studyScope';

type TemplateSettings = {
  includeRawData: boolean;
  includeFeedback: boolean;
  includeAnalytics: boolean;
  includeRecommendations: boolean;
  includeMessages: boolean;
  includeNotes: boolean;
  includeTimeOnTask: boolean;
  includeEngagement: boolean;
  titlePrefix: string;
  openingNote: string;
  closingNote: string;
};

const STORAGE_KEY = 'writelens-template-settings';

const DEFAULT_SETTINGS: TemplateSettings = {
  includeRawData: true,
  includeFeedback: true,
  includeAnalytics: true,
  includeRecommendations: true,
  includeMessages: true,
  includeNotes: true,
  includeTimeOnTask: true,
  includeEngagement: true,
  titlePrefix: 'Teacher report',
  openingNote: 'This report is prepared from real classroom evidence and the current AI analysis.',
  closingNote: 'The teacher can edit any paragraph before export or approval.',
};

function readStoredSettings() {
  if (typeof window === 'undefined') {
    return DEFAULT_SETTINGS;
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return DEFAULT_SETTINGS;
    }

    return { ...DEFAULT_SETTINGS, ...(JSON.parse(raw) as Partial<TemplateSettings>) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function FeedbackTemplateManagement() {
  const cases = useStudyScopeStore((state) => state.cases);
  const selectedCase = useMemo(() => cases[0] ?? null, [cases]);
  const [settings, setSettings] = useState<TemplateSettings>(readStoredSettings());
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const saveSettings = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    setToast('Template settings saved');
  };

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 pb-32 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)] font-bold mb-2">Report builder</p>
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">Template and indicator control</h1>
          <p className="mt-2 text-[var(--text-sec)] max-w-3xl">
            Decide which indicators appear in a report, what the opening and closing language says, and how much detail the teacher wants to keep visible.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={saveSettings}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--lav)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--blue)]"
          >
            <Save size={16} /> Save template
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-6">
        <GlassCard className="p-6 border-[var(--border)] space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Report composition</h2>
            <p className="text-sm text-[var(--text-sec)] mt-1">Turn sections on or off based on the report you want to hand to the teacher.</p>
          </div>

          <label className="space-y-2 block">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">Report title prefix</span>
            <input
              value={settings.titlePrefix}
              onChange={(event) => setSettings({ ...settings, titlePrefix: event.target.value })}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm"
            />
          </label>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['includeRawData', 'Raw data & metrics'],
              ['includeFeedback', 'Feedback & recommendations'],
              ['includeAnalytics', 'Advanced analytics'],
              ['includeRecommendations', 'Teacher recommendations'],
              ['includeMessages', 'Messages summary'],
              ['includeNotes', 'Teacher notes'],
              ['includeTimeOnTask', 'Time-on-task evidence'],
              ['includeEngagement', 'Engagement evidence'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={settings[key as keyof TemplateSettings] as boolean}
                  onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>

          <label className="space-y-2 block">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">Opening note</span>
            <textarea
              value={settings.openingNote}
              onChange={(event) => setSettings({ ...settings, openingNote: event.target.value })}
              rows={4}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm resize-y"
            />
          </label>

          <label className="space-y-2 block">
            <span className="text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">Closing note</span>
            <textarea
              value={settings.closingNote}
              onChange={(event) => setSettings({ ...settings, closingNote: event.target.value })}
              rows={4}
              className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm resize-y"
            />
          </label>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-4">
            <div className="flex items-center gap-2 text-[var(--lav)] mb-2">
              <Sparkles size={16} />
              <span className="text-xs uppercase tracking-wider font-bold">Included indicators</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                settings.includeRawData && 'Raw data',
                settings.includeFeedback && 'Feedback',
                settings.includeAnalytics && 'Analytics',
                settings.includeRecommendations && 'Recommendations',
                settings.includeMessages && 'Messages',
                settings.includeNotes && 'Notes',
                settings.includeTimeOnTask && 'Time-on-task',
                settings.includeEngagement && 'Engagement',
              ]
                .filter(Boolean)
                .map((item) => (
                  <span key={item as string} className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-sec)]">
                    {item}
                  </span>
                ))}
            </div>
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-[var(--border)] space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Preview</h2>
            <p className="text-sm text-[var(--text-sec)] mt-1">This shows the selected report structure applied to a real student case.</p>
          </div>

          {selectedCase ? (
            <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-4 space-y-4">
              <div className="flex items-start gap-3">
                <Eye className="mt-1 text-[var(--lav)]" size={18} />
                <div>
                  <p className="font-bold text-[var(--text-primary)]">{selectedCase.meta.studentName}</p>
                  <p className="text-sm text-[var(--text-sec)]">{settings.titlePrefix}</p>
                </div>
              </div>

              <div className="rounded-lg bg-slate-50 p-6 text-center text-slate-600">
                <Eye className="mx-auto mb-2 text-slate-400" size={32} />
                <p className="text-sm font-medium">Report Preview</p>
                <p className="mt-1 text-xs text-slate-500">Report generation disabled (frontend only)</p>
              </div>
            </div>
          ) : (
            <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-deep)] p-8 text-center text-sm text-[var(--text-sec)]">
              No student case loaded yet. Import workbook data first to preview the report.
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard className="p-6 border-[var(--border)]">
        <div className="flex items-start gap-4">
          <FileText className="mt-1 text-[var(--teal)]" size={20} />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">What this gives the teacher</h2>
            <p className="text-sm text-[var(--text-sec)] max-w-4xl">
              The teacher can switch indicators on or off, keep notes inside the report, and export a lighter or fuller version depending on whether the goal is a quick decision or a full dossier.
            </p>
            <div className="flex flex-wrap gap-2 pt-1 text-xs text-[var(--text-sec)]">
              <span className="rounded-full border border-[var(--border)] px-3 py-1">Custom indicators</span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">Teacher notes</span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">Student or group ready</span>
              <span className="rounded-full border border-[var(--border)] px-3 py-1">Print / HTML export</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
