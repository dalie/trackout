import { Route } from '@angular/router';

export const appRoutes: Route[] = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/home/home.component').then((m) => m.HomeComponent),
    title: 'Trackout',
  },
  {
    path: 'play',
    loadComponent: () =>
      import('./pages/play/play.component').then((m) => m.PlayComponent),
  },
];
