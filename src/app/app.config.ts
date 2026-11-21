
import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';

import {
  provideRouter,
  withHashLocation,
  withInMemoryScrolling,
  withViewTransitions,
} from '@angular/router';

import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import {
  provideTranslateService,
} from '@ngx-translate/core';

import {
  provideTranslateHttpLoader,
} from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { authInterceptor } from './core/intercpters/auth-interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),

    provideRouter(
      routes,
      withHashLocation(),
      withInMemoryScrolling({
        scrollPositionRestoration: 'top',
      }),
      withViewTransitions()
    ),

    provideHttpClient(
      withFetch(),
      withInterceptors([authInterceptor])
    ),

    provideTranslateService({
      loader: provideTranslateHttpLoader({
        prefix: '/i18n/',
        suffix: '.json',
      }),
      fallbackLang: 'en',
      lang: 'en',
    }),
  ],
};
