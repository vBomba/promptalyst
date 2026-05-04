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
  'settings.language': {
    en: 'Language',
    uk: 'Мова',
    pl: 'Język',
  },
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
  'templates.add': { en: 'Add template', uk: 'Додати шаблон', pl: 'Dodaj szablon' },
  'templates.delete': { en: 'Delete', uk: 'Видалити', pl: 'Usuń' },
  'templates.cardTitle': { en: 'Template', uk: 'Шаблон', pl: 'Szablon' },
  'templates.deleteConfirm': {
    en: 'Delete this template?',
    uk: 'Видалити цей шаблон?',
    pl: 'Usunąć ten szablon?',
  },
  'templates.resetConfirm': {
    en: 'Reset all templates to defaults? Custom templates will be removed.',
    uk: 'Скинути всі шаблони до типових? Власні шаблони буде втрачено.',
    pl: 'Przywrócić domyślne szablony? Własne szablony znikną.',
  },
  'templates.use': { en: 'Use template', uk: 'Використати', pl: 'Użyj' },
  'templates.hint': {
    en: 'Stored in this browser. Add, edit, or delete templates; title and body follow the header language.',
    uk: 'Зберігаються в браузері. Додавайте, редагуйте й видаляйте шаблони; назва й текст залежать від мови в шапці.',
    pl: 'Zapisane w przeglądarce. Dodawaj, edytuj i usuwaj szablony; tytuł i treść zależą od języka w nagłówku.',
  },
  'templates.langHint': {
    en: 'The header language applies to the UI, templates, and AI responses.',
    uk: 'Мова в шапці задає інтерфейс, шаблони та відповіді моделі.',
    pl: 'Język w nagłówku ustawia interfejs, szablony i odpowiedzi modelu.',
  },
  'templates.editTitle': { en: 'Title', uk: 'Назва', pl: 'Tytuł' },
  'templates.editBody': { en: 'Template text', uk: 'Текст шаблону', pl: 'Treść szablonu' },
  'templates.reset': { en: 'Reset all to defaults', uk: 'Скинути до типових', pl: 'Przywróć domyślne' },
  'templates.openAnalyzer': { en: 'Open in analyzer', uk: 'Відкрити в аналізаторі', pl: 'Otwórz w analizatorze' },
  'analyzer.pickTemplate': { en: 'Template', uk: 'Шаблон', pl: 'Szablon' },
  'analyzer.templateCustom': { en: 'Custom', uk: 'Власний', pl: 'Własny' },
  'analyzer.newPrompt': { en: 'New prompt', uk: 'Новий промпт', pl: 'Nowy prompt' },
  'analyzer.applyImproved': {
    en: 'Use as editor text',
    uk: 'Підставити в редактор',
    pl: 'Wstaw do edytora',
  },
  'analyzer.criterion.clarity': { en: 'Clarity', uk: 'Зрозумілість', pl: 'Jasność' },
  'analyzer.criterion.context': { en: 'Context', uk: 'Контекст', pl: 'Kontekst' },
  'analyzer.criterion.specificity': {
    en: 'Specificity',
    uk: 'Конкретність',
    pl: 'Konkretność',
  },
  'analyzer.criterion.constraints': {
    en: 'Constraints',
    uk: 'Обмеження',
    pl: 'Ograniczenia',
  },
  'analyzer.criterion.outputFormat': {
    en: 'Output format',
    uk: 'Формат виводу',
    pl: 'Format wyjścia',
  },
};

export function t(key: string, lang: AppLang): string {
  const row = STRINGS[key];
  return row ? row[lang] : key;
}
