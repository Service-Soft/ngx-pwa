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
     * The url to send a request to when wanting to disable notifications.
     */
    abstract readonly API_DISABLE_NOTIFICATIONS_URL: string;

    /**
     * The public key of your VAPID key pair.
     * Is needed to receive and display push notifications.
     */
    abstract readonly VAPID_PUBLIC_KEY: string;

    // eslint-disable-next-line jsdoc/require-returns
    /**
     * Whether or not the current user has notifications enabled.
     */
    get hasNotificationsEnabled(): boolean {
        return this.swPush.isEnabled;
    }

    constructor(private readonly swPush: SwPush, private readonly http: HttpClient) {}

    /**
     * Asks the user for permission to use push notifications.
     */
    async askForNotificationPermission(): Promise<void> {
        const pushSubscription = await this.swPush.requestSubscription({ serverPublicKey: this.VAPID_PUBLIC_KEY });
        void this.enableNotifications(pushSubscription);
    }

    /**
     * Enables notifications by sending a push subscription to the server.
     *
     * @param pushSubscription - The push subscription to send to the server.
     */
    protected async enableNotifications(pushSubscription: PushSubscription): Promise<void> {
        await firstValueFrom(this.http.post(this.API_ENABLE_NOTIFICATIONS_URL, pushSubscription));
    }

    /**
     * Disables notifications.
     */
    async disableNotifications(): Promise<void> {
        const pushSubscription = await firstValueFrom(this.swPush.subscription);
        if (!pushSubscription) {
            return;
        }
        await firstValueFrom(this.http.post(this.API_DISABLE_NOTIFICATIONS_URL, pushSubscription));
        await this.swPush.unsubscribe();
    }
}