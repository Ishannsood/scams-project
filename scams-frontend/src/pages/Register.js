import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setLoading(true);
    try {
      const { token, user } = await api.register(form);
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({...form, [k]: e.target.value});

  return (
    <div className="auth-page">
      <div className="auth-box">
        <div className="auth-logo">
          <div className="auth-logo-badge">🎓 CampusSync</div>
          <h1>SCAMS</h1>
          <p>Create your account to get started</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Full Name</label>
            <input type="text" value={form.name} onChange={set('name')} placeholder="Jane Smith" required />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input type="email" value={form.email} onChange={set('email')} placeholder="you@college.edu" required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input type="password" value={form.password} onChange={set('password')} placeholder="At least 6 characters" required minLength={6} />
          </div>
          <div className="form-group">
            <label>I am a…</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {[
                { value: 'member',    icon: '👤', label: 'Member',    desc: 'Join & attend' },
                { value: 'executive', icon: '⚙️', label: 'Executive', desc: 'Manage events' },
                { value: 'advisor',   icon: '🎓', label: 'Advisor',   desc: 'Oversee club' },
              ].map(r => (
                <div
                  key={r.value}
                  onClick={() => setForm({ ...form, role: r.value })}
                  style={{
                    padding: '10px 6px', borderRadius: 8, textAlign: 'center', cursor: 'pointer',
                    border: `2px solid ${form.role === r.value ? 'var(--primary)' : 'var(--gray-200)'}`,
                    background: form.role === r.value ? 'var(--primary-light)' : '#fff',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: '1.3rem', marginBottom: 4 }}>{r.icon}</div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: form.role === r.value ? 'var(--primary)' : 'var(--gray-800)' }}>{r.label}</div>
                  <div style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: 2 }}>{r.desc}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account? <Link to="/login">Sign in</Link>
        </div>
      </div>
    </div>
  );
}
