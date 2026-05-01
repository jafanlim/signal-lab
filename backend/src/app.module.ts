import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { MetricsModule } from './metrics/metrics.module';
import { LoggerModule } from './logger/logger.module';
import { ScenariosModule } from './scenarios/scenarios.module';
import { AppController } from './app.controller';

@Module({
  imports: [PrismaModule, MetricsModule, LoggerModule, ScenariosModule],
  controllers: [AppController],
})
export class AppModule {}
