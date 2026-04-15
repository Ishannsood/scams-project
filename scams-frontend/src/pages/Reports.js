import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../api';

function downloadCSV(filename, rows) {
  const content = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

function RateBar({ value }) {
  const color = value >= 70 ? 'var(--success)' : value >= 40 ? 'var(--warning)' : 'var(--danger)';
  return (
    <div style={{ minWidth: 80 }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color, marginBottom: 4 }}>{value}%</div>
      <div className="cap-bar">
        <div className="cap-bar-fill" style={{ width: `${value}%`, background: color }} />
      </div>
    </div>
  );
}

export default function Reports() {
  const [searchParams] = useSearchParams();
  const [summary, setSummary] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState(searchParams.get('tab') === 'members' ? 'members' : 'activities');

  useEffect(() => {
    Promise.all([api.getSummary(), api.getMembers()]).then(([s, m]) => {
      setSummary(s); setMembers(m); setLoading(false);
    });
  }, []);

  const exportActivitiesCSV = () => {
    const header = ['Activity', 'Date', 'Location', 'Capacity', 'Registered', 'Attended', 'Fill Rate', 'Attendance Rate'];
    const rows = summary.activities.map(a => [
      a.title, a.date, a.location, a.maxCapacity, a.registered, a.attended, a.fillRate,
      a.isPast ? a.attendanceRate : 'Upcoming',
    ]);
    downloadCSV('scams-activity-report.csv', [header, ...rows]);
  };

  const exportMembersCSV = () => {
    const header = ['Name', 'Email', 'Activities Registered', 'Activities Attended', 'Attendance Rate'];
    const rows = members.map(m => {
      const rate = m.activitiesRegistered > 0
        ? Math.round((m.activitiesAttended / m.activitiesRegistered) * 100) + '%'
        : '0%';
      return [m.name, m.email, m.activitiesRegistered, m.activitiesAttended, rate];
    });
    downloadCSV('scams-member-report.csv', [header, ...rows]);
  };

  if (loading) return <div className="loading">Loading reports…</div>;

  const totalRegistered = members.reduce((s, m) => s + m.activitiesRegistered, 0);
  const totalAttended   = members.reduce((s, m) => s + m.activitiesAttended, 0);
  const overallRate     = totalRegistered > 0 ? Math.round((totalAttended / totalRegistered) * 100) : 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        <p>Overview of club activities and member participation.</p>
      </div>

      <div className="grid-4 mb-4">
        <div className="stat-card stat-primary">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{summary.overview.totalActivities}</div>
          <div className="stat-label">Activities</div>
        </div>
        <div className="stat-card stat-info">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{summary.overview.totalMembers}</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-card stat-success">
          <div className="stat-icon">🎫</div>
          <div className="stat-value">{summary.overview.totalRegistrations}</div>
          <div className="stat-label">Registrations</div>
        </div>
        <div className="stat-card stat-warning">
          <div className="stat-icon">✅</div>
          <div className="stat-value">{summary.overview.totalAttendance}</div>
          <div className="stat-label">Attendances</div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 4, background: 'var(--gray-100)', padding: 3, borderRadius: 8 }}>
          {['activities', 'members'].map(t => (
            <button
              key={t}
              className={`btn btn-sm ${tab === t ? 'btn-primary' : ''}`}
              onClick={() => setTab(t)}
              style={tab !== t ? { background: 'transparent', border: 'none', color: 'var(--gray-600)' } : {}}
            >
              {t === 'activities' ? '📅 Activity Report' : '👥 Member Report'}
            </button>
          ))}
        </div>
        <button className="btn btn-outline btn-sm" onClick={tab === 'activities' ? exportActivitiesCSV : exportMembersCSV}>
          ⬇ Export CSV
        </button>
      </div>

      {tab === 'activities' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
            Activity Summary
          </div>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Activity</th>
                  <th>Date</th>
                  <th>Location</th>
                  <th>Capacity</th>
                  <th>Registered</th>
                  <th>Attended</th>
                  <th>Fill Rate</th>
                  <th>Attendance Rate</th>
                </tr>
              </thead>
              <tbody>
                {summary.activities.map(a => (
                  <tr key={a.activityId}>
                    <td style={{ fontWeight: 500 }}>{a.title}</td>
                    <td>{new Date(a.date).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}</td>
                    <td>{a.location}</td>
                    <td>{a.maxCapacity}</td>
                    <td>{a.registered}</td>
                    <td>{a.isPast ? a.attended : '—'}</td>
                    <td><RateBar value={parseInt(a.fillRate)} /></td>
                    <td>
                      {a.isPast
                        ? <RateBar value={parseInt(a.attendanceRate)} />
                        : <span className="badge badge-info" style={{ fontSize: '11px' }}>Upcoming</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'members' && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--gray-200)', fontWeight: 600 }}>
            Member Participation
          </div>
          {members.length === 0 ? (
            <div className="empty" style={{ padding: '36px' }}>
              <div className="empty-icon">👥</div>
              <h3>No members yet</h3>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Registered For</th>
                    <th>Attended</th>
                    <th>Attendance Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {members.map(m => {
                    const rate = m.activitiesRegistered > 0
                      ? Math.round((m.activitiesAttended / m.activitiesRegistered) * 100)
                      : 0;
                    return (
                      <tr key={m.id}>
                        <td style={{ fontWeight: 500 }}>{m.name}</td>
                        <td style={{ color: 'var(--gray-600)' }}>{m.email}</td>
                        <td>{m.activitiesRegistered}</td>
                        <td>{m.activitiesAttended}</td>
                        <td><RateBar value={rate} /></td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot>
                  <tr style={{ background: 'var(--gray-50)', borderTop: '2px solid var(--gray-200)' }}>
                    <td style={{ fontWeight: 700, color: 'var(--gray-800)' }} colSpan={2}>Totals</td>
                    <td style={{ fontWeight: 700 }}>{totalRegistered}</td>
                    <td style={{ fontWeight: 700 }}>{totalAttended}</td>
                    <td><RateBar value={overallRate} /></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
