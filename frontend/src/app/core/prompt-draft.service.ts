import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class PromptDraftService {
  readonly text = signal('');

  setText(value: string): void {
    this.text.set(value);
  }

  takeText(): string {
    const v = this.text();
    this.text.set('');
    return v;
  }
}
