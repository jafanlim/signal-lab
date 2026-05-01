# Skill: Add a new scenario type

## When to use
When adding a new scenario to Signal Lab — e.g. memory_leak, slow_query, timeout_error.

## Steps (always complete all 8)

1. **Add to ScenarioType enum** — Open `backend/src/scenarios/dto/run-scenario.dto.ts`.
   Add a new entry to the `ScenarioType` enum, e.g.:
   ```ts
   MEMORY_LEAK = 'memory_leak',
   ```
   This is a TypeScript enum in the DTO — **do NOT run a Prisma migration**, no schema change needed.

2. **scenario.service.ts** — Add a case to `executeScenario()` switch block in
   `backend/src/scenarios/scenario.service.ts`. The handler must:
   - Perform the scenario action (delay, allocate, throw, etc.)
   - NOT skip any of the 4 observability signals (handled in `run()` automatically)

3. **Metrics** — `this.metrics.increment(dto.type, status)` is already called in `run()` — no action needed unless adding a new metric shape.

4. **Logging** — `this.logger.log/warn/error` is already called in `run()` with the required payload:
   ```json
   { "event": "scenario_run", "scenarioType": "<type>", "status": "<status>", "durationMs": <ms> }
   ```
   If the new scenario should log at `warn` level, add its type to the level-selection logic in `run()`.

5. **Sentry** — Only call `Sentry.captureException(error)` if the new scenario is an **error** type.
   For success scenarios (like memory_leak), no Sentry call is needed. The existing `system_error`
   guard in `run()` handles this already if you check `dto.type === ScenarioType.YOUR_TYPE`.

6. **Prisma persist** — `this.prisma.scenarioRun.create()` is already called in `run()` — no action needed.

7. **Frontend** — Add the new option to the Select in
   `frontend/components/run-scenario-form.tsx` with a descriptive label:
   ```tsx
   <SelectItem value="memory_leak">Memory Leak (300ms allocation)</SelectItem>
   ```

8. **Verify** — Trigger the new scenario from the UI. Check:
   - `GET localhost:4000/metrics` → `signal_lab_scenarios_total` counter incremented with `type="memory_leak"`
   - Grafana Loki panel → structured log with `scenarioType: "memory_leak"`
   - `GET localhost:4000/scenarios/history` → new row in DB
   - Sentry (only if error type)
