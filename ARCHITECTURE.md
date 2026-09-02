# Architecture & Decisions

This is where I keep the reasoning behind the choices I made in HabitSync, mostly so I don't forget it myself, but also for anyone who wants to see how it's actually put together under the hood.

---

## Project layout

It's a monorepo, `frontend/` and `backend/` sitting side by side under one `habitsync/` folder, both pushed to the same GitHub repo. I went this route mainly for convenience since it's a solo project and I didn't want to manage two repos for something this size.

```
habitsync/
├── backend/
│   └── src/
│       ├── config/          # DB connection
│       ├── controllers/     # request handlers, thin, just call services
│       ├── middlewares/     # auth, error handling, client-date header
│       ├── models/          # Mongoose schemas
│       ├── routes/
│       ├── services/        # actual business logic lives here
│       └── utils/
│
└── frontend/
    └── src/
        ├── app/
        │   ├── (auth)/         # login, register
        │   ├── (app)/          # everything behind the auth guard
        │   │   ├── dashboard/
        │   │   ├── habits/
        │   │   ├── tasks/
        │   │   └── stats/
        │   └── layout.tsx
        ├── components/
        │   ├── habits/
        │   ├── tasks/
        │   ├── stats/
        │   ├── layout/
        │   └── ui/             # buttons, inputs, the accordion, etc
        ├── lib/
        │   ├── api/             # plain fetch calls, no Next.js stuff in here
        │   ├── hooks/            # React Query hooks
        │   └── utils/
        ├── store/                # two small Zustand stores
        └── types/
```

The `services/` layer on the backend keeps controllers thin, a controller just pulls stuff off `req` and calls a service function. Made it a lot easier to reason about what each function actually does when things got complicated later (streak calculation, period completion, etc).

---

## Why everything is client-rendered

I'm using Next.js but honestly not for SSR. Every page in this app is behind a login and shows data specific to one user, so there's nothing worth pre-rendering on the server. I use Next.js for the App Router (file-based routing is genuinely nice) and the build tooling, but every data fetch happens in the browser through React Query. If I were building a public marketing page I'd do it differently, but for a logged-in dashboard app this is the simpler path.

---

## Why React Query and not just fetch()

I actually started without it and quickly regretted it. The dashboard needed to remember what you'd already loaded (so flipping back to yesterday doesn't re-fetch), it needed optimistic updates so tapping a habit toggle feels instant instead of waiting on a network round trip, and it needed to quietly retry and roll back on failure. Writing all of that by hand would've been a mess of manual cache objects and race condition bugs. React Query handles it in a few lines per hook.

---

## Two small Zustand stores

I use Zustand for exactly two things: which date is selected on the dashboard, and which tab (Habits or Tasks) is active. Both get read by several unrelated components at once, so passing them down as props would mean threading state through five or six layers. Zustand is basically free in bundle size and solves this cleanly.

The tab choice also gets saved to localStorage so refreshing the page doesn't dump you back on the Habits tab if you were looking at Tasks. It clears itself when you log out.

---

## Auth: HttpOnly cookies over localStorage

I went with JWTs stored in HttpOnly cookies instead of localStorage mainly because localStorage is readable by any script running on the page, which makes it a soft target for XSS. HttpOnly cookies can't be touched by JavaScript at all. The tradeoff is the frontend can't just read the token to check "am I logged in," so instead there's a `GET /auth/current-user` call that verifies the session with the backend on page load.

---

## Keeping the API layer framework agnostic

Everything under `lib/api/` is just `fetch()` calls, no `next/navigation`, no Next-specific imports anywhere in that folder. I did this on purpose. If I ever build a React Native version of this app, I want to be able to copy that whole folder over and have it just work.

---

## The timezone problem (this one took a while to get right)

MongoDB stores every date as UTC midnight, which is the sane way to do it. But "today" means something different depending on where the user actually is. Someone in Bangladesh (UTC+6) at 2am local time is technically still on "yesterday" in UTC, and early on my app would show them the wrong date, which meant they couldn't log habits for the day they were actually living in.

The fix: the frontend sends an `x-client-date` header with every single request, containing the user's actual local date as a plain `YYYY-MM-DD` string. The backend reads that header and uses it as "today" for anything date-sensitive (the 30-day edit window, blocking future dates, streak calculation) instead of calling `new Date()` on the server. It's a small header but it fixed a genuinely confusing bug where the app felt broken for anyone not close to UTC.

---

## Habits vs Tasks: why two separate systems instead of one

My first instinct was to just add a `isTask` flag to the Habit model and reuse everything. I'm glad I didn't. A habit is fundamentally recurring, "did I drink water today" needs a separate log entry for every single day, because the same habit gets asked again tomorrow. A task like "renew car registration" happens exactly once. There's no "Tuesday's version" of it.

So Tasks got their own model entirely: a title, an optional due date, a priority, and a simple `isCompleted` / `completedAt` pair. No logs, no streaks, no scheduling rules. Trying to force both into one system would've meant a bunch of "if it's a task, ignore frequency" branches scattered everywhere, which felt worse than just having two clean, separate things.

---

## Streaks only count what's actually scheduled

If a habit is set to Mon/Wed/Fri, missing Tuesday shouldn't touch the streak, Tuesday was never supposed to happen. This sounds obvious but it wasn't the first version I shipped, I originally had every missed day break the streak regardless of schedule, which meant weekly habits were basically impossible to keep a real streak on. Fixed it once I noticed how wrong it felt while using my own app.

