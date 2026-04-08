// LEGACY - Moved during architecture refactor on 2026-04-08
// This was a duplicate of frontend/src/state/ — store/ was unused scaffolding.
// The real stores were in state/; they now live in store/ after consolidation.
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginUser } from '../services/authApi';
import { normalizeTeacherDisplayName } from '../utils/teacherDisplay';

export interface User {
  id: string;
  username: string;
  role: 'student' | 'teacher' | 'researcher' | 'admin';
  displayName: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<boolean>;
  setAuthData: (token: string, user: User) => void;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      
      login: async (username: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await loginUser(username, password);
          const user: User = {
            id: response.user.id,
            username: response.user.username,
            role: response.user.role as 'student' | 'teacher' | 'researcher' | 'admin',
            displayName: normalizeTeacherDisplayName(
              response.user.displayName,
              response.user.username,
              response.user.role
            ),
          };
          set({ token: response.token, user, isLoading: false });
          sessionStorage.setItem('writelens-auth-token', response.token);
          return true;
        } catch (err) {
          const errorMessage = err instanceof Error ? err.message : 'Login failed';
          set({ error: errorMessage, isLoading: false });
          return false;
        }
      },

      setAuthData: (token, user) => {
        const normalized: User = {
          ...user,
          displayName: normalizeTeacherDisplayName(user.displayName, user.username, user.role),
        };
        set({ token, user: normalized });
        sessionStorage.setItem('writelens-auth-token', token);
      },

      logout: () => {
        set({ token: null, user: null, error: null });
        sessionStorage.removeItem('writelens-auth-token');
        sessionStorage.removeItem('writelens-research-access');
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'writelens-auth',
      version: 1,
      migrate: (persisted: unknown) => {
        const state = persisted as { user?: User | null; token?: string | null } | null;
        if (state?.user) {
          return {
            ...state,
            user: {
              ...state.user,
              displayName: normalizeTeacherDisplayName(
                state.user.displayName,
                state.user.username,
                state.user.role
              ),
            },
          };
        }
        return persisted;
      },
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
