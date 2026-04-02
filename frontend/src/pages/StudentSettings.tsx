import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Bell, Shield, ArrowLeft, Check } from 'lucide-react';
import { StudentShell } from '../layouts/StudentShell';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';

export function StudentSettings() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Account');
  const [saveSuccess, setSaveSuccess] = useState(false);

  const tabs = [
    { id: 'Account', icon: User },
    { id: 'Notifications', icon: Bell },
    { id: 'Privacy', icon: Shield },
  ];

  const handleSave = () => {
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  return (
    <StudentShell>
      <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 pb-32">
        <header className="flex items-center gap-4">
          <button 
             onClick={() => navigate('/student-dashboard')}
             className="p-2 text-[var(--text-sec)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-raised)] rounded-full transition-all"
          >
             <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-editorial text-3xl text-[var(--text-primary)]">Settings</h1>
            <p className="text-sm text-[var(--text-sec)] font-body">Manage your profile and preferences.</p>
          </div>
        </header>

        <div className="flex flex-col md:flex-row gap-8">
           {/* Sidebar Tabs */}
           <aside className="w-full md:w-56 space-y-2">
              {tabs.map((tab) => (
                 <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-navigation text-sm ${
                       activeTab === tab.id
                          ? 'bg-[var(--lav-dim)] text-[var(--lav)] border border-[var(--lav-border)] shadow-sm'
                          : 'text-[var(--text-sec)] hover:bg-[var(--bg-raised)] border border-transparent'
                    }`}
                 >
                    <tab.icon size={18} />
                    {tab.id}
                 </button>
              ))}
           </aside>

           {/* Main Content */}
           <main className="flex-1">
              <GlassCard className="p-8">
                 {activeTab === 'Account' && (
                    <div className="space-y-6">
                       <h2 className="text-sm font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold mb-6">Account Details</h2>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] ml-1">Preferred Name</label>
                             <input type="text" defaultValue="Sarah" className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)]  focus:border-[var(--lav)] transition-colors" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] ml-1">Email</label>
                             <input type="email" defaultValue="sarah.j@university.edu" className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg px-4 py-2 text-sm text-[var(--text-primary)]  focus:border-[var(--lav)] transition-colors" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] ml-1">Bio/Goal</label>
                          <textarea className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-lg px-4 py-3 text-sm text-[var(--text-primary)] h-24 resize-none  focus:border-[var(--lav)] transition-colors" defaultValue="Focusing on improving my academic voice and source integration this semester." />
                       </div>
                    </div>
                 )}

                 {activeTab === 'Notifications' && (
                    <div className="space-y-6">
                       <h2 className="text-sm font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold mb-6">Notification Preferences</h2>
                       <div className="space-y-4">
                          {[
                            { label: 'Feedback Returned', desc: 'Notify me as soon as a teacher or the engine returns feedback.', default: true },
                            { label: 'Deadline Reminders', desc: 'Friendly reminders 24h before a task is due.', default: true },
                            { label: 'System Insights', desc: 'Periodic tips based on my writing style.', default: false },
                          ].map((item, i) => (
                             <div key={i} className="flex items-center justify-between p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-deep)]/50 group hover:border-[var(--lav-border)] transition-colors">
                                <div>
                                   <p className="text-sm font-medium text-[var(--text-primary)]">{item.label}</p>
                                   <p className="text-xs text-[var(--text-sec)]">{item.desc}</p>
                                </div>
                                <div className={`w-10 h-5 rounded-full relative transition-colors cursor-pointer ${item.default ? 'bg-[var(--lav)]' : 'bg-zinc-700'}`}>
                                   <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${item.default ? 'right-1' : 'left-1'}`} />
                                </div>
                             </div>
                          ))}
                       </div>
                    </div>
                 )}

                 {activeTab === 'Privacy' && (
                    <div className="space-y-6">
                       <h2 className="text-sm font-navigation uppercase tracking-widest text-[var(--text-primary)] font-bold mb-6">Privacy & Data Control</h2>
                       <p className="text-sm text-[var(--text-sec)] leading-relaxed">
                          Your writing data is used solely for pedagogical analysis and developmental feedback within this course.
                       </p>
                       <div className="p-4 rounded-xl border border-amber-500/10 bg-amber-500/5 text-amber-200/80 text-xs italic">
                          "Your identity is anonymized for all research exports, ensuring your privacy while contributing to academic growth models."
                       </div>
                    </div>
                 )}

                 <div className="mt-8 pt-8 border-t border-[var(--border)] flex justify-end">
                    <Button 
                       onClick={handleSave} 
                       className={`flex items-center gap-2 group ${saveSuccess ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-[var(--lav)]'}`}
                    >
                       {saveSuccess ? (
                          <>
                             <Check size={16} /> Preferences Saved
                          </>
                       ) : (
                          <>
                             Save Changes
                          </>
                       )}
                    </Button>
                 </div>
              </GlassCard>
           </main>
        </div>
      </div>
    </StudentShell>
  );
}

