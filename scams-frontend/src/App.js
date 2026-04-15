import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import ActivityDetail from './pages/ActivityDetail';
import MyRegistrations from './pages/MyRegistrations';
import AttendanceHistory from './pages/AttendanceHistory';
import Manage from './pages/Manage';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';
import Members from './pages/Members';
import Announcements from './pages/Announcements';
import Profile from './pages/Profile';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const Footer = () => (
  <footer style={{
    borderTop: '1px solid var(--gray-200)',
    background: '#fff',
    padding: '18px 28px',
    marginTop: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  }}>
    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
      © 2026 <strong style={{ color: 'var(--gray-600)' }}>SCAMS</strong> — Student Club Activity Management System
    </span>
    <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>
      Built by{' '}
      <strong style={{ color: 'var(--primary)' }}>Ishan Sood</strong>
      {' '}&{' '}
      <strong style={{ color: 'var(--primary)' }}>Rabin Kunnananickal Binu</strong>
      {' '}· COMP 2154
    </span>
  </footer>
);

const AppLayout = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
    <Navbar />
    <div style={{ flex: 1 }}>{children}</div>
    <Footer />
  </div>
);

function AppRoutes() {
  const { user }   = useAuth();
  const location   = useLocation();
  return (
    <Routes key={location.pathname}>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/activities" element={
        <ProtectedRoute><AppLayout><Activities /></AppLayout></ProtectedRoute>
      } />
      <Route path="/activities/:id" element={
        <ProtectedRoute><AppLayout><ActivityDetail /></AppLayout></ProtectedRoute>
      } />
      <Route path="/announcements" element={
        <ProtectedRoute><AppLayout><Announcements /></AppLayout></ProtectedRoute>
      } />
      <Route path="/my-registrations" element={
        <ProtectedRoute roles={['member']}><AppLayout><MyRegistrations /></AppLayout></ProtectedRoute>
      } />
      <Route path="/attendance-history" element={
        <ProtectedRoute roles={['member']}><AppLayout><AttendanceHistory /></AppLayout></ProtectedRoute>
      } />
      <Route path="/manage" element={
        <ProtectedRoute roles={['executive', 'advisor']}><AppLayout><Manage /></AppLayout></ProtectedRoute>
      } />
      <Route path="/attendance" element={
        <ProtectedRoute roles={['executive', 'advisor']}><AppLayout><Attendance /></AppLayout></ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute roles={['executive', 'advisor']}><AppLayout><Reports /></AppLayout></ProtectedRoute>
      } />
      <Route path="/members" element={
        <ProtectedRoute roles={['executive', 'advisor']}><AppLayout><Members /></AppLayout></ProtectedRoute>
      } />
      <Route path="/profile" element={
        <ProtectedRoute><AppLayout><Profile /></AppLayout></ProtectedRoute>
      } />

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </BrowserRouter>
    </AuthProvider>
  );
}
