import * as functions from 'firebase-functions';
import express from 'express';
import { apiRouter } from './api/routes';

const app = express();
app.use(express.json());
app.use('/', apiRouter);   // note: /api prefix Firebase URL mein already aa jayega

export const api = functions.https.onRequest(app);