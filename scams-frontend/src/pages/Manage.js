import { useEffect, useState } from 'react';
import { api } from '../api';

const EMPTY_FORM = { title: '', description: '', date: '', time: '', location: '', maxCapacity: 30 };

export default function Manage() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    const data = await api.getActivities();
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const flash = (m, isErr = false) => {
    if (isErr) { setError(m); setTimeout(() => setError(''), 3500); }
    else { setMsg(m); setTimeout(() => setMsg(''), 3000); }
  };

  const openCreate = () => { setEditing(null); setForm(EMPTY_FORM); setShowModal(true); };
  const openEdit = (a) => {
    setEditing(a.id);
    setForm({ title: a.title, description: a.description, date: a.date, time: a.time, location: a.location, maxCapacity: a.maxCapacity });
    setShowModal(true);
  };
  const closeModal = () => { setShowModal(false); setEditing(null); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setSaving(true);
    try {
      if (editing) { await api.updateActivity(editing, form); flash('Activity updated!'); }
      else { await api.createActivity(form); flash('Activity created!'); }
      closeModal(); load();
    } catch (err) { flash(err.message, true); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    try { await api.deleteActivity(id); flash('Activity deleted.'); load(); }
    catch (e) { flash(e.message, true); }
  };

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  if (loading) return <div className="loading">Loading activities…</div>;

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1>Manage Activities</h1>
          <p>Create, edit, or delete club activities.</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>➕ New Activity</button>
      </div>

      {msg && <div className="alert alert-success">{msg}</div>}
      {error && <div className="alert alert-error">{error}</div>}

      {activities.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">📝</div>
          <h3>No activities yet</h3>
          <p>Create your first activity to get started.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(a => {
                  const pct = Math.round((a.registeredCount / a.maxCapacity) * 100);
                  const isPast = new Date(a.date) < new Date();
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{a.title}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{a.description?.slice(0, 60)}{a.description?.length > 60 ? '…' : ''}</div>
                      </td>
                      <td>
                        <div>{new Date(a.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{a.time || 'TBD'}</div>
                        {isPast && <span className="badge badge-warning" style={{ marginTop: 4 }}>Past</span>}
                      </td>
                      <td>{a.location}</td>
                      <td>
                        <div style={{ fontSize: '13px' }}>{a.registeredCount} / {a.maxCapacity}</div>
                        <div className="cap-bar" style={{ marginTop: '4px', width: '80px' }}>
                          <div className={`cap-bar-fill${pct >= 100 ? ' full' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(a.id, a.title)}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={(e) => e.target.className === 'modal-overlay' && closeModal()}>
          <div className="modal">
            <div className="modal-header">
              <h2>{editing ? 'Edit Activity' : 'Create Activity'}</h2>
              <button className="modal-close" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Title *</label>
                <input value={form.title} onChange={set('title')} placeholder="e.g. React Workshop" required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea value={form.description} onChange={set('description')} placeholder="Brief description of the activity…" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Date *</label>
                  <input type="date" value={form.date} onChange={set('date')} required />
                </div>
                <div className="form-group">
                  <label>Time</label>
                  <input type="time" value={form.time} onChange={set('time')} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div className="form-group">
                  <label>Location</label>
                  <input value={form.location} onChange={set('location')} placeholder="e.g. Room 101" />
                </div>
                <div className="form-group">
                  <label>Max Capacity</label>
                  <input type="number" value={form.maxCapacity} onChange={set('maxCapacity')} min={1} max={500} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
