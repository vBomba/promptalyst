import { AppLang } from './locale.service';

/** Stable id string (presets or `t-` + uuid for user templates). */
export type TemplateId = string;

export type LocalizedTemplate = {
  id: TemplateId;
  titles: Record<AppLang, string>;
  bodies: Record<AppLang, string>;
};

function T(
  titles: Record<AppLang, string>,
  bodies: Record<AppLang, string>,
  id: string,
): LocalizedTemplate {
  return { id, titles, bodies };
}

/** Default library; user edits persist in localStorage via TemplateStoreService. */
export const DEFAULT_LOCALIZED_TEMPLATES: LocalizedTemplate[] = [
  T(
    {
      en: 'Coding',
      uk: 'Код',
      pl: 'Kod',
    },
    {
      en: `You are a senior software engineer. Help me with:

Context:
Goal:
Constraints (language, stack, style):
Expected output format (code blocks, steps, etc.):`,
      uk: `Ти — досвідчений інженер ПЗ. Допоможи з:

Контекст:
Мета:
Обмеження (мова, стек, стиль):
Очікуваний формат відповіді (код, кроки тощо):`,
      pl: `Jesteś starszym inżynierem oprogramowania. Pomóż mi z:

Kontekst:
Cel:
Ograniczenia (język, stack, styl):
Oczekiwany format odpowiedzi (bloki kodu, kroki itd.):`,
    },
    'coding',
  ),
  T(
    {
      en: 'Marketing',
      uk: 'Маркетинг',
      pl: 'Marketing',
    },
    {
      en: `Act as a marketing strategist. Create content with:

Product/service:
Audience:
Tone:
Channel (email, social, landing):
CTA:`,
      uk: `Виступи як маркетинговий стратег. Створи контент з:

Продукт/послуга:
Аудиторія:
Тон:
Канал (email, соцмережі, лендінг):
Заклик до дії:`,
      pl: `Wystąp jako strateg marketingowy. Przygotuj treści z:

Produkt/usługa:
Odbiorcy:
Ton:
Kanał (email, social, landing):
CTA:`,
    },
    'marketing',
  ),
  T(
    {
      en: 'Fitness',
      uk: 'Фітнес',
      pl: 'Fitness',
    },
    {
      en: `You are a certified trainer. Design a plan with:

Current level:
Goals:
Equipment available:
Time per session:
Limitations/injuries:`,
      uk: `Ти — сертифікований тренер. Склади план з:

Поточний рівень:
Цілі:
Доступне обладнання:
Час на тренування:
Обмеження/травми:`,
      pl: `Jesteś certyfikowanym trenerem. Zaplanuj z:

Poziom:
Cele:
Sprzęt:
Czas na sesję:
Ograniczenia/kontuzje:`,
    },
    'fitness',
  ),
  T(
    {
      en: 'General',
      uk: 'Загальне',
      pl: 'Ogólne',
    },
    {
      en: `Task:
Background context:
What I need from you:
Format of the answer:`,
      uk: `Завдання:
Контекст:
Що потрібно від тебе:
Формат відповіді:`,
      pl: `Zadanie:
Tło:
Czego potrzebuję:
Format odpowiedzi:`,
    },
    'general',
  ),
];
