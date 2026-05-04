/** Shared API contracts between Angular and Nest (no runtime imports required). */

export type AiChatRole = 'system' | 'user' | 'assistant';

export interface AiChatMessage {
  role: AiChatRole;
  content: string;
}

/** Client → Nest: structured UI / product events (no prompt text). */
export interface TelemetryClientEventDto {
  event: string;
  properties?: Record<string, unknown>;
  path?: string;
}

export interface AnalysisCriteriaDto {
  clarity: number;
  context: number;
  specificity: number;
  constraints: number;
  outputFormat: number;
}

export interface PromptAnalysisResultDto {
  overallScore: number;
  criteria: AnalysisCriteriaDto;
}

export interface AnalyzeSuggestRequestDto {
  promptText: string;
  aiLang: 'en' | 'uk' | 'pl';
  draftDurationMs?: number;
}

export interface AnalyzeSuggestResponseDto {
  analysis: PromptAnalysisResultDto;
  suggestions: string[];
}

export interface PromptVersionStoredDto {
  id: string;
  ordinal: number;
  text: string;
  analysis?: PromptAnalysisResultDto;
  suggestions?: string[];
  improvedText?: string;
  explainChanges?: string;
  createdAt: number;
  parentId?: string;
}

export interface PromptSessionStoredDto {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  versions: PromptVersionStoredDto[];
}
