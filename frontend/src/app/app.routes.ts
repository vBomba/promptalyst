import { Routes } from '@angular/router';

import { Analyzer } from './pages/analyzer/analyzer';
import { HistoryDetail } from './pages/history-detail/history-detail';
import { HistoryList } from './pages/history-list/history-list';
import { Templates } from './pages/templates/templates';

export const routes: Routes = [
  { path: '', component: Analyzer },
  { path: 'history', component: HistoryList },
  { path: 'history/:id', component: HistoryDetail },
  { path: 'templates', component: Templates },
  { path: '**', redirectTo: '' },
];
