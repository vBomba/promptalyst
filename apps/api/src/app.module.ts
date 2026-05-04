import { randomUUID } from 'node:crypto';

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';

import { AiModule } from './ai/ai.module';
import { AppController } from './app.controller';
import { TelemetryModule } from './telemetry/telemetry.module';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req, res) => {
          const header = req.headers['x-request-id'];
          const id =
            typeof header === 'string' && header.length > 0 ? header : randomUUID();
          res.setHeader('x-request-id', id);
          return id;
        },
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['apps/api/.env', '.env'],
    }),
    ThrottlerModule.forRoot([{ name: 'default', ttl: 60_000, limit: 60 }]),
    AiModule,
    TelemetryModule,
  ],
  controllers: [AppController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
