/**
 * Authentication API Service
 * Handles all backend authentication requests
 */

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    username: string;
    role: string;
    displayName: string;
  };
}

export interface LoginError {
  error: string;
}

/**
 * Authenticate user with username and password
 * @param username - User's username
 * @param password - User's password
 * @returns Authentication token and user info
 */
export async function loginUser(username: string, password: string): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    const error = (await response.json()) as LoginError;
    throw new Error(error.error || 'Login failed');
  }

  return response.json() as Promise<LoginResponse>;
}

/**
 * Verify if token is still valid
 * @param token - JWT token to verify
 * @returns True if token is valid
 */
export async function verifyToken(token: string): Promise<boolean> {
  try {
    const response = await fetch(`${API_BASE}/auth/verify`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Logout user (client-side cleanup)
 */
export function logout(): void {
  sessionStorage.removeItem('writelens-auth-token');
  sessionStorage.removeItem('writelens-research-access');
}
