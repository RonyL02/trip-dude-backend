import request from 'supertest';

import { Express } from 'express';
import { TestUser } from './types';
import { Response } from 'supertest';

export const createUser = async (
  app: Express,
  user: TestUser
): Promise<string> => {
  const response = await request(app).post('/auth/register').send(user);
  return response.body.newId;
};

export const loginUser = async (
  app: Express,
  email: string,
  password: string
): Promise<{ accessToken: string; refreshToken: string; username: string }> => {
  const response = await request(app)
    .post('/auth/login')
    .send({ email, password });

  const accessToken = extractFromCookie(response, 'access_token');
  const refreshToken = extractFromCookie(response, 'refresh_token');

  return {
    accessToken,
    refreshToken,
    username: response.body.username
  };
};

export const extractFromCookie = (response: Response, name: string) => {
  const cookies = response.headers['set-cookie'] as unknown as string[];

  const cookieString = cookies.find((cookie) => cookie.includes(name));
  const accessToken = cookieString?.split(';')[0].split('=')[1] ?? '';

  return accessToken;
};
