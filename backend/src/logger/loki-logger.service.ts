import { Injectable, LoggerService } from '@nestjs/common';
import * as winston from 'winston';
import LokiTransport from 'winston-loki';

@Injectable()
export class LokiLoggerService implements LoggerService {
  private readonly logger: winston.Logger;

  constructor() {
    const transports: winston.transport[] = [
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.colorize(),
          winston.format.simple(),
        ),
      }),
    ];

    if (process.env.LOKI_HOST) {
      transports.push(
        new LokiTransport({
          host: process.env.LOKI_HOST,
          labels: { app: 'signal-lab' },
          // batching: false sends immediately; avoids stale-flush issues in dev
          batching: false,
          onConnectionError: (err) =>
            console.error('Loki connection error:', err),
        }),
      );
    }

    this.logger = winston.createLogger({ level: 'info', transports });
  }

  private serialize(msg: string | object): string {
    return typeof msg === 'string' ? msg : JSON.stringify(msg);
  }

  log(message: string | object) {
    this.logger.info(this.serialize(message));
  }

  error(message: string | object, trace?: string) {
    const base = this.serialize(message);
    this.logger.error(trace ? `${base} — trace: ${trace}` : base);
  }

  warn(message: string | object) {
    this.logger.warn(this.serialize(message));
  }

  debug(message: string | object) {
    this.logger.debug(this.serialize(message));
  }

  verbose(message: string | object) {
    this.logger.verbose(this.serialize(message));
  }
}
