import { Injectable, inject, signal } from '@angular/core';

import { AppLang, LocaleService } from './locale.service';

const STORAGE_AI = 'promptalyst-ai-lang';

function readStoredAiLang(): AppLang | null {
  const raw = localStorage.getItem(STORAGE_AI);
  if (raw === 'uk' || raw === 'pl' || raw === 'en') {
    return raw;
  }
  return null;
}

/**
 * Language for model outputs (analyze, suggestions, improve, explain).
 * May differ from {@link LocaleService.uiLang} UI language (PRD §9).
 */
@Injectable({
  providedIn: 'root',
})
export class AiLocaleService {
  private readonly locale = inject(LocaleService);

  readonly aiLang = signal<AppLang>(readStoredAiLang() ?? this.locale.uiLang());

  setAiLang(lang: AppLang): void {
    if (this.aiLang() === lang) {
      return;
    }
    this.aiLang.set(lang);
    localStorage.setItem(STORAGE_AI, lang);
  }
}
