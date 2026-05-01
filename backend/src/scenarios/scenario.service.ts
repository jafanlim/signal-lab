import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/node';
import { PrismaService } from '../prisma/prisma.service';
import { MetricsService } from '../metrics/metrics.service';
import { LokiLoggerService } from '../logger/loki-logger.service';
import { RunScenarioDto, ScenarioType } from './dto/run-scenario.dto';

@Injectable()
export class ScenarioService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly metrics: MetricsService,
    private readonly logger: LokiLoggerService,
  ) {}

  async run(dto: RunScenarioDto) {
    const start = Date.now();
    let status: 'success' | 'error' = 'success';
    let errorMessage: string | undefined;

    try {
      await this.executeScenario(dto.type);
    } catch (err) {
      if (err instanceof HttpException) {
        throw err;
      }
      status = 'error';
      errorMessage = err instanceof Error ? err.message : String(err);
      if (dto.type === ScenarioType.SYSTEM_ERROR) {
        Sentry.captureException(err);
      }
    }

    const durationMs = Date.now() - start;

    // Signal 1 — Prometheus counter + duration histogram
    this.metrics.increment(dto.type, status);
    this.metrics.observeDuration(dto.type, durationMs);

    // Signal 2 — Structured log → Loki
    const logPayload = {
      event: 'scenario_run',
      scenarioType: dto.type,
      status,
      durationMs,
      ...(errorMessage && { errorMessage }),
    };
    if (status === 'error') this.logger.error(logPayload);
    else if (dto.type === ScenarioType.SLOW_REQUEST) this.logger.warn(logPayload);
    else this.logger.log(logPayload);

    // Signal 3 — Persist to PostgreSQL
    const run = await this.prisma.scenarioRun.create({
      data: { type: dto.type, status, durationMs, errorMessage },
    });

    // Signal 4 — Sentry already called above for system_error
    this.logger.log({
      event: 'scenario_persisted',
      scenarioId: run.id,
      scenarioType: dto.type,
      status,
    });

    return run;
  }

  async runTeapot(dto: RunScenarioDto): Promise<void> {
    const start = Date.now();
    const status = 'success' as const;
    const durationMs = Date.now() - start;

    this.metrics.increment(dto.type, status);
    this.metrics.observeDuration(dto.type, durationMs);

    this.logger.log({
      event: 'scenario_run',
      scenarioType: dto.type,
      status,
      durationMs,
    });

    const run = await this.prisma.scenarioRun.create({
      data: {
        type: dto.type,
        status,
        durationMs,
        metadata: { easter: true },
      },
    });

    this.logger.log({
      event: 'scenario_persisted',
      scenarioId: run.id,
      scenarioType: dto.type,
      status,
    });
  }

  private async executeScenario(type: ScenarioType): Promise<void> {
    switch (type) {
      case ScenarioType.SUCCESS:
        await new Promise((r) => setTimeout(r, 10));
        break;
      case ScenarioType.SLOW_REQUEST:
        await new Promise((r) => setTimeout(r, 2000));
        break;
      case ScenarioType.SYSTEM_ERROR:
        throw new Error('Simulated system failure — captured by Sentry');
      case ScenarioType.VALIDATION_ERROR:
        throw new HttpException(
          'Validation failed: name is required',
          HttpStatus.BAD_REQUEST,
        );
      case ScenarioType.TEAPOT:
        throw new Error('Teapot scenario is handled by runTeapot');
    }
  }

  async getHistory() {
    return this.prisma.scenarioRun.findMany({
      orderBy: { createdAt: 'desc' },
      take: 20,
    });
  }
}
