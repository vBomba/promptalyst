import { DOCUMENT } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

import type { TelemetryClientEventDto } from '@promptalyst/contracts';

import { environment } from '../../environments/environment';

/**
 * Product / debug events to Nest (no prompt bodies or model text — PRD §7.1).
 */
@Injectable({
  providedIn: 'root',
})
export class TelemetryService {
  private readonly http = inject(HttpClient);
  private readonly document = inject(DOCUMENT);

  private readonly base = environment.openAiApiBase;

  emit(event: string, properties?: Record<string, unknown>, pathOverride?: string): void {
    const path =
      pathOverride ??
      (this.document.defaultView?.location?.pathname ? this.document.defaultView.location.pathname : undefined);
    const body: TelemetryClientEventDto = { event, properties, path };
    this.http.post<{ ok: true }>(`${this.base}/client-events`, body).subscribe({
      error: () => {
        /* best-effort; never block UX */
      },
    });
  }
}
