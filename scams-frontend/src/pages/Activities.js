import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../api';

const FILTERS = ['all', 'upcoming', 'past'];
const SORTS = [
  { value: 'date-asc',   label: 'Date (Earliest)' },
  { value: 'date-desc',  label: 'Date (Latest)' },
  { value: 'title-asc',  label: 'Title (A–Z)' },
  { value: 'spots',      label: 'Spots Available' },
];

export default function Activities() {
  const { user } = useAuth();
  const toast = useToast();
  const [activities, setActivities] = useState([]);
  const [myRegIds, setMyRegIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState(searchParams.get('filter') === 'upcoming' ? 'upcoming' : 'all');
  const [sort, setSort] = useState('date-asc');

  const load = async () => {
    const acts = await api.getActivities();
    setActivities(acts);
    if (user.role === 'member') {
      const regs = await api.getMyRegistrations();
      setMyRegIds(new Set(regs.map(r => r.activityId)));
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleRegister = async (id) => {
    try { await api.joinActivity(id); toast('Registered successfully!'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const handleUnregister = async (id) => {
    try { await api.unregister(id); toast('Unregistered from activity.', 'info'); load(); }
    catch (e) { toast(e.message, 'error'); }
  };

  const now = new Date();

  const filtered = activities
    .filter(a => {
      const matchesSearch =
        a.title.toLowerCase().includes(search.toLowerCase()) ||
        a.location.toLowerCase().includes(search.toLowerCase());
      const isPast = new Date(a.date) < now;
      if (filter === 'upcoming') return matchesSearch && !isPast;
      if (filter === 'past')     return matchesSearch && isPast;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sort === 'date-asc')  return new Date(a.date) - new Date(b.date);
      if (sort === 'date-desc') return new Date(b.date) - new Date(a.date);
      if (sort === 'title-asc') return a.title.localeCompare(b.title);
      if (sort === 'spots')     return (a.maxCapacity - a.registeredCount) - (b.maxCapacity - b.registeredCount) < 0 ? 1 : -1;
      return 0;
    });

  if (loading) return (
    <div className="page">
      <div style={{ height: 40, width: 220, marginBottom: 24 }} className="skeleton" />
      <div className="grid-2">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="skeleton-card">
            <div className="skeleton skeleton-title" />
            <div className="skeleton skeleton-text" />
            <div className="skeleton skeleton-text" style={{ width: '75%' }} />
            <div className="skeleton skeleton-text" style={{ width: '55%' }} />
            <div style={{ marginTop: 12, height: 5 }} className="skeleton" />
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <div className="flex-between" style={{ flexWrap: 'wrap', gap: '12px', marginBottom: '16px' }}>
          <div>
            <h1>Activities</h1>
            <p>{activities.length} activit{activities.length !== 1 ? 'ies' : 'y'} available</p>
          </div>
          <input
            type="text"
            placeholder="Search by title or location…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{
              padding: '9px 14px', borderRadius: '8px', border: '1.5px solid var(--gray-200)',
              fontSize: '13px', width: '240px', background: '#fff', color: 'var(--gray-900)',
              outline: 'none', fontFamily: 'inherit',
            }}
          />
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '4px', background: 'var(--gray-100)', padding: '3px', borderRadius: '8px' }}>
            {FILTERS.map(f => (
              <button
                key={f}
                className={`btn btn-sm ${filter === f ? 'btn-primary' : ''}`}
                onClick={() => setFilter(f)}
                style={{ textTransform: 'capitalize', ...(filter !== f ? { background: 'transparent', border: 'none', color: 'var(--gray-600)' } : {}) }}
              >
                {f === 'all' ? 'All' : f === 'upcoming' ? '🗓 Upcoming' : '⏮ Past'}
              </button>
            ))}
          </div>
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            style={{ padding: '7px 12px', borderRadius: '8px', border: '1.5px solid var(--gray-200)', fontSize: '12px', color: 'var(--gray-700)', background: '#fff', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {SORTS.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
          {filtered.length !== activities.length && (
            <span style={{ fontSize: '12px', color: 'var(--gray-500)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
          )}
        </div>
      </div>


      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <h3>No activities found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid-2">
          {filtered.map(a => {
            const isReg = myRegIds.has(a.id);
            const pct = Math.round((a.registeredCount / a.maxCapacity) * 100);
            const isFull = a.registeredCount >= a.maxCapacity;
            const isPast = new Date(a.date) < now;
            return (
              <div className={`activity-card ${isPast ? 'status-past' : isFull ? 'status-full' : 'status-open'}`} key={a.id}>
                <div className="flex-between" style={{ alignItems: 'flex-start' }}>
                  <h3>{a.title}</h3>
                  {isPast
                    ? <span className="badge badge-warning">Past</span>
                    : isFull
                    ? <span className="badge badge-danger">Full</span>
                    : <span className="badge badge-success">Open</span>
                  }
                </div>
                <div className="meta">
                  <span>📅 {new Date(a.date).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
                  <span>🕐 {a.time || 'TBD'}</span>
                  <span>📍 {a.location}</span>
                  <span>👤 By {a.creatorName}</span>
                </div>
                <p className="desc">{a.description || 'No description provided.'}</p>
                <div style={{ fontSize: '12px', color: 'var(--gray-600)' }}>
                  {a.registeredCount} / {a.maxCapacity} spots filled
                  <div className="cap-bar" style={{ marginTop: '4px' }}>
                    <div className={`cap-bar-fill${pct >= 100 ? ' full' : ''}`} style={{ width: `${Math.min(pct, 100)}%` }} />
                  </div>
                </div>
                <div className="actions">
                  <Link to={`/activities/${a.id}`} className="btn btn-outline btn-sm">View Details</Link>
                  {user.role === 'member' && !isPast && (
                    isReg ? (
                      <>
                        <span className="badge badge-success">✓ Registered</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleUnregister(a.id)}>Unregister</button>
                      </>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleRegister(a.id)} disabled={isFull}>
                        {isFull ? 'Full' : 'Register'}
                      </button>
                    )
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
