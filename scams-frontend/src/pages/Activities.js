import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Activities() {
  const { user } = useAuth();
  const [activities, setActivities] = useState([]);
  const [myRegIds, setMyRegIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState('');
  const [search, setSearch] = useState('');

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

  const flash = (m) => { setMsg(m); setTimeout(() => setMsg(''), 3000); };

  const handleRegister = async (id) => {
    try { await api.register(id); flash('✅ Registered successfully!'); load(); }
    catch (e) { flash('❌ ' + e.message); }
  };

  const handleUnregister = async (id) => {
    try { await api.unregister(id); flash('Unregistered from activity.'); load(); }
    catch (e) { flash('❌ ' + e.message); }
  };

  const filtered = activities.filter(a =>
    a.title.toLowerCase().includes(search.toLowerCase()) ||
    a.location.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="loading">Loading activities…</div>;

  return (
    <div className="page">
      <div className="page-header flex-between">
        <div>
          <h1>Activities</h1>
          <p>{activities.length} activities available</p>
        </div>
        <input
          type="text" placeholder="🔍 Search activities…"
          value={search} onChange={e => setSearch(e.target.value)}
          style={{padding:'8px 14px', borderRadius:'8px', border:'1.5px solid var(--gray-200)', fontSize:'13px', width:'220px'}}
        />
      </div>

      {msg && <div className={`alert ${msg.startsWith('❌') ? 'alert-error' : 'alert-success'}`}>{msg}</div>}

      {filtered.length === 0 ? (
        <div className="empty"><div className="empty-icon">🔍</div><h3>No activities found</h3></div>
      ) : (
        <div className="grid-2">
          {filtered.map(a => {
            const isReg = myRegIds.has(a.id);
            const pct = Math.round((a.registeredCount / a.maxCapacity) * 100);
            const isFull = a.registeredCount >= a.maxCapacity;
            const isPast = new Date(a.date) < new Date();
            return (
              <div className="activity-card" key={a.id}>
                <div className="flex-between" style={{alignItems:'flex-start'}}>
                  <h3>{a.title}</h3>
                  {isPast
                    ? <span className="badge badge-warning">Past</span>
                    : isFull
                    ? <span className="badge badge-danger">Full</span>
                    : <span className="badge badge-success">Open</span>
                  }
                </div>
                <div className="meta">
                  <span>📅 {new Date(a.date).toLocaleDateString('en-CA', {weekday:'short',month:'short',day:'numeric'})}</span>
                  <span>🕐 {a.time || 'TBD'}</span>
                  <span>📍 {a.location}</span>
                  <span>👤 By {a.creatorName}</span>
                </div>
                <p className="desc">{a.description || 'No description provided.'}</p>
                <div style={{fontSize:'12px', color:'var(--gray-600)'}}>
                  {a.registeredCount} / {a.maxCapacity} spots filled
                  <div className="cap-bar" style={{marginTop:'4px'}}>
                    <div className={`cap-bar-fill${pct>=100?' full':''}`} style={{width:`${Math.min(pct,100)}%`}} />
                  </div>
                </div>
                {user.role === 'member' && !isPast && (
                  <div className="actions">
                    {isReg ? (
                      <>
                        <span className="badge badge-success">✓ Registered</span>
                        <button className="btn btn-ghost btn-sm" onClick={() => handleUnregister(a.id)}>Unregister</button>
                      </>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={() => handleRegister(a.id)} disabled={isFull}>
                        {isFull ? 'Full' : 'Register'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
