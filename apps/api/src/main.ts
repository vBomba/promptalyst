import { Logger } from 'nestjs-pino';

import { NestFactory } from '@nestjs/core';

import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));
  app.enableCors({
    origin: ['http://localhost:4200', 'http://127.0.0.1:4200'],
    credentials: true,
  });
  const port = process.env['PORT'] ? Number(process.env['PORT']) : 3333;
  await app.listen(port);
}

bootstrap().catch((err) => {
  console.error(err);
  process.exit(1);
});
