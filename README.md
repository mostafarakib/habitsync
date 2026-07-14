# HabitSync

A full-stack habit tracking web app built for daily use. The goal was simple — make tracking habits feel frictionless, not like a chore. No bloated dashboards, no overwhelming analytics, just a clean interface that gets out of your way.

## What it does

- Track daily, weekly, and monthly habits
- Boolean habits (done / not done) and measurable habits (track a number against a target)
- GitHub-style 30-day contribution calendar on each habit's detail page
- Streak tracking — only habits that are actually scheduled count toward your streak
- Flexible weekly habits — habits you want to do "sometime this week" without a fixed day
- Notes on each log entry
- Navigate to any past date and view or edit logs (within 30 days)
- Fully responsive — works on mobile and desktop

---

## Tech Stack

### Backend

- **Node.js + Express** — REST API with a clean service layer architecture
- **MongoDB + Mongoose** — document database, all dates stored as UTC midnight
- **JWT authentication** — HttpOnly cookies, no localStorage token handling
- **Cloudinary** — avatar uploads via Multer

### Frontend

- **Next.js 16** (App Router) — used purely as a routing and build framework; all data fetching is client-side
- **React Query** — server state, caching, and optimistic updates
- **Zustand** — minimal global state
- **React Hook Form** — form state and validation
- **Radix UI** — accessible primitives (Switch, Dialog, Select, DropdownMenu)
- **Tailwind CSS** — styling
- **date-fns** — date arithmetic
- **Sonner** — toast notifications
- **Lucide React** — icons

---

## Project Structure

This is a monorepo with `frontend/` and `backend/` as sibling folders under the root `habitsync/` directory, both tracked in the same GitHub repository.

```
habitsync/
├── backend/
│   ├── src/
│   │   ├── config/          # DB connection
│   │   ├── controllers/     # Request handlers
│   │   ├── middlewares/     # Auth, error handler, client date
│   │   ├── models/          # Mongoose schemas
│   │   ├── routes/          # Express routers
│   │   ├── services/        # Business logic layer
│   │   └── utils/           # Shared utilities
│   └── index.js
│
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/          # Login, Register pages
        │   ├── (app)/           # Protected pages behind auth guard
        │   │   ├── dashboard/
        │   │   └── habits/
        │   │       ├── [id]/        # Habit detail page
        │   │       ├── [id]/edit/   # Edit habit page
        │   │       ├── archived/    # Archived habits page
        │   │       └── new/         # Create habit page
        │   ├── layout.tsx       # Root layout with providers
        │   └── page.tsx         # Redirects to /dashboard
        ├── components/
        │   ├── habits/          # Habit-specific components
        │   ├── layout/          # Header, DateNavigator
        │   └── ui/              # Reusable primitives
        ├── lib/
        │   ├── api/             # Framework-agnostic fetch layer
        │   ├── errors/          # ApiError class + utilities
        │   ├── hooks/           # React Query hooks
        │   └── utils/           # Date, habit, cn utilities
        ├── providers/           # QueryClientProvider
        ├── store/               # Zustand date store
        └── types/               # TypeScript interfaces
```

---

## Architecture Decisions

### Why client-side rendering everywhere?

This app is 100% user-specific and session-gated. SSR adds complexity without any benefit here — there's nothing to pre-render for a logged-in user's personal habit data. Next.js is used for routing, the build pipeline, and the App Router's layout system.

### Why React Query instead of plain fetch?

The dashboard needs per-date caching (navigate to yesterday and back — instant), optimistic updates for habit toggling, and background refetching. Writing all of that manually would be hundreds of lines of brittle code. React Query handles it in a few hooks.

### Why Zustand for just the date?

The selected date is the only truly global UI state in the app — it's read by the `DateNavigator`, `HabitList`, `HabitRow`, and the log mutations simultaneously. Prop drilling it six levels deep or using React Context (which re-renders everything) would both be worse. Zustand is 1kb and solves this cleanly.

### Why HttpOnly cookies instead of localStorage?

XSS attacks can't read HttpOnly cookies. JWTs in localStorage are a common vulnerability. The trade-off is that the frontend can't read the token directly, but that's fine — we use a `GET /auth/current-user` endpoint to verify the session on page load.

### API layer is framework-agnostic

All files under `lib/api/` use plain `fetch` with no Next.js imports. This was intentional — if I build the React Native mobile app later, I can copy this entire folder over with zero changes.

### Timezone handling

All dates are stored as UTC midnight in MongoDB. The frontend sends a `x-client-date` header with every request containing the user's local date (`YYYY-MM-DD`). The backend uses this instead of `new Date()` for validating "today" — so a user in UTC+6 at 2am on July 14 correctly sees July 14 instead of July 13.

---

## Key Features Explained

### Streak system

Streaks only count habits that are actually scheduled. If you have a workout habit scheduled for Mon/Wed/Fri, missing Tuesday doesn't break your streak. Flexible weekly habits and monthly habits are intentionally excluded from streak calculation — they're for tracking, not for maintaining a daily chain.

### Optimistic updates

When you toggle a boolean habit, the UI updates instantly before the API responds. If the request fails, it silently rolls back to the previous state and shows an error toast. The user never waits for a network round-trip to see their action reflected.

### Flexible weekly habits

A "not scheduled — flexible" option lets you create weekly habits without pinning them to specific days. These appear every day like daily habits but don't affect your main streak. Useful for habits like "practice guitar sometime this week."

### 30-day edit window

Logs older than 30 days become read-only. The UI shows a "Read-only" badge on the date navigator and disables all controls. The backend enforces this server-side as well — you can't edit old logs by calling the API directly.

---

## API Overview

All endpoints are prefixed with `/api/v1`. Auth routes are public; all others require a valid JWT cookie.

### Auth

```
POST   /auth/register
POST   /auth/login
POST   /auth/logout
GET    /auth/current-user
```

### Habits

```
GET    /habits              Get all habits for the logged-in user
POST   /habits              Create a habit
GET    /habits/:id          Get a single habit
PATCH  /habits/:id          Update a habit
PATCH  /habits/:id/archive
PATCH  /habits/:id/unarchive
```

### Habit Logs

```
PUT    /habit-logs                    Upsert a log (create or update by habitId + date)
PUT    /habit-logs/bulk               Bulk upsert
GET    /habit-logs/date/:date         Get all habits + logs for a date (dashboard)
GET    /habit-logs/date-range         Get logs across a date range
GET    /habit-logs/habit/:habitId     Get all logs for a specific habit
PATCH  /habit-logs/:id/value          Update log value
PATCH  /habit-logs/:id/notes          Update log notes
DELETE /habit-logs/:id                Delete a log
GET    /habit-logs/streak/:habitId    Get current streak for a habit
```

---

## What I'd Add Next

- **Longest streak** tracking on the habit detail page
- **Charts** — weekly completion rate, measurable habit progress over time
- **React Native mobile app** — the API layer was designed to be reusable
- **Habit templates** — one-click setup for common habits
- **Weekly summary** — email or in-app digest of the week's performance
- **Export report** — can download report of any habit

---
