import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';
import { BookOpen, Users, Activity, AlertTriangle, ArrowRight } from 'lucide-react';
import { asmaaWorkspaceStudent, caseStudyMeta } from '../data/diagnostic';

type StatCardAccent = 'lav' | 'teal' | 'red' | 'gold';

interface StatCardProps {
  icon: React.ElementType;
  label: string;
  value: string;
  delay: string;
  isLoaded: boolean;
  accent: StatCardAccent;
}

export function Login() {
  const navigate = useNavigate();
  const [isLoaded] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-deep)] flex overflow-hidden relative">
      <div className="absolute inset-0 z-0 opacity-[0.03]">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--lav)] blur-[120px] animate-pulse" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-[var(--teal)] blur-[120px] animate-pulse" style={{ animationDuration: '12s' }} />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row max-w-7xl mx-auto w-full z-10 p-6 lg:p-12 items-center gap-12 xl:gap-24">
        <div
          className="flex-1 flex flex-col gap-10 opacity-0 transform -translate-x-8 transition-all duration-[800ms] ease-[var(--ease-spring)]"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateX(0)' : 'translateX(-2rem)'
          }}
        >
          <div>
            <h1 className="font-editorial italic text-4xl lg:text-5xl lg:leading-[1.1] text-[var(--text-primary)] mb-4">
              Forensic Intelligence for Adaptive Writing Assessment
            </h1>
            <p className="font-body text-[var(--text-sec)] text-lg">
              Doctoral Research Study - Belhadj Bouchaib University
            </p>
          </div>

          <blockquote className="border-l-4 border-[var(--lav)] pl-6 py-2">
            <p className="font-editorial italic text-xl lg:text-2xl text-[var(--text-primary)] leading-relaxed">
              "Assessment is most powerful when it illuminates the learning process, not merely its outcomes."
            </p>
            <footer className="mt-3 font-navigation text-sm text-[var(--text-muted)] tracking-wider uppercase">
              - Inspired by Hattie, 2009
            </footer>
          </blockquote>

          <div className="grid grid-cols-2 gap-4 mt-4">
            <StatCard icon={Users} label="Case File" value={caseStudyMeta.userId} delay="100ms" isLoaded={isLoaded} accent="lav" />
            <StatCard icon={Activity} label="Log Entries" value={String(caseStudyMeta.activityLogEntries)} delay="180ms" isLoaded={isLoaded} accent="teal" />
            <StatCard icon={AlertTriangle} label="Risk Status" value={asmaaWorkspaceStudent.risk.toUpperCase()} delay="260ms" isLoaded={isLoaded} accent="gold" />
            <StatCard icon={BookOpen} label="Assignments" value={String(caseStudyMeta.totalAssignmentsSubmitted)} delay="340ms" isLoaded={isLoaded} accent="gold" />
          </div>
        </div>

        <div
          className="w-full max-w-md opacity-0 transform translate-x-8 transition-all duration-[800ms] ease-[var(--ease-spring)]"
          style={{
            opacity: isLoaded ? 1 : 0,
            transform: isLoaded ? 'translateX(0)' : 'translateX(2rem)',
            transitionDelay: '150ms'
          }}
        >
          <GlassCard elevation="high" className="p-8 border border-[var(--border-bright)] backdrop-blur-[32px]">
            <h2 className="font-navigation text-2xl font-medium text-[var(--text-primary)] mb-8">
              Research Access
            </h2>

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div className="flex flex-col gap-2">
                <label className="font-body text-sm font-medium text-[var(--text-sec)]">
                  Institutional Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-4 py-3 text-[var(--text-primary)] font-body focus:outline-none focus:border-[var(--lav)] transition-colors"
                  placeholder="dr.name@university.edu"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="font-body text-sm font-medium text-[var(--text-sec)]">
                  Research Passphrase
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-4 py-3 text-[var(--text-primary)] font-body focus:outline-none focus:border-[var(--lav)] transition-colors"
                  placeholder="************"
                  required
                />
              </div>

              <Button type="submit" className="mt-4 w-full justify-between group">
                Enter Research Workspace
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Button>
            </form>

            <div className="mt-8 pt-6 border-t border-[var(--border)] text-center">
              <p className="font-forensic text-xs text-[var(--text-muted)]">
                WriteLens Analytical Studio v2.0
              </p>
            </div>
          </GlassCard>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, delay, isLoaded, accent }: StatCardProps) {
  return (
    <GlassCard
      elevation="mid"
      accent={accent}
      className="flex items-center gap-4 p-4 transition-all duration-700 ease-[var(--ease-spring)]"
      style={{
        opacity: isLoaded ? 1 : 0,
        transform: isLoaded ? 'translateY(0)' : 'translateY(1rem)',
        transitionDelay: delay
      }}
    >
      <div className={`text-[var(--${accent})]`}><Icon size={20} /></div>
      <div className="flex flex-col">
        <span className="font-body text-xs text-[var(--text-sec)]">{label}</span>
        <span className="font-forensic text-xl font-medium text-[var(--text-primary)]">{value}</span>
      </div>
    </GlassCard>
  );
}
