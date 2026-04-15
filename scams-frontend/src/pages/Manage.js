import { useEffect, useState } from 'react';
import { api } from '../api';
import { useToast } from '../context/ToastContext';
import ConfirmModal from '../components/ConfirmModal';

const EMPTY_FORM = { title: '', description: '', date: '', time: '', location: '', maxCapacity: 30 };

export default function Manage() {
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(null); // { id, title }

  const load = async () => {
    const data = await api.getActivities();
    setActivities(data);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

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
      if (editing) { await api.updateActivity(editing, form); toast('Activity updated!'); }
      else { await api.createActivity(form); toast('Activity created!'); }
      closeModal(); load();
    } catch (err) { toast(err.message, 'error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try { await api.deleteActivity(confirmDelete.id); toast('Activity deleted.', 'info'); load(); }
    catch (e) { toast(e.message, 'error'); }
    finally { setConfirmDelete(null); }
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


      {activities.length === 0 ? (
        <div className="empty">
          <span className="empty-icon">📝</span>
          <h3>No activities yet</h3>
          <p>Create your first activity to get started.</p>
          <div style={{ marginTop: 16 }}>
            <button className="btn btn-primary" onClick={openCreate}>➕ Create First Activity</button>
          </div>
        </div>
      ) : (
        <div className="card" style={{ padding: 0 }}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Fill</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activities.map(a => {
                  const pct = Math.round((a.registeredCount / a.maxCapacity) * 100);
                  const isPast = new Date(a.date) < new Date();
                  const isFull = a.registeredCount >= a.maxCapacity;
                  return (
                    <tr key={a.id}>
                      <td>
                        <div style={{ fontWeight: 700, color: 'var(--gray-900)' }}>{a.title}</div>
                        {a.description && (
                          <div style={{ fontSize: '11px', color: 'var(--gray-400)', marginTop: 2 }}>
                            {a.description.slice(0, 55)}{a.description.length > 55 ? '…' : ''}
                          </div>
                        )}
                      </td>
                      <td>
                        <div style={{ fontWeight: 500 }}>{new Date(a.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                        <div style={{ fontSize: '11px', color: 'var(--gray-400)' }}>{a.time || 'Time TBD'}</div>
                      </td>
                      <td style={{ color: 'var(--gray-600)' }}>{a.location}</td>
                      <td>
                        <div style={{ fontSize: '12px', fontWeight: 600, marginBottom: 4 }}>
                          {a.registeredCount} / {a.maxCapacity}
                          <span style={{ fontWeight: 400, color: 'var(--gray-400)', marginLeft: 4 }}>({pct}%)</span>
                        </div>
                        <div className="cap-bar" style={{ width: 80 }}>
                          <div className={`cap-bar-fill${isFull ? ' full' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                        </div>
                      </td>
                      <td>
                        {isPast
                          ? <span className="badge badge-warning">Past</span>
                          : isFull
                          ? <span className="badge badge-danger">Full</span>
                          : <span className="badge badge-success">Open</span>}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-outline btn-sm" onClick={() => openEdit(a)}>Edit</button>
                          <button className="btn btn-danger btn-sm" onClick={() => setConfirmDelete({ id: a.id, title: a.title })}>Delete</button>
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

      {confirmDelete && (
        <ConfirmModal
          title="Delete Activity"
          message={`Are you sure you want to delete "${confirmDelete.title}"? This cannot be undone.`}
          confirmLabel="Delete Activity"
          onConfirm={handleDelete}
          onCancel={() => setConfirmDelete(null)}
        />
      )}
    </div>
  );
}
