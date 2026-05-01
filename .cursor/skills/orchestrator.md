# Skill: Signal Lab PRD execution orchestrator (PRD 004)

## When to use

Starting or resuming a multi-phase PRD-driven build for Signal Lab. Always read the active **`context.json`** first (repo root **`.execution/context.json`** or **`.execution/<timestamp>/context.json`** from the current run) before planning or implementing.

## Model assignment

| Role | Model | Typical work |
|------|--------|----------------|
| Fast | Haiku-class | Rename/move files, boilerplate YAML/JSON, `.env.example`, checklist rows, formatting, lightweight scans |
| Default | Sonnet-class | NestJS/Prisma logic, Grafana panels, Cursor rules/skills, debugging observability |

Phase 5 splits: **~80% fast** (scaffolding, repetitive edits) / **~20% default** (non-trivial logic, edge cases).

## Execution directory (on start)

When the orchestrator run begins, create:

**`.execution/<timestamp>/context.json`**

where **`timestamp`** = `YYYY-MM-DD-HH-MM` (UTC or local — pick one per session and stay consistent).

Seed that file from the schema below with `status: "in_progress"` and `currentPhase` set to `"analysis"`. Keep the **repo root** **`.execution/context.json`** in sync as the **canonical pointer** for “latest run” (optional: symlink or copy).

## Seven phases

### Phase 1 — PRD Analysis (fast)

- Read the bound PRD (`prdPath` in context).
- Extract functional requirements, observability contract, rubric items.
- **Output:** Short summary in `phases.analysis.result`.

### Phase 2 — Codebase Scan (fast / explore)

- Map modules that touch the PRD (backend `scenarios/`, `metrics/`, `frontend/`, `infra/`).
- Note gaps vs PRD.
- **Output:** `phases.codebase.result`.

### Phase 3 — Planning (default)

- Execution plan: ordered tasks, risks, test/verification steps.
- **Output:** `phases.planning.result`.

### Phase 4 — Decomposition (default)

- Break plan into typed tasks (`database` | `backend` | `frontend` | …).
- Assign complexity (`low` | `medium` | `high`) and model hint (`fast` | `default`).
- Populate `tasks[]` with stable ids (`task-001`, …).
- **Output:** `phases.decomposition.result` + full `tasks` array.

### Phase 5 — Implementation (fast ~80% / default ~20%)

- Execute tasks in dependency order.
- Update each task `status`: `pending` → `in_progress` → `completed` | `failed`.
- Maintain `phases.implementation.completedTasks` / `totalTasks`.

### Phase 6 — Review (fast, readonly)

Per **PRD 004 F6 — review loop**:

For each domain in **`database`**, **`backend`**, **`frontend`**:

1. Run a **reviewer** subagent (readonly repo, fast model): checklist against PRD + project rules.
2. If **not passed**: run **implementer** (default model) with reviewer feedback; fix and re-run reviewer.
3. **Retry up to 3 times** per domain.
4. After **3 failures**: mark domain `failed`, **continue** (do not block the whole run).

Record outcomes in `phases.review.result`.

### Phase 7 — Report (fast)

Emit the **final report** (PRD 004 F8 template below). Set `phases.report.status` to `completed` and root `status` to `completed` (or `completed_with_failures` if any tasks/domains failed).

## context.json schema (PRD 004)

```json
{
  "executionId": "2026-05-01-11-11",
  "prdPath": "prds/002_prd-observability-demo.md",
  "status": "in_progress",
  "currentPhase": "implementation",
  "signal": 42,
  "phases": {
    "analysis": { "status": "completed", "result": "..." },
    "codebase": { "status": "completed", "result": "..." },
    "planning": { "status": "completed", "result": "..." },
    "decomposition": { "status": "completed", "result": "..." },
    "implementation": { "status": "in_progress", "completedTasks": 5, "totalTasks": 8 },
    "review": { "status": "pending" },
    "report": { "status": "pending" }
  },
  "tasks": [
    {
      "id": "task-001",
      "title": "Add ScenarioRun model to Prisma schema",
      "type": "database",
      "complexity": "low",
      "model": "fast",
      "status": "completed"
    }
  ]
}
```

### Phase status values

`pending` | `in_progress` | `completed` | `failed`

### Root status values

`in_progress` | `completed` | `completed_with_failures` | `blocked`

## Final report template (PRD 004 F8)

```text
Signal Lab PRD Execution — Complete

Tasks: X completed, Y failed, Z retries
Duration: ~N min
Model usage: X fast, Y default

Completed:
- [list]

Failed:
- [list]

Next steps:
- [list]
```

## Resume instructions

1. Read **`.execution/context.json`** (and timestamped copy if resuming a specific run).
2. Skip tasks already `completed`.
3. Respect `blockers` / failed domains; surface them in the report.
4. Continue from `currentPhase` and the first non-terminal task or phase.
5. Update **`context.json`** after every phase transition or task status change.
