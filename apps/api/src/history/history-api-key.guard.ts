import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

/**
 * Temporary lightweight protection for history endpoints.
 * If HISTORY_API_KEY is set, requests must provide matching `X-Api-Key` header.
 */
@Injectable()
export class HistoryApiKeyGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.config.get<string>('HISTORY_API_KEY');
    if (!expected) {
      return true;
    }

    const req = context.switchToHttp().getRequest<{
      headers?: Record<string, string | string[] | undefined>;
    }>();
    const got = req.headers?.['x-api-key'];
    const apiKey = Array.isArray(got) ? got[0] : got;
    if (apiKey !== expected) {
      throw new ForbiddenException('Invalid API key for history endpoint');
    }
    return true;
  }
}
