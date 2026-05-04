import { Body, Controller, Post } from '@nestjs/common';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';

import type { TelemetryClientEventDto } from '@promptalyst/contracts';

@Controller('client-events')
export class TelemetryController {
  constructor(
    @InjectPinoLogger(TelemetryController.name) private readonly log: PinoLogger,
  ) {}

  @Post()
  ingest(@Body() body: TelemetryClientEventDto): { ok: true } {
    const { event, properties, path } = body ?? {};
    this.log.info(
      {
        event: 'client_telemetry',
        name: event,
        path,
        keys: properties ? Object.keys(properties) : [],
      },
      'client_event',
    );
    return { ok: true };
  }
}
