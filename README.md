# Shamba Records — Crop Progress Tracker

A simple, role-aware web application for tracking crop progress across multiple fields during a growing season.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express |
| Database | PostgreSQL (`pg` pool) |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Dev runner | concurrently |

---

## Project Structure

```
crop-tracker/
├── package.json                  # root — runs both servers via concurrently
├── README.md
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js              # entry point — starts Express + DB check
│       ├── app.js                # Express setup, routes, CORS, error handler
│       ├── config/
│       │   ├── db.js             # pg Pool (DATABASE_URL)
│       │   ├── migrate.js        # creates tables (run once)
│       │   └── seed.js           # demo users + fields
│       ├── middleware/
│       │   └── auth.js           # JWT verify + requireRole()
│       ├── models/
│       │   └── fieldStatus.js    # computeStatus() pure function
│       └── routes/
│           ├── auth.js           # POST /login, GET /me
│           ├── fields.js         # CRUD, role-scoped
│           ├── updates.js        # field observations + stage changes
│           ├── users.js          # admin manages agents
│           └── dashboard.js      # aggregated stats per role
└── frontend/
    ├── package.json
    ├── vite.config.js            # proxies /api → :5000
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               # router + protected routes
        ├── styles/globals.css    # CSS variables, resets
        ├── context/AuthContext.jsx
        ├── hooks/
        │   ├── useAuth.js
        │   ├── useFields.js
        │   └── useDashboard.js
        ├── utils/
        │   ├── api.js            # axios instance with auth header
        │   └── helpers.js        # date formatting, status/stage colours
        ├── components/
        │   ├── common/           # Button, Badge, Modal, Table, StatCard
        │   ├── layout/           # Sidebar, Topbar, Layout
        │   ├── fields/           # FieldCard, FieldForm, FieldTable, UpdateForm
        │   └── dashboard/        # StageChart, RecentUpdates
        └── pages/
            ├── Login.jsx
            ├── Dashboard.jsx
            ├── Fields.jsx
            ├── FieldDetail.jsx
            └── Users.jsx
```

---

## Setup Instructions

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally (or a connection string to a hosted instance)

### 1. Clone & install

```bash
git clone <repo-url>
cd crop-tracker
npm install           # installs concurrently at root
npm run install:all   # installs backend + frontend deps
```

### 2. Configure environment

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=5000
DATABASE_URL=postgresql://YOUR_USER:YOUR_PASSWORD@localhost:5432/crop_tracker
JWT_SECRET=replace_with_a_long_random_string
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=http://localhost:3000
```

### 3. Create the database

```bash
createdb crop_tracker
```

### 4. Run migrations

```bash
npm run migrate
```

Creates three tables: `users`, `fields`, `field_updates`, plus an auto-update trigger on `fields.updated_at`.

### 5. Seed demo data

```bash
npm run seed
```

Inserts demo users and 5 sample fields.

### 6. Start development servers

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (Coordinator) | `admin@shamba.io` | `admin123` |
| Field Agent | `agent@shamba.io` | `agent123` |
| Field Agent 2 | `agent2@shamba.io` | `agent456` |

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT |
| GET | `/api/auth/me` | any | Current user info |
| GET | `/api/fields` | any | List fields (scoped by role) |
| POST | `/api/fields` | admin | Create field |
| GET | `/api/fields/:id` | any | Single field |
| PUT | `/api/fields/:id` | admin | Update field |
| DELETE | `/api/fields/:id` | admin | Delete field |
| GET | `/api/updates/:fieldId` | any | Update history for a field |
| POST | `/api/updates/:fieldId` | any | Submit stage update + notes |
| GET | `/api/dashboard` | any | Role-aware dashboard stats |
| GET | `/api/users` | admin | List all users |
| POST | `/api/users` | admin | Create a new agent |

---

## Field Status Logic

Status is **computed at query time** in `backend/src/models/fieldStatus.js` — it is never stored in the database, so it is always fresh.

```
completed  →  stage === 'harvested'

at_risk    →  stage is 'planted' or 'growing'
              AND one of:
                • no update recorded in the last 14 days
                • planted 90+ days ago and still not 'ready'

active     →  everything else
```

This approach avoids stale cached statuses and requires no background jobs.

---

## Field Lifecycle

```
planted → growing → ready → harvested
```

Stage advances are recorded as immutable rows in `field_updates` (append-only), giving a full audit trail of who changed what and when.

---

## Design Decisions

**Monorepo with Vite proxy** — single repo, Vite's `server.proxy` forwards `/api` calls to `:5000` so there are no CORS issues in development.

**Status computed, not stored** — avoids stale data and background workers. The pure `computeStatus()` function runs on every fetch.

**DB-level agent scoping** — agents are restricted to their assigned fields at the SQL query level on every endpoint, not just in the UI. Direct API calls cannot bypass this.

**Role-aware dashboard endpoint** — a single `GET /api/dashboard` returns a different payload shape depending on `req.user.role`, keeping the frontend simple.

**Append-only `field_updates`** — every stage change and observation is a new row. Nothing is ever deleted from this table, providing a complete history.

**No external UI library** — the UI uses inline styles and CSS custom properties only, keeping the bundle small and the design consistent with the provided colour tokens.

---

## Assumptions

- A field can only be assigned to one agent at a time.
- Only admins can create, edit, or delete fields; agents can only submit updates.
- The "At Risk" check uses calendar days, not business days.
- Passwords are hashed with bcrypt (cost factor 10).
- JWTs are stored in `localStorage` (acceptable for a demo; use `httpOnly` cookies in production).

---

## Running in Production

```bash
# Build frontend
npm run build --prefix frontend

# Serve static files from backend (or use nginx)
# Set NODE_ENV=production in backend/.env
npm run start --prefix backend
```
