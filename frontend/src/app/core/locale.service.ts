import { Injectable, signal } from '@angular/core';

export type AppLang = 'en' | 'uk' | 'pl';

const STORAGE_UI = 'promptalyst-ui-lang';

@Injectable({
  providedIn: 'root',
})
export class LocaleService {
  readonly uiLang = signal<AppLang>(readUi());

  constructor() {
    document.documentElement.setAttribute('lang', htmlLang(readUi()));
  }

  setUiLang(lang: AppLang): void {
    this.uiLang.set(lang);
    localStorage.setItem(STORAGE_UI, lang);
    document.documentElement.setAttribute('lang', htmlLang(lang));
  }
}

function readUi(): AppLang {
  const raw = localStorage.getItem(STORAGE_UI);
  if (raw === 'uk' || raw === 'pl' || raw === 'en') {
    return raw;
  }
  return 'en';
}

function htmlLang(lang: AppLang): string {
  if (lang === 'uk') {
    return 'uk';
  }
  if (lang === 'pl') {
    return 'pl';
  }
  return 'en';
}
