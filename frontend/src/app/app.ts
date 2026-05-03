import { Component, computed, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AppLang, LocaleService } from './core/locale.service';
import { t } from './core/i18n';
import { Theme } from './core/theme';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly theme = inject(Theme);
  private readonly locale = inject(LocaleService);

  protected readonly isDark = this.theme.isDark;
  protected readonly appLang = this.locale.uiLang;

  protected readonly themeIconClass = computed(() =>
    this.isDark() ? 'bx bx-sun' : 'bx bx-moon',
  );

  protected t(key: string): string {
    return t(key, this.locale.uiLang());
  }

  protected toggleTheme(): void {
    this.theme.toggleTheme();
  }

  protected setAppLang(lang: AppLang): void {
    this.locale.setUiLang(lang);
  }
}
