import { Injectable } from '@nestjs/common';
import { Counter, Histogram, Registry } from 'prom-client';

@Injectable()
export class MetricsService {
  private readonly registry: Registry;
  private readonly scenariosTotal: Counter;
  private readonly durationHistogram: Histogram;

  constructor() {
    this.registry = new Registry();
    this.registry.setDefaultLabels({ app: 'signal_lab' });

    this.scenariosTotal = new Counter({
      name: 'signal_lab_scenarios_total',
      help: 'Total number of scenario runs',
      labelNames: ['type', 'status'],
      registers: [this.registry],
    });

    this.durationHistogram = new Histogram({
      name: 'signal_lab_scenario_run_duration_seconds',
      help: 'Duration of scenario runs in seconds',
      labelNames: ['type'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [this.registry],
    });
  }

  increment(type: string, status: 'success' | 'error'): void {
    this.scenariosTotal.inc({ type, status });
  }

  observeDuration(type: string, durationMs: number): void {
    this.durationHistogram.observe({ type }, durationMs / 1000);
  }

  async getMetrics(): Promise<string> {
    return this.registry.metrics();
  }

  getContentType(): string {
    return this.registry.contentType;
  }
}
