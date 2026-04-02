import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Brain, Layers3, Plus, Save, ShieldCheck, SlidersHorizontal, Sparkles, Trash2 } from 'lucide-react';
import { GlassCard } from '../components/GlassCard';

type AnalysisScope = 'student' | 'group' | 'cohort';
type AnalysisMode = 'manual' | 'on-import' | 'scheduled' | 'on-demand';

type RuleDraft = {
  id: string;
  title: string;
  description: string;
  signal: string;
  threshold: number;
  scope: AnalysisScope;
  enabled: boolean;
};

type RuleSettings = {
  mode: AnalysisMode;
  requireTeacherApproval: boolean;
  allowBulkReports: boolean;
  selectedSources: string[];
  triggerOnNotes: boolean;
  triggerOnMessages: boolean;
  triggerOnTimeDrop: boolean;
  triggerOnErrorSpike: boolean;
};

const STORAGE_KEY = 'writelens-rule-settings';

const DEFAULT_RULES: RuleDraft[] = [
  {
    id: 'time-on-task',
    title: 'Low time-on-task',
    description: 'Flag students who spend too little time on the exercise.',
    signal: 'time_on_task',
    threshold: 20,
    scope: 'student',
    enabled: true,
  },
  {
    id: 'error-density',
    title: 'High error density',
    description: 'Escalate cases with repeated language or reasoning errors.',
    signal: 'error_density',
    threshold: 60,
    scope: 'group',
    enabled: true,
  },
  {
    id: 'engagement-drop',
    title: 'Engagement drop',
    description: 'Detect sudden drops in activity, comments, or revision uptake.',
    signal: 'engagement',
    threshold: 40,
    scope: 'cohort',
    enabled: true,
  },
];

const DEFAULT_SETTINGS: RuleSettings = {
  mode: 'on-demand',
  requireTeacherApproval: true,
  allowBulkReports: true,
  selectedSources: ['moodle_logs', 'rubric_scores', 'essays', 'messages', 'notes', 'time_on_task', 'engagement'],
  triggerOnNotes: true,
  triggerOnMessages: true,
  triggerOnTimeDrop: true,
  triggerOnErrorSpike: true,
};

const AVAILABLE_SOURCES = [
  { id: 'moodle_logs', label: 'Moodle logs' },
  { id: 'rubric_scores', label: 'Rubric scores' },
  { id: 'essays', label: 'Essays' },
  { id: 'messages', label: 'Teacher/student messages' },
  { id: 'notes', label: 'Teacher notes' },
  { id: 'time_on_task', label: 'Time on task' },
  { id: 'engagement', label: 'Engagement signals' },
];

function readStoredState() {
  if (typeof window === 'undefined') {
    return { rules: DEFAULT_RULES, settings: DEFAULT_SETTINGS };
  }

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return { rules: DEFAULT_RULES, settings: DEFAULT_SETTINGS };
    }

    const parsed = JSON.parse(raw) as { rules?: RuleDraft[]; settings?: RuleSettings };
    return {
      rules: parsed.rules?.length ? parsed.rules : DEFAULT_RULES,
      settings: parsed.settings ? { ...DEFAULT_SETTINGS, ...parsed.settings } : DEFAULT_SETTINGS,
    };
  } catch {
    return { rules: DEFAULT_RULES, settings: DEFAULT_SETTINGS };
  }
}

