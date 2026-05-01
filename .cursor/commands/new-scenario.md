# Command: /new-scenario

## What it does
Scaffolds a complete new scenario type end-to-end: DTO enum entry + backend handler + frontend form option + observability verification.

## Usage
/new-scenario <type_name> <description>

Example: /new-scenario memory_leak "Allocates a large array in a loop for 300ms, then succeeds"

## Files to edit (in order)

1. `backend/src/scenarios/dto/run-scenario.dto.ts`
   → Add `TYPE_NAME = 'type_name'` to the `ScenarioType` enum
   → No Prisma migration needed — this is a TypeScript enum, not a Prisma model field

2. `backend/src/scenarios/scenario.service.ts`
   → Add a `case ScenarioType.TYPE_NAME:` block inside `executeScenario()`
   → The 4 observability signals (metrics, log, prisma, sentry-if-error) fire automatically in `run()`
   → For success scenarios: no Sentry call needed
   → For warn-level scenarios: add type check to the log-level selector in `run()`

3. `frontend/components/run-scenario-form.tsx`
   → Add `<SelectItem value="type_name">Label</SelectItem>` to the Select component

## Output
After edits, print the verification checklist:
- [ ] `GET localhost:4000/metrics` shows `signal_lab_scenarios_total{type="type_name"}`
- [ ] Grafana Loki panel shows log with `scenarioType: "type_name"`
- [ ] `GET localhost:4000/scenarios/history` shows new row
- [ ] Sentry (only if error type)
