// LEGACY - Moved during architecture refactor on 2026-04-08
// This was an earlier simplified app shell (3 routes). Real app is frontend/src/App.tsx.
// Do NOT import or use. Kept for historical reference only.
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';

export function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    clearError();
    const ok = await login(username, password);
    if (ok) navigate('/dashboard');
  }

  return (
    <div className="min-h-screen bg-[var(--bg-deep)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <h1 className="font-editorial text-5xl italic text-[var(--text-primary)] mb-2">WriteLens</h1>
          <p className="text-[var(--text-muted)] text-sm font-navigation uppercase tracking-widest">
            Adaptive Writing Analytics
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-[var(--bg-sidebar)] border border-[var(--border)] rounded-2xl p-8 space-y-5 shadow-2xl"
        >
          <div>
            <label className="block text-xs font-navigation font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autoFocus
              className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--lav)] transition-colors"
              placeholder="Enter your username"
            />
          </div>

          <div>
            <label className="block text-xs font-navigation font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full bg-[var(--bg-deep)] border border-[var(--border)] rounded-xl px-4 py-3 text-[var(--text-primary)] text-sm outline-none focus:border-[var(--lav)] transition-colors"
              placeholder="Enter your password"
            />
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-navigation">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-[var(--lav)] text-white font-navigation font-bold text-xs uppercase tracking-widest shadow-[0_0_20px_var(--lav-glow)] hover:scale-[1.02] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}
