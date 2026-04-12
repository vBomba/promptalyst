import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { t } from '../../core/i18n';
import { LocaleService } from '../../core/locale.service';
import { PromptDraftService } from '../../core/prompt-draft.service';
import { PROMPT_TEMPLATES, PromptTemplate } from '../../core/templates.data';

@Component({
  selector: 'app-templates',
  imports: [MatButtonModule, MatCardModule],
  templateUrl: './templates.html',
  styleUrl: './templates.scss',
})
export class Templates {
  private readonly router = inject(Router);
  private readonly draft = inject(PromptDraftService);
  private readonly locale = inject(LocaleService);

  protected readonly items = PROMPT_TEMPLATES;

  protected t(key: string): string {
    return t(key, this.locale.uiLang());
  }

  protected apply(template: PromptTemplate): void {
    this.draft.setText(template.body);
    void this.router.navigateByUrl('/');
  }
}
