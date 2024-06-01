import * as bodyParser from 'body-parser';
import * as cors from 'cors';
import * as express from 'express';
import { Application } from 'express';
import * as webPush from 'web-push';

import { addPushSubscription } from './add-push-subscriber.route';
import { PUSH_SUBSCRIPTIONS } from './in-memory-db';
import { SECRETS } from './secrets';
import { sendNotification } from './send-notification.route';

webPush.setVapidDetails(
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
    // eslint-disable-next-line no-console
    console.log('HTTP Server running at http://localhost:3000');
});