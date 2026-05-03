import { Component, effect, inject, OnInit, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { finalize, map, switchMap } from 'rxjs';

import { HistoryStorageService, PromptSessionStored, PromptVersionStored } from '../../core/history-storage.service';
import { t } from '../../core/i18n';
import { LocaleService } from '../../core/locale.service';
import { PromptDraftService } from '../../core/prompt-draft.service';
import { PromptPipelineService } from '../../core/prompt-pipeline.service';
import { PromptPipelineState } from '../../core/prompt.types';
import { TemplateStoreService } from '../../core/template-store.service';

const TEMPLATE_CHIP_NONE = '__none__' as const;
type TemplateChipValue = string | typeof TEMPLATE_CHIP_NONE;

@Component({
  selector: 'app-analyzer',
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatChipListbox,
    MatChipOption,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './analyzer.html',
  styleUrl: './analyzer.scss',
})
export class Analyzer implements OnInit {
  private readonly pipeline = inject(PromptPipelineService);
  private readonly history = inject(HistoryStorageService);
  private readonly draft = inject(PromptDraftService);
  protected readonly locale = inject(LocaleService);
  protected readonly templateStore = inject(TemplateStoreService);

  protected readonly chipNone = TEMPLATE_CHIP_NONE;
  protected readonly chipSelection = signal<TemplateChipValue>(TEMPLATE_CHIP_NONE);

  protected readonly promptText = signal('');
  protected readonly advanced = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly state = signal<PromptPipelineState | null>(null);
  protected readonly currentSessionId = signal<string | null>(null);

  constructor() {
    effect(() => {
      const lang = this.locale.uiLang();
      const sel = this.chipSelection();
      if (sel !== TEMPLATE_CHIP_NONE) {
        const body = this.templateStore.getBody(sel, lang);
        this.promptText.set(body);
      }
    });
  }

  ngOnInit(): void {
    const pendingId = this.draft.takePendingTemplateId();
    const text = this.draft.takeText();
    if (pendingId) {
      this.chipSelection.set(pendingId);
    } else if (text) {
      this.promptText.set(text);
    }
  }

  protected t(key: string): string {
    return t(key, this.locale.uiLang());
  }

  protected onChipListChange(value: TemplateChipValue): void {
    this.chipSelection.set(value ?? TEMPLATE_CHIP_NONE);
  }

  protected analyze(): void {
    const text = this.promptText().trim();
    if (!text) {
      return;
    }
    this.error.set(null);
    this.busy.set(true);
    this.pipeline
      .runAnalysis(text)
      .pipe(
        switchMap((analysis) =>
          this.pipeline.runSuggestions(text, analysis).pipe(
            map((suggestions) => ({ analysis, suggestions })),
          ),
        ),
        finalize(() => this.busy.set(false)),
      )
      .subscribe({
        next: ({ analysis, suggestions }) => {
          this.state.set({ analysis, suggestions });
        },
        error: (e) => this.error.set(String(e?.message ?? e)),
      });
  }

  protected improve(): void {
    const text = this.promptText().trim();
    if (!text) {
      return;
    }
    this.error.set(null);
    this.busy.set(true);
    this.pipeline
      .runImprove(text, this.advanced())
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: ({ improved, explain }) => {
          this.state.update((s) => {
            const base = s ?? {};
            return {
              ...base,
              improvedText: improved,
              explainChanges: this.advanced() ? explain : undefined,
            };
          });
        },
        error: (e) => this.error.set(String(e?.message ?? e)),
      });
  }

  protected applyImproved(): void {
    const imp = this.state()?.improvedText;
    if (imp) {
      this.promptText.set(imp);
    }
  }

  protected newPrompt(): void {
    this.promptText.set('');
    this.chipSelection.set(TEMPLATE_CHIP_NONE);
    this.state.set(null);
    this.error.set(null);
    this.currentSessionId.set(null);
  }

  protected async saveToHistory(): Promise<void> {
    const text = this.promptText().trim();
    const st = this.state();
    if (!text || !st?.analysis) {
      return;
    }
    const sid = this.currentSessionId();
    let session: PromptSessionStored | undefined;
    if (sid) {
      session = await this.history.getSession(sid);
    }
    if (!session) {
      session = {
        id: sid ?? crypto.randomUUID(),
        title: text.split('\n')[0].trim().slice(0, 96) || 'Session',
        createdAt: Date.now(),
        updatedAt: Date.now(),
        versions: [],
      };
      this.currentSessionId.set(session.id);
    }
    const parent = session.versions.at(-1);
    const version: PromptVersionStored = {
      id: crypto.randomUUID(),
      ordinal: session.versions.length,
      text,
      analysis: st.analysis,
      suggestions: st.suggestions,
      improvedText: st.improvedText,
      explainChanges: st.explainChanges,
      createdAt: Date.now(),
      parentId: parent?.id,
    };
    session.versions.push(version);
    session.updatedAt = Date.now();
    await this.history.putSession(session);
  }

  protected criteriaKeys(): (keyof NonNullable<PromptPipelineState['analysis']>['criteria'])[] {
    return ['clarity', 'context', 'specificity', 'constraints', 'outputFormat'];
  }
}
