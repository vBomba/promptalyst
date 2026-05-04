import { Injectable, signal } from '@angular/core';

import { AppLang } from './locale.service';
import {
  DEFAULT_LOCALIZED_TEMPLATES,
  LocalizedTemplate,
  TemplateId,
} from './templates.data';

const STORAGE_V2 = 'promptalyst-templates-v2';
const STORAGE_V1 = 'promptalyst-templates-v1';

const PRESET_IDS = new Set(DEFAULT_LOCALIZED_TEMPLATES.map((t) => t.id));

function emptyTitles(): Record<AppLang, string> {
  return { en: '', uk: '', pl: '' };
}

function cloneDefaults(): LocalizedTemplate[] {
  return DEFAULT_LOCALIZED_TEMPLATES.map((t) => ({
    id: t.id,
    titles: { ...t.titles },
    bodies: { ...t.bodies },
  }));
}

/** Migrate v1 (fixed 4 + merge) → full list for v2. */
function migrateFromV1(parsed: unknown): LocalizedTemplate[] {
  const defaults = cloneDefaults();
  if (!Array.isArray(parsed)) {
    return defaults;
  }
  const merged = defaults.map((def) => {
    const row = parsed.find((r: { id?: string }) => r?.id === def.id) as
      | Partial<LocalizedTemplate>
      | undefined;
    if (!row?.titles || !row?.bodies) {
      return def;
    }
    return {
      id: def.id,
      titles: { ...def.titles, ...row.titles },
      bodies: { ...def.bodies, ...row.bodies },
    };
  });
  const extras = parsed.filter(
    (r: { id?: string }) =>
      typeof r?.id === 'string' && r.id.length > 0 && !PRESET_IDS.has(r.id),
  ) as LocalizedTemplate[];
  const normalizedExtras = extras.map((row) => ({
    id: row.id,
    titles: { ...emptyTitles(), ...row.titles },
    bodies: { ...emptyTitles(), ...row.bodies },
  }));
  return [...merged, ...normalizedExtras];
}

function isValidTemplateRow(x: unknown): x is LocalizedTemplate {
  if (!x || typeof x !== 'object') {
    return false;
  }
  const o = x as Record<string, unknown>;
  if (typeof o['id'] !== 'string' || !o['titles'] || typeof o['titles'] !== 'object') {
    return false;
  }
  if (!o['bodies'] || typeof o['bodies'] !== 'object') {
    return false;
  }
  return true;
}

function normalizeRow(r: LocalizedTemplate): LocalizedTemplate {
  return {
    id: r.id,
    titles: { ...emptyTitles(), ...r.titles },
    bodies: { ...emptyTitles(), ...r.bodies },
  };
}

function readFromStorage(): LocalizedTemplate[] {
  try {
    const v2 = localStorage.getItem(STORAGE_V2);
    if (v2) {
      const parsed = JSON.parse(v2) as unknown;
      if (Array.isArray(parsed) && parsed.every(isValidTemplateRow)) {
        return (parsed as LocalizedTemplate[]).map(normalizeRow);
      }
    }
    const v1 = localStorage.getItem(STORAGE_V1);
    if (v1) {
      const migrated = migrateFromV1(JSON.parse(v1) as unknown);
      localStorage.setItem(STORAGE_V2, JSON.stringify(migrated));
      localStorage.removeItem(STORAGE_V1);
      return migrated;
    }
  } catch {
    /* fall through */
  }
  return cloneDefaults();
}

@Injectable({
  providedIn: 'root',
})
export class TemplateStoreService {
  readonly list = signal<LocalizedTemplate[]>(readFromStorage());

  constructor() {
    this.persist();
  }

  getTitle(id: TemplateId, lang: AppLang): string {
    const raw = this.list().find((t) => t.id === id)?.titles[lang]?.trim();
    return raw ? raw : id;
  }

  getBody(id: TemplateId, lang: AppLang): string {
    return this.list().find((t) => t.id === id)?.bodies[lang] ?? '';
  }

  updateTitle(id: TemplateId, lang: AppLang, title: string): void {
    this.list.update((arr) =>
      arr.map((t) =>
        t.id === id ? { ...t, titles: { ...t.titles, [lang]: title } } : t,
      ),
    );
    this.persist();
  }

  updateBody(id: TemplateId, lang: AppLang, body: string): void {
    this.list.update((arr) =>
      arr.map((t) =>
        t.id === id ? { ...t, bodies: { ...t.bodies, [lang]: body } } : t,
      ),
    );
    this.persist();
  }

  addTemplate(): TemplateId {
    const id = `t-${crypto.randomUUID()}`;
    const row: LocalizedTemplate = {
      id,
      titles: {
        en: 'New template',
        uk: 'Новий шаблон',
        pl: 'Nowy szablon',
      },
      bodies: emptyTitles(),
    };
    this.list.update((arr) => [...arr, row]);
    this.persist();
    return id;
  }

  removeTemplate(id: TemplateId): void {
    this.list.update((arr) => arr.filter((t) => t.id !== id));
    this.persist();
  }

  resetToDefaults(): void {
    this.list.set(cloneDefaults());
    this.persist();
  }

  private persist(): void {
    try {
      localStorage.setItem(STORAGE_V2, JSON.stringify(this.list()));
    } catch {
      /* quota */
    }
  }
}
