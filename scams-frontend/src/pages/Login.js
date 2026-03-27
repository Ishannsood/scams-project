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
          <h1>SCAMS</h1>
          <p>Student Club Activity Management System</p>
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
        <p style={{fontSize:'12px', color:'var(--gray-600)', marginBottom:'8px', fontWeight:600}}>Quick Login (Demo Accounts)</p>
        <div style={{display:'flex', flexDirection:'column', gap:'6px'}}>
          {[
            { label: '👤 Member',    email: 'member@test.com'  },
            { label: '⚙️ Executive', email: 'exec@test.com'    },
            { label: '🎓 Advisor',   email: 'advisor@test.com' },
          ].map(a => (
            <button key={a.email} className="btn btn-ghost btn-sm" onClick={() => fillAccount(a.email)} style={{justifyContent:'flex-start'}}>
              {a.label} — {a.email}
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
