export type TemplateId = 'coding' | 'marketing' | 'fitness' | 'general';

export interface PromptTemplate {
  id: TemplateId;
  titleKey: string;
  body: string;
}

/** UI titles use i18n keys templates.cat.* */
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'coding',
    titleKey: 'templates.coding',
    body: `You are a senior software engineer. Help me with:

Context:
Goal:
Constraints (language, stack, style):
Expected output format (code blocks, steps, etc.):`,
  },
  {
    id: 'marketing',
    titleKey: 'templates.marketing',
    body: `Act as a marketing strategist. Create content with:

Product/service:
Audience:
Tone:
Channel (email, social, landing):
CTA:`,
  },
  {
    id: 'fitness',
    titleKey: 'templates.fitness',
    body: `You are a certified trainer. Design a plan with:

Current level:
Goals:
Equipment available:
Time per session:
Limitations/injuries:`,
  },
  {
    id: 'general',
    titleKey: 'templates.general',
    body: `Task:
Background context:
What I need from you:
Format of the answer:`,
  },
];
