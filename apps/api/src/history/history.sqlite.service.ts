import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

import { Injectable, OnModuleInit } from '@nestjs/common';
import Database = require('better-sqlite3');
import type { PromptSessionStoredDto } from '@promptalyst/contracts';

@Injectable()
export class HistorySqliteService implements OnModuleInit {
  private db!: Database.Database;

  onModuleInit(): void {
    const dbPath = resolve(process.cwd(), 'data/promptalyst.sqlite');
    mkdirSync(dirname(dbPath), { recursive: true });
    this.db = new Database(dbPath);
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS history_sessions (
        id TEXT PRIMARY KEY,
        updated_at INTEGER NOT NULL,
        payload TEXT NOT NULL
      );
    `);
  }

  list(): PromptSessionStoredDto[] {
    const rows = this.db
      .prepare('SELECT payload FROM history_sessions ORDER BY updated_at DESC')
      .all() as { payload: string }[];
    return rows.map((r) => JSON.parse(r.payload) as PromptSessionStoredDto);
  }

  get(id: string): PromptSessionStoredDto | undefined {
    const row = this.db
      .prepare('SELECT payload FROM history_sessions WHERE id = ?')
      .get(id) as { payload: string } | undefined;
    return row ? (JSON.parse(row.payload) as PromptSessionStoredDto) : undefined;
  }

  upsert(session: PromptSessionStoredDto): PromptSessionStoredDto {
    const payload = JSON.stringify(session);
    this.db
      .prepare(
        `
        INSERT INTO history_sessions (id, updated_at, payload)
        VALUES (@id, @updated_at, @payload)
        ON CONFLICT(id) DO UPDATE SET
          updated_at = excluded.updated_at,
          payload = excluded.payload
      `,
      )
      .run({
        id: session.id,
        updated_at: session.updatedAt,
        payload,
      });
    return session;
  }

  delete(id: string): void {
    this.db.prepare('DELETE FROM history_sessions WHERE id = ?').run(id);
  }
}
