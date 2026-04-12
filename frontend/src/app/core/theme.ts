import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Theme {
  readonly isDark = signal(false);

  constructor() {
    const stored = localStorage.getItem('promptalyst-theme');
    if (stored === 'dark') {
      this.setDark(true);
    } else if (stored === 'light') {
      this.setDark(false);
    } else {
      let prefersDark = false;
      if (typeof window !== 'undefined' && typeof window.matchMedia === 'function') {
        prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      }
      this.setDark(prefersDark);
    }
  }

  toggleTheme(): void {
    this.setDark(!this.isDark());
  }

  private setDark(value: boolean): void {
    this.isDark.set(value);
    document.body.classList.toggle('app-dark-theme', value);
    document.body.classList.toggle('app-light-theme', !value);
    localStorage.setItem('promptalyst-theme', value ? 'dark' : 'light');
  }
}
