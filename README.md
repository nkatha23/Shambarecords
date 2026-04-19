# Shamba Records — Crop Progress Tracker

A simple, role-aware web application for tracking crop progress across multiple fields during a growing season.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Axios |
| Backend | Node.js, Express, Helmet, compression, express-rate-limit |
| Database | PostgreSQL (`pg` pool) |
| Auth | JWT (`jsonwebtoken`) + `bcryptjs` |
| Dev runner | concurrently |

---

## Project Structure

```
Shambarecords/
├── package.json                  # root — runs both servers via concurrently
├── docs/screenshots/             # UI screenshots used in this README
├── backend/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── index.js              # entry — env validation, DB check, server start
│       ├── app.js                # Express: helmet, compression, rate-limit, routes, static serve
│       ├── config/
│       │   ├── db.js             # pg Pool (DATABASE_URL)
│       │   ├── migrate.js        # creates tables (run once)
│       │   └── seed.js           # demo users + fields
│       ├── middleware/
│       │   └── auth.js           # JWT verify + requireRole()
│       ├── models/
│       │   └── fieldStatus.js    # computeStatus() — pure function, never stored
│       └── routes/
│           ├── auth.js           # POST /login, /register  GET /me
│           ├── fields.js         # CRUD, role-scoped
│           ├── updates.js        # field observations + stage changes
│           ├── users.js          # admin manages agents
│           └── dashboard.js      # aggregated stats per role
└── frontend/
    ├── package.json
    ├── vite.config.js            # proxies /api → :5000 in dev
    ├── index.html
    └── src/
        ├── main.jsx
        ├── App.jsx               # router + protected route guards
        ├── styles/globals.css    # CSS variables, resets
        ├── context/AuthContext.jsx
        ├── hooks/                # useAuth, useFields, useDashboard
        ├── utils/                # axios instance, date helpers, colour maps
        ├── components/
        │   ├── common/           # Button, Badge, Modal, Table, StatCard
        │   ├── layout/           # Sidebar, Topbar, Layout wrapper
        │   ├── fields/           # FieldCard, FieldForm, FieldTable, UpdateForm
        │   └── dashboard/        # StageChart, RecentUpdates
        └── pages/
            ├── Login.jsx
            ├── Register.jsx
            ├── Dashboard.jsx
            ├── Fields.jsx
            ├── FieldDetail.jsx
            └── Users.jsx
```

---

## Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+

### Install & run

```bash
git clone <repo-url>
cd Shambarecords
npm install           # installs concurrently at root
npm run install:all   # installs backend + frontend deps
npm run migrate       # create tables (run once)
npm run seed          # load demo data (optional)
npm run dev           # starts both servers
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- Health check: http://localhost:5000/api/health

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin (Coordinator) | `admin@shamba.io` | `admin123` |
| Field Agent | `agent@shamba.io` | `agent123` |
| Field Agent 2 | `agent2@shamba.io` | `agent456` |

Self-registration is also available at `/register`. New accounts default to the **agent** role.

---

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| POST | `/api/auth/login` | — | Login, returns JWT + user |
| POST | `/api/auth/register` | — | Self-register as agent |
| GET | `/api/auth/me` | any | Current user info |
| GET | `/api/fields` | any | List fields (role-scoped) |
| POST | `/api/fields` | admin | Create field |
| GET | `/api/fields/:id` | any | Single field |
| PUT | `/api/fields/:id` | admin | Update field |
| DELETE | `/api/fields/:id` | admin | Delete field |
| GET | `/api/updates/:fieldId` | any | Update history for a field |
| POST | `/api/updates/:fieldId` | any | Submit stage update + notes |
| GET | `/api/dashboard` | any | Role-aware dashboard stats |
| GET | `/api/users` | admin | List all users |
| POST | `/api/users` | admin | Create agent (admin-managed) |
| GET | `/api/health` | — | Health check |

Auth endpoints are rate-limited to **20 requests / 15 min**. All other API endpoints allow **200 requests / 15 min**.

---

## Field Status Logic

Status is **computed at query time** in `backend/src/models/fieldStatus.js` — never stored, always fresh.

```
completed  →  stage === 'harvested'

at_risk    →  stage is 'planted' or 'growing'
              AND one of:
                • no update recorded in the last 14 days
                • planted 90+ days ago and still not 'ready'

active     →  everything else
```

---

## Field Lifecycle

```
planted → growing → ready → harvested
```

Every stage change is an immutable row in `field_updates` — append-only, giving a full audit trail.

---

## Design Decisions

**Monorepo with Vite proxy** — Vite's `server.proxy` forwards `/api` to `:5000` in dev; in production the Express server serves the built frontend directly (no nginx required for a single-server deploy).

**Status computed, not stored** — avoids stale data and background workers. `computeStatus()` runs on every fetch.

**DB-level agent scoping** — agents are restricted to their assigned fields at the SQL query level on every endpoint. Direct API calls cannot bypass this.

**Role-aware dashboard endpoint** — a single `GET /api/dashboard` returns a different payload shape depending on `req.user.role`, keeping the frontend simple.

**Append-only `field_updates`** — nothing is ever deleted from this table, giving a full change history.

**No UI library** — inline styles + CSS custom properties only. Zero runtime CSS overhead, consistent with the design tokens.

**Production hardening** — `helmet` sets secure HTTP headers, `compression` gzip-encodes responses, `express-rate-limit` guards against brute-force on auth routes, and required env vars are validated at startup.

---

## Assumptions

- A field is assigned to one agent at a time.
- Only admins create, edit, or delete fields; agents only submit updates.
- Self-registered users are always agents; only an admin can promote a role.
- The "At Risk" staleness check uses calendar days.
- JWTs are stored in `localStorage` — suitable for this context; swap to `httpOnly` cookies for stricter deployments.

---

## Production Deployment

```bash
# 1. Build the frontend
npm run build --prefix frontend

# 2. Set NODE_ENV in backend/.env
echo "NODE_ENV=production" >> backend/.env

# 3. Start the server — serves API + static frontend on a single port
npm run start --prefix backend
```

The Express server will serve `frontend/dist` as static files and fall back to `index.html` for client-side routing. No separate web server needed for a single-node deploy.
