import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  PromptSessionStoredDto,
  PromptVersionStoredDto,
} from '@promptalyst/contracts';

import { PromptAnalysisResult } from './prompt.types';
import { environment } from '../../environments/environment';

const LEGACY_DB_NAME = 'promptalyst-db';
const LEGACY_DB_VERSION = 1;
const LEGACY_STORE = 'sessions';
const LEGACY_MIGRATION_DONE = 'promptalyst-history-migrated-v1';

export interface PromptVersionStored
  extends Omit<PromptVersionStoredDto, 'analysis'> {
  analysis?: PromptAnalysisResult;
}

export interface PromptSessionStored
  extends Omit<PromptSessionStoredDto, 'versions'> {
  versions: PromptVersionStored[];
}

@Injectable({
  providedIn: 'root',
})
export class HistoryStorageService {
  private readonly http = inject(HttpClient);
  private readonly base = `${environment.openAiApiBase}/history/sessions`;
  private migrationPromise: Promise<void> | null = null;
  private readonly requestOptions =
    environment.historyApiKey && environment.historyApiKey.length > 0
      ? {
          headers: new HttpHeaders({
            'X-Api-Key': environment.historyApiKey,
          }),
        }
      : undefined;

  async listSessions(): Promise<PromptSessionStored[]> {
    await this.ensureLegacyMigrated();
    return this.fetchRemoteList();
  }

  async getSession(id: string): Promise<PromptSessionStored | undefined> {
    try {
      return await firstValueFrom(
        this.http.get<PromptSessionStored>(
          `${this.base}/${encodeURIComponent(id)}`,
          this.requestOptions,
        ),
      );
    } catch {
      return undefined;
    }
  }

  async putSession(session: PromptSessionStored): Promise<void> {
    await firstValueFrom(
      this.http.put<PromptSessionStored>(
        `${this.base}/${encodeURIComponent(session.id)}`,
        session,
        this.requestOptions,
      ),
    );
  }

  async deleteSession(id: string): Promise<void> {
    await firstValueFrom(
      this.http.delete<void>(
        `${this.base}/${encodeURIComponent(id)}`,
        this.requestOptions,
      ),
    );
  }

  private fetchRemoteList(): Promise<PromptSessionStored[]> {
    return firstValueFrom(
      this.http.get<PromptSessionStored[]>(this.base, this.requestOptions),
    );
  }

  /**
   * One-time migration from old IndexedDB storage to server SQLite API.
   * Runs lazily on first history list request and never blocks normal usage on failure.
   */
  private async ensureLegacyMigrated(): Promise<void> {
    if (localStorage.getItem(LEGACY_MIGRATION_DONE) === '1') {
      return;
    }
    if (this.migrationPromise) {
      return this.migrationPromise;
    }

    this.migrationPromise = (async () => {
      try {
        if (typeof indexedDB === 'undefined') {
          localStorage.setItem(LEGACY_MIGRATION_DONE, '1');
          return;
        }

        const remote = await this.fetchRemoteList();
        if (remote.length > 0) {
          localStorage.setItem(LEGACY_MIGRATION_DONE, '1');
          return;
        }

        const legacyRows = await this.readLegacyIndexedDbSessions();
        if (legacyRows.length === 0) {
          localStorage.setItem(LEGACY_MIGRATION_DONE, '1');
          return;
        }

        for (const row of legacyRows) {
          await this.putSession(row);
        }

        localStorage.setItem(LEGACY_MIGRATION_DONE, '1');
      } catch {
        // Best-effort migration: keep app usable even if migration fails.
      } finally {
        this.migrationPromise = null;
      }
    })();

    return this.migrationPromise;
  }

  private async readLegacyIndexedDbSessions(): Promise<PromptSessionStored[]> {
    const db = await new Promise<IDBDatabase>((resolve, reject) => {
      const req = indexedDB.open(LEGACY_DB_NAME, LEGACY_DB_VERSION);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result);
    });

    try {
      const rows = await new Promise<PromptSessionStored[]>((resolve, reject) => {
        const tx = db.transaction(LEGACY_STORE, 'readonly');
        const req = tx.objectStore(LEGACY_STORE).getAll();
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve((req.result as PromptSessionStored[]) ?? []);
      });
      rows.sort((a, b) => b.updatedAt - a.updatedAt);
      return rows;
    } finally {
      db.close();
    }
  }
}
