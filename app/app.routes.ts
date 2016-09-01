import { provideRouter, RouterConfig, ROUTER_DIRECTIVES } from '@angular/router';

import { WelcomeComponent } from './home/index.component';
import { NotFoundComponent } from './msg/404.component';

export const routes: RouterConfig = [
  { path: '', component: WelcomeComponent },
  { path: '404', component: NotFoundComponent },
  { path: '**', redirectTo: '/404' }
];

export const APP_ROUTER_PROVIDERS = [
  provideRouter(routes)
];
