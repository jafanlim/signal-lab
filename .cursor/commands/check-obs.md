# Command: /check-obs

## What it does

Runs through the full observability verification checklist (PRD 003 R3) and reports pass/fail per check.

## Checks performed

1. `GET http://localhost:4000/metrics` → confirm `signal_lab_scenarios_total` present (and histogram series when applicable).
2. Run a **success** scenario → counter increments; structured logs in Loki.
3. Run **system_error** → Sentry exception captured (when DSN configured).
4. Open Grafana at `http://localhost:3001` → **Signal Lab Overview** dashboard loads and panels have data after scrapes.
5. Loki panel / Explore → logs filterable by `scenarioType` (query e.g. `{app="signal-lab"}`).
6. Confirm **four signals** for scenario types that require them per PRD (counter + log + Prisma + Sentry on errors).

## Output

A **pass/fail table** per check with a short **remediation hint** for each failure.
