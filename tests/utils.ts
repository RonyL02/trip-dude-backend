import request from 'supertest';

import { Express } from 'express';
import { TestUser } from './types';

export const createUser = async (
  app: Express,
  user: TestUser
): Promise<string> => {
  const response = await request(app).post('/users').send(user);
  return response.body.newId;
};

export const loginUser = async (
  app: Express,
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; userId: string }> => {
  const response = await request(app)
    .post('/auth/login')
    .send({ email, password });
  return response.body;
};
