import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const EMPTY_FORM = { title: '', content: '', pinned: false };

export default function Announcements() {
  const { user } = useAuth();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const isAdmin = user.role === 'executive' || user.role === 'advisor';

  const load = async () => {
    const data = await api.getAnnouncements();
    setAnnouncements(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAnnouncement(form);
      flash('✅ Announcement posted!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      flash('❌ ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this announcement?')) return;
    try {
      await api.deleteAnnouncement(id);
      flash('Announcement deleted.');
      load();
    } catch (e) {
      flash('❌ ' + e.message);
    }
  };

  if (loading) return <div className="loading">Loading announcements…</div>;

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1>Announcements</h1>
          <p>Club notices and updates from the executive team.</p>
        </div>
        {isAdmin && (
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '📢 Post Announcement'}
          </button>
        )}
      </div>

      {msg && <div className={`alert ${msg.startsWith('❌') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {isAdmin && showForm && (
        <div className="card mb-4">
          <div className="card-title">New Announcement</div>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title *</label>
              <input
                value={form.title}
                onChange={e => setForm({ ...form, title: e.target.value })}
                placeholder="e.g. Upcoming AGM Notice"
                required
              />
            </div>
            <div className="form-group">
              <label>Content *</label>
              <textarea
                value={form.content}
                onChange={e => setForm({ ...form, content: e.target.value })}
                placeholder="Write your announcement here…"
                style={{ minHeight: '100px' }}
                required
              />
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={form.pinned}
                  onChange={e => setForm({ ...form, pinned: e.target.checked })}
                  style={{ width: 'auto' }}
                />
                Pin this announcement (shows at top)
              </label>
            </div>
            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 16 }}>
              <button type="button" className="btn btn-ghost" onClick={() => setShowForm(false)}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Posting…' : 'Post Announcement'}
              </button>
            </div>
          </form>
        </div>
      )}

      {announcements.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">📢</span>
          <h3>No announcements yet</h3>
          {isAdmin
            ? <p>Post an announcement to notify all members.</p>
            : <p>Check back later for updates from the executive team.</p>}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {announcements.map(a => {
            const initials = a.creatorName.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
            return (
              <div
                key={a.id}
                className="card"
                style={{ borderLeft: a.pinned ? '4px solid var(--primary)' : '4px solid var(--gray-200)', padding: '18px 20px' }}
              >
                <div className="flex-between" style={{ marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    {a.pinned && (
                      <span style={{
                        background: 'var(--primary-light)', color: 'var(--primary)',
                        fontSize: '10px', fontWeight: 700, textTransform: 'uppercase',
                        letterSpacing: '0.05em', padding: '2px 8px', borderRadius: 999,
                      }}>📌 Pinned</span>
                    )}
                    <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>{a.title}</h3>
                  </div>
                  {isAdmin && (
                    <button
                      className="btn btn-ghost btn-sm"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger-light)', flexShrink: 0 }}
                      onClick={() => handleDelete(a.id)}
                    >
                      Delete
                    </button>
                  )}
                </div>

                <p style={{ color: 'var(--gray-700)', fontSize: '14px', lineHeight: 1.65, marginBottom: 14 }}>
                  {a.content}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{
                    width: 24, height: 24, borderRadius: '50%', background: 'var(--primary-light)',
                    color: 'var(--primary)', fontSize: '10px', fontWeight: 800,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>{initials}</div>
                  <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>
                    {a.creatorName} · {new Date(a.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
