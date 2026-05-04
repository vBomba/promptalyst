import { Component, computed, effect, inject, OnInit, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import {
  VbButtonComponent,
  VbChipComponent,
  VbLoaderComponent,
  VbTextareaComponent,
  VbToggleComponent,
} from 'vbomba-ui';
import { finalize } from 'rxjs';

import { AiLocaleService } from '../../core/ai-locale.service';
import { HistoryStorageService, PromptSessionStored, PromptVersionStored } from '../../core/history-storage.service';
import { t } from '../../core/i18n';
import { LocPipe } from '../../core/loc.pipe';
import { LocaleService } from '../../core/locale.service';
import { PromptDraftService } from '../../core/prompt-draft.service';
import { PromptPipelineService } from '../../core/prompt-pipeline.service';
import { type AnalysisCriteria, PromptPipelineState } from '../../core/prompt.types';
import { TelemetryService } from '../../core/telemetry.service';
import { TemplateStoreService } from '../../core/template-store.service';

const TEMPLATE_CHIP_NONE = '__none__' as const;
type TemplateChipValue = string | typeof TEMPLATE_CHIP_NONE;

const CRITERIA_ORDER: readonly (keyof AnalysisCriteria)[] = [
  'clarity',
  'context',
  'specificity',
  'constraints',
  'outputFormat',
];

@Component({
  selector: 'app-analyzer',
  imports: [
    MatCardModule,
    VbButtonComponent,
    VbChipComponent,
    VbToggleComponent,
    VbLoaderComponent,
    VbTextareaComponent,
    LocPipe,
  ],
  templateUrl: './analyzer.html',
  styleUrl: './analyzer.scss',
})
export class Analyzer implements OnInit {
  private readonly pipeline = inject(PromptPipelineService);
  private readonly history = inject(HistoryStorageService);
  private readonly draft = inject(PromptDraftService);
  protected readonly locale = inject(LocaleService);
  private readonly templateStore = inject(TemplateStoreService);
  private readonly telemetry = inject(TelemetryService);
  private readonly aiLocale = inject(AiLocaleService);

  protected readonly chipNone = TEMPLATE_CHIP_NONE;
  protected readonly chipSelection = signal<TemplateChipValue>(TEMPLATE_CHIP_NONE);

  protected readonly promptText = signal('');
  protected readonly advanced = signal(false);
  protected readonly busy = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly state = signal<PromptPipelineState | null>(null);
  protected readonly currentSessionId = signal<string | null>(null);

  /** Start of the current “draft window” until the user runs Analyze (PRD draft duration). */
  private readonly analysisDraftStartedAt = signal<number | null>(null);

  /** Precomputed chip labels — avoids calling store methods from the template. */
  protected readonly templateChipRows = computed(() => {
    const lang = this.locale.uiLang();
    return this.templateStore.list().map((tmpl) => ({
      id: tmpl.id,
      label: this.templateStore.getTitle(tmpl.id, lang),
    }));
  });

  /** Localized criterion labels for the analysis breakdown (not method calls in template). */
  protected readonly criterionRows = computed(() => {
    const lang = this.locale.uiLang();
    return CRITERIA_ORDER.map((key) => ({
      key,
      label: t(`analyzer.criterion.${key}`, lang),
    }));
  });

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
    this.markAnalysisDraftWindowStart();
  }

  private markAnalysisDraftWindowStart(): void {
    this.analysisDraftStartedAt.set(Date.now());
  }

  protected onChipListChange(value: TemplateChipValue): void {
    this.chipSelection.set(value ?? TEMPLATE_CHIP_NONE);
  }

  protected onTemplateChipKeydown(event: KeyboardEvent, value: TemplateChipValue): void {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.onChipListChange(value);
    }
  }

  protected analyze(): void {
    const text = this.promptText().trim();
    if (!text) {
      return;
    }
    const started = this.analysisDraftStartedAt();
    const draftDurationMs =
      started != null ? Math.max(0, Math.round(Date.now() - started)) : undefined;
    const pipelineStarted = performance.now();
    this.error.set(null);
    this.busy.set(true);
    this.pipeline
      .runAnalysisAndSuggestions(
        text,
        draftDurationMs !== undefined ? { draftDurationMs } : {},
      )
      .pipe(finalize(() => this.busy.set(false)))
      .subscribe({
        next: ({ analysis, suggestions }) => {
          this.state.set({ analysis, suggestions });
          this.markAnalysisDraftWindowStart();
          this.telemetry.emit('pipeline_analyze_complete', {
            durationMs: Math.round(performance.now() - pipelineStarted),
            draftDurationMs: draftDurationMs ?? null,
            advanced: this.advanced(),
            aiLang: this.aiLocale.aiLang(),
          });
        },
        error: (e) => {
          this.error.set(String(e?.message ?? e));
          this.telemetry.emit('pipeline_analyze_failed', {
            durationMs: Math.round(performance.now() - pipelineStarted),
            draftDurationMs: draftDurationMs ?? null,
            advanced: this.advanced(),
            aiLang: this.aiLocale.aiLang(),
          });
        },
      });
  }

  protected improve(): void {
    const text = this.promptText().trim();
    if (!text) {
      return;
    }
    const pipelineStarted = performance.now();
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
          this.telemetry.emit('pipeline_improve_complete', {
            durationMs: Math.round(performance.now() - pipelineStarted),
            advanced: this.advanced(),
            aiLang: this.aiLocale.aiLang(),
          });
        },
        error: (e) => {
          this.error.set(String(e?.message ?? e));
          this.telemetry.emit('pipeline_improve_failed', {
            durationMs: Math.round(performance.now() - pipelineStarted),
            advanced: this.advanced(),
            aiLang: this.aiLocale.aiLang(),
          });
        },
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
    this.markAnalysisDraftWindowStart();
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
    try {
      await this.history.putSession(session);
      this.telemetry.emit('history_save_complete', {
        versionOrdinal: version.ordinal,
        totalVersions: session.versions.length,
      });
    } catch (err) {
      this.telemetry.emit('history_save_failed', {
        versionOrdinal: version.ordinal,
      });
      this.error.set(String((err as Error)?.message ?? err));
    }
  }
}
