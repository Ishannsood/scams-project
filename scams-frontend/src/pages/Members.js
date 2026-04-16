import { useEffect, useState } from 'react';
import { api } from '../api';

const ROLE_COLORS = {
  member:    { bg: '#dbeafe', color: '#1d4ed8', label: 'Member'    },
  executive: { bg: '#f3e8ff', color: '#7c3aed', label: 'Executive' },
  advisor:   { bg: '#d1fae5', color: '#065f46', label: 'Advisor'   },
};

const AVATAR_COLORS = [
  '#6366f1','#8b5cf6','#ec4899','#f59e0b','#10b981','#3b82f6','#ef4444','#14b8a6',
  '#f97316','#84cc16','#06b6d4','#a855f7','#e11d48','#0891b2','#65a30d','#7c3aed',
  '#d97706','#059669','#2563eb','#dc2626',
];

function getAvatarColor(id) {
  const idx = parseInt(id.replace(/\D/g, ''), 10) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}

function RateBar({ value }) {
  const color = value >= 70 ? 'var(--success)' : value >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: '11px', color: 'var(--gray-500)' }}>Attendance</span>
        <span style={{ fontSize: '11px', fontWeight: 700, color }}>{value}%</span>
      </div>
      <div className="cap-bar">
        <div className="cap-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Members() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const load = async () => {
    setLoading(true); setError(null); setCountdown(0);
    try {
      const data = await api.getAllMembers();
      setMembers(data);
    } catch (e) {
      setError(e.message || 'Failed to load.');
      if (e.message === 'COLD_START') {
        let t = 55; setCountdown(t);
        const iv = setInterval(() => { t -= 1; setCountdown(t); if (t <= 0) { clearInterval(iv); load(); } }, 1000);
      }
    } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const filtered = members.filter(m => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) ||
                        m.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'all' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const totalRegs  = members.reduce((s, m) => s + m.activitiesRegistered, 0);
  const totalAtt   = members.reduce((s, m) => s + m.activitiesAttended,   0);
  const overallRate = totalRegs > 0 ? Math.round((totalAtt / totalRegs) * 100) : 0;
  const roleCounts = members.reduce((acc, m) => { acc[m.role] = (acc[m.role] || 0) + 1; return acc; }, {});

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
            <h3 style={{ fontSize:'1rem', fontWeight:700, color:'var(--gray-700)' }}>Could not load members</h3>
            <p style={{ fontSize:12, color:'var(--gray-400)', fontFamily:'monospace', background:'var(--gray-100)', padding:'6px 12px', borderRadius:6 }}>{error}</p>
            <button className="btn btn-primary" onClick={load}>Retry</button>
          </>
        )}
      </div>
    </div>
  );

  if (loading) return <div className="loading">Loading members…</div>;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Members</h1>
        <p>{members.length} people in the club</p>
      </div>

      {/* Overview stats */}
      <div className="grid-4 mb-4">
        <div className="stat-card stat-primary">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{members.length}</div>
          <div className="stat-label">Total</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">👤</div>
          <div className="stat-value">{roleCounts.member || 0}</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">⚙️</div>
          <div className="stat-value">{(roleCounts.executive || 0) + (roleCounts.advisor || 0)}</div>
          <div className="stat-label">Staff</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">📊</div>
          <div className="stat-value">{overallRate}%</div>
          <div className="stat-label">Avg Attendance</div>
        </div>
      </div>

      {/* Search & filter */}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center', marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Search by name or email…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            flex: 1, minWidth: 200, padding: '9px 14px', borderRadius: 8,
            border: '1.5px solid var(--gray-200)', fontSize: 13,
            background: '#fff', fontFamily: 'inherit', outline: 'none',
          }}
        />
        <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', padding: 3, borderRadius: 8 }}>
          {['all', 'member', 'executive', 'advisor'].map(r => (
            <button
              key={r}
              className={`btn btn-sm ${roleFilter === r ? 'btn-primary' : ''}`}
              onClick={() => setRoleFilter(r)}
              style={roleFilter !== r ? { background: 'transparent', border: 'none', color: 'var(--gray-600)', textTransform: 'capitalize' } : { textTransform: 'capitalize' }}
            >
              {r === 'all' ? 'All' : r.charAt(0).toUpperCase() + r.slice(1)}
            </button>
          ))}
        </div>
        {filtered.length !== members.length && (
          <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="empty">
          <div className="empty-icon">🔍</div>
          <h3>No members found</h3>
          <p>Try adjusting your search or filter.</p>
        </div>
      ) : (
        <div className="grid-3">
          {filtered.map(m => {
            const initials = m.name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
            const avatarColor = getAvatarColor(m.id);
            const roleStyle = ROLE_COLORS[m.role] || ROLE_COLORS.member;
            return (
              <div key={m.id} className="card" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                    background: avatarColor, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 15, fontWeight: 800, letterSpacing: '-0.02em',
                  }}>{initials}</div>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--gray-900)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--gray-400)', marginTop: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {m.email}
                    </div>
                  </div>
                  <span style={{
                    marginLeft: 'auto', flexShrink: 0,
                    background: roleStyle.bg, color: roleStyle.color,
                    fontSize: 10, fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.05em', padding: '3px 8px', borderRadius: 999,
                  }}>{roleStyle.label}</span>
                </div>

                {/* Stats row */}
                <div style={{ display: 'flex', gap: 0, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-100)' }}>
                  <div style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRight: '1px solid var(--gray-100)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--primary)', lineHeight: 1 }}>{m.activitiesRegistered}</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Registered</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px 0', textAlign: 'center', borderRight: '1px solid var(--gray-100)' }}>
                    <div style={{ fontSize: 18, fontWeight: 800, color: 'var(--success)', lineHeight: 1 }}>{m.activitiesAttended}</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attended</div>
                  </div>
                  <div style={{ flex: 1, padding: '10px 0', textAlign: 'center' }}>
                    <div style={{
                      fontSize: 18, fontWeight: 800, lineHeight: 1,
                      color: m.attendanceRate >= 70 ? 'var(--success)' : m.attendanceRate >= 40 ? 'var(--warning)' : 'var(--danger)',
                    }}>{m.attendanceRate}%</div>
                    <div style={{ fontSize: 10, color: 'var(--gray-400)', marginTop: 3, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rate</div>
                  </div>
                </div>

                {/* Attendance bar */}
                <RateBar value={m.attendanceRate} />

                {/* Last activity */}
                {m.lastActivityTitle && (
                  <div style={{ fontSize: 11, color: 'var(--gray-400)', borderTop: '1px solid var(--gray-100)', paddingTop: 10 }}>
                    Last registered: <span style={{ color: 'var(--gray-600)', fontWeight: 600 }}>{m.lastActivityTitle}</span>
                  </div>
                )}
                {!m.lastActivityTitle && (
                  <div style={{ fontSize: 11, color: 'var(--gray-300)', borderTop: '1px solid var(--gray-100)', paddingTop: 10 }}>
                    No registrations yet
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
