import { useState } from 'react';
import { ResearchShell } from '../layouts/ResearchShell';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';
import { Save, RotateCcw, ShieldCheck, Database, Settings2, Sliders } from 'lucide-react';
import { caseStudyMeta } from '../data/diagnostic';

export function Settings() {
  const [activeSubTab, setActiveSubTab] = useState('Thresholds');

  const navItems = [
    { id: 'Thresholds', icon: Sliders },
    { id: 'Study Meta', icon: ShieldCheck },
    { id: 'Data Management', icon: Database }
  ];

  return (
    <ResearchShell>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <header className="flex justify-between items-end mb-8">
          <div>
            <h1 className="font-editorial text-4xl text-[var(--text-primary)] mb-2">Configuration Console</h1>
            <p className="text-[var(--text-sec)] font-body">Manage case-study parameters, diagnostic thresholds, and intervention logic.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="ghost"><RotateCcw size={16} /> Defaults</Button>
            <Button variant="primary"><Save size={16} /> Save Changes</Button>
          </div>
        </header>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sub Sidebar */}
          <aside className="lg:w-64 space-y-1">
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveSubTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all font-navigation text-sm ${
                  activeSubTab === item.id 
                  ? 'bg-[var(--lav-glow)] text-[var(--lav)] border border-[var(--lav-border)]' 
                  : 'text-[var(--text-sec)] hover:bg-[var(--bg-raised)]'
                }`}
              >
                <item.icon size={18} />
                {item.id}
              </button>
            ))}
          </aside>

          {/* Main Context */}
          <main className="flex-1 space-y-6">
            {activeSubTab === 'Thresholds' && (
              <div className="space-y-6">
                <GlassCard className="p-6">
                  <h3 className="text-[var(--teal)] font-navigation text-xs uppercase tracking-widest mb-6 pb-2 border-b border-[var(--border)]">NLP & Performance Thresholds</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ThresholdField label="TTR Vocabulary Boundary" value="0.35" unit="ratio" description="Values below this trigger 'Vocabulary Concern' status." />
                    <ThresholdField label="Max Error Density" value="3.50" unit="err/100w" description="Maximum tolerated errors before diagnostic Rule 1 fires." />
                    <ThresholdField label="Min Cohesion Markers" value="3" unit="count" description="Discoursal markers required for 'Satisfactory' cohesion." />
                    <ThresholdField label="Secure Score Boundary" value="4.00" unit="score" description="The score required to classify the case as securely on track." />
                  </div>
                </GlassCard>

                <GlassCard className="p-6">
                  <h3 className="text-[var(--gold)] font-navigation text-xs uppercase tracking-widest mb-6 pb-2 border-b border-[var(--border)]">Engagement Weightings</h3>
                  <p className="text-xs text-[var(--text-sec)] mb-6">Define how much each behavioral metric contributes to the Engagement Composite Score (Must sum to 1.0).</p>
                  <div className="space-y-4">
                    <WeightSlider label="Draft Submissions" value={25} />
                    <WeightSlider label="Revision Frequency" value={30} />
                    <WeightSlider label="Platform Logins" value={15} />
                    <WeightSlider label="Feedback Views" value={20} />
                    <WeightSlider label="Help-Seeking" value={10} />
                  </div>
                </GlassCard>
              </div>
            )}

            {activeSubTab === 'Study Meta' && (
              <GlassCard className="p-8 space-y-8">
                <section className="space-y-4">
                  <h3 className="font-navigation text-sm text-[var(--lav)]">Primary Credentials</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Institution</label>
                      <input className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--lav)]" defaultValue={caseStudyMeta.institution} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Instructor / Reviewer</label>
                      <input className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--lav)]" defaultValue={caseStudyMeta.instructor} />
                    </div>
                  </div>
                </section>
                
                <section className="space-y-4">
                  <h3 className="font-navigation text-sm text-[var(--lav)]">Research Topic</h3>
                  <div className="space-y-2">
                    <label className="text-xs text-[var(--text-muted)] uppercase tracking-wider">Case Title</label>
                    <textarea className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-4 py-3 text-[var(--text-primary)] focus:outline-none focus:border-[var(--lav)] min-h-[100px]" defaultValue={`Single-student analytical verification for ${caseStudyMeta.studentName} in ${caseStudyMeta.courseTitle}.`} />
                  </div>
                </section>
              </GlassCard>
            )}

            {activeSubTab === 'Data Management' && (
              <div className="space-y-6">
                <GlassCard className="p-6 border-[var(--border-bright)]">
                  <div className="flex items-start gap-4">
                    <div className="p-3 rounded-lg bg-[var(--red-dim)] text-[var(--red)]">
                      <Settings2 size={24} />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-editorial text-[var(--text-primary)] mb-1">Advanced Data Controls</h3>
                      <p className="text-sm text-[var(--text-sec)] mb-6">Administrative actions for clearing the current case cache.</p>
                      
                      <div className="flex gap-4">
                        <Button className="!bg-[var(--red-dim)] !text-[var(--red)] border border-[var(--border-bright)] hover:!bg-[var(--lav-glow)]">Clear Case Cache</Button>
                        <Button className="!bg-[var(--bg-high)] border border-[var(--border)]">Reset Thresholds</Button>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              </div>
            )}
          </main>
        </div>
      </div>
    </ResearchShell>
  );
}

function ThresholdField({ label, value, unit, description }: { label: string, value: string, unit: string, description: string }) {
  return (
    <div className="space-y-2 group">
      <div className="flex justify-between items-center">
        <label className="text-sm font-navigation text-[var(--text-primary)]">{label}</label>
        <div className="flex items-center gap-2">
          <input className="w-20 bg-[var(--bg-deep)] border border-[var(--border)] rounded px-2 py-1 text-right text-[var(--lav)] font-mono text-sm focus:outline-none focus:border-[var(--lav)]" defaultValue={value} />
          <span className="text-[var(--text-muted)] text-[10px] uppercase font-navigation">{unit}</span>
        </div>
      </div>
      <p className="text-[10px] text-[var(--text-muted)] leading-relaxed group-hover:text-[var(--text-sec)] transition-colors">{description}</p>
    </div>
  );
}

function WeightSlider({ label, value }: { label: string, value: number }) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs font-navigation text-[var(--text-sec)]">
        <span>{label}</span>
        <span className="text-[var(--teal)] font-mono">{value}%</span>
      </div>
      <div className="h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden border border-[var(--border)]">
        <div className="h-full bg-[var(--teal)] shadow-[0_0_8px_var(--teal-dim)]" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}
