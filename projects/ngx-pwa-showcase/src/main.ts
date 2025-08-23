import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';
import { enableProdMode } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideServiceWorker } from '@angular/service-worker';
import { NavRoute } from 'ngx-material-navigation';
import { NGX_PWA_OFFLINE_SERVICE, OfflineRequestInterceptor } from 'ngx-pwa';

import { AppComponent } from './app/app.component';
import { OfflineService } from './app/services/offline.service';
import { environment } from './environments/environment';

const routes: NavRoute[] = [
    {
        title: 'Home',
        path: '',
        // eslint-disable-next-line promise/prefer-await-to-then
        loadComponent: () => import('./app/pages/home/home.component').then(m => m.HomeComponent)
    }
];

if (environment.production) {
    enableProdMode();
}

bootstrapApplication(
    AppComponent,
    {
        providers: [
            provideRouter(routes),
            provideHttpClient(withInterceptorsFromDi()),
            provideServiceWorker(
                'ngsw-worker.js',
                {
                    enabled: environment.production,
                    registrationStrategy: 'registerWhenStable:30000'
                }
            ),
            {
                provide: NGX_PWA_OFFLINE_SERVICE,
                useExisting: OfflineService
            },
            {
                provide: HTTP_INTERCEPTORS,
                useClass: OfflineRequestInterceptor,
                multi: true
            }
        ]
    }
// eslint-disable-next-line promise/prefer-await-to-callbacks, no-console
).catch(error => console.error(error));