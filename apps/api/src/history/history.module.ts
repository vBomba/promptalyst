import { Module } from '@nestjs/common';

import { HistoryController } from './history.controller';
import { HistoryApiKeyGuard } from './history-api-key.guard';
import { HistorySqliteService } from './history.sqlite.service';

@Module({
  controllers: [HistoryController],
  providers: [HistorySqliteService, HistoryApiKeyGuard],
})
export class HistoryModule {}
