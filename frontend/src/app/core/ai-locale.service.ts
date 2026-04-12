import { Injectable, signal } from '@angular/core';

import { AppLang, LocaleService } from './locale.service';

const STORAGE_AI = 'promptalyst-ai-lang';

@Injectable({
  providedIn: 'root',
})
export class AiLocaleService {
  readonly aiLang = signal<AppLang>(this.readInitial());

  constructor(private readonly locale: LocaleService) {
    if (!localStorage.getItem(STORAGE_AI)) {
      this.aiLang.set(this.locale.uiLang());
    }
  }

  setAiLang(lang: AppLang): void {
    this.aiLang.set(lang);
    localStorage.setItem(STORAGE_AI, lang);
  }

  private readInitial(): AppLang {
    const raw = localStorage.getItem(STORAGE_AI);
    if (raw === 'uk' || raw === 'pl' || raw === 'en') {
      return raw;
    }
    return 'en';
  }
}
