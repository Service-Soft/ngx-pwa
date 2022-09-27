/* eslint-disable jsdoc/require-jsdoc */
import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { SwPush } from '@angular/service-worker';
import { NgxPwaNotificationService } from 'ngx-pwa';
import { environment } from '../../environments/environment';
import { SECRETS } from './secrets';

@Injectable({providedIn: 'root'})
export class NotificationService extends NgxPwaNotificationService {

    readonly API_ENABLE_NOTIFICATIONS_URL: string = `${environment.apiUrl}/enable-notifications`;

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
    readonly VAPID_PUBLIC_KEY: string = SECRETS.publicKey;

    constructor(private readonly push: SwPush, private readonly httpClient: HttpClient) {
        super(push, httpClient);
    }
}