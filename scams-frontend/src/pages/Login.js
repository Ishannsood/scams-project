import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token, user } = await api.login(form);
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const fillAccount = (email) => setForm({ email, password: 'password123' });

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-badge">🎓 CampusSync</div>
          <h1>SCAMS</h1>
          <p>Student Club Activity Management System</p>
          <p style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: '6px' }}>
            Ishan Sood · Rabin Kunnananickal Binu
          </p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required />
          </div>
          <button className="btn btn-primary btn-lg" style={{width:'100%'}} disabled={loading}>
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <div className="divider" />
        <p style={{ fontSize: '11px', color: 'var(--gray-500)', marginBottom: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Demo Accounts
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { label: 'Member',    icon: '👤', email: 'member@test.com',  color: '#1d4ed8', bg: '#dbeafe' },
            { label: 'Executive', icon: '⚙️', email: 'exec@test.com',    color: '#7c3aed', bg: '#f3e8ff' },
            { label: 'Advisor',   icon: '🎓', email: 'advisor@test.com', color: '#065f46', bg: '#d1fae5' },
          ].map(a => (
            <button
              key={a.email}
              onClick={() => fillAccount(a.email)}
              style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '9px 14px', borderRadius: '8px', border: `1.5px solid ${a.bg}`,
                background: a.bg, cursor: 'pointer', transition: 'all 0.15s', width: '100%',
              }}
            >
              <span style={{ fontSize: '1rem' }}>{a.icon}</span>
              <span style={{ fontWeight: 700, fontSize: '13px', color: a.color }}>{a.label}</span>
              <span style={{ fontSize: '12px', color: a.color, opacity: 0.7, marginLeft: 'auto' }}>{a.email}</span>
            </button>
          ))}
        </div>

        <div className="auth-footer">
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </div>
    </div>
  );
}
