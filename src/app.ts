import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { Env, verifyEnvVariables } from './env';

verifyEnvVariables();

const initDB = async () => {
    try {
        await mongoose.connect(Env.DB_CONNECTION_URL);
        console.log('connected to db')
    } catch (error) {
        console.error(`failed connecting to db: ${error}`);
    }
};

export const initApp = async () => {
    await initDB();

    const app = express();
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: true }));
    app.get('/health', (_request: Request, response: Response) => {
        response.send('trip-dude backend is up and running!');
    });

    return app;
}