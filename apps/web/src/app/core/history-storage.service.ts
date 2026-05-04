import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type {
  PromptSessionStoredDto,
  PromptVersionStoredDto,
} from '@promptalyst/contracts';

import { PromptAnalysisResult } from './prompt.types';
import { environment } from '../../environments/environment';

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
  private readonly requestOptions =
    environment.historyApiKey && environment.historyApiKey.length > 0
      ? {
          headers: new HttpHeaders({
            'X-Api-Key': environment.historyApiKey,
          }),
        }
      : undefined;

  async listSessions(): Promise<PromptSessionStored[]> {
    return firstValueFrom(
      this.http.get<PromptSessionStored[]>(this.base, this.requestOptions),
    );
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
}
