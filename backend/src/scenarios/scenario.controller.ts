import { Controller, Post, Get, Body, Res } from '@nestjs/common';
import type { Response } from 'express';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { ScenarioService } from './scenario.service';
import { MetricsService } from '../metrics/metrics.service';
import { RunScenarioDto, ScenarioType } from './dto/run-scenario.dto';

@ApiTags('scenarios')
@Controller()
export class ScenarioController {
  constructor(
    private readonly scenarioService: ScenarioService,
    private readonly metricsService: MetricsService,
  ) {}

  @Post('scenarios')
  @ApiOperation({ summary: 'Run a scenario — observability signals depend on scenario type (PRD)' })
  async runScenario(
    @Body() dto: RunScenarioDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    if (dto.type === ScenarioType.TEAPOT) {
      await this.scenarioService.runTeapot(dto);
      res.status(418);
      return { signal: 42, message: "I'm a teapot" };
    }
    return this.scenarioService.run(dto);
  }

  @Get('scenarios/history')
  @ApiOperation({ summary: 'Get last 20 scenario runs' })
  async getHistory() {
    return this.scenarioService.getHistory();
  }

  @Get('metrics')
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics(@Res() res: Response) {
    res.set('Content-Type', this.metricsService.getContentType());
    res.end(await this.metricsService.getMetrics());
  }
}
