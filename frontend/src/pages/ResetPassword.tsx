import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';
import { ArrowRight, EyeOff, Eye, ShieldCheck } from 'lucide-react';

export function ResetPassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    
    setError('');
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
      setTimeout(() => navigate('/login'), 2000);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-deep)] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-md p-8 border border-[var(--border-bright)] animate-in fade-in zoom-in duration-500">
        <h2 className="font-navigation text-2xl font-medium text-[var(--text-primary)] mb-2">
          Create New Password
        </h2>
        <p className="font-body text-sm text-[var(--text-sec)] mb-8">
          Please enter a strong password containing at least 8 characters.
        </p>

        {submitted ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
            <ShieldCheck size={24} className="text-emerald-500 mx-auto mb-2" />
            <h3 className="font-navigation text-sm font-medium text-emerald-500 mb-1">Password Reset Successful</h3>
            <p className="font-body text-xs text-emerald-400">
              Redirecting to login securely...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2 relative">
              <label htmlFor="new-password" className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] ml-1">New Password</label>
              <div className="relative">
                <input
                  id="new-password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete="new-password"
                  className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md pl-4 pr-10 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--lav)] transition-colors"
                  placeholder="••••••••"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex flex-col gap-2 relative">
              <label htmlFor="confirm-password" className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] ml-1">Confirm Password</label>
              <input
                id="confirm-password"
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--lav)] transition-colors"
                placeholder="••••••••"
              />
            </div>

            {error && (
              <p className="font-body text-xs text-rose-400 leading-relaxed" role="alert" aria-live="assertive">
                {error}
              </p>
            )}
            
            <Button type="submit" className="w-full justify-between group h-12 shadow-[0_0_20px_var(--lav-glow)] bg-[var(--lav)] hover:bg-[var(--lav-glow)] text-white border-transparent mt-2">
              Save Password <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
