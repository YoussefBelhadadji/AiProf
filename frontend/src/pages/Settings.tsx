import React, { useState, useEffect } from 'react';
import { Sliders, BookOpen, ShieldCheck, Database, Zap, Save, RefreshCw, AlertTriangle, Target, Activity } from 'lucide-react';
import { fetchRulebook, type StrongRuleRow } from '../services/rulebookApi';


const CATEGORIES = ['Thresholds', 'Rules', 'Study Meta', 'Data Management'];

export const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('Thresholds');
   const [rulebook, setRulebook] = useState<{ profile_rules: Array<{ profile: string; rules: StrongRuleRow[] }> } | null>(null);
  const [loading, setLoading] = useState(true);
   const [showAddRule, setShowAddRule] = useState(false);
   const [newRule, setNewRule] = useState({
      rule_id: '',
      category: 'General',
      priority: '100',
      pedagogical_interpretation: '',
      ai_learner_state_output: '',
      onsite_intervention: '',
   });

   const buildProfileRules = (rules: StrongRuleRow[]) => {
      const byCategory = new Map<string, StrongRuleRow[]>();
      for (const rule of rules) {
         const category = (rule.category || 'General').trim() || 'General';
         const bucket = byCategory.get(category) ?? [];
         bucket.push(rule);
         byCategory.set(category, bucket);
      }

      return Array.from(byCategory.entries()).map(([profile, categoryRules]) => ({
         profile,
         rules: [...categoryRules].sort((a, b) => (b.priority || 0) - (a.priority || 0)),
      }));
   };

  useEffect(() => {
      fetchRulebook()
         .then((data) => {
            setRulebook({ profile_rules: buildProfileRules(data.strong_rule_table || []) });
        setLoading(false);
      })
      .catch(() => {
            setRulebook({ profile_rules: [] });
        setLoading(false);
      });
  }, []);

   const handleAddRule = () => {
      const interpretation = newRule.pedagogical_interpretation.trim();
      const ruleId = newRule.rule_id.trim();

      if (!interpretation || !ruleId) {
         /* FIX: Replace alert with proper form validation UI feedback in future sprint */
         console.error('Form validation failed: Rule ID and Pedagogical Move are required.');
         return;
      }

      const syntheticRule: StrongRuleRow = {
         rule_id: ruleId,
         category: newRule.category.trim() || 'General',
         priority: Number(newRule.priority) || 100,
         enabled: true,
         raw_data_condition: newRule.ai_learner_state_output || 'Manual rule entry',
         ai_learner_state_output: newRule.ai_learner_state_output || 'Manual inference state',
         pedagogical_interpretation: interpretation,
         adaptive_feedback_type: 'teacher_defined_rule',
         feedback_message_focus: interpretation,
         theoretical_justification: 'Teacher-authored rule (pending backend persistence)',
         feedback_templates: ['standard_feedback'],
         onsite_interventions: [newRule.onsite_intervention || 'teacher_review_required'],
         feedback_messages: [],
      };

      setRulebook((current) => {
         const currentGroups = current?.profile_rules ?? [];
         const groupIndex = currentGroups.findIndex((group) => group.profile === syntheticRule.category);
         if (groupIndex === -1) {
            return {
               profile_rules: [
                  ...currentGroups,
                  { profile: syntheticRule.category, rules: [syntheticRule] },
               ],
            };
         }

         const updated = [...currentGroups];
         updated[groupIndex] = {
            ...updated[groupIndex],
            rules: [syntheticRule, ...updated[groupIndex].rules],
         };
         return { profile_rules: updated };
      });

      setShowAddRule(false);
      setNewRule({
         rule_id: '',
         category: 'General',
         priority: '100',
         pedagogical_interpretation: '',
         ai_learner_state_output: '',
         onsite_intervention: '',
      });
   };

  return (
    <div className="max-w-7xl mx-auto px-6 py-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
           <div>
              <h1 className="font-editorial text-5xl italic text-[var(--text-primary)] mb-2">Pedagogical Control Nexus</h1>
              <p className="font-body text-sm text-[var(--text-muted)] italic max-w-2xl text-balance leading-relaxed">
                 Manage the analytical engine&apos;s sensitivity, diagnostic logic, and intervention templates. Changes here dynamically recalibrate the forensic pipeline.
              </p>
           </div>
           <div className="flex gap-4">
              <button 
                onClick={() => {
                  /* FIX: Replace alert with proper confirmation dialog in future sprint */
                  console.log('Resetting all settings to application defaults');
                }} 
                className="px-6 py-3 rounded-xl bg-[var(--bg-high)] border border-[var(--border)] text-xs font-navigation font-bold uppercase tracking-widest text-[var(--text-muted)] flex items-center gap-2 hover:text-[var(--text-primary)] transition-colors"
              >
                 <RefreshCw className="w-3.5 h-3.5" />
                 Reset Defaults
              </button>
              <button 
                onClick={() => {
                  /* FIX: Replace alert with proper save feedback toast UI in future sprint */
                  console.log('Saving configuration changes to the system...');
                }} 
                className="px-8 py-3 rounded-xl bg-[var(--lav)] text-white text-xs font-navigation font-bold uppercase tracking-[0.2em] shadow-[0_0_20px_var(--lav-glow)] flex items-center gap-2 hover:scale-[1.02] transition-all"
              >
                 <Save className="w-3.5 h-3.5" />
                 Save Configuration
              </button>
           </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-10 items-start">
           
           {/* Sidebar Navigation */}
           <aside className="xl:col-span-3 flex flex-col gap-2">
              {CATEGORIES.map(cat => (
                <button 
                  key={cat}
                  onClick={() => setActiveTab(cat)}
                  className={`flex items-center justify-between px-6 py-4 rounded-xl transition-all font-navigation text-xs uppercase font-bold tracking-widest ${
                    activeTab === cat 
                    ? 'bg-[var(--lav-dim)] text-[var(--lav)] border border-[var(--lav-border)]' 
                    : 'text-[var(--text-muted)] hover:bg-[rgba(255,255,255,0.02)]'
                  }`}
                >
                   <span className="flex items-center gap-3">
                      {cat === 'Thresholds' && <Sliders className="w-4 h-4" />}
                      {cat === 'Rules' && <BookOpen className="w-4 h-4" />}
                      {cat === 'Study Meta' && <ShieldCheck className="w-4 h-4" />}
                      {cat === 'Data Management' && <Database className="w-4 h-4" />}
                      {cat}
                   </span>
                   {activeTab === cat && <div className="w-1 h-1 rounded-full bg-[var(--lav)]"></div>}
                </button>
              ))}

              <div className="mt-10 p-6 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border)] border-dashed">
                 <div className="flex items-center gap-2 mb-4">
                    <AlertTriangle className="w-4 h-4 text-[var(--blue)] opacity-50" />
                    <span className="font-navigation text-xs uppercase font-bold text-[var(--text-muted)]">Nexus Sensitivity</span>
                 </div>
                 <p className="font-body text-xs text-[var(--text-muted)] italic leading-relaxed">
                    Configuration changes apply globally to all current dataset evaluations.
                 </p>
              </div>
           </aside>

           {/* Main Content Area */}
           <main className="xl:col-span-9 space-y-10">
              
              {activeTab === 'Thresholds' && (
                <div className="grid grid-cols-1 gap-10">
                   {/* NLP & Performance Grid */}
                   <div className="glass-card p-10">
                      <div className="flex items-center gap-3 mb-10 pb-4 border-b border-[var(--border)]">
                         <Target className="w-5 h-5 text-[var(--blue)]" />
                         <h3 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--text-primary)]">Analytical Boundaries</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                         {[
                           { label: 'TTR Vocabulary Boundary', val: '0.35', desc: 'Values below trigger "Vocabulary Concern" status.' },
                           { label: 'Max Error Density', val: '3.50', desc: 'Max tolerated errors before diagnostic Rule 1 fires.' },
                           { label: 'Min Cohesion Index', val: '3.00', desc: 'Markers required for "Satisfactory" cohesion.' },
                           { label: 'Secure Score Boundary', val: '4.00', desc: 'Score required to classify case as securely on track.' },
                         ].map(t => (
                           <div key={t.label} className="p-6 rounded-xl bg-[var(--bg-deep)] border border-[var(--border)] group hover:border-[var(--lav-border)] transition-colors">
                              <div className="flex justify-between items-center mb-4">
                                 <label className="font-navigation text-xs uppercase font-extrabold text-[var(--text-muted)]">{t.label}</label>
                                 <input 
                                   type="text" 
                                   defaultValue={t.val} 
                                   className="w-16 bg-[var(--bg-high)] border border-[var(--border)] rounded px-2 py-1 text-xs font-forensic text-[var(--lav)] text-right focus:border-[var(--lav)]"
                                 />
                              </div>
                              <p className="font-body text-xs text-[var(--text-muted)] italic leading-relaxed">{t.desc}</p>
                           </div>
                         ))}
                      </div>
                   </div>

                   {/* Engagement Weightings */}
                   <div className="glass-card p-10 bg-[radial-gradient(circle_at_bottom_left,_var(--blue-dim)_0%,_transparent_60%)]">
                      <div className="flex items-center gap-3 mb-10 pb-4 border-b border-[var(--border)]">
                         <Activity className="w-5 h-5 text-[var(--violet)]" />
                         <h3 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--text-primary)]">Behavioral Weighting Matrix</h3>
                      </div>
                      <div className="space-y-8">
                         {[
                           { l: 'Draft Submissions', v: 25 },
                           { l: 'Revision Frequency', v: 30 },
                           { l: 'Platform Logins', v: 15 },
                           { l: 'Feedback Views', v: 20 },
                           { l: 'Help-Seeking', v: 10 },
                         ].map(w => (
                           <div key={w.l} className="space-y-3">
                              <div className="flex justify-between font-navigation text-xs uppercase font-bold text-[var(--text-sec)]">
                                 <span>{w.l}</span>
                                 <span className="text-[var(--blue)] font-forensic">{w.v}%</span>
                              </div>
                              <div className="h-1.5 w-full bg-[var(--bg-deep)] rounded-full overflow-hidden border border-[var(--border)]">
                                 <div className="h-full bg-[var(--blue)] shadow-[0_0_10px_var(--blue-glow)]" style={{ width: `${w.v}%` }}></div>
                              </div>
                           </div>
                         ))}
                      </div>
                   </div>
                </div>
              )}

              {activeTab === 'Rules' && (
                <div className="glass-card p-10">
                   <div className="flex items-center justify-between mb-10 pb-4 border-b border-[var(--border)]">
                      <div className="flex items-center gap-3">
                         <BookOpen className="w-5 h-5 text-[var(--lav)]" />
                         <h3 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--text-primary)]">Diagnostic Logic Library</h3>
                      </div>
                      <button
                        onClick={() => setShowAddRule((open) => !open)}
                        className="px-4 py-1.5 rounded-lg bg-[var(--lav-dim)] text-[var(--lav)] border border-[var(--lav-border)] text-xs font-navigation font-bold uppercase tracking-widest"
                      >
                         Add Rule
                      </button>
                   </div>

                   {showAddRule && (
                     <div className="mb-8 p-6 rounded-2xl border border-[var(--lav-border)] bg-[var(--lav-dim)]/40 space-y-4">
                       <h4 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--lav)]">Create Draft Rule</h4>
                       <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <input
                           value={newRule.rule_id}
                           onChange={(event) => setNewRule((prev) => ({ ...prev, rule_id: event.target.value }))}
                           placeholder="Rule ID (e.g., C9)"
                           className="w-full bg-[var(--bg-high)] border border-[var(--border)] rounded px-3 py-2 text-xs font-forensic text-[var(--text-primary)]"
                         />
                         <input
                           value={newRule.category}
                           onChange={(event) => setNewRule((prev) => ({ ...prev, category: event.target.value }))}
                           placeholder="Category"
                           className="w-full bg-[var(--bg-high)] border border-[var(--border)] rounded px-3 py-2 text-xs font-forensic text-[var(--text-primary)]"
                         />
                         <input
                           value={newRule.priority}
                           onChange={(event) => setNewRule((prev) => ({ ...prev, priority: event.target.value }))}
                           placeholder="Priority"
                           className="w-full bg-[var(--bg-high)] border border-[var(--border)] rounded px-3 py-2 text-xs font-forensic text-[var(--text-primary)]"
                         />
                       </div>
                       <textarea
                         value={newRule.pedagogical_interpretation}
                         onChange={(event) => setNewRule((prev) => ({ ...prev, pedagogical_interpretation: event.target.value }))}
                         placeholder="Pedagogical Move"
                         rows={3}
                         className="w-full bg-[var(--bg-high)] border border-[var(--border)] rounded px-3 py-2 text-xs font-body text-[var(--text-primary)]"
                       />
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input
                           value={newRule.ai_learner_state_output}
                           onChange={(event) => setNewRule((prev) => ({ ...prev, ai_learner_state_output: event.target.value }))}
                           placeholder="AI State Trigger"
                           className="w-full bg-[var(--bg-high)] border border-[var(--border)] rounded px-3 py-2 text-xs font-forensic text-[var(--text-primary)]"
                         />
                         <input
                           value={newRule.onsite_intervention}
                           onChange={(event) => setNewRule((prev) => ({ ...prev, onsite_intervention: event.target.value }))}
                           placeholder="Onsite Intervention"
                           className="w-full bg-[var(--bg-high)] border border-[var(--border)] rounded px-3 py-2 text-xs font-forensic text-[var(--text-primary)]"
                         />
                       </div>
                       <div className="flex justify-end gap-3">
                         <button
                           onClick={() => setShowAddRule(false)}
                           className="px-4 py-2 rounded-lg border border-[var(--border)] text-xs font-navigation font-bold uppercase tracking-widest text-[var(--text-muted)]"
                         >
                           Cancel
                         </button>
                         <button
                           onClick={handleAddRule}
                           className="px-4 py-2 rounded-lg bg-[var(--lav)] text-white text-xs font-navigation font-bold uppercase tracking-widest"
                         >
                           Add
                         </button>
                       </div>
                     </div>
                   )}

                   <div className="space-y-8 max-h-[700px] overflow-y-auto pr-4 custom-scrollbar">
                      {loading ? (
                        <div className="flex flex-col items-center py-20 opacity-20">
                           <RefreshCw className="w-10 h-10 animate-spin mb-4" />
                           <span className="font-navigation text-xs uppercase font-bold">Synchronizing Rulebook...</span>
                        </div>
                      ) : rulebook?.profile_rules?.map((ruleGroup: { profile: string; rules: StrongRuleRow[] }, idx: number) => (
                        <div key={idx} className="space-y-6">
                           <div className="flex items-center gap-3 sticky top-0 bg-[var(--bg-base)] z-10 py-2 border-b border-[var(--border)]">
                              <Zap className="w-4 h-4 text-[var(--lav)]" />
                              <h4 className="font-editorial text-2xl italic text-[var(--text-primary)]">{ruleGroup.profile} Scenario</h4>
                           </div>
                           <div className="grid grid-cols-1 gap-4">
                              {ruleGroup.rules?.map((r: StrongRuleRow) => (
                                <div key={r.rule_id} className="p-8 bg-[var(--bg-deep)] border border-[var(--border)] rounded-2xl group hover:border-[var(--lav-border)] transition-all">
                                   <div className="flex justify-between items-start mb-6">
                                      <div className="flex items-center gap-3 text-xs font-forensic text-[var(--lav)] uppercase font-bold">
                                         {r.rule_id}
                                         <span className="w-1 h-1 rounded-full bg-[var(--border-bright)]"></span>
                                         P{r.priority} Priority
                                      </div>
                                      <button className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity">
                                         <Sliders className="w-4 h-4 text-[var(--text-muted)]" />
                                      </button>
                                   </div>
                                   <div className="space-y-4">
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                         <div>
                                            <span className="font-navigation text-xs uppercase font-extrabold text-[var(--text-muted)] block mb-1">State Trigger</span>
                                            <p className="font-body text-xs text-[var(--text-primary)] font-medium italic">{r.ai_learner_state_output || r.raw_data_condition || 'Not specified'}</p>
                                         </div>
                                         <div>
                                            <span className="font-navigation text-xs uppercase font-extrabold text-[var(--text-muted)] block mb-1">Pedagogical Move</span>
                                            <p className="font-editorial text-lg italic text-[var(--text-primary)]">{r.pedagogical_interpretation}</p>
                                         </div>
                                      </div>
                                      <div className="pt-4 border-t border-[var(--border)] flex flex-wrap gap-2">
                                         <span className="px-3 py-1 rounded-lg bg-[var(--bg-high)] border border-[var(--border)] text-xs font-forensic text-[var(--blue)]">
                                            {(r.onsite_interventions?.[0] || 'teacher_review_required').replace(/_/g, ' ')}
                                         </span>
                                         <span className="px-3 py-1 rounded-lg bg-[var(--bg-high)] border border-[var(--border)] text-xs font-forensic text-[var(--teal)]">
                                            {(r.feedback_templates?.[0] || 'standard_feedback').replace(/_/g, ' ')}
                                         </span>
                                      </div>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </div>
                      ))}
                   </div>
                </div>
              )}

              {activeTab === 'Study Meta' && (
                <div className="glass-card p-12">
                   <div className="flex items-center gap-3 mb-12 pb-4 border-b border-[var(--border)]">
                      <ShieldCheck className="w-5 h-5 text-[var(--lav)]" />
                      <h3 className="font-navigation text-xs uppercase tracking-widest font-bold text-[var(--text-primary)]">Research Metadata</h3>
                   </div>
                   <div className="space-y-10">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                         {[
                           { label: 'Instructor / PI', val: 'Fatima GUERCH', icon: ShieldCheck },
                           { label: 'Institution', val: 'University of Ain Temouchent', icon: Database },
                           { label: 'Course Identifier', val: 'AW-379', icon: Sliders },
                           { label: 'Protocol Version', val: '2.4.1 Forensic-Futurist', icon: Zap },
                         ].map(m => (
                           <div key={m.label} className="space-y-3">
                              <label className="font-navigation text-xs uppercase font-extrabold text-[var(--text-muted)] block">{m.label}</label>
                              <div className="p-5 rounded-2xl bg-[var(--bg-deep)] border border-[var(--border)] flex items-center gap-4">
                                 <m.icon className="w-4 h-4 text-[var(--lav)] opacity-50" />
                                 <span className="font-editorial text-xl italic text-[var(--text-primary)]">{m.val}</span>
                              </div>
                           </div>
                         ))}
                      </div>
                      <div className="p-10 rounded-2xl bg-[var(--bg-sidebar)] border border-[var(--border)] border-dashed space-y-4">
                         <h4 className="font-navigation text-xs uppercase font-extrabold text-[var(--text-primary)]">Current Research Focus</h4>
                         <p className="font-body text-sm text-[var(--text-muted)] italic leading-relaxed">
                            Single-student analytical verification for Lahmarabbou Asmaa in Academic Writing. Synthesis window covers 20 Nov 2025 - 14 Mar 2026.
                         </p>
                      </div>
                   </div>
                </div>
              )}

            </main>
         </div>

      </div>
  );
};

