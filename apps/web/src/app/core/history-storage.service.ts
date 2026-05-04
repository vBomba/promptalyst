import { Injectable } from '@angular/core';

import { PromptAnalysisResult } from './prompt.types';

const DB_NAME = 'promptalyst-db';
const DB_VERSION = 1;
const STORE = 'sessions';

export interface PromptVersionStored {
  id: string;
  ordinal: number;
  text: string;
  analysis?: PromptAnalysisResult;
  suggestions?: string[];
  improvedText?: string;
  explainChanges?: string;
  createdAt: number;
  parentId?: string;
}

export interface PromptSessionStored {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  versions: PromptVersionStored[];
}

@Injectable({
  providedIn: 'root',
})
export class HistoryStorageService {
  private dbPromise: Promise<IDBDatabase> | null = null;

  private db(): Promise<IDBDatabase> {
    if (!this.dbPromise) {
      this.dbPromise = new Promise((resolve, reject) => {
        const req = indexedDB.open(DB_NAME, DB_VERSION);
        req.onerror = () => reject(req.error);
        req.onsuccess = () => resolve(req.result);
        req.onupgradeneeded = () => {
          const db = req.result;
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        };
      });
    }
    return this.dbPromise;
  }

  async listSessions(): Promise<PromptSessionStored[]> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const store = tx.objectStore(STORE);
      const req = store.getAll();
      req.onerror = () => reject(req.error);
      req.onsuccess = () => {
        const rows = (req.result as PromptSessionStored[]) ?? [];
        rows.sort((a, b) => b.updatedAt - a.updatedAt);
        resolve(rows);
      };
    });
  }

  async getSession(id: string): Promise<PromptSessionStored | undefined> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readonly');
      const req = tx.objectStore(STORE).get(id);
      req.onerror = () => reject(req.error);
      req.onsuccess = () => resolve(req.result as PromptSessionStored | undefined);
    });
  }

  async putSession(session: PromptSessionStored): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).put(session);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }

  async deleteSession(id: string): Promise<void> {
    const db = await this.db();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE, 'readwrite');
      tx.objectStore(STORE).delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
}
