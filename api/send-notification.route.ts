/* eslint-disable no-console */
/* eslint-disable jsdoc/require-jsdoc */
/* eslint-disable @cspell/spellchecker */
import { Request, Response } from 'express';
import * as webpush from 'web-push';
import { PUSH_SUBSCRIPTIONS } from './in-memory-db';

export function sendNotification(req: Request, res: Response): void {
    // sample notification payload
    const notificationPayload = {
        notification: {
            title: 'Example Notification',
            body: 'This notification is testing the ngx-pwa library.',
            vibrate: [100, 50, 100],
            data: {
                'dateOfArrival': Date.now(),
                'primaryKey': 1
            },
            actions: [{
                action: 'explore',
                title: 'Go to the site'
            }]
        }
    };

    Promise.all(PUSH_SUBSCRIPTIONS.map(sub => webpush.sendNotification(sub, JSON.stringify(notificationPayload))))
        .then(() => res.status(200).json({ message: 'Notification sent successfully.' }))
        .catch(err => {
            console.error('Error sending notification, reason: ', err);
            res.sendStatus(500);
        });
}