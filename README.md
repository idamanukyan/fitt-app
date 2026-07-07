# HyperFit

> Full-stack fitness platform: a FastAPI backend and a React Native (Expo) mobile app covering workouts, nutrition, sleep, supplements, AI coaching, and a gamified shop.

## What it does

- **Workout tracking** — exercise library, workout builder, active session logging, training history
- **Nutrition** — meal logging, meal plan generation, daily macro summaries
- **AI coaching** — AI chat plus human coach conversations in a dual-mode chat
- **Health tracking** — sleep, body measurements, goals, progress photos
- **Gamification** — achievements, leaderboard, and an in-app shop
- **Supplements** — supplement schedules with configurable reminders
- **Offline support** — mobile sync queue for offline-first logging

## Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI · SQLAlchemy · Alembic · Pydantic v2 |
| Database | SQLite (dev) / PostgreSQL (prod) |
| Mobile | React Native 0.81 · Expo 54 · TypeScript · React 19 |
| State | Zustand · React Context · React Query |
| Auth | JWT (HS512) with refresh rotation and token blacklisting |
| Rate limiting | slowapi (per-user, on auth/AI/shop endpoints) |
| Observability | Sentry (backend + mobile) · request logging middleware · Mixpanel |
| Testing | pytest (backend) · Jest (mobile) · coverage thresholds in CI |
| CI | GitHub Actions (lint + tests on push/PR) · Husky pre-commit hooks · ruff · Prettier |

## Repository layout

```
backend/
  app/
    routes/        # 22 route modules, all versioned under /api/v1/
    services/      # business logic
    repositories/  # data access
    models/        # SQLAlchemy models
    schemas/       # Pydantic schemas
    core/          # config, database, auth, rate limiting
  alembic/         # database migrations
  tests/           # pytest suite
mobile/
  screens/         # 40 screens
  components/      # shared UI (ErrorState, LoadingState, ErrorBoundary, ...)
  services/        # API client and domain services
  stores/          # Zustand stores
  src/i18n/        # localization
  __tests__/       # Jest suite
```

Both sides follow the same layering: routes → services → repositories → models on the backend; screens → components → services → stores/hooks on mobile.

## Getting started

Prerequisites: Python 3.11+, Node 18+, and an iOS simulator / Android emulator or the Expo Go app.

```bash
# Backend setup (first time)
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Mobile setup (first time)
cd ../mobile
npm install

# Start everything (backend on :8000, Expo dev server on :8081)
cd ..
./start-all.sh

# Stop everything
./stop-all.sh
```

The backend serves interactive API docs at `http://localhost:8000/docs` (development only — disabled in production).

### Docker alternative

Instead of the manual backend setup above, you can run the API and a PostgreSQL database (mirroring production instead of SQLite) with Docker:

```bash
docker compose up --build
```

This builds the backend image, starts Postgres, applies Alembic migrations on container start, and serves the API on `http://localhost:8000`. Postgres is exposed on `localhost:5432` (user/password/db: `hyperfit`); data persists in the `pgdata` volume across restarts.

The mobile app stays on the host (simulators can't run in Docker) — start it with `cd mobile && npm start`. It talks to `localhost:8000`, so no configuration change is needed.

```bash
# Follow API logs
docker compose logs -f api

# Tear down (add -v to also wipe the Postgres data volume)
docker compose down
```

## Testing

```bash
# Backend
cd backend && source venv/bin/activate
python -m pytest

# Mobile
cd mobile
npm test
npm run test:coverage
```

CI runs linting (ruff, ESLint/Prettier) and both test suites on every push and pull request, with enforced coverage thresholds.

## Roadmap

Recent work (tracked in issues #1–39, all closed) hardened security defaults, added rate limiting, Sentry, CI with coverage gates, backend test suites for core routes, and paid down mobile tech debt (screen extraction, type safety, loading/error states).

Next up:

- **E2E testing** — Detox or Maestro flows for the critical mobile journeys
- **Mobile component tests** — render tests for the extracted screen components
- **Docker Compose dev environment** — one-command backend + database setup
- **OpenAPI client generation** — generate the mobile API client from the backend spec
- **Progress photo optimization** — compression/resizing pipeline instead of raw base64
- **Replace python-jose with PyJWT** — move off an unmaintained JWT dependency

## Status

Personal project. Active development.
