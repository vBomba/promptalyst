import { AppLang } from './locale.service';

type Dict = Record<AppLang, string>;

const STRINGS: Record<string, Dict> = {
  'app.title': {
    en: 'Promptalyst',
    uk: 'Promptalyst',
    pl: 'Promptalyst',
  },
  'nav.analyzer': { en: 'Analyzer', uk: 'Аналізатор', pl: 'Analizator' },
  'nav.history': { en: 'History', uk: 'Історія', pl: 'Historia' },
  'nav.templates': { en: 'Templates', uk: 'Шаблони', pl: 'Szablony' },
  'nav.theme': { en: 'Toggle theme', uk: 'Змінити тему', pl: 'Przełącz motyw' },
  'settings.uiLang': { en: 'Interface language', uk: 'Мова інтерфейсу', pl: 'Język interfejsu' },
  'settings.aiLang': { en: 'AI response language', uk: 'Мова відповіді AI', pl: 'Język odpowiedzi AI' },
  'analyzer.title': { en: 'Prompt', uk: 'Промпт', pl: 'Prompt' },
  'analyzer.placeholder': {
    en: 'Paste or write your prompt…',
    uk: 'Вставте або напишіть промпт…',
    pl: 'Wklej lub napisz prompt…',
  },
  'analyzer.analyze': { en: 'Analyze', uk: 'Аналізувати', pl: 'Analizuj' },
  'analyzer.improve': { en: 'Improve', uk: 'Покращити', pl: 'Ulepsz' },
  'analyzer.modeSimple': { en: 'Simple', uk: 'Простий', pl: 'Prosty' },
  'analyzer.modeAdvanced': { en: 'Advanced', uk: 'Розширений', pl: 'Zaawansowany' },
  'analyzer.score': { en: 'Score', uk: 'Оцінка', pl: 'Ocena' },
  'analyzer.suggestions': { en: 'Suggestions', uk: 'Рекомендації', pl: 'Sugestie' },
  'analyzer.improved': { en: 'Improved prompt', uk: 'Покращений промпт', pl: 'Ulepszony prompt' },
  'analyzer.explain': { en: 'What changed', uk: 'Що змінилось', pl: 'Co się zmieniło' },
  'analyzer.working': { en: 'Calling model…', uk: 'Запит до моделі…', pl: 'Wywołanie modelu…' },
  'analyzer.error': { en: 'Request failed', uk: 'Помилка запиту', pl: 'Żądanie nie powiodło się' },
  'analyzer.saveHistory': { en: 'Save to history', uk: 'Зберегти в історію', pl: 'Zapisz w historii' },
  'history.title': { en: 'Sessions', uk: 'Сесії', pl: 'Sesje' },
  'history.empty': { en: 'No saved sessions yet.', uk: 'Ще немає збережених сесій.', pl: 'Brak zapisanych sesji.' },
  'history.open': { en: 'Open', uk: 'Відкрити', pl: 'Otwórz' },
  'history.delete': { en: 'Delete', uk: 'Видалити', pl: 'Usuń' },
  'history.versions': { en: 'Versions', uk: 'Версії', pl: 'Wersje' },
  'history.compare': { en: 'Compare', uk: 'Порівняти', pl: 'Porównaj' },
  'templates.title': { en: 'Templates', uk: 'Шаблони', pl: 'Szablony' },
  'templates.use': { en: 'Use template', uk: 'Використати', pl: 'Użyj' },
  'templates.hint': {
    en: 'Inserts starter text into the analyzer.',
    uk: 'Підставляє стартовий текст у аналізатор.',
    pl: 'Wstawia tekst startowy do analizatora.',
  },
  'templates.coding': { en: 'Coding', uk: 'Код', pl: 'Kod' },
  'templates.marketing': { en: 'Marketing', uk: 'Маркетинг', pl: 'Marketing' },
  'templates.fitness': { en: 'Fitness', uk: 'Фітнес', pl: 'Fitness' },
  'templates.general': { en: 'General tasks', uk: 'Загальні задачі', pl: 'Ogólne' },
  'analyzer.newPrompt': { en: 'New prompt', uk: 'Новий промпт', pl: 'Nowy prompt' },
  'analyzer.applyImproved': {
    en: 'Use as editor text',
    uk: 'Підставити в редактор',
    pl: 'Wstaw do edytora',
  },
};

export function t(key: string, lang: AppLang): string {
  const row = STRINGS[key];
  return row ? row[lang] : key;
}
