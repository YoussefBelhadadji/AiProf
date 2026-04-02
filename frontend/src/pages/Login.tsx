import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { useStudyScopeStore } from '../state/studyScope';
import { autoLoadCases, fetchCases } from '../services/casesApi';
import { mapParsedCaseToStudyCase } from '../state/studyScope';
import { Button } from '../components/Button';
import { Beaker, ShieldCheck, Lock, ArrowRight, User } from 'lucide-react';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  
  const navigate = useNavigate();
  const authStore = useAuthStore();
  const studyScopeStore = useStudyScopeStore();
  const isLoading = authStore.isLoading;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!username.trim() || !password.trim()) {
      setError('Please enter both username and password');
      return;
    }

    const success = await authStore.login(username.trim(), password.trim());
    if (success) {
      sessionStorage.setItem('writelens-research-access', 'granted');
      
      // Auto-load workbook cases after login for full teacher control
      try {
        const token = useAuthStore.getState().token;
        if (token) {
          let parsedCases = await fetchCases(token);
          if (parsedCases.length === 0) {
            parsedCases = await autoLoadCases(token);
          }

          if (parsedCases.length > 0) {
            studyScopeStore.importCases(parsedCases.map(mapParsedCaseToStudyCase));
          }
        }
      } catch (err) {
        console.error('Failed to load workbook cases:', err);
      }
      
      navigate('/dashboard');
    } else {
      setError(authStore.error || 'Invalid Research Credentials');
    }
  };

  return (
    <main id="main-content" className="min-h-screen bg-[var(--bg-deep)] flex overflow-hidden font-body">
      {/* Left Hemisphere: Research Context */}
      <div className="hidden lg:flex w-7/12 bg-[var(--bg-sidebar)] relative flex-col justify-between p-16 overflow-hidden">
        {/* Background Visual Artifacts */}
        <div className="absolute top-[-10%] right-[-10%] w-[600px] h-[600px] bg-[var(--lav-glow)] rounded-full blur-[120px] opacity-20"></div>
        <div className="absolute bottom-[-5%] left-[-5%] w-[400px] h-[400px] bg-[var(--blue-glow)] rounded-full blur-[100px] opacity-15"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-12 h-12 rounded-xl bg-[var(--lav)] flex items-center justify-center shadow-[0_0_25px_var(--lav-glow)]">
              <Beaker className="w-7 h-7 text-white" />
            </div>
            <span className="font-navigation font-bold text-3xl tracking-tighter text-gradient-lav">WriteLens</span>
          </div>

          <div className="max-w-xl">
             <h1 className="font-editorial text-5xl md:text-6xl italic leading-tight text-[var(--text-primary)] mb-8">
               Adaptive Writing <br/><span className="text-[var(--lav)]">Assessment</span> <br/>for Educators.
             </h1>
             <p className="text-xl text-[var(--text-sec)] leading-relaxed font-body mb-12">
               A dedicated teaching platform for diagnosing academic writing development, delivering adaptive feedback, and tracking student growth with evidence-based intervention.
             </p>

             <div className="grid grid-cols-2 gap-8 text-[var(--text-sec)]">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-6 h-6 text-[var(--lav)] shrink-0" />
                  <div>
                    <h4 className="font-navigation text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-1">Professor-Only</h4>
                    <p className="text-sm">Single-instructor analytics and feedback control.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Lock className="w-6 h-6 text-[var(--blue)] shrink-0" />
                  <div>
                    <h4 className="font-navigation text-xs font-bold uppercase tracking-widest text-[var(--text-primary)] mb-1">Student Privacy</h4>
                    <p className="text-sm">No student login. Data stays private to you.</p>
                  </div>
                </div>
             </div>
          </div>
        </div>

        <div className="relative z-10 flex items-center justify-between border-t border-[var(--border)] pt-8">
           <div className="font-editorial text-sm italic text-[var(--text-muted)]">
             WriteLens &copy; 2024-2026. University Teaching Platform.
           </div>
           <div className="flex items-center gap-6">
              <span className="w-2 h-2 rounded-full bg-[var(--teal)] shadow-[0_0_8px_var(--teal)] animate-pulse"></span>
              <span className="font-navigation text-xs uppercase tracking-widest font-bold">System Active</span>
           </div>
        </div>
      </div>

      {/* Right Hemisphere: Access Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 lg:p-24 relative bg-[radial-gradient(circle_at_center,_var(--bg-raised)_0%,_var(--bg-deep)_100%)]">
        <div className="w-full max-w-md">
           <div className="lg:hidden flex items-center gap-3 mb-12">
              <div className="w-10 h-10 rounded-lg bg-[var(--lav)] flex items-center justify-center">
                <Beaker className="w-6 h-6 text-white" />
              </div>
              <span className="font-navigation font-bold text-2xl tracking-tight text-white">WriteLens</span>
           </div>

           <div className="glass-card p-10 relative overflow-hidden">
              <div className="mb-8">
                <h2 className="font-navigation font-bold text-2xl uppercase tracking-tighter mb-2">Professor Access</h2>
                <p className="text-[var(--text-sec)] text-sm">Enter your credentials to access student analytics and adaptive feedback tools.</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-6">
                {error && (
                  <div role="alert" aria-live="assertive" className="p-4 rounded-lg bg-[var(--red-dim)] border border-[var(--red-glow)] text-[var(--red)] text-xs font-navigation font-bold uppercase tracking-wide">
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <label htmlFor="login-username" className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold ml-1">Username or Email</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input
                      id="login-username"
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="username or email"
                      autoComplete="username"
                      className="w-full bg-[var(--bg-deep)] border border-[var(--border)] focus:border-[var(--lav-border)] focus:ring-2 focus:ring-[var(--lav-dim)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-password" className="font-navigation text-xs uppercase tracking-widest text-[var(--text-muted)] font-bold ml-1">Password</label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                    <input 
                      id="login-password"
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                      autoComplete="current-password"
                      className="w-full bg-[var(--bg-deep)] border border-[var(--border)] focus:border-[var(--lav-border)] focus:ring-2 focus:ring-[var(--lav-dim)] rounded-xl py-3 pl-12 pr-4 text-sm text-[var(--text-primary)] transition-all"
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  isLoading={isLoading}
                  fullWidth
                  variant="primary"
                  className="py-4 rounded-xl flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50 group hover:shadow-[0_0_20px_var(--lav-glow)]"
                >
                  <span className="font-navigation font-bold tracking-widest uppercase text-xs">Sign In to Dashboard</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Button>
              </form>

              <div className="mt-8 pt-8 border-t border-[var(--border)] flex flex-col gap-4">
                 <div className="text-center text-xs uppercase tracking-widest text-[var(--text-muted)] hover:text-[var(--lav)] transition-colors cursor-pointer font-bold">
                   Need help? Contact your IT department.
                 </div>
                 <div className="flex items-center gap-2 justify-center opacity-40">
                    <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
                    <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
                    <div className="w-1 h-1 rounded-full bg-[var(--text-muted)]"></div>
                 </div>
              </div>
           </div>

           <div className="mt-12 text-center">
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                Authorized Educators Only. All student data, analytics, and feedback <br/>decisions are logged for compliance and quality assurance.
              </p>
           </div>
        </div>
      </div>
    </main>
  );
};

