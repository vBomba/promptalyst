import { inject, Injectable } from '@angular/core';
import { map, Observable, switchMap } from 'rxjs';

import { AiLocaleService } from './ai-locale.service';
import { OpenAiService } from './openai.service';
import { PromptAnalysisResult, PromptPipelineState } from './prompt.types';

@Injectable({
  providedIn: 'root',
})
export class PromptPipelineService {
  private readonly openAi = inject(OpenAiService);
  private readonly aiLocale = inject(AiLocaleService);

  runAnalysis(promptText: string): Observable<PromptAnalysisResult> {
    const lang = this.aiLocale.aiLang();
    return this.openAi.chatJson<PromptAnalysisResult>(
      [
        { role: 'system', content: systemAnalysis(lang) },
        { role: 'user', content: `Prompt to analyze:\n"""${promptText}"""` },
      ],
      { temperature: 0.25 },
    );
  }

  runSuggestions(promptText: string, analysis: PromptAnalysisResult): Observable<string[]> {
    const lang = this.aiLocale.aiLang();
    return this.openAi
      .chatJson<{ suggestions: string[] }>(
        [
          { role: 'system', content: systemSuggestions(lang) },
          {
            role: 'user',
            content: `Prompt:\n"""${promptText}"""\n\nAnalysis JSON:\n${JSON.stringify(analysis)}`,
          },
        ],
        { temperature: 0.4 },
      )
      .pipe(map((o) => o.suggestions ?? []));
  }

  runImprove(
    promptText: string,
    advanced: boolean,
  ): Observable<{ improved: string; explain?: string }> {
    const lang = this.aiLocale.aiLang();
    return this.openAi.chatJson<{ improved: string; explain?: string }>(
      [
        { role: 'system', content: systemImprove(lang, advanced) },
        { role: 'user', content: `Rewrite this prompt:\n"""${promptText}"""` },
      ],
      { temperature: 0.45 },
    );
  }

  runFullPipeline(promptText: string, advanced: boolean): Observable<PromptPipelineState> {
    return this.runAnalysis(promptText).pipe(
      switchMap((analysis) =>
        this.runSuggestions(promptText, analysis).pipe(
          switchMap((suggestions) =>
            this.runImprove(promptText, advanced).pipe(
              map(({ improved, explain }) => ({
                analysis,
                suggestions,
                improvedText: improved,
                explainChanges: advanced ? explain : undefined,
              })),
            ),
          ),
        ),
      ),
    );
  }
}

function langName(l: string): string {
  if (l === 'uk') {
    return 'Ukrainian';
  }
  if (l === 'pl') {
    return 'Polish';
  }
  return 'English';
}

function systemAnalysis(lang: string): string {
  return `You are an expert prompt engineer. Analyze the user's prompt.
Return ONLY valid JSON with this shape:
{"overallScore": number from 1-10, "criteria": {"clarity":0-10,"context":0-10,"specificity":0-10,"constraints":0-10,"outputFormat":0-10}}
Scores are normalized 0-10 per criterion. Be consistent.
All human-readable strings in the JSON (if any) must be in ${langName(lang)}.`;
}

function systemSuggestions(lang: string): string {
  return `You are an expert prompt engineer. Given a prompt and its analysis JSON, list concrete edits.
Return ONLY valid JSON: {"suggestions": string[]} — each item: what to add, remove, or clarify.
Write suggestion strings in ${langName(lang)}.`;
}

function systemImprove(lang: string, advanced: boolean): string {
  const explain = advanced
    ? 'Include "explain" with a short explanation of changes in ' + langName(lang) + '.'
    : 'Omit "explain" or set it to empty string.';
  return `You are an expert prompt engineer. Rewrite the prompt for better LLM results. Preserve user intent.
Return ONLY valid JSON: {"improved": string, "explain": string}
${explain}
The improved prompt can stay in the user's language; "explain" must be in ${langName(lang)}.`;
}
