/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @cspell/spellchecker */
import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Application } from 'express';
import * as webpush from 'web-push';
import { addPushSubscription } from './add-push-subscriber.route';
import { PUSH_SUBSCRIPTIONS } from './in-memory-db';
import { SECRETS } from './secrets';
import { sendNotification } from './send-notification.route';

webpush.setVapidDetails(
    `mailto:${SECRETS.email}`,
    SECRETS.publicKey,
    SECRETS.privateKey
);

const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());

app.post('/enable-notifications', (req, res) => addPushSubscription(req, res));

app.post('/send-notification', (req, res) => sendNotification(req, res));

app.get('/subscriptions', (req, res) => res.json(PUSH_SUBSCRIPTIONS));

app.listen(3000, () => {
    console.log('HTTP Server running at http://localhost:3000');
});