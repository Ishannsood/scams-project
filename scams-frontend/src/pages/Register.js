import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: '#dc2626' };
  if (score <= 2) return { score, label: 'Fair',   color: '#d97706' };
  if (score <= 3) return { score, label: 'Good',   color: '#2563eb' };
  return           { score, label: 'Strong', color: '#059669' };
}

const ROLES = [
  { value: 'member',    icon: '👤', label: 'Member',    desc: 'Join & attend events' },
  { value: 'executive', icon: '⚙️', label: 'Executive', desc: 'Manage activities'    },
  { value: 'advisor',   icon: '🎓', label: 'Advisor',   desc: 'Oversee the club'     },
];

export default function Register() {
  const [form, setForm]         = useState({ name: '', email: '', password: '', role: 'member' });
  const [confirm, setConfirm]   = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);
  const { login }               = useAuth();
  const navigate                = useNavigate();

  const strength = useMemo(() => passwordStrength(form.password), [form.password]);
  const mismatch = confirm.length > 0 && confirm !== form.password;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== confirm) { setError('Passwords do not match.'); return; }
    setError(''); setLoading(true);
    try {
      const { token, user } = await api.register(form);
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.message);
    } finally { setLoading(false); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <div className="auth-page">
      <div className="auth-box" style={{ maxWidth: 460 }}>

        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-badge">🎓 CampusSync</div>
          <h1>SCAMS</h1>
          <p>Create your account to get started</p>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>

          {/* Name */}
          <div className="form-group">
            <label>Full Name</label>
            <input
              type="text" value={form.name} onChange={set('name')}
              placeholder="Jane Smith" required autoComplete="name"
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email</label>
            <input
              type="email" value={form.email} onChange={set('email')}
              placeholder="you@college.edu" required autoComplete="email"
            />
          </div>

          {/* Password + strength */}
          <div className="form-group" style={{ marginBottom: 8 }}>
            <label>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPw ? 'text' : 'password'}
                value={form.password} onChange={set('password')}
                placeholder="At least 6 characters" required minLength={6}
                autoComplete="new-password"
                style={{ paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPw(v => !v)}
                style={{
                  position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  fontSize: 14, color: 'var(--gray-400)', padding: 2, lineHeight: 1,
                }}
                tabIndex={-1}
              >
                {showPw ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Strength bar */}
          {form.password.length > 0 && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 4, marginBottom: 5 }}>
                {[1,2,3,4,5].map(i => (
                  <div key={i} style={{
                    flex: 1, height: 3, borderRadius: 999,
                    background: i <= strength.score ? strength.color : 'var(--gray-200)',
                    transition: 'background 0.2s',
                  }} />
                ))}
              </div>
              <span style={{ fontSize: 11, fontWeight: 700, color: strength.color }}>
                {strength.label} password
              </span>
            </div>
          )}

          {/* Confirm password */}
          <div className="form-group">
            <label>Confirm Password</label>
            <input
              type={showPw ? 'text' : 'password'}
              value={confirm} onChange={e => setConfirm(e.target.value)}
              placeholder="Re-enter your password" required
              autoComplete="new-password"
              style={{ borderColor: mismatch ? 'var(--danger)' : undefined }}
            />
            {mismatch && (
              <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 5, fontWeight: 600 }}>
                Passwords don't match
              </p>
            )}
          </div>

          {/* Role selector */}
          <div className="form-group">
            <label>I am a…</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {ROLES.map(r => {
                const active = form.role === r.value;
                return (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setForm({ ...form, role: r.value })}
                    style={{
                      padding: '12px 6px', borderRadius: 10, textAlign: 'center',
                      cursor: 'pointer', transition: 'all 0.15s',
                      border: `2px solid ${active ? 'var(--primary)' : 'var(--gray-200)'}`,
                      background: active ? 'var(--primary-light)' : '#fff',
                      boxShadow: active ? '0 0 0 3px rgba(79,70,229,0.1)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: '1.4rem', marginBottom: 5 }}>{r.icon}</div>
                    <div style={{
                      fontSize: '12px', fontWeight: 700, lineHeight: 1.2,
                      color: active ? 'var(--primary)' : 'var(--gray-800)',
                    }}>{r.label}</div>
                    <div style={{ fontSize: '10px', color: 'var(--gray-500)', marginTop: 3, lineHeight: 1.3 }}>
                      {r.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <button
            className="btn btn-primary btn-lg"
            style={{ width: '100%', marginTop: 4 }}
            disabled={loading || mismatch}
          >
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
