import { useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

function passwordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: '' };
  let score = 0;
  if (pw.length >= 6)  score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score, label: 'Weak',   color: 'var(--danger)' };
  if (score <= 2) return { score, label: 'Fair',   color: 'var(--warning)' };
  if (score <= 3) return { score, label: 'Good',   color: 'var(--info)' };
  return           { score, label: 'Strong', color: 'var(--success)' };
}

const ROLE_META = {
  member:    { label: 'Member',    color: '#1d4ed8', bg: '#dbeafe', desc: 'Can browse and register for activities' },
  executive: { label: 'Executive', color: '#5b21b6', bg: '#ede9fe', desc: 'Can manage activities and mark attendance' },
  advisor:   { label: 'Advisor',   color: '#065f46', bg: '#d1fae5', desc: 'Full club oversight and management access' },
};

const AVATAR_COLORS = [
  '#4f46e5','#7c3aed','#db2777','#d97706','#059669',
  '#2563eb','#dc2626','#0891b2','#65a30d','#9333ea',
];

export default function Profile() {
  const { user, updateUser } = useAuth();
  const toast = useToast();

  const avatarColor = AVATAR_COLORS[user.id.charCodeAt(user.id.length - 1) % AVATAR_COLORS.length];
  const initials    = user.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
  const roleMeta    = ROLE_META[user.role] || ROLE_META.member;

  // Name form
  const [name,       setName]       = useState(user.name);
  const [savingName, setSavingName] = useState(false);

  // Password form
  const [pwForm,    setPwForm]    = useState({ current: '', next: '', confirm: '' });
  const [showPw,    setShowPw]    = useState(false);
  const [savingPw,  setSavingPw]  = useState(false);

  const strength  = useMemo(() => passwordStrength(pwForm.next), [pwForm.next]);
  const mismatch  = pwForm.confirm.length > 0 && pwForm.confirm !== pwForm.next;
  const nameChanged = name.trim() !== user.name;

  const handleNameSave = async (e) => {
    e.preventDefault();
    if (!nameChanged) return;
    setSavingName(true);
    try {
      const { token, user: updated } = await api.updateProfile({ name: name.trim() });
      updateUser(updated, token);
      toast('Name updated!');
    } catch (err) { toast(err.message, 'error'); }
    finally { setSavingName(false); }
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    if (pwForm.next !== pwForm.confirm) { toast('Passwords do not match', 'error'); return; }
    setSavingPw(true);
    try {
      const { token, user: updated } = await api.updateProfile({ currentPassword: pwForm.current, newPassword: pwForm.next });
      updateUser(updated, token);
      toast('Password updated!');
      setPwForm({ current: '', next: '', confirm: '' });
    } catch (err) { toast(err.message, 'error'); }
    finally { setSavingPw(false); }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
        <p>Manage your account details and password.</p>
      </div>

      {/* ── Profile hero card ── */}
      <div className="card mb-4" style={{
        background: `linear-gradient(135deg, ${avatarColor}18 0%, #fff 60%)`,
        borderLeft: `4px solid ${avatarColor}`,
        display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap',
      }}>
        {/* Avatar */}
        <div style={{
          width: 72, height: 72, borderRadius: '50%', flexShrink: 0,
          background: avatarColor, color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.03em',
          boxShadow: `0 4px 16px ${avatarColor}55`,
        }}>
          {initials}
        </div>
        {/* Info */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--gray-900)', letterSpacing: '-0.02em' }}>
            {user.name}
          </div>
          <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 3 }}>{user.email}</div>
          <div style={{ marginTop: 8 }}>
            <span style={{
              background: roleMeta.bg, color: roleMeta.color,
              fontSize: 10.5, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '0.06em', padding: '3px 10px', borderRadius: 999,
            }}>
              {roleMeta.label}
            </span>
            <span style={{ fontSize: 12, color: 'var(--gray-500)', marginLeft: 10 }}>
              {roleMeta.desc}
            </span>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, alignItems: 'start' }}>

        {/* ── Update name ── */}
        <div className="card">
          <div className="card-title">Display Name</div>
          <form onSubmit={handleNameSave}>
            <div className="form-group">
              <label>Full Name</label>
              <input
                type="text" value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Your full name" required minLength={2}
              />
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              {nameChanged && (
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setName(user.name)}>
                  Reset
                </button>
              )}
              <button className="btn btn-primary btn-sm" disabled={savingName || !nameChanged}>
                {savingName ? 'Saving…' : 'Save Name'}
              </button>
            </div>
          </form>
        </div>

        {/* ── Account info (read-only) ── */}
        <div className="card">
          <div className="card-title">Account Info</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Email',    value: user.email },
              { label: 'Role',     value: roleMeta.label },
              { label: 'User ID',  value: user.id },
            ].map(item => (
              <div key={item.label} className="detail-item">
                <span className="detail-label">{item.label}</span>
                <span className="detail-value" style={{ wordBreak: 'break-all' }}>{item.value}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 16, lineHeight: 1.5 }}>
            Email and role cannot be changed. Contact an advisor if you need help.
          </p>
        </div>

        {/* ── Change password ── */}
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <div className="card-title">Change Password</div>
          <form onSubmit={handlePasswordSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Current Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.current}
                  onChange={e => setPwForm(f => ({ ...f, current: e.target.value }))}
                  placeholder="••••••••" required
                />
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>New Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.next}
                  onChange={e => setPwForm(f => ({ ...f, next: e.target.value }))}
                  placeholder="At least 6 characters" required minLength={6}
                />
                {pwForm.next.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    <div style={{ display: 'flex', gap: 3, marginBottom: 3 }}>
                      {[1,2,3,4,5].map(i => (
                        <div key={i} style={{
                          flex: 1, height: 3, borderRadius: 999,
                          background: i <= strength.score ? strength.color : 'var(--gray-200)',
                        }} />
                      ))}
                    </div>
                    <span style={{ fontSize: 10, fontWeight: 700, color: strength.color }}>{strength.label}</span>
                  </div>
                )}
              </div>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label>Confirm New Password</label>
                <input
                  type={showPw ? 'text' : 'password'}
                  value={pwForm.confirm}
                  onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))}
                  placeholder="Re-enter new password" required
                  style={{ borderColor: mismatch ? 'var(--danger)' : undefined }}
                />
                {mismatch && (
                  <p style={{ fontSize: 11, color: 'var(--danger)', marginTop: 4, fontWeight: 600 }}>
                    Doesn't match
                  </p>
                )}
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 18 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 7, cursor: 'pointer', fontSize: 12, color: 'var(--gray-600)' }}>
                <input type="checkbox" checked={showPw} onChange={e => setShowPw(e.target.checked)} style={{ width: 'auto' }} />
                Show passwords
              </label>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 10 }}>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => setPwForm({ current: '', next: '', confirm: '' })}>
                  Clear
                </button>
                <button className="btn btn-primary btn-sm" disabled={savingPw || mismatch}>
                  {savingPw ? 'Updating…' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
