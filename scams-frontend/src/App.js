import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Activities from './pages/Activities';
import MyRegistrations from './pages/MyRegistrations';
import Manage from './pages/Manage';
import Attendance from './pages/Attendance';
import Reports from './pages/Reports';

const ProtectedRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading">Loading…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" replace />;
  return children;
};

const AppLayout = ({ children }) => (
  <>
    <Navbar />
    {children}
  </>
);

function AppRoutes() {
  const { user } = useAuth();
  return (
    <Routes>
      <Route path="/login"    element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />

      <Route path="/dashboard" element={
        <ProtectedRoute><AppLayout><Dashboard /></AppLayout></ProtectedRoute>
      } />
      <Route path="/activities" element={
        <ProtectedRoute><AppLayout><Activities /></AppLayout></ProtectedRoute>
      } />
      <Route path="/my-registrations" element={
        <ProtectedRoute roles={['member']}><AppLayout><MyRegistrations /></AppLayout></ProtectedRoute>
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

      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
