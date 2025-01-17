import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';

dotenv.config();

const initDB = async () => {
    const dbConnectionUrl = process.env.DB_CONNECTION_URL;

    try {
        await mongoose.connect(dbConnectionUrl!);
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