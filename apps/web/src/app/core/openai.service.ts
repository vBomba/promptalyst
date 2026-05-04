import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

import { environment } from '../../environments/environment';

interface ChatCompletionDto {
  choices?: { message?: { content?: string | null } }[];
}

@Injectable({
  providedIn: 'root',
})
export class OpenAiService {
  private readonly http = inject(HttpClient);

  chatJson<T>(
    messages: { role: 'system' | 'user' | 'assistant'; content: string }[],
    options?: { temperature?: number; model?: string },
  ): Observable<T> {
    const url = `${environment.openAiApiBase}/v1/chat/completions`;
    const body = {
      model: options?.model ?? 'gpt-4o-mini',
      messages,
      temperature: options?.temperature ?? 0.35,
      response_format: { type: 'json_object' as const },
    };
    return this.http.post<ChatCompletionDto>(url, body).pipe(
      map((res) => {
        const raw = res.choices?.[0]?.message?.content;
        if (raw == null || raw === '') {
          throw new Error('Empty completion');
        }
        return JSON.parse(raw) as T;
      }),
    );
  }
}
