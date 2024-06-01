/* eslint-disable no-console */
/* eslint-disable jsdoc/require-jsdoc */
import { Request, Response } from 'express';
import * as webPush from 'web-push';

import { PUSH_SUBSCRIPTIONS } from './in-memory-db';

export function sendNotification(req: Request, res: Response): void {
    // sample notification payload
    // eslint-disable-next-line typescript/typedef
    const notificationPayload = {
        notification: {
            title: 'Example Notification',
            body: 'This notification is testing the ngx-pwa library.',
            vibrate: [100, 50, 100],
            data: {
                dateOfArrival: Date.now(),
                primaryKey: 1
            },
            actions: [
                {
                    action: 'explore',
                    title: 'Go to the site'
                }
            ]
        }
    };

    Promise.all(PUSH_SUBSCRIPTIONS.map(sub => webPush.sendNotification(sub, JSON.stringify(notificationPayload))))
        // eslint-disable-next-line promise/prefer-await-to-then
        .then(() => res.status(200).json({ message: 'Notification sent successfully.' }))
        // eslint-disable-next-line promise/prefer-await-to-then, promise/prefer-await-to-callbacks
        .catch(error => {
            console.error('Error sending notification, reason: ', error);
            res.sendStatus(500);
        });
}