/* eslint-disable @cspell/spellchecker */
import * as express from 'express';
import { Application } from 'express';
import * as SECRETS from './secrets.json';
// import {readAllLessons} from './read-all-lessons.route';
// import {addPushSubscriber} from './add-push-subscriber.route';
// import {sendNewsletter} from './send-newsletter.route';
import * as bodyParser from 'body-parser';
import * as webpush from 'web-push';
import { sendNotification } from './send-notification.route';
import { addPushSubscription } from './add-push-subscriber.route';
import { PUSH_SUBSCRIPTIONS } from './in-memory-db';
import * as cors from 'cors';

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