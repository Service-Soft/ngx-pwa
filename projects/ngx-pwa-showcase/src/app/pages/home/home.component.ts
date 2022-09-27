/* eslint-disable jsdoc/require-jsdoc */
import { HttpContext, HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { NGX_PWA_HTTP_CONTEXT_METADATA, NgxPwaVersionReadyDialogComponent } from 'ngx-pwa';
import { firstValueFrom } from 'rxjs';
import { NotificationService } from '../../services/notification.service';
import { OfflineService } from '../../services/offline.service';
import { UpdateService } from '../../services/update.service';

@Component({
    selector: 'app-home',
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.scss']
})
export class HomeComponent {
    context: HttpContext = new HttpContext().set(NGX_PWA_HTTP_CONTEXT_METADATA, { type: 'testType' });

    constructor(
        readonly offlineService: OfflineService,
        private readonly http: HttpClient,
        readonly notificationService: NotificationService,
        readonly updateService: UpdateService,
        private readonly dialog: MatDialog
    ) { }

    sendPostRequest(): void {
        void firstValueFrom(this.http.post('http://localhost:3000/post', { }, { context: this.context }));
    }

    sendPatchRequest(): void {
        void firstValueFrom(this.http.patch('http://localhost:3000/update', { }, { context: this.context }));
    }

    sendDeleteRequest(): void {
        void firstValueFrom(this.http.delete('http://localhost:3000/delete', { context: this.context }));
    }

    sendPushNotification(): void {
        void firstValueFrom(this.http.post('http://localhost:3000/send-notification', { }));
    }

    openVersionReadyDialog(): void {
        this.dialog.open(NgxPwaVersionReadyDialogComponent, { autoFocus: false, restoreFocus: false });
    }
}