export function RuleManagement() {
  const initialState = readStoredState();
  const [rules, setRules] = useState<RuleDraft[]>(initialState.rules);
  const [settings, setSettings] = useState<RuleSettings>(initialState.settings);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timer = window.setTimeout(() => setToast(null), 2400);
    return () => window.clearTimeout(timer);
  }, [toast]);

  const activeRules = useMemo(() => rules.filter((rule) => rule.enabled), [rules]);

  const persist = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ rules, settings }));
    setToast('Rule settings saved');
  };

  const addRule = () => {
    setRules((current) => [
      ...current,
      {
        id: `rule-${Date.now()}`,
        title: 'New rule',
        description: 'Describe when the system should raise this signal.',
        signal: 'custom_signal',
        threshold: 50,
        scope: 'student',
        enabled: true,
      },
    ]);
  };

  const updateRule = (id: string, patch: Partial<RuleDraft>) => {
    setRules((current) => current.map((rule) => (rule.id === id ? { ...rule, ...patch } : rule)));
  };

  const removeRule = (id: string) => {
    setRules((current) => current.filter((rule) => rule.id !== id));
  };

  const sourceCount = settings.selectedSources.length;

  return (
    <div className="max-w-7xl mx-auto p-6 md:p-8 space-y-6 pb-32 relative">
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm font-bold text-emerald-300 shadow-xl">
          {toast}
        </div>
      )}

      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-[var(--text-muted)] font-bold mb-2">Teacher control center</p>
          <h1 className="text-4xl font-bold text-[var(--text-primary)]">Rules, thresholds, and triggers</h1>
          <p className="mt-2 text-[var(--text-sec)] max-w-3xl">
            Configure what the system watches, when it runs, and which cases require your approval before feedback is released.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={persist}
            className="inline-flex items-center gap-2 rounded-xl bg-[var(--lav)] px-5 py-3 text-sm font-bold text-white transition-colors hover:bg-[var(--blue)]"
          >
            <Save size={16} /> Save settings
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <GlassCard className="p-5 border-[var(--border)]">
          <div className="flex items-center gap-3 text-[var(--lav)]">
            <SlidersHorizontal size={18} />
            <p className="text-xs uppercase tracking-wider font-bold">Mode</p>
          </div>
          <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">{settings.mode}</p>
          <p className="text-xs text-[var(--text-sec)] mt-1">How the pipeline starts</p>
        </GlassCard>
        <GlassCard className="p-5 border-[var(--border)]">
          <div className="flex items-center gap-3 text-[var(--teal)]">
            <ShieldCheck size={18} />
            <p className="text-xs uppercase tracking-wider font-bold">Approval</p>
          </div>
          <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">{settings.requireTeacherApproval ? 'Required' : 'Optional'}</p>
          <p className="text-xs text-[var(--text-sec)] mt-1">Controls release of feedback</p>
        </GlassCard>
        <GlassCard className="p-5 border-[var(--border)]">
          <div className="flex items-center gap-3 text-[var(--amber)]">
            <Layers3 size={18} />
            <p className="text-xs uppercase tracking-wider font-bold">Sources</p>
          </div>
          <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">{sourceCount}</p>
          <p className="text-xs text-[var(--text-sec)] mt-1">Data streams included in analysis</p>
        </GlassCard>
        <GlassCard className="p-5 border-[var(--border)]">
          <div className="flex items-center gap-3 text-[var(--rose)]">
            <Sparkles size={18} />
            <p className="text-xs uppercase tracking-wider font-bold">Active rules</p>
          </div>
          <p className="mt-3 text-lg font-bold text-[var(--text-primary)]">{activeRules.length}</p>
          <p className="text-xs text-[var(--text-sec)] mt-1">Custom triggers currently enabled</p>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-6">
        <GlassCard className="p-6 border-[var(--border)] space-y-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-[var(--text-primary)]">Scope and triggers</h2>
              <p className="text-sm text-[var(--text-sec)] mt-1">Choose who is analyzed and which signals should matter.</p>
            </div>
            <button
              onClick={addRule}
              className="inline-flex items-center gap-2 rounded-lg border border-[var(--lav)] px-4 py-2 text-xs font-bold uppercase tracking-wider text-[var(--lav)] transition-colors hover:bg-[var(--lav)]/10"
            >
              <Plus size={14} /> Add rule
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="space-y-2 text-sm text-[var(--text-primary)]">
              <span className="block text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">Analysis mode</span>
              <select
                value={settings.mode}
                onChange={(event) => setSettings({ ...settings, mode: event.target.value as AnalysisMode })}
                className="w-full rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm"
              >
                <option value="manual">Manual</option>
                <option value="on-import">On import</option>
                <option value="scheduled">Scheduled</option>
                <option value="on-demand">On demand</option>
              </select>
            </label>

            <label className="space-y-2 text-sm text-[var(--text-primary)]">
              <span className="block text-xs uppercase tracking-wider font-bold text-[var(--text-muted)]">Data sources</span>
              <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-4 space-y-2">
                {AVAILABLE_SOURCES.map((source) => (
                  <label key={source.id} className="flex items-center gap-3 cursor-pointer text-sm">
                    <input
                      type="checkbox"
                      checked={settings.selectedSources.includes(source.id)}
                      onChange={(event) => {
                        const next = event.target.checked
                          ? [...settings.selectedSources, source.id]
                          : settings.selectedSources.filter((item) => item !== source.id);
                        setSettings({ ...settings, selectedSources: next });
                      }}
                    />
                    <span>{source.label}</span>
                  </label>
                ))}
              </div>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-4">
              <input
                type="checkbox"
                checked={settings.requireTeacherApproval}
                onChange={(event) => setSettings({ ...settings, requireTeacherApproval: event.target.checked })}
                className="mt-1"
              />
              <span>
                <span className="block font-bold text-[var(--text-primary)]">Teacher approval required</span>
                <span className="block text-sm text-[var(--text-sec)]">Keep all feedback drafts pending until you approve, edit, or reject them.</span>
              </span>
            </label>

            <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-4">
              <input
                type="checkbox"
                checked={settings.allowBulkReports}
                onChange={(event) => setSettings({ ...settings, allowBulkReports: event.target.checked })}
                className="mt-1"
              />
              <span>
                <span className="block font-bold text-[var(--text-primary)]">Bulk reports enabled</span>
                <span className="block text-sm text-[var(--text-sec)]">Generate one report for a group or cohort when you need a wider view.</span>
              </span>
            </label>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              ['triggerOnNotes', 'Teacher notes matter'],
              ['triggerOnMessages', 'Messages matter'],
              ['triggerOnTimeDrop', 'Time drop matters'],
              ['triggerOnErrorSpike', 'Error spike matters'],
            ].map(([key, label]) => (
              <label key={key} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] px-4 py-3 text-sm">
                <input
                  type="checkbox"
                  checked={settings[key as keyof RuleSettings] as boolean}
                  onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })}
                />
                <span>{label}</span>
              </label>
            ))}
          </div>
        </GlassCard>

        <GlassCard className="p-6 border-[var(--border)] space-y-4">
          <div>
            <h2 className="text-2xl font-bold text-[var(--text-primary)]">Analysis summary</h2>
            <p className="text-sm text-[var(--text-sec)] mt-1">A quick readout of what the system will watch for.</p>
          </div>

          <div className="space-y-3">
            {rules.map((rule) => (
              <div key={rule.id} className="rounded-xl border border-[var(--border)] bg-[var(--bg-deep)] p-4 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">{rule.title}</p>
                    <p className="text-sm text-[var(--text-sec)] mt-1">{rule.description}</p>
                  </div>
                  <button
                    onClick={() => removeRule(rule.id)}
                    className="rounded-md p-2 text-[var(--text-sec)] transition-colors hover:bg-[var(--red)]/10 hover:text-[var(--red)]"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <label className="space-y-1">
                    <span className="block text-xs uppercase tracking-wider text-[var(--text-muted)]">Signal</span>
                    <input
                      value={rule.signal}
                      onChange={(event) => updateRule(rule.id, { signal: event.target.value })}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs uppercase tracking-wider text-[var(--text-muted)]">Threshold</span>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      value={rule.threshold}
                      onChange={(event) => updateRule(rule.id, { threshold: Number(event.target.value) })}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2"
                    />
                  </label>
                  <label className="space-y-1">
                    <span className="block text-xs uppercase tracking-wider text-[var(--text-muted)]">Scope</span>
                    <select
                      value={rule.scope}
                      onChange={(event) => updateRule(rule.id, { scope: event.target.value as AnalysisScope })}
                      className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-base)] px-3 py-2"
                    >
                      <option value="student">Student</option>
                      <option value="group">Group</option>
                      <option value="cohort">Cohort</option>
                    </select>
                  </label>
                </div>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={rule.enabled}
                    onChange={(event) => updateRule(rule.id, { enabled: event.target.checked })}
                  />
                  <span>Rule enabled</span>
                </label>
              </div>
            ))}
          </div>
        </GlassCard>
      </div>

      <GlassCard className="p-6 border-[var(--border)]">
        <div className="flex items-start gap-4">
          <Brain className="text-[var(--lav)] mt-1" size={20} />
          <div className="space-y-2">
            <h2 className="text-xl font-bold text-[var(--text-primary)]">How the system will behave</h2>
            <p className="text-sm text-[var(--text-sec)] max-w-4xl">
              When you save, these settings define which sources feed the AI pipeline, which signals raise attention, and whether the teacher must approve feedback before it reaches the student.
            </p>
            <div className="flex flex-wrap gap-2 pt-2">
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-sec)]">Students</span>
              <ArrowRight size={14} className="self-center text-[var(--text-muted)]" />
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-sec)]">Groups</span>
              <ArrowRight size={14} className="self-center text-[var(--text-muted)]" />
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-sec)]">Rules</span>
              <ArrowRight size={14} className="self-center text-[var(--text-muted)]" />
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-sec)]">Teacher approval</span>
              <ArrowRight size={14} className="self-center text-[var(--text-muted)]" />
              <span className="rounded-full border border-[var(--border)] px-3 py-1 text-xs text-[var(--text-sec)]">Report</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  );
}
