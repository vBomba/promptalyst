import { HttpService } from '@nestjs/axios';
import { HttpStatus, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectPinoLogger, PinoLogger } from 'nestjs-pino';
import { firstValueFrom } from 'rxjs';

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

    const response = await firstValueFrom(
      this.http.post<unknown>(
        'https://api.openai.com/v1/chat/completions',
        body,
        {
          headers: {
            Authorization: `Bearer ${key}`,
            'Content-Type': 'application/json',
          },
          validateStatus: () => true,
        },
      ),
    );

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
}
