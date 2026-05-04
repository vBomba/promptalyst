import { Routes } from '@angular/router';

import { ShellLayoutComponent } from './layout/shell-layout.component';
import { appTitleResolve, navLinksResolve } from './layout/shell-route.resolvers';
import { Analyzer } from './pages/analyzer/analyzer';
import { HistoryDetail } from './pages/history-detail/history-detail';
import { HistoryList } from './pages/history-list/history-list';
import { Templates } from './pages/templates/templates';

export const routes: Routes = [
  {
    path: '',
    component: ShellLayoutComponent,
    resolve: {
      appTitle: appTitleResolve,
      navLinks: navLinksResolve,
    },
    runGuardsAndResolvers: 'always',
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'analyzer' },
      { path: 'analyzer', component: Analyzer, data: { animation: 'analyzer' } },
      { path: 'history', component: HistoryList, data: { animation: 'history' } },
      { path: 'history/:id', component: HistoryDetail, data: { animation: 'history-detail' } },
      { path: 'templates', component: Templates, data: { animation: 'templates' } },
      { path: '**', redirectTo: 'analyzer' },
    ],
  },
];
