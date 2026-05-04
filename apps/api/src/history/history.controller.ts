import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import type { PromptSessionStoredDto } from '@promptalyst/contracts';

import { HistoryApiKeyGuard } from './history-api-key.guard';
import { HistorySqliteService } from './history.sqlite.service';

@Controller('history/sessions')
@UseGuards(HistoryApiKeyGuard)
export class HistoryController {
  constructor(private readonly history: HistorySqliteService) {}

  @Get()
  list(): PromptSessionStoredDto[] {
    return this.history.list();
  }

  @Get(':id')
  get(@Param('id') id: string): PromptSessionStoredDto {
    const row = this.history.get(id);
    if (!row) {
      throw new NotFoundException('Session not found');
    }
    return row;
  }

  @Put(':id')
  upsert(
    @Param('id') id: string,
    @Body() body: PromptSessionStoredDto,
  ): PromptSessionStoredDto {
    if (!body || body.id !== id) {
      throw new BadRequestException('Session id mismatch');
    }
    return this.history.upsert(body);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id') id: string): void {
    this.history.delete(id);
  }
}
