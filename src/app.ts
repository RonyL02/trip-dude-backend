import express, { Request, Response, Express } from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { Env, verifyEnvVariables } from './env';
import swaggerJSDoc from 'swagger-jsdoc';
import swaggerUI from 'swagger-ui-express';
import AuthRouter from './routes/auth_routes';
import PostRouter from './routes/post_routes';
import cors from 'cors';
import FileRouter from './routes/file_routes';
import UserRouter from './routes/user_routes';
import CommentRouter from './routes/comment_routes';
import ActivityRouter from './routes/activity_routes';
import path from 'node:path';

verifyEnvVariables();

const initDB = async () => {
  try {
    await mongoose.connect(Env.DB_CONNECTION_URL);
    console.log('connected to db');
  } catch (error) {
    console.error(`failed connecting to db: ${error}`);
  }
};

export const initSwagger = (app?: Express) => {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Trip Dude REST API',
        version: '1.0.0',
        description: 'REST server for the Trip Dude Application'
      }
    },
    apis: ['./src/routes/*.ts']
  };
  const specs = swaggerJSDoc(options);
  let swaggerApp: Express | undefined;
  if (Env.NODE_ENV === 'production') {
    swaggerApp = express();
    swaggerApp.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
  } else {
    app?.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
  }

  return swaggerApp;
};

export const initApp = async () => {
  await initDB();

  const app = express();
  app.use(
    cors({
      credentials: true,
      origin: Env.DOMAIN_FRONT
    })
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  /**
   * @swagger
   * /health:
   *    get:
   *       summary: a route to check if the backend is running
   */
  app.get('/health', (_request: Request, response: Response) => {
    response.send('trip-dude backend is up and running!');
  });
  // app.use(express.static('front'));
  app.use('/storage', express.static('storage'));

  app.use('/auth', AuthRouter);
  app.use('/posts', PostRouter);
  app.use('/files', FileRouter);
  app.use('/users', UserRouter);
  app.use('/comments', CommentRouter);
  app.use('/activities', ActivityRouter);

  if (Env.NODE_ENV === 'production') {
    const buildPath = path.normalize(path.join(__dirname, '../front'));
    app.use(express.static(buildPath));

    app.get('(/*)?', async (_req, res) => {
      res.sendFile(path.join(buildPath, 'index.html'));
    });
  }
  return app;
};
