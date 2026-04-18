# SCAMS — Student Club Activity Management System

> A full-stack web application for managing student club activities, registrations, attendance, and reporting.

**Live Demo:** https://scams-project.vercel.app

| Role | Email | Password |
|---|---|---|
| Member | member@test.com | password123 |
| Executive | exec@test.com | password123 |
| Advisor | advisor@test.com | password123 |

---

## About

SCAMS replaces the spreadsheets, WhatsApp group chats, and paper sign-in sheets that student clubs rely on. It gives members a central place to discover and register for events, and gives executives the tools to manage activities, track attendance, and generate reports — all in one platform.

**Course:** COMP 2154 – System Development Project  
**Team:** Ishan Sood (101539944) · Rabin Kunnananickal Binu (101516420)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router DOM v6, Context API |
| Backend | Node.js, Express v4 |
| Database | MongoDB Atlas (Mongoose ODM) |
| Authentication | JWT (7-day expiry), bcrypt password hashing |
| Deployment | Vercel (frontend) + Render (backend) |

---

## Features

### All Users
- JWT authentication with auto-logout on token expiry
- Role-based access control (Member / Executive / Advisor)
- Dark mode with localStorage persistence
- Cold-start detection — auto-retry spinner when Render server wakes up
- Fully responsive UI

### Member
- Browse activities with category filters (Workshop / Social / Career / Academic)
- Register for activities with real-time capacity tracking
- Join waitlist when an activity is full — auto-promoted when a spot opens
- View upcoming and past registrations
- Personal attendance history with rate tracking
- Read club announcements

### Executive / Advisor
- Create, edit, and delete activities
- Mark attendance individually or bulk "Mark All Present"
- Live attendance rate bar per activity
- Reports dashboard — fill rate and attendance rate per activity
- Member participation report with overall totals
- Export any report as CSV
- Post, pin, and delete club announcements
- View all member profiles with activity stats

---

## Project Structure

```
scams-project/
├── package.json                    # Root: runs both servers via concurrently
│
├── scams-backend/
│   ├── server.js                   # Entry point (port 5000)
│   ├── app.js                      # Express app setup, routes, DB connect
│   ├── db.js                       # MongoDB Atlas connection
│   ├── seed.js                     # One-time seed (20 users, 9 activities)
│   ├── middleware/
│   │   └── auth.js                 # JWT authenticate + role authorize
│   ├── models/
│   │   ├── User.js
│   │   ├── Activity.js
│   │   ├── Registration.js
│   │   ├── Waitlist.js
│   │   ├── Attendance.js
│   │   └── Announcement.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── activities.js
│   │   ├── registrations.js
│   │   ├── attendance.js
│   │   ├── members.js
│   │   ├── reports.js
│   │   └── announcements.js
│   └── tests/
│       ├── auth.test.js
│       ├── activities.test.js
│       └── registrations.test.js
│
└── scams-frontend/
    ├── vercel.json                  # API proxy → Render backend
    └── src/
        ├── api.js                   # Fetch wrapper (JWT + cold-start detection)
        ├── App.js                   # Routes + ProtectedRoute guard
        ├── index.css                # Design system (CSS custom properties)
        ├── context/
        │   ├── AuthContext.js
        │   ├── DarkModeContext.js
        │   └── ToastContext.js
        ├── components/
        │   ├── Navbar.js
        │   └── ConfirmModal.js
        └── pages/
            ├── Login.js
            ├── Register.js
            ├── Dashboard.js
            ├── Activities.js
            ├── ActivityDetail.js
            ├── MyRegistrations.js
            ├── AttendanceHistory.js
            ├── Manage.js
            ├── Attendance.js
            ├── Members.js
            ├── Reports.js
            ├── Announcements.js
            └── Profile.js
```

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Login + receive JWT |
| GET | `/me` | Authenticated | Current user info |
| PATCH | `/profile` | Authenticated | Update name or password |

### Activities — `/api/activities`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | All activities with registration counts |
| GET | `/:id` | Authenticated | Single activity with participant list |
| POST | `/` | Executive / Advisor | Create activity |
| PUT | `/:id` | Executive / Advisor | Update activity |
| DELETE | `/:id` | Executive / Advisor | Delete activity |

### Registrations — `/api/registrations`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/my` | Authenticated | My registrations |
| GET | `/recent` | Executive / Advisor | Recent sign-ups feed |
| GET | `/waitlist/my` | Authenticated | My waitlist entries with position |
| POST | `/:id` | Authenticated | Register for activity |
| DELETE | `/:id` | Authenticated | Unregister (triggers waitlist promotion) |
| POST | `/:id/waitlist` | Authenticated | Join waitlist |
| DELETE | `/:id/waitlist` | Authenticated | Leave waitlist |

### Attendance — `/api/attendance`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/my/history` | Authenticated | Personal attendance record |
| GET | `/:activityId` | Executive / Advisor | Attendance sheet for activity |
| POST | `/:activityId/mark` | Executive / Advisor | Mark / unmark attendance |

### Reports — `/api/reports`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/summary` | Executive / Advisor | Club-wide stats + per-activity breakdown |
| GET | `/members` | Executive / Advisor | Member participation stats |

### Members — `/api/members`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Executive / Advisor | All users with activity stats |

### Announcements — `/api/announcements`
| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | All announcements (pinned first) |
| POST | `/` | Executive / Advisor | Create announcement |
| DELETE | `/:id` | Executive / Advisor | Delete announcement |

---

## Local Development

```bash
# 1. Clone
git clone https://github.com/Ishannsood/scams-project.git
cd scams-project

# 2. Install all dependencies
npm run install:all

# 3. Add environment variables
echo "MONGODB_URI=your_connection_string" > scams-backend/.env
echo "JWT_SECRET=your_secret_key" >> scams-backend/.env

# 4. Start both servers
npm start
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:5000

The backend seeds the database automatically on first run if the collection is empty.

---

## Running Tests

```bash
cd scams-backend
npm test
```

Covers: auth (register, login, JWT validation), activities (CRUD, role protection), registrations (register, unregister, waitlist).

---

## Deployment

| Service | Purpose | Config |
|---|---|---|
| Vercel | Frontend + API proxy | `vercel.json` rewrites `/api/*` to Render |
| Render | Backend (Node.js) | Set `MONGODB_URI` and `JWT_SECRET` env vars |
| MongoDB Atlas | Database (M0 free cluster) | Whitelist `0.0.0.0/0` for Render |

---

## Environment Variables

| Variable | Where | Description |
|---|---|---|
| `MONGODB_URI` | Render / `.env` | MongoDB Atlas connection string |
| `JWT_SECRET` | Render / `.env` | Secret key for signing JWT tokens |
| `PORT` | Render (auto) | Server port |
