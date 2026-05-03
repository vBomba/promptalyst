import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

import { t } from '../../core/i18n';
import { LocaleService } from '../../core/locale.service';
import { PromptDraftService } from '../../core/prompt-draft.service';
import { TemplateStoreService } from '../../core/template-store.service';
import { TemplateId } from '../../core/templates.data';

@Component({
  selector: 'app-templates',
  imports: [FormsModule, MatButtonModule, MatCardModule, MatFormFieldModule, MatInputModule],
  templateUrl: './templates.html',
  styleUrl: './templates.scss',
})
export class Templates {
  private readonly router = inject(Router);
  private readonly draft = inject(PromptDraftService);
  private readonly locale = inject(LocaleService);
  protected readonly store = inject(TemplateStoreService);

  protected readonly titleDraft = signal<Record<string, string>>({});
  protected readonly bodyDraft = signal<Record<string, string>>({});

  constructor() {
    effect(() => {
      this.locale.uiLang();
      this.store.list();
      this.syncDraftsFromStore();
    });
  }

  protected t(key: string): string {
    return t(key, this.locale.uiLang());
  }

  protected addTemplate(): void {
    this.store.addTemplate();
  }

  protected removeTemplate(id: TemplateId): void {
    if (!confirm(this.t('templates.deleteConfirm'))) {
      return;
    }
    this.store.removeTemplate(id);
  }

  protected patchTitle(id: TemplateId, value: string): void {
    this.titleDraft.update((m) => ({ ...m, [id]: value }));
  }

  protected patchBody(id: TemplateId, value: string): void {
    this.bodyDraft.update((m) => ({ ...m, [id]: value }));
  }

  protected saveTitle(id: TemplateId): void {
    const v = this.titleDraft()[id] ?? '';
    this.store.updateTitle(id, this.locale.uiLang(), v.trim());
  }

  protected saveBody(id: TemplateId): void {
    this.store.updateBody(id, this.locale.uiLang(), this.bodyDraft()[id] ?? '');
  }

  protected resetAll(): void {
    if (!confirm(this.t('templates.resetConfirm'))) {
      return;
    }
    this.store.resetToDefaults();
  }

  protected openInAnalyzer(id: TemplateId): void {
    const lang = this.locale.uiLang();
    const body = this.store.getBody(id, lang);
    this.draft.setTemplateAndText(id, body);
    void this.router.navigateByUrl('/');
  }

  private syncDraftsFromStore(): void {
    const lang = this.locale.uiLang();
    const list = this.store.list();
    const titles: Record<string, string> = {};
    const bodies: Record<string, string> = {};
    for (const tmpl of list) {
      titles[tmpl.id] = tmpl.titles[lang];
      bodies[tmpl.id] = tmpl.bodies[lang];
    }
    this.titleDraft.set(titles);
    this.bodyDraft.set(bodies);
  }
}
