# Skill: Add a new structured log event

## When to use
When adding a new log event to the backend — new action, new error type, new audit trail entry.

## Steps

1. **Never use console.log** — always use the injected NestJS Logger (`this.logger`).

2. **Choose the right level**:
   - `this.logger.log(payload)` — normal operations
   - `this.logger.warn(payload)` — degraded but not broken (high_load, slow response)
   - `this.logger.error(payload)` — failures, exceptions, system_error

3. **Always use a structured object payload** — never a plain string:
```typescript
   this.logger.log({
     event: 'scenario_completed',   // descriptive event name
     scenarioId: run.id,
     scenarioType: type,
     status: 'success',
     durationMs: duration,
     // add any additional context fields here
   });
```

4. **Loki label consideration** — Fields that you want to filter by in Grafana (scenarioType, status) are already mapped as dynamic Loki labels in loki-logger.ts. If adding a new filterable field, update the `dynamicLabels` config in loki-logger.ts.

5. **Verify in Grafana** — After triggering the code path, open Grafana → Explore → Loki → query `{job="signal_lab"}` → confirm the new log entry appears with the correct fields.
