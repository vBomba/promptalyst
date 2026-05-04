import { inject } from '@angular/core';
import { ResolveFn } from '@angular/router';
import type { VbShellNavLink } from 'vbomba-ui';

import { t } from '../core/i18n';
import { LocaleService } from '../core/locale.service';

export const appTitleResolve: ResolveFn<string> = () => {
  const locale = inject(LocaleService);
  return t('app.title', locale.uiLang());
};

export const navLinksResolve: ResolveFn<VbShellNavLink[]> = () => {
  const locale = inject(LocaleService);
  const lang = locale.uiLang();
  return [
    { path: 'analyzer', label: t('nav.analyzer', lang), icon: 'bx bx-edit-alt', animation: 'analyzer' },
    { path: 'history', label: t('nav.history', lang), icon: 'bx bx-history', animation: 'history' },
    { path: 'templates', label: t('nav.templates', lang), icon: 'bx bx-library', animation: 'templates' },
  ];
};
