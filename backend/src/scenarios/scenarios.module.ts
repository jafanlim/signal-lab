import { Module } from '@nestjs/common';
import { ScenarioService } from './scenario.service';
import { ScenarioController } from './scenario.controller';
import { MetricsModule } from '../metrics/metrics.module';
import { LoggerModule } from '../logger/logger.module';

@Module({
  imports: [MetricsModule, LoggerModule],
  providers: [ScenarioService],
  controllers: [ScenarioController],
})
export class ScenariosModule {}
