import { Body, Controller, Post, Res } from '@nestjs/common';
import type { Response } from 'express';
import type {
  AnalyzeSuggestRequestDto,
  AnalyzeSuggestResponseDto,
} from '@promptalyst/contracts';

import { OpenAiProxyService } from './openai-proxy.service';

@Controller()
export class OpenAiProxyController {
  constructor(private readonly openAi: OpenAiProxyService) {}

  @Post('v1/chat/completions')
  async chatCompletions(
    @Body() body: unknown,
    @Res({ passthrough: true }) res: Response,
  ): Promise<unknown> {
    const out = await this.openAi.forwardChatCompletions(body);
    res.status(out.status);
    return out.data;
  }

  @Post('ai/analyze-suggest')
  async analyzeSuggest(
    @Body() body: AnalyzeSuggestRequestDto,
  ): Promise<AnalyzeSuggestResponseDto> {
    return this.openAi.analyzeAndSuggest(body);
  }
}
