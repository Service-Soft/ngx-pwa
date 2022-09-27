/* eslint-disable jsdoc/require-jsdoc */
import { PUSH_SUBSCRIPTIONS } from './in-memory-db';
import { Request, Response } from 'express';
import { PushSubscription } from 'web-push';

export function addPushSubscription(req: Request, res: Response): void {
    console.log('received req', req);
    PUSH_SUBSCRIPTIONS.push(req.body as unknown as PushSubscription);
    res.status(200).json({ message: 'Subscription added successfully.' });
}