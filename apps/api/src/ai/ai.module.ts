import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';

import { OpenAiProxyController } from './openai-proxy.controller';
import { OpenAiProxyService } from './openai-proxy.service';

@Module({
  imports: [HttpModule.register({ timeout: 120_000, maxRedirects: 0 })],
  controllers: [OpenAiProxyController],
  providers: [OpenAiProxyService],
})
export class AiModule {}
