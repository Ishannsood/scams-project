# Student Club Activity Management System (SCAMS)

## Course
COMP 2154 – System Development Project

## Team
**CampusSync**
- Ishan Sood – 101539944
- Rabin Kunnananickal Binu – 101516420

## Project Description
SCAMS is a full-stack web application that helps student clubs manage activities, registrations, attendance, and reporting in one centralized platform. The system supports three user roles — Member, Executive, and Advisor — each with tailored dashboards and access controls.

## Tech Stack
| Layer | Technology |
|---|---|
| Frontend | React 18, React Router DOM v6, React Context API |
| Backend | Node.js 18 LTS, Express v4 |
| Auth | JSON Web Tokens (JWT), 24-hour expiry |
| Data Store | In-memory JavaScript arrays (MongoDB-compatible structure) |
| Styling | Custom CSS design system (CSS custom properties) |

## Project Structure
```
scams-project/
├── scams-backend/
│   ├── data/
│   │   └── store.js          # In-memory data store + seed data
│   ├── middleware/
│   │   └── auth.js           # JWT authenticate + role authorize
│   ├── routes/
│   │   ├── auth.js           # POST /register, POST /login, GET /me
│   │   ├── activities.js     # Full CRUD for activities
│   │   ├── registrations.js  # Register/unregister for activities
│   │   ├── attendance.js     # Mark attendance + history
│   │   ├── reports.js        # Summary stats + member list
│   │   └── announcements.js  # Club announcements
│   └── server.js             # Express app entry point (port 5000)
│
└── scams-frontend/
    ├── public/
    └── src/
        ├── api.js                  # Centralized fetch helper
        ├── App.js                  # Routes + ProtectedRoute
        ├── index.css               # Design system (CSS vars, components)
        ├── context/
        │   └── AuthContext.js      # Global auth state
        ├── components/
        │   └── Navbar.js           # Responsive navbar with role-aware links
        └── pages/
            ├── Login.js            # Login with demo account quick-fill
            ├── Register.js         # New member registration
            ├── Dashboard.js        # Role-aware dashboard
            ├── Activities.js       # Browse, filter, sort, register
            ├── ActivityDetail.js   # Single activity detail + registration
            ├── MyRegistrations.js  # Member's upcoming + past registrations
            ├── AttendanceHistory.js# Member's attendance record
            ├── Manage.js           # Exec/Advisor: create, edit, delete activities
            ├── Attendance.js       # Exec/Advisor: mark individual + bulk attendance
            ├── Reports.js          # Exec/Advisor: stats + CSV export
            └── Announcements.js    # Club-wide announcements
```

## Getting Started

### Prerequisites
- Node.js v18 LTS or later
- npm v9 or later

### 1. Start the Backend
```bash
cd scams-project/scams-backend
npm install
npm run dev        # uses nodemon for auto-restart
# or: npm start   # production start
```
Backend runs at **http://localhost:5000**

### 2. Start the Frontend
```bash
cd scams-project/scams-frontend
npm install
npm start
```
Frontend runs at **http://localhost:3000** and proxies `/api` calls to port 5000.

## Demo Accounts
| Role | Email | Password |
|---|---|---|
| Member | member@test.com | password123 |
| Executive | exec@test.com | password123 |
| Advisor | advisor@test.com | password123 |

Use the quick-fill buttons on the Login page to sign in instantly.

## Implemented Features

### Authentication & Authorization
1. **User Registration** — New users register with name, email, password, and role selection
2. **User Login** — JWT issued on login, stored in localStorage, sent with every API request
3. **Protected Routes** — Frontend ProtectedRoute component + backend middleware enforce role-based access
4. **Role-Based Access Control** — Member / Executive / Advisor roles each see different UI and have different API permissions

### Member Features
5. **Activity Browsing** — Filter (All / Upcoming / Past), sort (date, title, spots available), search
6. **Activity Registration** — Register/unregister from activities; capacity enforcement prevents overbooking
7. **My Registrations** — View upcoming and past registrations, unregister from upcoming events
8. **Activity Detail View** — Full info page per activity with registration action
9. **Attendance History** — View personal attendance record for all attended events
10. **Announcements** — Read club-wide announcements; pinned announcements highlighted

### Executive / Advisor Features
11. **Activity Management** — Create, edit, and delete activities via modal form (title, date, time, location, description, capacity)
12. **Attendance Marking** — Mark individual participants as attended; bulk "Mark All Present" for efficiency
13. **Reports Dashboard** — Two-tab view: activity statistics and member statistics
14. **CSV Export** — Export current report tab to CSV file for offline use
15. **Announcement Management** — Post and delete club announcements; pin important ones

### System Features
16. **Responsive Design** — All pages adapt to mobile screens; hamburger menu on narrow viewports
17. **Role-Aware Dashboard** — Members see registration stats; Executives/Advisors see club-wide overview + quick actions
18. **Real-Time Capacity Bars** — Visual capacity indicators on activity cards across all views

## API Endpoints

### Auth — `/api/auth`
| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/register` | Public | Create account |
| POST | `/login` | Public | Get JWT token |
| GET | `/me` | Authenticated | Current user info |

### Activities — `/api/activities`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | List all activities |
| GET | `/:id` | Authenticated | Single activity |
| POST | `/` | Executive/Advisor | Create activity |
| PUT | `/:id` | Executive/Advisor | Update activity |
| DELETE | `/:id` | Executive/Advisor | Delete activity |

### Registrations — `/api/registrations`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/my` | Authenticated | My registrations |
| POST | `/:activityId` | Authenticated | Register for activity |
| DELETE | `/:activityId` | Authenticated | Unregister |

### Attendance — `/api/attendance`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/:activityId` | Executive/Advisor | Attendee list |
| POST | `/:activityId/mark` | Executive/Advisor | Mark attendance |
| GET | `/my/history` | Authenticated | My attendance history |

### Reports — `/api/reports`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/summary` | Executive/Advisor | Club-wide stats |
| GET | `/members` | Executive/Advisor | Member list with stats |

### Announcements — `/api/announcements`
| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/` | Authenticated | All announcements (pinned first) |
| POST | `/` | Executive/Advisor | Create announcement |
| DELETE | `/:id` | Executive/Advisor | Delete announcement |

## Architecture Notes
- **No database required** — data persists in memory for the duration of the server process. Restarting the backend resets to seed data.
- **JWT Secret** — hardcoded as `scams_secret_key_2026` in `middleware/auth.js`. For production, move to an environment variable.
- **Password Storage** — stored as plain text for demo purposes. For production, use bcrypt.
- **CORS** — configured to allow `http://localhost:3000` only.
