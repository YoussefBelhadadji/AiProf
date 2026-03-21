import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Reports } from './pages/Reports';
import { Import } from './pages/Import';
import { Settings } from './pages/Settings';
import { Station01 } from './pages/Station01';
import { Station02 } from './pages/Station02';
import { Station03 } from './pages/Station03';
import { Station04 } from './pages/Station04';
import { Station05 } from './pages/Station05';
import { Station06 } from './pages/Station06';
import { Station07 } from './pages/Station07';
import { Station08 } from './pages/Station08';
import { Station09 } from './pages/Station09';
import { Station10 } from './pages/Station10';
import { Station11 } from './pages/Station11';
import { Station12 } from './pages/Station12';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/students" element={<Students />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/import" element={<Import />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/pipeline/1" element={<Station01 />} />
        <Route path="/pipeline/2" element={<Station02 />} />
        <Route path="/pipeline/3" element={<Station03 />} />
        <Route path="/pipeline/4" element={<Station04 />} />
        <Route path="/pipeline/5" element={<Station05 />} />
        <Route path="/pipeline/6" element={<Station06 />} />
        <Route path="/pipeline/7" element={<Station07 />} />
        <Route path="/pipeline/8" element={<Station08 />} />
        <Route path="/pipeline/9" element={<Station09 />} />
        <Route path="/pipeline/10" element={<Station10 />} />
        <Route path="/pipeline/11" element={<Station11 />} />
        <Route path="/pipeline/12" element={<Station12 />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
