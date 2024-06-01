/* eslint-disable jsdoc/require-jsdoc */
import { Request, Response } from 'express';
import { PushSubscription } from 'web-push';

import { PUSH_SUBSCRIPTIONS } from './in-memory-db';

export function addPushSubscription(req: Request, res: Response): void {
    PUSH_SUBSCRIPTIONS.push(req.body as unknown as PushSubscription);
    res.status(200).json({ message: 'Subscription added successfully.' });
}