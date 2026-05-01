# Signal Lab — Submission Checklist

## Submission metadata

| Field | Value |
|-------|--------|
| **Repo URL** | *(No `git remote` — `.git` not present in this workspace. Run `git init` / `git remote add origin …` before publishing.)* |
| **Branch** | `main` *(expected once initialized)* |
| **Time (hands-on)** | **~4 hours** total phased build *(approximate — no dated `JOURNAL.md` in repo; aligns with phased orchestrator breakdown)* |

## Stack inventory (☑ implemented)

| Layer | Tech | Key paths |
|-------|------|-----------|
| ☑ Frontend | Next.js 16 · shadcn/ui · Tailwind · TanStack Query · RHF + Zod | `frontend/package.json`, `frontend/app/`, `frontend/components/` |
| ☑ Backend | NestJS | `backend/package.json`, `backend/src/` |
| ☑ Data | Prisma · PostgreSQL | `backend/prisma/schema.prisma`, `backend/prisma/migrations/` |
| ☑ Infra | Docker Compose | `docker-compose.yml`, `.env.example` |
| ☑ Prometheus | scrape + TSDB | `infra/prometheus/prometheus.yml` |
| ☑ Loki | log backend | `infra/loki/loki-config.yml` |
| ☑ Grafana | provisioning + dashboards | `infra/grafana/provisioning/`, `infra/grafana/dashboards/signal-lab.json` |

## Observability verification (signals)

Every scenario run emits **four** signals: Prometheus counter · Loki structured log · Prisma persist · Sentry on `system_error` only.

| Signal | Exact verification step |
|--------|-------------------------|
| **Counter** | `curl -s http://localhost:4000/metrics \| grep signal_lab_scenarios_total` — lines include `type` and `status` labels. |
| **Loki / logs** | `curl -s "http://localhost:3100/loki/api/v1/query_range?query={job=\"signal_lab\"}&limit=5" \| grep scenarioType` (or Grafana Explore `{job="signal_lab"}`). |
| **Prisma** | `POST /scenarios` response JSON includes persisted `id` + `createdAt`; `GET /scenarios/history` lists runs. |
| **Sentry** | Run **`system_error`** from UI or `curl` → new issue appears in Sentry project for this DSN. |

## Cursor AI layer (actual files)

### Rules (`.cursor/rules/` — 4 files)

| File | Role |
|------|------|
| `00-project-context.mdc` | Always-applied overview, monorepo map, mandatory stack + naming. |
| `01-backend-nestjs.mdc` | NestJS + Prisma v7 conventions, Logger not `console.log`. |
| `02-frontend-nextjs.mdc` | App Router · client/server boundaries · data fetching conventions. |
| `03-observability.mdc` | Four-signal contract, `signal_lab_` metrics, structured log fields. |

### Skills (`.cursor/skills/`)

| File | Role |
|------|------|
| `add-scenario.md` | End-to-end checklist for wiring a new scenario type across four signals. |
| `add-metric.md` | prom-client registration + Grafana panel alignment. |
| `add-log.md` | Structured logging with required fields for this codebase. |
| `orchestrator.md` | Phased build plan + how to resume from `context.json`. |

### Commands (`.cursor/commands/`)

| File | Automation |
|------|-------------|
| `new-scenario.md` | Slash workflow to scaffold scenario changes consistently. |
| `run-migration.md` | Prisma migrate workflow for this repo. |
| `check-obs.md` | Observability smoke / interviewer-style checks. |

### Hooks (`.cursor/hooks/` — executable)

| Script | Prevention |
|--------|-------------|
| `pre-commit.sh` | TypeScript typecheck backend + frontend before commit keeps broken types off main. |
| `post-save-prisma.sh` | Format Prisma schema on save to avoid drift/noise. |

### Orchestrator & resume

| Artifact | Detail |
|---------|--------|
| `context.json` | Repo root — `project`, `currentPhase`, `completedPhases`, `completedTasks`, `blockers`, `deviations`. |
| `.cursor/skills/orchestrator.md` | **Six** numbered build phases (infra → Nest → Next → Grafana → AI layer review → docs) plus resume rules. Phase 7 in practice = README / checklist / verification (tracked in checklist + README). |

## Core App

- [x] Docker Compose starts all 6 services with `docker compose up -d`
- [x] Backend NestJS running at localhost:4000
- [x] Frontend Next.js running at localhost:3000
- [x] Grafana running at localhost:3001 with 4 live panels
- [x] Loki receiving structured JSON logs with scenarioType label
- [x] Prometheus scraping backend metrics at host.docker.internal:4000

## Observability Signals (all 4 fire on every scenario run)

