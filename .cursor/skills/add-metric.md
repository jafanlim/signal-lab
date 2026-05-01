# Skill: Add a new Prometheus metric

## When to use
When Signal Lab needs to track a new measurable value — e.g. response duration histogram, active connections gauge.

## Steps

1. **MetricsService** — Add the new metric in `backend/src/metrics/metrics.service.ts`:
   - Counter: `new Counter({ name: 'signal_lab_{name}', help: '...', labelNames: [...] })`
   - Gauge: `new Gauge({ name: 'signal_lab_{name}', help: '...' })`
   - Histogram: `new Histogram({ name: 'signal_lab_{name}', help: '...', buckets: [...] })`
   - Register with `register.registerMetric(metric)` — always check for duplicates first

2. **Export a method** — Add a typed method to MetricsService that callers use (never expose the raw metric object outside the service).

3. **Inject and call** — In the service that needs it, inject MetricsService and call the new method at the right point.

4. **Grafana panel** — Open `infra/grafana/dashboards/signal-lab.json` and add a new panel:
   - Panel type: timeseries for rates, stat for current values, histogram for distributions
   - PromQL: `rate(signal_lab_{name}[1m])` for counters, `signal_lab_{name}` for gauges
   - Place in the dashboard grid, increment the panel id

5. **Verify** — Hit `GET http://localhost:4000/metrics` and confirm the new metric appears. Run a scenario and confirm the value changes. Check Grafana panel renders data.
