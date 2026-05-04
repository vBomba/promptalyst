import { SlicePipe } from '@angular/common';
import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { map } from 'rxjs';
import { type VbSelectOption, VbSelectComponent } from 'vbomba-ui';

import { HistoryStorageService, PromptSessionStored, PromptVersionStored } from '../../core/history-storage.service';
import { LocPipe } from '../../core/loc.pipe';
import { LocaleService } from '../../core/locale.service';

@Component({
  selector: 'app-history-detail',
  imports: [RouterLink, MatCardModule, SlicePipe, VbSelectComponent, LocPipe],
  templateUrl: './history-detail.html',
  styleUrl: './history-detail.scss',
})
export class HistoryDetail implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly history = inject(HistoryStorageService);
  protected readonly locale = inject(LocaleService);

  private readonly id = toSignal(this.route.paramMap.pipe(map((p) => p.get('id'))), {
    initialValue: null,
  });

  protected readonly session = signal<PromptSessionStored | null>(null);
  /** Indices into `versions` array */
  protected readonly compareA = signal(0);
  protected readonly compareB = signal(0);

  protected readonly diffLines = computed(() => {
    const s = this.session();
    const i = this.compareA();
    const j = this.compareB();
    if (!s || i === j) {
      return null;
    }
    const va = s.versions[i];
    const vb = s.versions[j];
    if (!va || !vb) {
      return null;
    }
    return { left: va.text, right: vb.text, leftIdx: i, rightIdx: j };
  });

  protected readonly versionOptions = computed((): VbSelectOption[] => {
    const s = this.session();
    if (!s) {
      return [];
    }
    const lang = this.locale.uiLang();
    return s.versions.map((v, i) => ({
      value: String(i),
      label: `v${v.ordinal + 1} · ${new Date(v.createdAt).toLocaleString(lang)}`,
    }));
  });

  async ngOnInit(): Promise<void> {
    const id = this.id();
    if (!id) {
      return;
    }
    const sess = await this.history.getSession(id);
    this.session.set(sess ?? null);
    if (sess && sess.versions.length > 1) {
      this.compareA.set(0);
      this.compareB.set(sess.versions.length - 1);
    }
  }

}
