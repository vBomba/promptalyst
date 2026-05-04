import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';
import type {
  AnalyzeSuggestRequestDto,
  AnalyzeSuggestResponseDto,
} from '@promptalyst/contracts';

@Injectable()
export class OpenAiProxyService {
  constructor(
    private readonly http: HttpService,
    private readonly config: ConfigService,
    @InjectPinoLogger(OpenAiProxyService.name) private readonly log: PinoLogger,
  ) {}

  async forwardChatCompletions(
    body: unknown,
  ): Promise<{ status: number; data: unknown }> {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (!key) {
      this.log.warn('OPENAI_API_KEY is not set');
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        data: {
          error: {
            message: 'OpenAI is not configured on the server (OPENAI_API_KEY).',
            type: 'server_configuration',
          },
        },
      };
    }

    const model =
      body &&
      typeof body === 'object' &&
      'model' in body &&
      typeof (body as { model: unknown }).model === 'string'
        ? (body as { model: string }).model
        : 'unknown';
    const messages =
      body && typeof body === 'object' && 'messages' in body
        ? (body as { messages: unknown }).messages
        : undefined;
    const messageCount = Array.isArray(messages) ? messages.length : 0;

    this.log.info(
      { event: 'openai_forward', model, messageCount },
      'Forwarding to OpenAI',
    );

    const response = await this.callOpenAi(body, key);

    this.log.info(
      {
        event: 'openai_response',
        status: response.status,
        model,
        messageCount,
      },
      'OpenAI responded',
    );

    return { status: response.status, data: response.data };
  }

  async analyzeAndSuggest(
    input: AnalyzeSuggestRequestDto,
  ): Promise<AnalyzeSuggestResponseDto> {
    const key = this.config.get<string>('OPENAI_API_KEY');
    if (!key) {
      throw new Error('OpenAI is not configured on the server (OPENAI_API_KEY).');
    }

    const meta =
      input.draftDurationMs != null
        ? `\n\n[Metadata for calibration: the user spent about ${input.draftDurationMs} ms editing or preparing this prompt before requesting analysis.]`
        : '';

    const body = {
      model: 'gpt-4o-mini',
      temperature: 0.3,
      response_format: { type: 'json_object' as const },
      messages: [
        { role: 'system', content: systemAnalyzeSuggest(input.aiLang) },
        {
          role: 'user',
          content: `Prompt to analyze and improve guidance for:\n"""${input.promptText}"""${meta}`,
        },
      ],
    };

    const response = await this.callOpenAi(body, key);
    if (response.status < 200 || response.status >= 300) {
      this.log.warn(
        { event: 'openai_analyze_suggest_failed', status: response.status },
        'OpenAI analyze+suggest request failed',
      );
      throw new Error(`OpenAI request failed (${response.status})`);
    }
    const data = response.data as {
      choices?: { message?: { content?: string | null } }[];
    };
    const raw = data.choices?.[0]?.message?.content;
    if (!raw) {
      throw new Error('Empty completion');
    }
    const parsed = JSON.parse(raw) as AnalyzeSuggestResponseDto;
    return {
      analysis: parsed.analysis,
      suggestions: parsed.suggestions ?? [],
    };
  }

  private async callOpenAi(body: unknown, key: string) {
    return firstValueFrom(
      this.http.post<unknown>('https://api.openai.com/v1/chat/completions', body, {
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        validateStatus: () => true,
      }),
    );
  }
}

function langName(l: string): string {
  if (l === 'uk') return 'Ukrainian';
  if (l === 'pl') return 'Polish';
  return 'English';
}

function systemAnalyzeSuggest(lang: string): string {
  return `You are an expert prompt engineer.
Return ONLY valid JSON with this exact shape:
{
  "analysis": {
    "overallScore": number from 1-10,
    "criteria": {
      "clarity": number 0-10,
      "context": number 0-10,
      "specificity": number 0-10,
      "constraints": number 0-10,
      "outputFormat": number 0-10
    }
  },
  "suggestions": string[]
}
Use consistent normalized scoring. Keep 4-8 concise suggestions.
All suggestion strings must be in ${langName(lang)}.`;
}
