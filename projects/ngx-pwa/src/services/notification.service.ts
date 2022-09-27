import { HttpClient } from '@angular/common/http';
import { SwPush } from '@angular/service-worker';
import { firstValueFrom } from 'rxjs';

/**
 * A base service that provides functionality regarding notifications.
 */
export abstract class NgxPwaNotificationService {

    /**
     * The url to send a new push subscription to.
     */
    abstract readonly API_ENABLE_NOTIFICATIONS_URL: string;

    /**
     * The public key of your VAPID key pair.
     * Is needed to receive and display push notifications.
     */
    abstract readonly VAPID_PUBLIC_KEY: string;

    constructor(private readonly swPush: SwPush, private readonly http: HttpClient) {}

    /**
     * Asks the user for permission to use push notifications.
     */
    askForNotificationPermission(): void {
        void this.swPush.requestSubscription({ serverPublicKey: this.VAPID_PUBLIC_KEY })
            .then(pushSubscription => this.enableNotifications(pushSubscription))
            .catch();
    }

    /**
     * Enables notifications by sending a push subscription to the server.
     *
     * @param pushSubscription - The push subscription to send to the server.
     */
    protected async enableNotifications(pushSubscription: PushSubscription): Promise<void> {
        await firstValueFrom(this.http.post(this.API_ENABLE_NOTIFICATIONS_URL, pushSubscription));
    }
}