import serverless from 'serverless-http';
import express from 'express';
import { apiRouter } from '../../src/api/routes';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

export const handler = serverless(app);
