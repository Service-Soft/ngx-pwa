
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { NgxPwaNotificationService } from 'ngx-pwa';

import { SECRETS } from './secrets';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class NotificationService extends NgxPwaNotificationService {

    readonly API_ENABLE_NOTIFICATIONS_URL: string = `${environment.apiUrl}/enable-notifications`;

    readonly API_DISABLE_NOTIFICATIONS_URL: string = `${environment.apiUrl}/disable-notifications`;

    readonly VAPID_PUBLIC_KEY: string = SECRETS.publicKey;

    constructor(swPush: SwPush, http: HttpClient) {
        super(swPush, http);
    }
}