Flexible weekly habits (the ones with no fixed day) and monthly habits are deliberately excluded from streak counting altogether. They're for tracking whether you did something, not for building a daily chain, so folding them into the streak number just produced numbers that didn't mean anything.

---

## Partial credit, and rethinking what "breaks" a streak

The first version of streak logic was strictly binary, either you did the whole habit that day or the streak reset to zero. That felt too harsh once I actually used the app for a while. If I hit 3 of my 4 target glasses of water, that's not "nothing," but a pure done/not-done system treated it exactly the same as doing nothing at all.

So I moved to a percentage-based rule instead, and it applies the same way to both individual habit streaks and the new overall streak:

- **0% done** → the streak genuinely resets, you didn't show up at all
- **1-49% done** → the streak holds steady, doesn't go up, doesn't go down, "you tried, that's worth not losing everything for"
- **50-99% done** → the streak increments, partial effort still counts as a real day
- **100% done** → the streak increments, same as above
  Today gets special treatment in this calculation: since the day isn't over yet, today is only ever allowed to help the streak (increment it) if you've already hit 50%+, it can never reset or hold back a streak that's otherwise intact, since you might still log more before the day ends.

Boolean habits don't really have a "partial," so for those it's still just 0% or 100%. For measurable habits with an `atLeast` target, the percentage is a real fraction (2 of 4 glasses is a genuine 50%). Other target types (`atMost`, `lessThan`, `exactly`) don't have a natural percentage in the same way, so those fall back to a binary complete/not-complete score.

I also added **best streak** alongside current streak, both per-habit and as an overall number across all habits. Current streak answers "am I still going," best streak answers "what's the longest I've ever managed," and having both gives a lot more context than current streak alone, especially once a streak eventually breaks and the number resets to zero, at least the best-ever number is still there as a record.

---

## "Period completion" for flexible and monthly habits

This was the trickiest bit of logic in the whole app. If you complete a flexible weekly habit on Monday, it should show as done for the rest of that week, not just for Monday, then reset itself the following Sunday. Same idea for monthly habits across a calendar month.

The backend computes this per request (`periodCompleted` and `periodLog` on each entry) rather than making the frontend guess. This mattered especially for measurable habits: if you log `2` articles on Monday for a "write 3 articles a week" habit, the input should still show `2` on Wednesday, and bumping it to `3` on Wednesday should update that same log, not create a new one. Getting the frontend to correctly read from `periodLog` instead of the day's own (often empty) log took a few passes to get right.

---

## The stats page

Once habits had real percentage-based scoring, it made sense to surface it somewhere beyond a single number on a single habit's page. The stats page pulls together:

- An overall completion ring (today's scheduled habits, how many done)
- Current streak, best streak, and active habit count as small stat tiles
- A 6-month GitHub-style heatmap, one cell per day, color intensity driven by that day's average completion percentage across relevant habits
- A completion trend chart (Recharts bar chart), bucketed into weekly windows that scale with whatever period you pick (30/60/90 days), so the bar count stays readable instead of turning into a wall of tiny bars at 90 days
- A per-habit performance list with completion rate, current and best streak, and total completions, with its own independent period selector so it doesn't get coupled to the trend chart's period
- A small "insights" section that's just deterministic math on data already being fetched, no AI involved, things like flagging your strongest habit, whether you're more consistent on weekdays vs weekends, or calling out a habit that's slipping. All of it is threshold-gated so it only shows an insight when there's actually something meaningful to say, rather than always filling the space with something.
  The heatmap ended up needing two separate backend endpoints in the end, not one. The multi-habit version (used on the stats page) averages completion across every streak-relevant habit per day. The single-habit version (used on each habit's own detail page) needed to be scoped to one habit and include flexible/monthly habits too, since you'd want to see a heatmap for a habit even if it doesn't count toward the streak system. I originally tried to make one endpoint do both jobs and it got messy fast, splitting them apart made both pieces simpler and meant fixing a bug in one couldn't accidentally break the other.

---

## Ended habits

Habits can have an optional end date. Once that date passes, the habit quietly stops showing up on the dashboard and moves into a read-only "Ended" section on the archived habits page. You can still look at its history and streak, but you can't edit it, archive it, or unarchive it, its lifecycle is just done. Felt cleaner than making the user manually archive something that already reached its natural end.

---

## The 30-day edit window

Logs older than 30 days become read-only, both in the UI (controls get disabled, there's a small badge) and on the backend (the API rejects edits to old logs even if someone tries to hit it directly). Wanted to leave room for correcting recent mistakes without turning the log history into something infinitely editable.

---

## Keeping Render's free tier awake

Render's free backend hosting spins down after 15 minutes of no traffic, and waking back up can take 30-50 seconds, which is a rough first impression if someone's clicking through from a resume. I added a `/api/v1/health` endpoint and set up a free UptimeRobot monitor that pings it every 5 minutes. Costs nothing (both services' free tiers comfortably cover this) and keeps the app from ever fully going to sleep.

---

## Things I'd still like to add

- An export/report feature for a habit's full history
- Recurring tasks, or maybe just a lighter-weight "repeat weekly" option for tasks that don't need full habit machinery
- A React Native app, which is a big part of why the API layer is kept so decoupled from Next.js
