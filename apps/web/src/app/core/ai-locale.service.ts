import { Injectable, inject } from '@angular/core';

import { AppLang, LocaleService } from './locale.service';

/**
 * Model output language — same as {@link LocaleService.uiLang} (single app language control).
 */
@Injectable({
  providedIn: 'root',
})
export class AiLocaleService {
  private readonly locale = inject(LocaleService);

  readonly aiLang = this.locale.uiLang;

  setAiLang(lang: AppLang): void {
    this.locale.setUiLang(lang);
  }
}
