import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';
import { api } from '../api';

const EMPTY_FORM = { title: '', content: '', pinned: false };

export default function Announcements() {
  const { user } = useAuth();
  const toast = useToast();
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);

  const isAdmin = user.role === 'executive' || user.role === 'advisor';

  const load = async () => {
    setLoading(true); setError(null); setCountdown(0);
    try {
      const data = await api.getAnnouncements();
      setAnnouncements(data);
    } catch (e) {
      setError(e.message || 'Failed to load.');
      if (e.message === 'COLD_START') {
        let t = 55; setCountdown(t);
        const iv = setInterval(() => { t -= 1; setCountdown(t); if (t <= 0) { clearInterval(iv); load(); } }, 1000);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.createAnnouncement(form);
      toast('Announcement posted!');
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } catch (err) {
      toast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      await api.deleteAnnouncement(confirmDelete);
      toast('Announcement deleted.', 'info');
      load();
    } catch (e) {
      toast(e.message, 'error');
    } finally {
      setConfirmDelete(null);
    }
  };

  if (error) return (
    <div className="page">
      <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'80px 24px', textAlign:'center', gap:16 }}>
        {error === 'COLD_START' ? (
          <>
            <div style={{ fontSize:'2.5rem' }}>⏳</div>
            <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--gray-700)' }}>Server is waking up…</h3>
            <p style={{ fontSize:13, color:'var(--gray-500)', maxWidth:340 }}>The free server spins down after inactivity. It'll be ready in about a minute.</p>
            <div style={{ width:64, height:64, borderRadius:'50%', border:'4px solid var(--gray-200)', borderTopColor:'var(--primary)', animation:'spin 1s linear infinite' }} />
            <p style={{ fontSize:22, fontWeight:800, color:'var(--primary)', letterSpacing:'-0.04em' }}>{countdown}s</p>
            <p style={{ fontSize:12, color:'var(--gray-400)' }}>Retrying automatically…</p>
            <button className="btn btn-ghost btn-sm" onClick={load}>Retry now</button>
          </>
        ) : (
          <>
            <div style={{ fontSize:'2.5rem' }}>⚠️</div>
            <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--gray-700)' }}>Could not load announcements</h3>
            <p style={{ fontSize:12, color:'var(--gray-400)', fontFamily:'monospace', background:'var(--gray-100)', padding:'6px 12px', borderRadius:6 }}>{error}</p>
            <button className="btn btn-primary" onClick={load}>Retry</button>
          </>
        )}
      </div>
    </div>
  );

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
                      onClick={() => setConfirmDelete(a.id)}
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

      {confirmDelete && (
        <ConfirmModal
          title="Delete Announcement"
          message="Are you sure you want to delete this announcement? This cannot be undone."
          confirmLabel="Delete"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
