import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '../components/GlassCard';
import { Button } from '../components/Atoms';
import { ArrowRight, ArrowLeft, Mail } from 'lucide-react';

export function ForgotPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTimeout(() => {
      setSubmitted(true);
    }, 500);
  };

  return (
    <div className="min-h-screen w-full bg-[var(--bg-deep)] flex items-center justify-center p-6">
      <GlassCard className="w-full max-w-md p-8 border border-[var(--border-bright)] animate-in fade-in zoom-in duration-500">
        <button onClick={() => navigate('/login')} className="flex items-center gap-2 text-sm text-[var(--text-sec)] hover:text-[var(--text-primary)] mb-6 transition-colors font-navigation uppercase tracking-wider">
          <ArrowLeft size={16} /> Back to Login
        </button>
        
        <h2 className="font-navigation text-2xl font-medium text-[var(--text-primary)] mb-2">
          Reset Password
        </h2>
        <p className="font-body text-sm text-[var(--text-sec)] mb-8">
          Enter your institutional email address and we'll send you instructions to reset your password.
        </p>

        {submitted ? (
          <div className="bg-[var(--lav-dim)] border border-[var(--lav-border)] rounded-xl p-4 text-center">
            <Mail size={24} className="text-[var(--lav)] mx-auto mb-2" />
            <h3 className="font-navigation text-sm font-medium text-[var(--lav)] mb-1">Check your inbox</h3>
            <p className="font-body text-xs text-[var(--text-sec)]">
              If an account matches {email}, you will receive a password reset link shortly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="flex flex-col gap-2">
              <label htmlFor="forgot-email" className="text-xs font-navigation uppercase tracking-widest text-[var(--text-muted)] ml-1">Email Address</label>
              <input
                id="forgot-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-md px-4 py-3 text-sm text-[var(--text-primary)] focus:border-[var(--lav)] transition-colors"
                placeholder="teacher@writelens.edu"
              />
            </div>
            
            <Button type="submit" className="w-full justify-between group h-12 shadow-[0_0_20px_var(--lav-glow)] bg-[var(--lav)] hover:bg-[var(--lav-glow)] text-white border-transparent">
              Send Reset Link <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </Button>
          </form>
        )}
      </GlassCard>
    </div>
  );
}
