// LEGACY - Moved during architecture refactor on 2026-04-08
// This was an earlier simplified app shell (3 routes). Real app is frontend/src/App.tsx.
// Do NOT import or use. Kept for historical reference only.
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from '../state/authStore';
import { LoginPage } from './LoginPage';
import { DashboardPage } from './DashboardPage';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
