import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { loginUser } from '../services/authApi';

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
            displayName: response.user.displayName,
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
        set({ token, user });
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
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
