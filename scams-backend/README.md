# SCAMS – Student Club Activity Management System
**Team:** CampusSync | COMP 2154 – System Development Project  
**Members:** Ishan Sood (101539944) · Rabin Kunnananickal Binu (101516420)

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+ installed
- npm installed

---

### 1. Start the Backend

```bash
cd scams-backend
npm install
npm start
```

Backend runs at: **http://localhost:5000**

---

### 2. Start the Frontend

```bash
cd scams-frontend
npm install
npm start
```

Frontend runs at: **http://localhost:3000**  
(The `"proxy": "http://localhost:5000"` in package.json routes API calls automatically.)

---

## 🔑 Demo Accounts

| Role      | Email               | Password    |
|-----------|---------------------|-------------|
| Member    | member@test.com     | password123 |
| Executive | exec@test.com       | password123 |
| Advisor   | advisor@test.com    | password123 |

Click the quick-login buttons on the login page to auto-fill credentials.

---

## 📁 Project Structure

```
scams-backend/
├── data/
│   └── store.js          # In-memory data (users, activities, etc.)
├── middleware/
│   └── auth.js           # JWT auth + role-based access
├── routes/
│   ├── auth.js           # POST /api/auth/login|register
│   ├── activities.js     # GET/POST/PUT/DELETE /api/activities
│   ├── registrations.js  # GET/POST/DELETE /api/registrations
│   ├── attendance.js     # GET/POST /api/attendance
│   └── reports.js        # GET /api/reports/summary|members
└── server.js             # Express entry point (port 5000)

scams-frontend/
├── public/
│   └── index.html
└── src/
    ├── context/
    │   └── AuthContext.js  # Global auth state
    ├── components/
    │   └── Navbar.js       # Role-aware navigation
    ├── pages/
    │   ├── Login.js         # Sign in + demo accounts
    │   ├── Register.js      # New account creation
    │   ├── Dashboard.js     # Overview + stats
    │   ├── Activities.js    # Browse + register/unregister
    │   ├── MyRegistrations.js  # Member's event list
    │   ├── Manage.js        # Create/edit/delete activities (exec/advisor)
    │   ├── Attendance.js    # Mark attendance per activity (exec/advisor)
    │   └── Reports.js       # Activity & member analytics (exec/advisor)
    ├── api.js               # Fetch helper for all API calls
    ├── App.js               # Router + protected routes
    ├── index.js             # React entry point
    └── index.css            # Complete design system
```

---

## ✅ Features Implemented

### All Roles
- JWT-based login & registration
- Browse all club activities
- View registration counts & capacity

### Member
- Register / unregister for activities
- View upcoming and past personal registrations

### Executive / Advisor
- Create, edit, and delete activities
- Mark attendance per activity (individual or bulk)
- View activity summary report (fill rate, attendance rate)
- View member participation report

---

## ⚠️ Notes
- Data is **in-memory only** — it resets when the backend server restarts.
- No MongoDB connection required for this version.
- To add persistent storage later, replace `data/store.js` arrays with MongoDB calls.
