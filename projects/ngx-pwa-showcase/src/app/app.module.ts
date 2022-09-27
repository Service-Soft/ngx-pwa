import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ServiceWorkerModule } from '@angular/service-worker';
import { environment } from '../environments/environment';
import { NgxPwaOfflineStatusBarModule, OfflineRequestInterceptor, NGX_PWA_OFFLINE_SERVICE } from 'ngx-pwa';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { NgxMatNavigationFooterModule, NgxMatNavigationNavbarModule } from 'ngx-material-navigation';
import { OfflineService } from './services/offline.service';

@NgModule({
    declarations: [
        AppComponent
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        // eslint-disable-next-line @cspell/spellchecker
        ServiceWorkerModule.register('ngsw-worker.js', {
            enabled: environment.production,
            registrationStrategy: 'registerWhenStable:30000'
        }),
        HttpClientModule,
        NgxMatNavigationNavbarModule,
        NgxMatNavigationFooterModule,
        NgxPwaOfflineStatusBarModule,
        MatSnackBarModule
    ],
    providers: [
        {
            provide: NGX_PWA_OFFLINE_SERVICE,
            useExisting: OfflineService
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: OfflineRequestInterceptor,
            multi: true
        }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }