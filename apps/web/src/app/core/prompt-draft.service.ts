import { Injectable, signal } from '@angular/core';

import { TemplateId } from './templates.data';

@Injectable({
  providedIn: 'root',
})
export class PromptDraftService {
  readonly text = signal('');
  private readonly pendingTemplateId = signal<TemplateId | null>(null);

  setText(value: string): void {
    this.text.set(value);
  }

  /** Open analyzer with this template selected and body inserted (current UI language). */
  setTemplateAndText(id: TemplateId, text: string): void {
    this.pendingTemplateId.set(id);
    this.text.set(text);
  }

  takePendingTemplateId(): TemplateId | null {
    const v = this.pendingTemplateId();
    this.pendingTemplateId.set(null);
    return v;
  }

  takeText(): string {
    const v = this.text();
    this.text.set('');
    return v;
  }
}
