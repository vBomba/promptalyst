import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { VbButtonComponent } from 'vbomba-ui';

import { HistoryStorageService, PromptSessionStored } from '../../core/history-storage.service';
import { t } from '../../core/i18n';
import { LocaleService } from '../../core/locale.service';

@Component({
  selector: 'app-history-list',
  imports: [RouterLink, MatCardModule, VbButtonComponent],
  templateUrl: './history-list.html',
  styleUrl: './history-list.scss',
})
export class HistoryList implements OnInit {
  private readonly history = inject(HistoryStorageService);
  private readonly locale = inject(LocaleService);
  private readonly router = inject(Router);

  protected readonly sessions = signal<PromptSessionStored[]>([]);

  async ngOnInit(): Promise<void> {
    await this.reload();
  }

  protected t(key: string): string {
    return t(key, this.locale.uiLang());
  }

  protected async reload(): Promise<void> {
    this.sessions.set(await this.history.listSessions());
  }

  protected async remove(id: string, event: Event): Promise<void> {
    event.preventDefault();
    event.stopPropagation();
    await this.history.deleteSession(id);
    await this.reload();
  }

  protected openSession(id: string): void {
    void this.router.navigate(['/history', id]);
  }

  protected formatDate(ts: number): string {
    return new Date(ts).toLocaleString(this.locale.uiLang());
  }
}
