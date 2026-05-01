# Signal Lab

Signal Lab is a full-stack observability playground: trigger **success**, **validation error**, **system error**, **slow request**, or **teapot** scenarios from a Next.js UI and immediately see the result in Grafana dashboards, structured Loki logs, and Sentry error tracking. Built to demonstrate end-to-end observability wiring on a production-grade stack you can clone and run in minutes.

## Screenshots

| UI | Grafana Dashboard |
|-----|------|
| ![UI](docs/screenshots/ui.png) | ![Grafana](docs/screenshots/grafana.png) |

| Loki Logs | Sentry Error |
|-----|------|
| ![Loki](docs/screenshots/loki.png) | ![Sentry](docs/screenshots/sentry.png) |

## Stack

| Area | Choices |
|------|---------|
| **Frontend** | Next.js 16 · shadcn/ui · Tailwind CSS · TanStack Query · React Hook Form |
| **Backend** | NestJS · Prisma · PostgreSQL |
| **Observability** | prom-client · winston-loki · @sentry/node · Grafana · Loki · Prometheus |
| **Infra** | Docker Compose |

## Prerequisites

- Docker Desktop 4+
- Node.js 20+ (nvm recommended)
- A free Sentry DSN ([sentry.io](https://sentry.io) → New Project → Node.js → copy DSN)

## Quick start

```bash
git clone https://github.com/jafanlim/signal-lab && cd signal-lab
cp .env.example .env
# Open .env and replace SENTRY_DSN with your real DSN

# Start infra (postgres, prometheus, loki, grafana)
docker compose up -d postgres prometheus loki grafana

# Start backend with hot reload
cd backend && npm install && npx prisma migrate deploy && npm run start:dev &

# Start frontend (new terminal tab)
cd ../frontend && npm install && npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

> **Note:** The API runs on the host. Prometheus scrapes `host.docker.internal:4000` (see `infra/prometheus/prometheus.yml`) so metrics reach Grafana automatically.

## Verification walkthrough

1. UI loads at [http://localhost:3000](http://localhost:3000) — three panels: **Run scenario**, **Recent runs**, **Observability links**.
2. Choose **Success** → Run → green success badge appears; **Recent runs** gains a new row.
3. Choose **System error** → Run → error badge in UI; open your Sentry project → new issue "Simulated system failure" appears.
4. Choose **Slow request** → Run → success with **~2000ms** duration visible in history.
5. Choose **🫖 Teapot** → Run → HTTP 418 response with `{ "signal": 42, "message": "I'm a teapot" }`.
6. Open [http://localhost:4000/metrics](http://localhost:4000/metrics) → confirm `signal_lab_scenarios_total` and `signal_lab_http_requests_total` present with labels.
7. Open [http://localhost:3001](http://localhost:3001) → **Dashboards** → **Signal Lab Overview** → all **six** panels show live data (Prometheus scrape interval: 5s).
8. **Grafana** → **Alerting** → confirm two alert rules: *High error rate* (>30%) and *Slow request p95* (>3s).
9. **Grafana** → **Explore** → **Loki** → `{app="signal-lab"}` → readable JSON logs with `scenarioType`, `status`, `durationMs` fields.
10. Open [http://localhost:4000/api](http://localhost:4000/api) → Swagger UI with all endpoints documented.
11. Open [http://localhost:4000/api/health](http://localhost:4000/api/health) → `{ "status": "ok", "timestamp": "..." }`.
12. Inspect `.cursor/` → `rules/`, `skills/`, `commands/`, `hooks/` all present.

## Stop all services

```bash
# Ctrl+C in backend and frontend terminals
docker compose down

# Full reset (removes all data):
docker compose down -v
```

## Cursor AI layer

**Rules (`00-project-context.mdc` through `04-error-handling.mdc`):** Five always-on constraint files that pin the stack, forbid `console.log` in the backend, mandate the `signal_lab_` metric prefix and `{app="signal-lab"}` Loki label, and require every scenario run to emit all four observability signals. Without these, AI assistants drift to wrong libraries, skip Sentry or Prisma steps, or invent metric names that break Grafana queries.

**Custom skills (`add-scenario`, `add-metric`, `add-log`):** Repeatable step-by-step workflows for extending the system — add a scenario type with all four signals atomically wired, register a new prom-client metric and update the Grafana panel in one action, or emit logs with the exact field contract this codebase expects. No re-explaining the architecture each session.

**Commands (`/new-scenario`, `/check-obs`, `/add-endpoint`, `/run-migration`):** Slash-command entry points that scaffold a scenario end-to-end, run an observability smoke checklist, scaffold a fully wired NestJS endpoint, or standardise Prisma migrate steps.

**Hooks (`pre-commit.sh`, `post-save-prisma.sh`):** Pre-commit typechecks both TypeScript projects before a commit lands; post-save formats the Prisma schema automatically to prevent noisy diffs.

**Orchestrator + `context.json`:** `.cursor/skills/orchestrator.md` defines seven phased build phases with fast/default model assignments. `context.json` and `.execution/` record `currentPhase`, `completedTasks`, and `blockers` so any new Cursor chat can resume exactly where the previous one stopped — no re-summarising the entire project.

## What I'd do with +4 hours

The core requirements are complete. With extra time I'd extend:

- **Playwright E2E suite** — automate the full verification walkthrough so `npm run test:e2e` runs all 12 checks in CI without manual steps
- **Demo seed script** — `prisma db seed` to pre-populate 50 historical runs across all scenario types so the dashboard looks meaningful on first open before any manual interaction
- **Full Docker dev mode** — add `ts-node-dev` watch inside the backend container with volume mount so `docker compose up -d` starts everything including hot reload, no host processes needed
