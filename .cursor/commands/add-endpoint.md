# Command: /add-endpoint

## What it does

Scaffolds a complete new NestJS endpoint with full observability wiring (Prometheus, structured Loki logs, optional Sentry on errors), aligned with Signal Lab rules (`signal_lab_` prefix, log fields `scenarioId`, `scenarioType`, `status` where applicable).

## Usage

`/add-endpoint <resource> <method> <description>`

Example: `/add-endpoint alerts GET "List all active alerts"`

## Steps performed

1. Create DTO in `backend/src/<resource>/dto/` (validation + Swagger).
2. Create or extend service with business logic.
3. Add controller handler with `@ApiTags`, `@ApiOperation`, correct HTTP method/status.
4. Wire **`MetricsService`** counter increment (labels consistent with existing patterns).
5. Add structured log via **`LokiLoggerService`** (NestJS `Logger` never replaced by `console.log`).
6. Register controller/service in the Nest module if this is a new resource.
7. Verify: `curl` the endpoint, check `GET /metrics`, confirm logs in Loki explore `{app="signal-lab"}`.

## Output

List the **up to ~3 primary files** touched, paste a **verification curl** example, and note **Prometheus** metric name added or reused.
