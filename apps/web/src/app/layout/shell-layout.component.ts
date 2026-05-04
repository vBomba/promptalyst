import { Component, inject } from '@angular/core';
import { VbAppShellComponent, VbSelectComponent, VbThemeService, type VbSelectOption } from 'vbomba-ui';

import type { AppLang } from '../core/locale.service';
import { LocaleService } from '../core/locale.service';
import { t } from '../core/i18n';

@Component({
  selector: 'app-shell-layout',
  imports: [VbAppShellComponent, VbSelectComponent],
  templateUrl: './shell-layout.component.html',
  styleUrl: './shell-layout.component.scss',
})
export class ShellLayoutComponent {
  private readonly vbTheme = inject(VbThemeService);
  protected readonly locale = inject(LocaleService);

  constructor() {
    this.vbTheme.init();
  }

  protected readonly langOptions: VbSelectOption[] = [
    { value: 'en', label: 'English' },
    { value: 'uk', label: 'Українська' },
    { value: 'pl', label: 'Polski' },
  ];

  protected t(key: string): string {
    return t(key, this.locale.uiLang());
  }

  protected onLangChange(value: string): void {
    if (value === 'en' || value === 'uk' || value === 'pl') {
      this.locale.setUiLang(value as AppLang);
    }
  }
}
