const BASE = process.env.REACT_APP_API_URL || '/api';

const getToken = () => localStorage.getItem('scams_token');

const headers = () => ({
  'Content-Type': 'application/json',
  ...(getToken() ? { Authorization: `Bearer ${getToken()}` } : {}),
});

const handle = async (res) => {
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Something went wrong');
  return data;
};

export const api = {
  // Auth
  login:    (body) => fetch(`${BASE}/auth/login`,    { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  register: (body) => fetch(`${BASE}/auth/register`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),

  // Activities
  getActivities:    ()         => fetch(`${BASE}/activities`,      { headers: headers() }).then(handle),
  getActivity:      (id)       => fetch(`${BASE}/activities/${id}`, { headers: headers() }).then(handle),
  createActivity:   (body)     => fetch(`${BASE}/activities`,      { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  updateActivity:   (id, body) => fetch(`${BASE}/activities/${id}`, { method: 'PUT',    headers: headers(), body: JSON.stringify(body) }).then(handle),
  deleteActivity:   (id)       => fetch(`${BASE}/activities/${id}`, { method: 'DELETE', headers: headers() }).then(handle),

  // Registrations
  getMyRegistrations: ()   => fetch(`${BASE}/registrations/my`,       { headers: headers() }).then(handle),
  register:           (id) => fetch(`${BASE}/registrations/${id}`,    { method: 'POST',   headers: headers() }).then(handle),
  unregister:         (id) => fetch(`${BASE}/registrations/${id}`,    { method: 'DELETE', headers: headers() }).then(handle),

  // Attendance
  getAttendance:  (actId)         => fetch(`${BASE}/attendance/${actId}`,      { headers: headers() }).then(handle),
  markAttendance: (actId, body)   => fetch(`${BASE}/attendance/${actId}/mark`, { method: 'POST', headers: headers(), body: JSON.stringify(body) }).then(handle),
  myHistory:      ()              => fetch(`${BASE}/attendance/my/history`,    { headers: headers() }).then(handle),

  // Reports
  getSummary: () => fetch(`${BASE}/reports/summary`, { headers: headers() }).then(handle),
  getMembers: () => fetch(`${BASE}/reports/members`, { headers: headers() }).then(handle),

  // Announcements
  getAnnouncements:   ()         => fetch(`${BASE}/announcements`,      { headers: headers() }).then(handle),
  createAnnouncement: (body)     => fetch(`${BASE}/announcements`,      { method: 'POST',   headers: headers(), body: JSON.stringify(body) }).then(handle),
  deleteAnnouncement: (id)       => fetch(`${BASE}/announcements/${id}`, { method: 'DELETE', headers: headers() }).then(handle),
};