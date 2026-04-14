# Student Club Activity Management System (SCAMS)

## Course
COMP 2154 – System Development Project

## Team
**CampusSync**
- Ishan Sood – 101539944
- Rabin Kunnananickal Binu – 101516420

---

## What is SCAMS?

SCAMS is a full-stack web application that helps student clubs manage activities, registrations, attendance, and reporting in one centralized platform. It supports three user roles — **Member**, **Executive**, and **Advisor** — each with their own tailored dashboard and access level.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, React Router DOM v6, React Context API |
| Backend | Node.js 18 LTS, Express v4 |
| Authentication | JSON Web Tokens (JWT), 24-hour expiry |
| Data Store | In-memory JavaScript arrays (no database required) |
| Styling | Custom CSS design system with CSS custom properties |
| Dev tooling | nodemon, concurrently |

---

## Quick Start (One Command)

```bash
# 1. Clone the repo
git clone https://github.com/Ishannsood/scams-project.git
cd scams-project

# 2. Install all dependencies (frontend + backend)
npm run install:all

# 3. Start both servers at once
npm start
```

- Frontend → **http://localhost:3000**
- Backend API → **http://localhost:5000**

> Both servers start in the same terminal with color-coded output.

---

## Demo Accounts

| Role | Email | Password |
|---|---|---|
| Member | member@test.com | password123 |
| Executive | exec@test.com | password123 |
| Advisor | advisor@test.com | password123 |

Use the **quick-fill buttons** on the Login page — no typing needed.

---

## Project Structure

```
scams-project/
├── package.json                  # Root: runs both servers via concurrently
│
├── scams-backend/
│   ├── server.js                 # Express entry point (port 5000)
│   ├── data/
│   │   └── store.js              # In-memory data store + seed data
│   ├── middleware/
│   │   └── auth.js               # JWT authenticate + role authorize
│   └── routes/
│       ├── auth.js               # Register, login, me
│       ├── activities.js         # Full CRUD
│       ├── registrations.js      # Register/unregister
│       ├── attendance.js         # Mark + history
│       ├── reports.js            # Summary + member stats
│       └── announcements.js      # Club announcements
│
└── scams-frontend/
    └── src/
        ├── api.js                # Centralized fetch wrapper (JWT injected)
        ├── App.js                # Routes + ProtectedRoute guard
        ├── index.css             # Full design system (variables, components)
        ├── context/
        │   └── AuthContext.js    # Global auth state via React Context
        ├── components/
        │   └── Navbar.js         # Responsive navbar, role-aware links, hamburger
        └── pages/
            ├── Login.js          # Login + demo account quick-fill
            ├── Register.js       # Registration with visual role selector
            ├── Dashboard.js      # Gradient hero, stats, announcements preview
            ├── Activities.js     # Browse, filter, sort, search, register
            ├── ActivityDetail.js # Full activity page + registration CTA
            ├── MyRegistrations.js# Upcoming & past registrations
            ├── AttendanceHistory.js # Personal attendance record
            ├── Manage.js         # Create / edit / delete activities (modal)
            ├── Attendance.js     # Mark attendance + rate bar + avatars
            ├── Reports.js        # Stats, visual rate bars, CSV export
            └── Announcements.js  # Feed with pinned support + creator avatar
```

---

## Features

### Authentication
- JWT-based login and registration
- Token stored in localStorage, sent with every API request
- ProtectedRoute component guards all pages
- Role-based access — each role sees different pages and API endpoints

### Member
- Browse all activities with filter (All / Upcoming / Past), sort, and search
- Register and unregister from activities with live capacity enforcement
- View upcoming and past registrations on a dedicated page
- Activity detail page with full info and registration CTA
- Personal attendance history with event links
- Read club announcements (pinned items highlighted)

### Executive / Advisor
- Create, edit, and delete activities via a modal form
- Attendance sheet per activity — mark individually or bulk "Mark All Present"
- Attendance rate progress bar, member avatar initials, present-first sorting
- Reports dashboard with activity stats and member participation
- Visual rate bars (green / yellow / red) for fill rate and attendance rate
- Export any report tab to CSV
- Post and delete club announcements, pin important ones

### UI & System
- Gradient hero banner on dashboard with time-based greeting
- Colored stat cards with icons (primary / success / info / warning)
- Activity cards with status-based left border (green = open, red = full, gray = past)
- Glassmorphism navbar with gradient brand text
- Fully responsive — hamburger menu on mobile
- Spinning loader animation, smooth card hover transitions
- Role card selector on the register page (visual picker instead of dropdown)

---

## API Reference

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account + get token |
| POST | `/login` | Public | Login + get token |
| GET | `/me` | Authenticated | Current user info |

### Activities — `/api/activities`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | All activities |
| GET | `/:id` | Authenticated | Single activity with participants |
| POST | `/` | Executive / Advisor | Create activity |
| PUT | `/:id` | Executive / Advisor | Update activity |
| DELETE | `/:id` | Executive / Advisor | Delete activity |

### Registrations — `/api/registrations`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/my` | Authenticated | My registrations |
| POST | `/:activityId` | Authenticated | Register (capacity checked) |
| DELETE | `/:activityId` | Authenticated | Unregister |

### Attendance — `/api/attendance`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/my/history` | Authenticated | Personal attendance record |
| GET | `/:activityId` | Executive / Advisor | Attendance sheet for activity |
| POST | `/:activityId/mark` | Executive / Advisor | Mark / unmark attendance |

### Reports — `/api/reports`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/summary` | Executive / Advisor | Club-wide overview + per-activity stats |
| GET | `/members` | Executive / Advisor | Member list with participation stats |

### Announcements — `/api/announcements`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | All announcements (pinned first) |
| POST | `/` | Executive / Advisor | Create announcement |
| DELETE | `/:id` | Executive / Advisor | Delete announcement |

---

## Architecture Notes

- **No database** — all data lives in memory. Restarting the backend resets to seed data.
- **JWT secret** — hardcoded as `scams_secret_key_2026` in `middleware/auth.js`. Move to `.env` for production.
- **Passwords** — stored as plain text for demo purposes. Use bcrypt in production.
- **CORS** — configured for `http://localhost:3000` only.