- [x] Prometheus counter `signal_lab_scenarios_total` increments with `type` + `status` labels
- [x] Winston-Loki log with required fields: `scenarioId`, `scenarioType`, `status`, `durationMs`
- [x] Prisma `scenarioRun.create()` persists each run to PostgreSQL
- [x] Sentry `captureException()` fires on `system_error` scenario only

## Scenario Types

- [x] `normal` — success path, info log, counter{status:success}
- [x] `high_load` — 200ms delay, warn log, counter{status:success}
- [x] `system_error` — throws Error, Sentry capture, error log, counter{status:error}

## Frontend

- [x] Run scenario form (React Hook Form + Zod validation)
- [x] Run history panel (TanStack Query, last 20 runs)
- [x] Observability links panel (Grafana, Prometheus, Loki)

## Cursor AI Layer (summary checkboxes)

### Rules (4 files)

- [x] `00-project-context.mdc` — always-applied project overview + file paths
- [x] `01-backend-nestjs.mdc` — NestJS + Prisma conventions
- [x] `02-frontend-nextjs.mdc` — Next.js App Router conventions
- [x] `03-observability.mdc` — Prometheus + Loki + Sentry rules

### Custom Skills (4 files)

- [x] `add-scenario.md` — full scaffold for new scenario types
- [x] `add-metric.md` — add prom-client counter + Grafana panel
- [x] `add-log.md` — add structured log with required fields
- [x] `orchestrator.md` — meta-skill coordinating the above

### Commands (3 files)

- [x] `/new-scenario` — scaffolds scenario end-to-end
- [x] `/run-migration` — Prisma migrate workflow
- [x] `/check-obs` — observability verification checklist

### Hooks (2 executable scripts)

- [x] `pre-commit.sh` — TypeScript typecheck for backend + frontend
- [x] `post-save-prisma.sh` — auto-format Prisma schema on save

### Orchestrator

- [x] `orchestrator.md` — coordinates multi-step workflows
- [x] `context.json` — resume state at repo root

### Marketplace Skills (6 installed in Cursor Settings)

| # | Skill | Why Connected |
|---|-------|---------------|
| 1 | Prisma | Generates correct schema syntax, migration commands, and client usage — prevents hallucinated Prisma v7 API |
| 2 | NestJS | Knows correct DI patterns, decorator syntax, module structure — prevents wrong provider registration |
| 3 | Next.js App Router | Distinguishes server vs client components, correct `use client` placement, App Router conventions |
| 4 | Tailwind CSS | Prevents invented class names, generates correct responsive and dark mode variants |
| 5 | Docker | Correct multi-stage Dockerfile syntax, compose healthcheck patterns, volume mount syntax |
| 6 | Prometheus / Grafana | Knows PromQL syntax and Grafana dashboard JSON schema — prevents invalid panel configs |

**What closed custom skills cover that marketplace skills don't:**
Custom skills cover Signal Lab-specific workflows: `add-scenario` wires all 4 observability
signals atomically (no marketplace skill knows our exact signal contract);
`add-metric` adds a counter AND updates the Grafana dashboard JSON in one action;
`add-log` enforces structured JSON format with required fields specific to this project.

## Known Deviations from Original Spec

| Deviation | Reason |
|-----------|--------|
| Prisma v7: `@prisma/adapter-pg` required, `PrismaService` uses `pg.Pool` | Prisma v7 dropped legacy connection URL approach |
| `@nestjs/common` pinned to 11.0.7 | v11.1.x has broken npm publish as of 2026-05-01 |
| No backend hot-reload | Node.js v25 + ajv-formats + nest CLI incompatibility |
| Prometheus scrape target: `host.docker.internal:4000` | Backend runs on host, not in Docker container |
| Next.js 16 uses Turbopack by default | Kept — no issues encountered |

## What I didn't finish (honest gaps)

- **Playwright / E2E** — No automated browser suite; README walkthrough + manual `curl / UI` verification only for now.
- **Grafana alerting** — Dashboards provisioned; no alert rules for error-rate or stalled scrapes committed.
- **Demo seed script** — No `npm run seed` to preload history rows for sterile demos (only live runs populate data).
- **Backend watch-mode story** — Documented mitigation (nodemon / Node downgrade); not wired as a first-class npm script yet.
- **Full Dockerized dev coupling** — Optional `docker compose` path includes backend container, but README quick-path optimizes host-run API + infra containers.
- **`context.json` phase numbering** — Historically drifted vs orchestrator numbered phases until Phase 7 close-out (normalized in current `context.json`).
- **`git`/remote absent** — This workspace snapshot has no `.git`; publication steps are still manual until initialized.
