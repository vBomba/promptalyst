export interface AnalysisCriteria {
  clarity: number;
  context: number;
  specificity: number;
  constraints: number;
  outputFormat: number;
}

export interface PromptAnalysisResult {
  overallScore: number;
  criteria: AnalysisCriteria;
}

export interface PromptPipelineState {
  analysis?: PromptAnalysisResult;
  suggestions?: string[];
  improvedText?: string;
  explainChanges?: string;
}
